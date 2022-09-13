import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageComponentInteraction,
  MessageReaction,
  TextBasedChannel,
  User,
} from "discord.js";
import Player from "./Player";
import { team } from "./roles";

function addAgreeAndDisagreeButtons() {
  const actionRow = new MessageActionRow();
  const agreeButton = new MessageButton()
    .setStyle("PRIMARY")
    .setLabel("찬성")
    .setCustomId("agree");
  const disagreeButton = new MessageButton()
    .setStyle("DANGER")
    .setLabel("반대")
    .setCustomId("disagree");
  actionRow.addComponents(agreeButton, disagreeButton);
  return actionRow;
}

class Dealer {
  private _playerList: Player[];
  private _numberOfTeammates: number;
  private _channelStartedGame: TextBasedChannel;
  private _rejectedTeams: number = 0;
  private _proposedTeam: Player[] = [];
  private _playersAgreed: User[] = [];
  private _playersDisagreed: User[] = [];
  private _missionSuccess: number = 0;
  private _missionFail: number = 0;
  private _teamLeader: Player;
  private _emitter: any;
  private _roundNumber: number;

  constructor(
    numberOfTeammates: number,
    firstTeamLeader: Player,
    playerList: Player[],
    channelStartedGame: TextBasedChannel,
    roundNumber: number,
    emitter: any
  ) {
    this._numberOfTeammates = numberOfTeammates;
    this._teamLeader = firstTeamLeader;
    this._playerList = playerList;
    this._channelStartedGame = channelStartedGame;
    this._emitter = emitter;
    this._roundNumber = roundNumber;
    this.notifyTurnToTeamLeader();
  }

  get allPlayersVoted() {
    return (
      this._playersAgreed.length + this._playersDisagreed.length >=
      this._playerList.length
    );
  }

  get allPlayersSubmittedMission() {
    return this._missionSuccess + this._missionFail >= this._numberOfTeammates;
  }

  set missionSuccess(num: number) {
    this._missionSuccess = num;
  }

  set missionFail(num: number) {
    this._missionFail = num;
  }

  set newTeamLeader(player: Player) {
    this._proposedTeam = [];
    this._playersAgreed = [];
    this._playersDisagreed = [];
    this._teamLeader = player;
  }

  get missionSuccess() {
    return this._missionSuccess;
  }

  get missionFail() {
    return this._missionFail;
  }

  set agree(user: User) {
    this._playersAgreed.push(user);
  }

  set disagree(user: User) {
    this._playersDisagreed.push(user);
  }

  get isMissionSuccessful() {
    return (
      (this._playerList.length >= 7 &&
        this._roundNumber === 4 &&
        this._missionFail < 2) ||
      !this._missionFail
    );
  }

