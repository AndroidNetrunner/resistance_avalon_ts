import {ICommand} from 'WOKCommands';
import { active_hosts } from '../state';

const removeSpecialRole : ICommand = {
    category: 'joining',
    description: 'new player tries to join',
    callback: ({message}) => {
        const currentHost = active_hosts.get(message.channelId);
        if (!currentHost)
            return '시작한 게임이 존재하지 않습니다.';
        const content = message.content.split(' ');
        if (content.length === 2) {
            const role = content[1];
            return currentHost.removeSpecialRole(role);
        }
    }
}

export default removeSpecialRole;