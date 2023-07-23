import makeEmbed from "./makeEmbed";
import Role from "../classes/Role";
import Player from "../classes/Player";

const makeEmbedForRoleNotifyMessage = (
  role: Role,
  visiblePlayers: Player[]
) => {
  const title = `당신의 역할은 ${role.name}입니다!`;
  const description = role.description;
  const color = role.team;
  const fields = getFieldsForVisibleRoles(visiblePlayers);
  return makeEmbed({ title, description, color, fields });
};

const getFieldsForVisibleRoles = (visiblePlayers: Player[]) => {
  if (visiblePlayers.length > 0)
    return [
      {
        name: `당신의 눈에 보이는 사람은...`,
        value: `${visiblePlayers.join(",")}입니다!`,
      },
    ];
  return undefined;
};

export default makeEmbedForRoleNotifyMessage;