  private async notifyTurnToTeamLeader() {
    const embed = new MessageEmbed()
      .setTitle(
        `${this._teamLeader.user.username}님, 이제 원정대원을 지목해주실 차례입니다.`
      )
      .setDescription(
        `이번 라운드에서 지목하실 원정대원 수는 ${this._numberOfTeammates}명입니다.`
      )
      .setFields({
        name: `각 이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
        value: this._playerList
          .map((player) => `${player.emoticon}: ${player.user.username}`)
          .join("\n"),
      });
    const message = await this._channelStartedGame.send({ embeds: [embed] });
    this._playerList.forEach((player) => message.react(player.emoticon));
    const filter = (reaction: MessageReaction, user: User) =>
      this._teamLeader.user === user &&
      this._playerList
        .map((player) => player.emoticon)
        .includes(reaction.emoji.toString());
    message
      .createReactionCollector({
        max: this._numberOfTeammates,
        filter,
        dispose: true,
      })
      .on("collect", (reaction) => {
        this.addPlayerToTeam(
          this._playerList[
            this._playerList
              .map((player) => player.emoticon)
              .indexOf(reaction.emoji.toString())
          ]
        );
        this._channelStartedGame.send(
          `${
            this._playerList[
              this._playerList
                .map((player) => player.emoticon)
                .indexOf(reaction.emoji.toString())
            ].user.username
          }님이 원정대에 추가되었습니다.`
        );
      })
      .on("remove", (reaction) => {
        this.removePlayerFromTeam(
          this._playerList[
            this._playerList
              .map((player) => player.emoticon)
              .indexOf(reaction.emoji.toString())
          ]
        );
        this._channelStartedGame.send(
          `${
            this._playerList[
              this._playerList
                .map((player) => player.emoticon)
                .indexOf(reaction.emoji.toString())
            ].user.username
          }님이 원정대에서 제외되었습니다.`
        );
      })
      .on("end", async () => {
        message.delete();
        await this.startVote(this._teamLeader);
      });
  }

  private async startVote(player: Player) {
    this._teamLeader = player;
    this._playerList.forEach((player: Player) =>
      this.sendVoteToPlayers(player)
    );
  }

  private async startMission() {
    const embed = new MessageEmbed()
      .setTitle("이제 미션카드를 제출할 시간입니다!")
      .setDescription(
        "아래 버튼을 눌러 미션 성공과 미션 실패 중 한 가지를 선택해주세요."
      );
    const buttons = (player: Player) =>
      new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle("SUCCESS")
          .setLabel("미션 성공")
          .setCustomId("missionSuccess"),
        new MessageButton()
          .setStyle("DANGER")
          .setLabel("미션 실패")
          .setCustomId("missionFail")
          .setDisabled(!team.evil.some((evil) => evil === player.role)),
      ]);
    for (let player of this._proposedTeam) {
      const message = await player.user.send({
        embeds: [embed],
        components: [buttons(player)],
      });
      message
        .createMessageComponentCollector({ max: 1 })
        .on("collect", (interaction) => {
          this[interaction.customId as "missionSuccess" | "missionFail"] += 1;
          console.log(this._missionSuccess);
          console.log(this._missionFail);
          interaction.user.send(
            `${
              interaction.customId === "missionSuccess"
                ? "미션 성공을"
                : "미션 실패를"
            } 선택하셨습니다.`
          );
          if (this.allPlayersSubmittedMission) this.revealMissionResult();
        })
        .on("end", () => {
          message.delete();
        });
    }
  }

  private revealVotes() {
    const fields = [
      {
        name: "찬성",
        value: `${this._playersAgreed.length}표: ${this._playersAgreed
          .map((user) => user.username)
          .join()}`,
      },
      {
        name: "반대",
        value: `${this._playersDisagreed.length}표: ${this._playersDisagreed
          .map((user) => user.username)
          .join()}`,
      },
    ];
    const embed = new MessageEmbed().setTitle(
      `개표 결과, 이번 원정대는 ${
        this._playersAgreed.length > this._playersDisagreed.length ? "가" : "부"
      }결되었습니다.`
    ).setDescription(`원정대장: ${this._teamLeader.user.username}\n
            원정대: ${this._proposedTeam
              .map((player) => player.user.username)
              .join()}`);
    this.handOverNextLeader();
    if (this._playersAgreed.length > this._playersDisagreed.length) {
      fields.push({
        name: "원정대는 미션을 수행하러 떠납니다.",
        value: "모든 원정대원은 DM을 확인하여 미션을 진행해주세요.",
      });
      this.startMission();
    } else this._rejectedTeams += 1;
    embed.setFields(fields);
    this._channelStartedGame.send({ embeds: [embed] });
    if (this._rejectedTeams === 5)
      this._emitter.emit(
        `gameEnd`,
        "5연속 원정대 부결로 인한 악의 하수인 승리"
      );
    else if (this._playersAgreed.length <= this._playersDisagreed.length)
      this.notifyTurnToTeamLeader();
  }
  private handOverNextLeader() {
    let index = this._playerList.indexOf(this._teamLeader);
    index = (index + 1) % this._playerList.length;
    this._teamLeader = this._playerList[index];
  }

  private revealMissionResult() {
    const description = this.isMissionSuccessful
      ? "원정대는 미션에 성공하였습니다!"
      : "아쉽게도 원정대는 미션에 실패하였습니다...";
    const embed = new MessageEmbed()
      .setTitle("원정대가 미션 수행을 끝마쳤습니다.")
      .setDescription(description)
      .setFields([
        {
          name: "제출된 미션 카드는 다음과 같습니다.",
          value: `성공: ${this._missionSuccess} 실패: ${this._missionFail}`,
        },
        {
          name: "이번 미션에 참가한 원정대는 다음과 같습니다.",
          value: this._proposedTeam
            .map((player) => player.user.username)
            .join(),
        },
      ])
      .setColor(this.isMissionSuccessful ? "BLUE" : "RED");
    this._channelStartedGame.send({ embeds: [embed] });
    this._emitter.emit(`roundEnd`, this.isMissionSuccessful, this._teamLeader);
  }

  private addPlayerToTeam(player: Player) {
    this._proposedTeam.push(player);
  }
  private removePlayerFromTeam(player: Player) {
    const index = this._proposedTeam.indexOf(player);
    this._proposedTeam.splice(index, 1);
  }

  private async sendVoteToPlayers(player: Player) {
    const embed = new MessageEmbed()
      .setTitle(
        `${this._teamLeader.user.username}님이 ${this._roundNumber}라운드 ${
          this._rejectedTeams + 1
        }번째 원정대를 제안하였습니다.`
      )
      .setDescription(`아래 버튼을 눌러 찬성 혹은 반대를 투표해주세요.`)
      .addField(
        `원정대에 소속된 플레이어들은...`,
        `${this._proposedTeam
          .map((player) => player.user.username)
          .join()} 입니다!`
      );
    const message = await player.user.send({
      embeds: [embed],
      components: [addAgreeAndDisagreeButtons()],
    });
    message
      .createMessageComponentCollector({ max: 1 })
      .on("collect", (interaction) => {
        this.notifyVoteSaved(interaction);
        if (this.allPlayersVoted) this.revealVotes();
      })
      .on("end", () => {
        message.delete();
      });
  }
  private notifyVoteSaved(interaction: MessageComponentInteraction) {
    this[interaction.customId as "agree" | "disagree"] = interaction.user;
    console.log(this._playersAgreed.length);
    interaction.user.send(
      `${interaction.customId === "agree" ? "찬성" : "반대"}에 투표하셨습니다.`
    );
    this._channelStartedGame.send(
      `${interaction.user.username}님이 투표하셨습니다.`
    );
  }
}

export default Dealer;
