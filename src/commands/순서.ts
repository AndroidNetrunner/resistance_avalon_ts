import { ICommand } from "wokcommands";
import { active_games } from "../state";

const order : ICommand = {
    category: 'order',
    description: '원정대장이 이동하는 순서를 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.',
    slash: true,
    callback: ({ interaction }) => {
        if (active_games.get(interaction.channelId)) {
            return `${active_games.get(interaction.channelId)?.playerList.join(' -> ')}`;
        }
        return `진행 중인 게임이 존재하지 않습니다.`;
    }
}

export default order;