import { MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";
import Dealer from "./Dealer";
import Host from "./Host";
import Player from "./Player";
import { assassin, ASSASSIN, evil, EVIL, loyal, LOYAL, merlin, MERLIN, mordred, MORDRED, morgana, MORGANA, oberon, OBERON, percival, PERCIVAL } from "./roles";
import { active_games } from "./state";

const EventEmitter = require('events');

function shuffle(array: any[]) {
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

const quest_sheet = {
	3: [2, 3, 2, 3, 2],
	5: [2, 3, 2, 3, 3],
	6: [2, 3, 4, 3, 4],
	7: [2, 3, 3, 4, 4],
	8: [3, 4, 4, 5, 5],
	9: [3, 4, 4, 5, 5],
	10: [3, 4, 4, 5, 5]
}

class Game {
    private _playerList: Player[];
    private _teamLeader: Player;
    private _channelStartedGame: TextChannel;
    private _missionBoard: number[];
    private _roundNumber: number;
    private _emitter: any = new EventEmitter();
    private _loyalScore: number;
    private _evilScore: number;

    get playerList() {
        return this._playerList.map(player => player.user.username);
    }
    constructor(host: Host) {
        this._playerList = this.setPlayerList(host);
        this._channelStartedGame = host.channelStartedGame;
        this._missionBoard = quest_sheet[this._playerList.length as 5 | 6 | 7 | 8 | 9 | 10];
        this._roundNumber = 1;
        this._teamLeader = this._playerList[Math.floor(Math.random() * this._playerList.length)];
        this._loyalScore = 0;
        this._evilScore = 0;
        this.startNewGame(host.activeSpecialRoles);
        this.notifyRoles();
        this._emitter.on('roundEnd', (missionSuccess: boolean, newTeamLeader: Player) => {
            this._roundNumber += 1;
            missionSuccess ? this._loyalScore += 1 : this._evilScore += 1;
            this._teamLeader = newTeamLeader;
            if (this._loyalScore === 3 || this._evilScore === 3) {
                if (this._loyalScore === 3)
                    this.notifyAssassinationToAssassin();
                else
                    this.revealResult('3번의 미션 실패로 인한 악의 하수인 승리');
            }
            else {
                const embed = new MessageEmbed()
                .setTitle('현재까지 각 진영의 득점 상황은 다음과 같습니다.')
                .setDescription(`선의 세력: ${this._loyalScore}, 악의 하수인: ${this._evilScore}`);
                this._channelStartedGame.send({embeds: [embed]});
                this.startNewRound();
            }
        });
        this._emitter.on('gameEnd', () => this.revealResult('5연속 원정대 부결로 인한 악의 하수인 승리'));
    };

    private startNewGame(specialRoles: Map<string, string[]>): void {
        const embed = new MessageEmbed()
        .setTitle('게임이 시작되었습니다!')
        .setDescription(`특수 직업: ${specialRoles.get('loyal')?.concat(specialRoles.get('evil') as string[]).join()}`)
        .setFields({
            name: '각 라운드 별 원정대 인원 수는 다음과 같습니다.',
            value: `1라운드: ${this._missionBoard[0]}
                    2라운드: ${this._missionBoard[1]}
                    3라운드: ${this._missionBoard[2]}
                    4라운드: ${this._missionBoard[3]}
                    5라운드: ${this._missionBoard[4]}`
        });
        this._channelStartedGame.send({embeds: [embed]});
        this.startNewRound();
    }

    private setPlayerList(host: Host): Player[] {
        const numberOfLoyal = host.userList.length !== 9 ? Math.floor(host.userList.length / 2 + 1) : 6;
        const numberOfEvil = host.userList.length - numberOfLoyal;
        const loyalRoles = host.activeSpecialRoles.get('loyal') as string[];
        const evilRoles = host.activeSpecialRoles.get('evil') as string[];
        const playerList = [];
        while (loyalRoles.length < numberOfLoyal)
            loyalRoles.push(LOYAL);
        while (evilRoles.length < numberOfEvil)
            evilRoles.push(EVIL);
        const allRoles = shuffle(loyalRoles.concat(evilRoles));
        for (let i in host.userList) {
            playerList.push(new Player(host.userList[i], allRoles[i], `${i}\u20E3`));
            }
        return playerList;
    }

    private notifyRoles() {
        for (let player of this._playerList) {
            switch (player.role) {
                case MERLIN:
                    merlin(player, this._playerList);
                    break;
                case LOYAL:
                    loyal(player);
                    break;
                case EVIL:
                    evil(player, this._playerList);
                    break;
                case PERCIVAL:
                    percival(player, this._playerList);
                    break;
                case MORDRED:
                    mordred(player, this._playerList);
                    break;
                case MORGANA:
                    morgana(player, this._playerList);
                    break;
                case OBERON:
                    oberon(player);
                    break;
                case ASSASSIN:
                    assassin(player, this._playerList);
            }
        }
    }
    private startNewRound() {
        return new Dealer(this._missionBoard[this._roundNumber - 1], this._teamLeader, this._playerList, this._channelStartedGame, this._roundNumber, this._emitter);
    }
    private async notifyAssassinationToAssassin() {
        const validEmoticons : string[] = [];
        let stringOfemoticonOfPlayers = "";
        for (let player of this._playerList) {
            if (![ASSASSIN, EVIL, MORDRED, MORGANA].includes(player.role)) {
                stringOfemoticonOfPlayers += `${player.emoticon}: ${player.user.username}\n`;
                validEmoticons.push(player.emoticon);
            }
        }
        for (let player of this._playerList) {
            if (player.role === ASSASSIN) {
                const embed = new MessageEmbed()
                .setTitle('이제 멀린을 암살할 시간입니다.')
                .setDescription(`${player.user.username}님은 멀린이라고 생각되는 플레이어를 한 명 지목해주세요.`)
                .setFields({
                    name: '각 이모티콘이 의미하는 플레이어는 다음과 같습니다.',
                    value: stringOfemoticonOfPlayers
                });
                const assassin = player;
                const message = await this._channelStartedGame.send({embeds: [embed]});
                for (let emoticon of validEmoticons)
                    message.react(emoticon);
                const filter = (reaction: MessageReaction, user: User) => user.id === assassin.user.id && validEmoticons.includes(reaction.emoji.name as string);
                const collector = message.createReactionCollector({ filter: filter })
                collector.on('collect', (reaction: MessageReaction, user: User) => {
                    for (let target of this._playerList) {
                        if (target.emoticon === reaction.emoji.name) {
                            const description = target.role === MERLIN ? "멀린 암살 성공으로 인한 악의 하수인 승리" : "3번의 미션 성공 및 멀린 암살 회피로 인한 선의 세력 승리";
                            this.revealResult(description);
                            break;
                        }
                    }
                });
                break;
            }
        }
    }
    private revealResult(description: string) {
        let stringOfRoleOfPlayers = "";
        for (let player of this._playerList)
            stringOfRoleOfPlayers += `${player.user.username}: ${player.role}\n`;
        const embed = new MessageEmbed()
        .setTitle('게임이 모두 종료되었습니다!')
        .setDescription(description)
        .setFields({
            name: '각 플레이어의 직업은 다음과 같습니다.',
            value: stringOfRoleOfPlayers
        })
        .setColor(description === "3번의 미션 성공 및 멀린 암살 회피로 인한 선의 세력 승리" ? "BLUE" : "RED");
        this._channelStartedGame.send({embeds: [embed]});
        active_games.delete(this._channelStartedGame.id);
    }

}

export default Game;