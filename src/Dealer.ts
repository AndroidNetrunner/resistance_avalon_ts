import { Message, MessageActionRow, MessageButton, MessageEmbed, MessageReaction, TextBasedChannel, User } from "discord.js";
import Player from "./Player";
import { team } from "./roles";

function addAgreeAndDisagreeButtons() {
    const actionRow = new MessageActionRow();
    const agreeButton = new MessageButton()
        .setStyle('PRIMARY')
        .setLabel('찬성')
        .setCustomId('agree');
    const disagreeButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('반대')
        .setCustomId('disagree');
    actionRow.addComponents(agreeButton, disagreeButton);
    return actionRow;
}

class Dealer {
    playerList: Player[];
    numberOfTeammates: number;
    channelStartedGame: TextBasedChannel;
    rejectedTeams: number = 0;
    proposedTeam: Player[] = [];
    playerAgreed: Player[] = [];
    playerDisagreed: Player[] = [];
    missionSuccess: number = 0;
    missionFail: number = 0;
    teamLeader: Player;
    emitter: any;
    roundNumber: number;
    
    constructor(numberOfTeammates: number, firstTeamLeader: Player, playerList: Player[], channelStartedGame: TextBasedChannel, roundNumber: number, emitter: any) {
        this.numberOfTeammates = numberOfTeammates;
        this.teamLeader = firstTeamLeader;
        this.playerList = playerList;
        this.channelStartedGame = channelStartedGame;
        this.notifyTurnToTeamLeader();
        this.emitter = emitter;
        this.roundNumber = roundNumber;
    }
    private async startVote() {
        const embed = new MessageEmbed()
            .setTitle(`${this.teamLeader.user.username}님이 ${this.roundNumber}라운드 ${this.rejectedTeams + 1}번째 원정대를 제안하였습니다.`)
            .setDescription(`아래 버튼을 눌러 찬성 혹은 반대를 투표해주세요.`)
            .setFields({
                name: `원정대에 소속된 플레이어들은...`,
                value: `${this.proposedTeam.map(player => player.user.username).join()} 입니다!`
            });
        for (let player of this.playerList) {
            const message = await player.user.send({
                embeds: [embed],
                components: [addAgreeAndDisagreeButtons()]
            });
            message.createMessageComponentCollector({max: 1})
                .on('collect', i => {
                    if (i.customId === 'agree') {
                        this.playerAgreed.push(player);
                        player.user.send(`찬성에 투표하셨습니다.`);
                    }
                    else {
                        this.playerDisagreed.push(player);
                        player.user.send(`반대에 투표하셨습니다.`);
                    }
                    this.channelStartedGame.send(`${player.user.username}님이 투표하셨습니다.`);
                    message.delete();
                    if (this.playerAgreed.length + this.playerDisagreed.length >= this.playerList.length)
                        this.revealVotes();
                })
        }
    }

