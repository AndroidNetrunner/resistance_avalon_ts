import {ICommand} from 'WOKCommands';
import Game from '../Game';
import { active_games, active_hosts } from '../state';

const close : ICommand = {
    category: 'joining',
    description: 'stop joining game',
    callback: ({message}) => {
        const host = active_hosts.get(message.channelId);
        if (!host)
            return `시작한 게임이 존재하지 않습니다.`;
        const lengthOfCurrentGamePlayers = host.userList.length;
        // if (lengthOfCurrentGamePlayers < 5)
        //     return `현재 플레이어 인원수가 ${lengthOfCurrentGamePlayers}입니다. 최소 5명이 있어야 게임을 진행할 수 있습니다.`;
        active_games.set(message.channelId, new Game(host));
        active_hosts.delete(message.channelId);
    }
}

export default close;