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
import Player from "./classes/Player";
import Role from "./classes/Role";
import { active_games } from "./state";
import { roles } from "./constants";
import makeEmbedForRoleNotifyMessage from "./utils/makeEmbedForRoleNotifyMessage";

const { Merlin, Loyal, Evil, Assassin, Percival, Mordred, Morgana, Oberon } =
  roles;

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

class Game {
  private _playerList: Player[];
  private _teamLeader: Player;
  private _channelStartedGame: TextBasedChannel;
  private _missionBoard: number[];
  private _roundNumber: number;
  private _emitter: any = new EventEmitter();
  private _loyalScore: number;
  private _evilScore: number;

  get playerList() {
    return this._playerList.map((player) => player.user.username);
  }
  constructor(host: Host) {
    this._playerList = this.setPlayerList(host);
    this._channelStartedGame = host.channelStartedGame;
    this._missionBoard =
      quest_sheet[this._playerList.length as 5 | 6 | 7 | 8 | 9 | 10];
    this._roundNumber = 1;
    this._teamLeader =
      this._playerList[Math.floor(Math.random() * this._playerList.length)];
    this._loyalScore = 0;
    this._evilScore = 0;
    this.startNewGame(host.activeSpecialRoles);
    this.notifyRolesToPlayers(host.channelStartedGame);
    this._emitter.on(
      "roundEnd",
      (missionSuccess: boolean, newTeamLeader: Player) => {
        this._roundNumber += 1;
        missionSuccess ? (this._loyalScore += 1) : (this._evilScore += 1);
        this._teamLeader = newTeamLeader;
        if (this._loyalScore === 3 || this._evilScore === 3) {
          if (this._loyalScore === 3) this.notifyAssassinationToAssassin();
          else this.revealResult("3번의 미션 실패로 인한 악의 하수인 승리");
        } else {
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
    this._emitter.on("gameEnd", () =>
      this.revealResult("5연속 원정대 부결로 인한 악의 하수인 승리")
    );
  }

  private startNewGame(specialRoles: Map<string, string[]>): void {
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
    this._channelStartedGame.send({ embeds: [embed] });
    this.startNewRound();
  }

  private setPlayerList(host: Host): Player[] {
    const numberOfLoyal =
      host.userList.length !== 9 ? Math.floor(host.userList.length / 2 + 1) : 6;
    const numberOfEvil = host.userList.length - numberOfLoyal;
    const loyalRoles = host.activeSpecialRoles.get("loyal") as string[];
    const evilRoles = host.activeSpecialRoles.get("evil") as string[];
    const playerList = [];
    while (loyalRoles.length < numberOfLoyal) loyalRoles.push(Loyal);
    while (evilRoles.length < numberOfEvil) evilRoles.push(Evil);
    const allRoles = shuffle(loyalRoles.concat(evilRoles));
    for (let i in host.userList) {
      playerList.push(new Player(host.userList[i], allRoles[i], `${i}\u20E3`));
    }

    return playerList;
  }

  private async notifyRolesToPlayers(channel: TextBasedChannel) {
    try {
      this._playerList.forEach(
        async (player: Player) => await this.notifyRoleToPlayer(player)
      );
    } catch (error) {
      channel.send(
        `앗! 누군가가 봇에게 DM 발송 권한을 주지 않아 DM 발송에 실패했습니다. 
                설정 -> 개인정보 보호 및 보안 -> "서버 멤버가 보내는 다이렉트 메세지 허용하기"가 켜져있는지 확인해주세요!
                모든 플레이어가 허용한 후, /리셋을 입력해 게임을 초기화할 수 있습니다.`
      );
    }
  }

  private notifyRoleToPlayer = async (player: Player): Promise<void> => {
    const { role } = player;
    const { visibleRoles } = role;
    const visiblePlayers = this.calculateVisiblePlayers(player, visibleRoles);
    const embed = makeEmbedForRoleNotifyMessage(role, visiblePlayers);
    await player.user.send({
      embeds: [embed],
    });
  };

  private calculateVisiblePlayers(
    player: Player,
    visibleRoles: Role[]
  ): Player[] {
    return this._playerList.filter(
      (target) =>
        player !== target &&
        visibleRoles.map((role) => role.name).includes(target.role.name)
    );
  }

  private startNewRound() {
    return new Dealer(
      this._missionBoard[this._roundNumber - 1],
      this._teamLeader,
      this._playerList,
      this._channelStartedGame,
      this._roundNumber,
      this._emitter
    );
  }

  private async notifyAssassinationToAssassin() {
    const validMerlinCandidates: Player[] = this._playerList.filter(
      (player) => ![Assassin, Evil, Mordred, Morgana].includes(player.role.name)
    );
    const assassin = this._playerList.find(
      (player) => player.role.name === Assassin
    );
    if (!assassin) throw new Error("No Assassin Error");
    const embed = new MessageEmbed()
      .setTitle("이제 멀린을 암살할 시간입니다.")
      .setDescription(
        `${assassin.user.username}님은 멀린이라고 생각되는 플레이어를 한 명 지목해주세요.`
      );
    const firstRowCandidateButtons = new MessageActionRow().addComponents(
      validMerlinCandidates
        .slice(0, 5)
        .map((player) =>
          new MessageButton()
            .setStyle("SECONDARY")
            .setLabel(player.user.username)
            .setCustomId(player.user.id)
        )
    );
    const secondRowCandidateButtons = new MessageActionRow().addComponents(
      validMerlinCandidates
        .slice(5)
        .map((player) =>
          new MessageButton()
            .setStyle("SECONDARY")
            .setLabel(player.user.username)
            .setCustomId(player.user.id)
        )
    );
    const message = await this._channelStartedGame.send({
      embeds: [embed],
      components:
        validMerlinCandidates.length > 5
          ? [firstRowCandidateButtons, secondRowCandidateButtons]
          : [firstRowCandidateButtons],
    });
    const filter = (interaction: MessageComponentInteraction) =>
      interaction.user.id === assassin.user.id;
    message.awaitMessageComponent({ filter }).then((i) => {
      const description = this.isSuccessfulAssassination(i.customId)
        ? "멀린 암살 성공으로 인한 악의 하수인 승리"
        : "3번의 미션 성공 및 멀린 암살 회피로 인한 선의 세력 승리";
      this.revealResult(description);
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

  private isSuccessfulAssassination(targetId: string): boolean {
    for (let player of this._playerList) {
      if (player.user.id === targetId) {
        return player.role.name === Merlin;
      }
    }
    throw new Error("No merlin Error");
  }
}

export default Game;
