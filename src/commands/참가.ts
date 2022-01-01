import {ICommand} from 'WOKCommands';
import { active_hosts } from '../state';

const join : ICommand = {
    category: 'joining',
    description: 'new player tries to join',
    callback: ({message}) => {
        const host = active_hosts.get(message.channelId);
        if (!host)
            return `시작한 게임이 존재하지 않습니다.`;
        if (host.userList.includes(message.author))
            return `${message.author.username}님은 이미 참가하셨습니다.`;
        const lengthOfCurrentGamePlayers = host.userList.length;
        if (lengthOfCurrentGamePlayers >= 10)
            return `플레이어 수가 10명입니다. 더 이상 참여하실 수 없습니다.`;
        host.userList.push(message.author); 
        return `${message.author.username}님이 참가하셨습니다. 현재 플레이어 ${lengthOfCurrentGamePlayers + 1}명`;
    }
}

export default join;