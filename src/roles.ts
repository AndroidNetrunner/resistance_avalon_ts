import { MessageEmbed } from "discord.js";
import Player from "./Player";
export const roles = {
  Loyal: "선의 세력",
  Evil: "악의 하수인",
  Merlin: "멀린",
  Assassin: "암살자",
  Percival: "퍼시발",
  Mordred: "모드레드",
  Morgana: "모르가나",
  Oberon: "오베론",
} as const;

export type Role = typeof roles[keyof typeof roles];

export const isValidAdditionalRole = (param: string): param is Role => {
  return ["퍼시발", "모드레드", "모르가나", "오베론"].includes(param);
};

class UnknownRoleError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

interface content {
<<<<<<< HEAD
  role: Role;
=======
  role: string;
>>>>>>> 0db737d67d978b54f64ee5cbca32f6c614cd3cd3
  description: string;
  fieldName: string;
  fieldValue: string;
}

export const RolesSeenToSpecialRole = {
  [roles.Merlin]: [roles.Evil, roles.Assassin, roles.Morgana, roles.Oberon],
  [roles.Evil]: [roles.Evil, roles.Assassin, roles.Mordred, roles.Morgana],
  [roles.Percival]: [roles.Merlin, roles.Morgana],
  [roles.Mordred]: [roles.Evil, roles.Assassin, roles.Morgana],
  [roles.Morgana]: [roles.Evil, roles.Assassin, roles.Mordred],
  [roles.Assassin]: [roles.Evil, roles.Mordred, roles.Morgana],
  [roles.Loyal]: undefined,
  [roles.Oberon]: undefined,
};

export const team: { loyal: Role[]; evil: Role[] } = {
  loyal: [roles.Merlin, roles.Percival, roles.Loyal],
  evil: [
    roles.Assassin,
    roles.Mordred,
    roles.Morgana,
    roles.Oberon,
    roles.Evil,
  ],
};

const notifyRoleToPlayer = async (
  player: Player,
  playerList: Player[]
): Promise<void> => {
  const visibleRole = RolesSeenToSpecialRole[player.role];
  const embed = makeEmbed(player, playerList, visibleRole);
  await player.user.send({
    embeds: [embed],
  });
<<<<<<< HEAD
  console.log(player.user.username, player.role);
=======
>>>>>>> 0db737d67d978b54f64ee5cbca32f6c614cd3cd3
};

const makeEmbed = (
  player: Player,
  playerList: Player[],
  visibleRole?: Role[]
) => {
  const visiblePlayers =
    visibleRole &&
    playerList
      .filter(
<<<<<<< HEAD
        (opponent) => player !== opponent && visibleRole.includes(opponent.role)
=======
        (opponent) =>
          player !== opponent &&
          visibleRole.some((role) => role === opponent.role)
>>>>>>> 0db737d67d978b54f64ee5cbca32f6c614cd3cd3
      )
      .map((opponent) => opponent.user.username);
  const content = makeEmbedContent(player.role, visiblePlayers?.join());
  const embed = new MessageEmbed()
    .setTitle(`당신의 역할은 ${content.role}입니다.`)
    .setDescription(content.description)
<<<<<<< HEAD
    .setColor(team.loyal.includes(content.role) ? "BLUE" : "RED");
  if (content.fieldName && content.fieldValue)
    embed.addField(content.fieldName, content.fieldValue);
=======
    .setColor(
      team.loyal.some((loyal) => loyal === content.role) ? "BLUE" : "RED"
    );
  if (content.fieldName) embed.addField(content.fieldName, content.fieldValue);
>>>>>>> 0db737d67d978b54f64ee5cbca32f6c614cd3cd3
  return embed;
};

const makeEmbedContent = (role: Role, visiblePlayers?: string): content => {
  switch (role) {
    case roles.Merlin:
      return {
        role: roles.Merlin,
        description:
          "모드레드를 제외한 악의 하수인들을 알 수 있지만,\n당신이 암살당한다면 선의 세력은 패배합니다!",
        fieldName: "당신의 눈에 보이는 악의 세력은...",
        fieldValue: `${visiblePlayers}입니다!`,
      };
    case roles.Loyal:
      return {
        role: roles.Loyal,
        description:
          "다른 선의 세력을 파악해 미션을 성공시켜 게임에서 승리하세요!",
        fieldName: "",
        fieldValue: "",
      };
    case roles.Evil:
      return {
        role: roles.Evil,
        description: "선의 세력을 속여 미션을 실패시키면 게임에서 승리합니다!",
        fieldName: "당신의 눈에 보이는 악의 세력은...",
        fieldValue: `${visiblePlayers}입니다!`,
      };
    case roles.Percival:
      return {
        role: roles.Percival,
        description:
          "멀린이 누구인지 알 수 있지만, 모르가나도 위장한 채 당신에게 보일 것입니다!",
        fieldName: "당신의 눈에 보이는 멀린 후보는...",
        fieldValue: `${visiblePlayers}입니다!`,
      };
    case roles.Assassin:
      return {
        role: roles.Assassin,
        description:
          "악의 하수인이 패배하기 직전, 멀린 암살에 성공한다면 악의 세력은 역전승합니다!",
        fieldName: "당신의 눈에 보이는 악의 세력은...",
        fieldValue: `${visiblePlayers}입니다!`,
      };
    case roles.Mordred:
      return {
        role: roles.Mordred,
        description:
          "당신은 악의 하수인이지만, 멀린에게 정체가 보이지 않습니다!",
        fieldName: "당신의 눈에 보이는 악의 세력은...",
        fieldValue: `${visiblePlayers}입니다!`,
      };
    case roles.Morgana:
      return {
        role: roles.Morgana,
        description: "퍼시발에게는 당신이 멀린으로 위장한 채 보입니다!",
        fieldName: "당신의 눈에 보이는 악의 세력은,,,",
        fieldValue: `${visiblePlayers}입니다!`,
      };
    case roles.Oberon:
      return {
        role: roles.Oberon,
        description:
          "악의 하수인이지만, 다른 악의 하수인들과 정체를 서로 모릅니다.",
        fieldName: "",
        fieldValue: "",
      };
    default:
<<<<<<< HEAD
      throw new UnknownRoleError("역할을 찾을 수 없습니다.");
=======
      throw new UnknownRoleError("역할을 찾을 수 업습니다.");
>>>>>>> 0db737d67d978b54f64ee5cbca32f6c614cd3cd3
  }
};

export default notifyRoleToPlayer;
