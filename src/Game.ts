import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageComponentInteraction,
  TextBasedChannel,
  User,
} from "discord.js";
import Dealer from "./Dealer";
import Host from "./Host";
import Player from "./Player";
import { active_games } from "./state";
import notifyRoleToPlayer, { roles } from "./roles";
const EventEmitter = require("events");

function shuffle(array: any[]) {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
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
  10: [3, 4, 4, 5, 5],
};

const { Loyal, Evil, Merlin, Assassin, Percival, Mordred, Morgana, Oberon } =
  roles;

class Game {
  private _playerList!: Player[];
  private _teamLeader!: Player;
  private _channelStartedGame!: TextBasedChannel;
  private _missionBoard!: number[];
  private _roundNumber!: number;
  private _emitter: any = new EventEmitter();
  private _loyalScore!: number;
  private _evilScore!: number;

  get playerList() {
    return this._playerList.map((player) => player.user.username);
  }

  get emitter() {
    return this._emitter;
  }

  constructor(host: Host) {
    console.log("new Game has been started", host);
    this.setInitialState(host);
    this.readyNewGame(host.activeSpecialRoles);
    this.notifyRolesToPlayers(host.channelStartedGame);
    this.startNewRound();
    this.setRoundEndEmitter();
    this.setGameEndEmitter();
  }

  private setInitialState(host: Host) {
    this._playerList = this.setPlayerList(host);
    this._channelStartedGame = host.channelStartedGame;
    this._missionBoard =
      quest_sheet[this._playerList.length as 5 | 6 | 7 | 8 | 9 | 10];
    this._roundNumber = 1;
    this._teamLeader =
      this._playerList[Math.floor(Math.random() * this._playerList.length)];
    this._loyalScore = 0;
    this._evilScore = 0;
  }

