import { ICommand } from "wokcommands";
import { active_hosts } from "../state";

const reset : ICommand = {
    category: 'reset',
    description: 'delete current playing game',
    callback: ({message}) => {
        active_hosts.delete(message.channelId);
        return `게임이 초기화되었습니다.`;
    }
}

export default reset;