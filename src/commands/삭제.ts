import { ICommand } from "wokcommands";
import { active_hosts } from "../state";

const removeSpecialRole: ICommand = {
  category: "joining",
  description:
    "추가된 직업을 삭제합니다. X는 삭제할 직업을 뜻합니다. 참가를 받는 동안에만 사용할 수 있습니다. 예) /삭제 퍼시발",
  minArgs: 1,
  expectedArgs: "<role>",
  callback: ({ interaction, args }) => {
    const [role] = args;
    const currentHost = active_hosts.get(interaction.channelId);
    if (!currentHost) return "시작한 게임이 존재하지 않습니다.";
    return currentHost.removeSpecialRole(role);
  },
};

export default removeSpecialRole;
