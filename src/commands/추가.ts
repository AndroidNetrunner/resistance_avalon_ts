import { ICommand } from "wokcommands";
import { active_hosts } from "../state";
import { isValidAdditionalRole } from "../roles";
const addSpecialRole: ICommand = {
  category: "joining",
  description: "new player tries to join",
  slash: true,
  minArgs: 1,
  expectedArgs: "<role>",
  callback: ({ interaction, args }) => {
    const currentHost = active_hosts.get(interaction.channelId);
    if (!currentHost) return "시작한 게임이 존재하지 않습니다.";
    const [role] = args;
    if (!isValidAdditionalRole(role))
      return `${role}은 존재하지 않는 추가역할입니다.`;
    return currentHost.addSpecialRole(role);
  },
};

export default addSpecialRole;