  private async readyNewGame(
    specialRoles: Map<string, string[]>
  ): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle("게임이 시작되었습니다!")
      .setDescription(
        `사용 직업: ${specialRoles
          .get("loyal")
          ?.concat(specialRoles.get("evil") as string[])
          .join()}`
      )
      .setFields({
        name: "각 라운드 별 원정대 인원 수는 다음과 같습니다.",
        value: `1라운드: ${this._missionBoard[0]}
                    2라운드: ${this._missionBoard[1]}
                    3라운드: ${this._missionBoard[2]}
                    4라운드: ${this._missionBoard[3]}
                    5라운드: ${this._missionBoard[4]}`,
      });
    await this._channelStartedGame.send({ embeds: [embed] });
  }

  private setPlayerList(host: Host): Player[] {
    const numberOfLoyal =
      host.userList.length !== 9 ? Math.floor(host.userList.length / 2 + 1) : 6;
    const numberOfEvil = host.userList.length - numberOfLoyal;
    const loyalRoles = host.activeSpecialRoles.get("loyal") as string[];
    const evilRoles = host.activeSpecialRoles.get("evil") as string[];
    while (loyalRoles.length < numberOfLoyal) loyalRoles.push(Loyal);
    while (evilRoles.length < numberOfEvil) evilRoles.push(Evil);
    const allRoles = shuffle(loyalRoles.concat(evilRoles));
    return host.userList.map(
      (user, index) => new Player(user, allRoles[index], `${index}\u20E3`)
    );
  }

  private setRoundEndEmitter() {
    this.emitter.on(
      "roundEnd",
      (missionSuccess: boolean, newTeamLeader: Player) => {
        this._roundNumber += 1;
        missionSuccess ? (this._loyalScore += 1) : (this._evilScore += 1);
        this._teamLeader = newTeamLeader;
        if (this._loyalScore === 3) this.notifyAssassinationToAssassin();
        else if (this._evilScore === 3)
          this.emitter.emit(
            "gameEnd",
            "3번의 미션 실패로 인한 악의 하수인 승리"
          );
        else {
          const embed = new MessageEmbed()
            .setTitle("현재까지 각 진영의 득점 상황은 다음과 같습니다.")
            .setDescription(
              `선의 세력: ${this._loyalScore}, 악의 하수인: ${this._evilScore}`
            );
          this._channelStartedGame.send({ embeds: [embed] });
          this.startNewRound();
        }
      }
    );
  }

  private setGameEndEmitter() {
    this.emitter.on("gameEnd", (description: string) =>
      this.revealResult(description)
    );
  }
  private async notifyRolesToPlayers(channel: TextBasedChannel) {
    try {
      this._playerList.forEach(async (player: Player) => {
        console.log(player.user.username, player.role);
        await notifyRoleToPlayer(player, this._playerList);
      });
    } catch (error) {
      channel.send(
        `앗! 누군가가 봇에게 DM 발송 권한을 주지 않아 DM 발송에 실패했습니다. 
                설정 -> 개인정보 보호 및 보안 -> "서버 멤버가 보내는 다이렉트 메세지 허용하기"가 켜져있는지 확인해주세요!
                모든 플레이어가 허용한 후, /리셋을 입력해 게임을 초기화할 수 있습니다.`
      );
    }
  }
  private startNewRound() {
    return new Dealer(
      this._missionBoard[this._roundNumber - 1],
      this._teamLeader,
      this._playerList,
      this._channelStartedGame,
      this._roundNumber,
      this.emitter
    );
  }
  private async notifyAssassinationToAssassin() {
    const validMerlinCandidates: Player[] = this._playerList.filter(
      (player) =>
        ![Assassin, Evil, Mordred, Morgana].some((role) => player.role === role)
    );
    const assassin = this._playerList.find(
      (player) => player.role === Assassin
    );
    if (!assassin) throw new Error("No Assassin Error");
    const embed = new MessageEmbed()
      .setTitle("이제 멀린을 암살할 시간입니다.")
      .setDescription(
        `${assassin.user.username}님은 멀린이라고 생각되는 플레이어를 한 명 지목해주세요.`
      )
      .setFields({
        name: "멀린 후보 목록은 다음과 같습니다.",
        value: validMerlinCandidates
          .map((player) => `${player.user.username}`)
          .join(),
      });
    const candidateButtons = [
      new MessageActionRow().addComponents(
        ...validMerlinCandidates
          .slice(0, 5)
          .map((player) =>
            new MessageButton()
              .setStyle("SECONDARY")
              .setLabel(player.user.username)
              .setCustomId(player.role)
          )
      ),
    ];
    if (validMerlinCandidates.length > 5)
      candidateButtons.concat([
        new MessageActionRow().addComponents(
          ...validMerlinCandidates
            .slice(5)
            .map((player) =>
              new MessageButton()
                .setStyle("SECONDARY")
                .setLabel(player.user.username)
                .setCustomId(player.role)
            )
        ),
      ]);

    const message = await this._channelStartedGame.send({
      embeds: [embed],
      components: candidateButtons,
    });
    const filter = (interaction: MessageComponentInteraction) =>
      interaction.user.id === assassin.user.id;
    message.awaitMessageComponent({ filter }).then(async (interaction) => {
      await interaction.deferReply();
      const description =
        interaction.customId === Merlin
          ? "멀린 암살 성공으로 인한 악의 하수인 승리"
          : "3번의 미션 성공 및 멀린 암살 회피로 인한 선의 세력 승리";
      this.emitter.emit("gameEnd", description);
    });
  }
  private revealResult(description: string) {
    const embed = new MessageEmbed()
      .setTitle("게임이 모두 종료되었습니다!")
      .setDescription(description)
      .setFields({
        name: "각 플레이어의 직업은 다음과 같습니다.",
        value: this._playerList
          .map((player) => `${player.user.username} : ${player.role}`)
          .join("\n"),
      })
      .setColor(description.includes("선의 세력 승리") ? "BLUE" : "RED");
    this._channelStartedGame.send({ embeds: [embed] });
    active_games.delete(this._channelStartedGame.id);
  }
}

export default Game;
