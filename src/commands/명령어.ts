
import { MessageEmbed } from 'discord.js';
import { ICommand } from 'wokcommands';

const makeField = (name: string, value: string) => ({name, value});

const command: ICommand = {
    category: 'showing',
    description: '사용할 수 있는 모든 명령어를 출력합니다.',
    slash: true,
    callback: () => {
        const embed = new MessageEmbed()
        .setTitle('사용가능한 명령어들은 다음과 같습니다.')
        .setDescription('사용가능한 추가 역할: 퍼시발, 모드레드, 오베론, 모르가나')
        .addFields(
            makeField('/명령어', '사용할 수 있는 모든 명령어를 출력합니다.'),
            makeField('/시작', '참가할 수 있는 게임을 만듭니다. 같은 채널에 이미 시작한 게임이 있다면 사용할 수 없습니다.'),
            makeField('/참가', '시작한 게임을 참가합니다. 시작한 게임이 존재하지 않거나 게임이 마감된 상태라면 사용할 수 없습니다.'),
            makeField('/마감', '참가를 마감하고 게임을 시작하기 위한 명령어입니다. 마감되지 않은 게임이 없다면 사용할 수 없습니다.'),
            makeField('/리셋', '진행 중인 게임을 초기화합니다. 새로운 게임을 시작할 수 있는 상태가 됩니다.'),
            makeField('/순서', '원정대장이 이동하는 순서를 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.'),
            makeField('/추가 X', '새로운 역할을 추가합니다. X는 추가할 역할을 뜻합니다. 참가를 받는 동안에만 사용할 수 있습니다. 예) /추가 퍼시발'),
            makeField('/삭제 X', '추가된 직업을 삭제합니다. X는 삭제할 직업을 뜻합니다. 참가를 받는 동안에만 사용할 수 있습니다. 예) /삭제 퍼시발')
        )
        return embed;
    }
}

export default command;