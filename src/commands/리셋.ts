import { ICommand } from "wokcommands";
import { active_hosts } from "../state";

const reset: ICommand = {
  category: "reset",
  description:
    "진행 중인 게임을 초기화합니다. 새로운 게임을 시작할 수 있는 상태가 됩니다.",
  slash: true,
  callback: ({ interaction }) => {
    active_hosts.delete(interaction.channelId);
    return `게임이 초기화되었습니다.`;
  },
};

export default reset;