    private async startMission() {
        const embed = new MessageEmbed()
        .setTitle('이제 미션카드를 제출할 시간입니다!')
        .setDescription('아래 버튼을 눌러 미션 성공과 미션 실패 중 한 가지를 선택해주세요.');
        const buttons = (player: Player) => new MessageActionRow()
        .addComponents(
            [new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('미션 성공')
            .setCustomId('success'),
            new MessageButton()
            .setStyle('DANGER')
            .setLabel('미션 실패')
            .setCustomId('fail')
            .setDisabled(!team.evil.includes(player.role))]
        )
        for (let player of this.proposedTeam) {
            const message = await player.user.send({embeds: [embed], components: [buttons(player)]});
            message.awaitMessageComponent().then(i => {
                player.user.send(`${i.customId === 'success' ? '미션 성공을' : '미션 실패를'} 선택하셨습니다.`);
                i.customId === 'success' ? this.missionSuccess += 1 : this.missionFail += 1;
                message.delete();
                if (this.missionSuccess + this.missionFail >= this.proposedTeam.length)
                    this.revealMissionResult()
            })
        }
    }
    private revealVotes() {
        const fields = [{
            name: '찬성',
            value: `${this.playerAgreed.length}표: ${this.playerAgreed.map(player => player.user.username).join()}`
        }, {
            name: '반대',
            value: `${this.playerDisagreed.length}표: ${this.playerDisagreed.map(player => player.user.username).join()}`
        }];
        const embed = new MessageEmbed()
            .setTitle(`개표 결과, 이번 원정대는 ${this.playerAgreed.length > this.playerDisagreed.length ? '가' : '부'}결되었습니다.`)
            .setDescription(`원정대장: ${this.teamLeader.user.username}\n
            원정대: ${this.proposedTeam.map(player => player.user.username).join()}`);
        this.handOverNextLeader();
        if (this.playerAgreed.length > this.playerDisagreed.length) {
            fields.push({
                name: '원정대는 미션을 수행하러 떠납니다.',
                value: '모든 원정대원은 DM을 확인하여 미션을 진행해주세요.'
            });
            this.startMission()
        }
        else
            this.rejectedTeams += 1
        embed.setFields(fields);
        this.channelStartedGame.send({ embeds: [embed] });
        if (this.rejectedTeams === 5)
            this.emitter.emit(`gameEnd`);
        else if (this.playerAgreed.length <= this.playerDisagreed.length)
            this.notifyTurnToTeamLeader();
    }
    private handOverNextLeader() {
        let index = this.playerList.indexOf(this.teamLeader);
        index = (index + 1) % this.playerList.length;
        this.teamLeader = this.playerList[index];
    }
    private revealMissionResult() {
        const missionSuccess = (this.playerList.length >= 7 && this.roundNumber === 4 && this.missionFail < 2) || !this.missionFail;
        const description = missionSuccess ? '원정대는 미션에 성공하였습니다!' : '아쉽게도 원정대는 미션에 실패하였습니다...';
        const embed = new MessageEmbed()
        .setTitle('원정대가 미션 수행을 끝마쳤습니다.')
        .setDescription(description)
        .setFields([{
            name: '제출된 미션 카드는 다음과 같습니다.',
            value: `성공: ${this.missionSuccess} 실패: ${this.missionFail}`
        }, {
            name: '이번 미션에 참가한 원정대는 다음과 같습니다.',
            value: this.proposedTeam.map(player => player.user.username).join()
        }])
        .setColor(missionSuccess ? 'BLUE' : 'RED');
        this.channelStartedGame.send({embeds : [embed]});
        this.emitter.emit(`roundEnd`, missionSuccess, this.teamLeader);
    }
    private addPlayerToTeam(player: Player) {
        this.proposedTeam.push(player);
    }
    private removePlayerFromTeam(player: Player) {
        const index = this.proposedTeam.indexOf(player);
        this.proposedTeam.splice(index, 1);
    }
    private async notifyTurnToTeamLeader() {
        this.proposedTeam = [];
        this.playerAgreed = [];
        this.playerDisagreed = [];
        let stringOfemoticonOfPlayers = "";
        for (let player of this.playerList) {
            stringOfemoticonOfPlayers += `${player.emoticon}: ${player.user.username}\n`;
        }
        const embed = new MessageEmbed()
        .setTitle(`${this.teamLeader.user.username}님, 이제 원정대원을 지목해주실 차례입니다.`)
        .setDescription(`이번 라운드에서 지목하실 원정대원 수는 ${this.numberOfTeammates}명입니다.`)
        .setFields({
            name: `각 이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: stringOfemoticonOfPlayers
        })
        const message = await this.channelStartedGame.send({embeds: [embed]});
        for (let player of this.playerList) {
            message.react(player.emoticon);
        }
        const filter = (reaction:MessageReaction, user: User) => this.teamLeader.user === user && this.playerList.map(player => player.emoticon).includes(reaction.emoji.toString());
        const collector = message.createReactionCollector({max: this.numberOfTeammates, filter, dispose: true});
        collector.on('collect', (reaction, user) => {this.addPlayerToTeam(this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())]); this.channelStartedGame.send(`${this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())].user.username}님이 원정대에 추가되었습니다.`)});
        collector.on('remove', (reaction, user) => { this.removePlayerFromTeam(this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())]); this.channelStartedGame.send(`${this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())].user.username}님이 원정대에서 제외되었습니다.`)});
        collector.on('end', async () => {message.delete(); await this.startVote()});
    }
}

export default Dealer;