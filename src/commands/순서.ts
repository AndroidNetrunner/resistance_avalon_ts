import { ICommand } from "wokcommands";
import { active_games } from "../state";

const order : ICommand = {
    category: 'order',
    description: 'print the order of teamLeader',
    callback: ({message}) => {
        if (active_games.get(message.channelId)) {
            return `${active_games.get(message.channelId)?.playerList.join('')}`.slice(0, -4);
        }
        return `진행 중인 게임이 존재하지 않습니다.`;
    }
}

export default order;