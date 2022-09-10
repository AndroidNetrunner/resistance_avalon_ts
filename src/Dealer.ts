import { MessageActionRow, MessageButton, MessageEmbed, MessageComponentInteraction, MessageReaction, TextBasedChannel, User } from "discord.js";
import Player from "./Player";
import { team } from "./roles";

function addAgreeAndDisagreeButtons() {
    const actionRow = new MessageActionRow();
    const agreeButton = new MessageButton()
        .setStyle('PRIMARY')
        .setLabel('찬성')
        .setCustomId('playerAgreed');
    const disagreeButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('반대')
        .setCustomId('playerDisagreed');
    actionRow.addComponents(agreeButton, disagreeButton);
    return actionRow;
}

class Dealer {
    private playerList: Player[];
    private numberOfTeammates: number;
    private channelStartedGame: TextBasedChannel;
    private rejectedTeams: number = 0;
    private proposedTeam: Player[] = [];
    private playerAgreed: User[] = [];
    private playerDisagreed: User[] = [];
    private missionSuccess: number = 0;
    private missionFail: number = 0;
    private teamLeader: Player;
    private emitter: any;
    private roundNumber: number;

    constructor(numberOfTeammates: number, firstTeamLeader: Player, playerList: Player[], channelStartedGame: TextBasedChannel, roundNumber: number, emitter: any) {
        this.numberOfTeammates = numberOfTeammates;
        this.teamLeader = firstTeamLeader;
        this.playerList = playerList;
        this.channelStartedGame = channelStartedGame;
        this.emitter = emitter;
        this.roundNumber = roundNumber;
        this.notifyTurnToTeamLeader();
    }

    get allPlayersVoted() {
        return this.playerAgreed.length + this.playerDisagreed.length >= this.playerList.length
    }

    get allPlayersSubmittedMission() {
        return this.missionSuccess + this.missionFail >= this.proposedTeam.length;
    }

    private async startVote() {
        const embed = new MessageEmbed()
            .setTitle(`${this.teamLeader.user.username}님이 ${this.roundNumber}라운드 ${this.rejectedTeams + 1}번째 원정대를 제안하였습니다.`)
            .setDescription(`아래 버튼을 눌러 찬성 혹은 반대를 투표해주세요.`)
            .addField(`원정대에 소속된 플레이어들은...`,
            `${this.proposedTeam.map(player => player.user.username).join()} 입니다!`);
        for (let player of this.playerList) {
            const message = await player.user.send({
                embeds: [embed],
                components: [addAgreeAndDisagreeButtons()]
            });
            message.createMessageComponentCollector({max: 1})
                .on('collect', interaction => {
                    this.notifyVoteSaved(interaction);
                    message.delete();
                    if (this.allPlayersVoted)
                        this.emitter.emit('completeVote');
                })
        }
        this.emitter.on('completeVote', this.revealVotes);
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
            .setCustomId('missionSuccess'),
            new MessageButton()
            .setStyle('DANGER')
            .setLabel('미션 실패')
            .setCustomId('missionFail')
            .setDisabled(!team.evil.includes(player.role))]
        )
        for (let player of this.proposedTeam) {
            const message = await player.user.send({embeds: [embed], components: [buttons(player)]});
            message.awaitMessageComponent().then((interaction) => {
                this[interaction.customId as 'missionSuccess' | 'missionFail'] += 1;
                interaction.user.send(`${interaction.customId === 'missionSuccess' ? '미션 성공을' : '미션 실패를'} 선택하셨습니다.`);
                message.delete();
                if (this.allPlayersSubmittedMission)
                    this.emitter.emit('missionEnd');
            })
        }
        this.emitter.on('missionEnd', this.revealMissionResult);
    }

    private revealVotes() {
        const fields = [{
            name: '찬성',
            value: `${this.playerAgreed.length}표: ${this.playerAgreed.map(user => user.username).join()}`
        }, {
            name: '반대',
            value: `${this.playerDisagreed.length}표: ${this.playerDisagreed.map(user => user.username).join()}`
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
            this.emitter.emit(`gameEnd`, '5연속 원정대 부결로 인한 악의 하수인 승리');
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
        collector.on('collect', (reaction) => {this.addPlayerToTeam(this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())]); this.channelStartedGame.send(`${this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())].user.username}님이 원정대에 추가되었습니다.`)});
        collector.on('remove', (reaction) => { this.removePlayerFromTeam(this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())]); this.channelStartedGame.send(`${this.playerList[this.playerList.map(player => player.emoticon).indexOf(reaction.emoji.toString())].user.username}님이 원정대에서 제외되었습니다.`)});
        collector.on('end', async () => {message.delete(); await this.startVote()});
    }

    private notifyVoteSaved(interaction: MessageComponentInteraction) {
        this[interaction.customId as 'playerAgreed' | 'playerDisagreed'].push(interaction.user);
        interaction.user.send(`${interaction.customId === 'playerAgreed' ? '찬성' : '반대'}에 투표하셨습니다.`);
        this.channelStartedGame.send(`${interaction.user.username}님이 투표하셨습니다.`);
    }
}

export default Dealer;