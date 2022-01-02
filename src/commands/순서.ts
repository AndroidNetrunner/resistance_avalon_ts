import { ICommand } from "wokcommands";
import { active_games, active_hosts } from "../state";

const reset : ICommand = {
    category: 'reset',
    description: 'delete current playing game',
    callback: ({message}) => {
        if (active_games.get(message.channelId)) {
            return `${active_games.get(message.channelId)?.playerList.map(player => `${player.user.username} -> `).join('')}`.slice(0, -4);
        }
        return `게임이 초기화되었습니다.`;
    }
}

export default reset;