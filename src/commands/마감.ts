import {ICommand} from 'wokcommands';
import Game from '../Game';
import { active_games, active_hosts } from '../state';

const close : ICommand = {
    category: 'joining',
    description: '참가를 마감하고 게임을 시작하기 위한 명령어입니다. 마감되지 않은 게임이 없다면 사용할 수 없습니다.',
    slash: true,
    callback: ({interaction}) => {
        const host = active_hosts.get(interaction.channelId);
        if (!host)
            return `시작한 게임이 존재하지 않습니다.`;
        if (host.numberOfPlayers < 5)
            return `현재 플레이어 인원수가 ${host.numberOfPlayers}명입니다. 최소 5명이 있어야 게임을 진행할 수 있습니다.`;
        active_games.set(interaction.channelId, new Game(host));
        active_hosts.delete(interaction.channelId);
    }
}

export default close;