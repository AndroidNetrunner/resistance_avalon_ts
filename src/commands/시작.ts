import { CommandInteraction, MessageEmbed, TextBasedChannel } from "discord.js";
import { ICommand } from "wokcommands";
import Host from "../Host";
import { active_hosts } from "../state";

const startNewGame: ICommand = {
  category: "new game",
  description:
    "참가할 수 있는 게임을 만듭니다. 같은 채널에 이미 시작한 게임이 있다면 사용할 수 없습니다.",
  slash: true,
  callback: ({ interaction }: { interaction: CommandInteraction }) => {
    if (active_hosts.has(interaction.channelId))
      return `이미 시작한 게임이 존재합니다.`;
    if (!interaction.channel) return;
    const newGame = new Host(interaction.user, interaction.channel);
    active_hosts.set(interaction.channelId, newGame);
    const embed = new MessageEmbed()
      .setTitle("레지스탕스 아발론에 오신 것을 환영합니다!")
      .setDescription(
        "레지스탕스 아발론은 선과 악의 세력이 대립하는 마피아 게임입니다. 선과 악의 갈등 속에서 승리를 위해 진실을 파악하세요!"
      )
      .setFields({
        name: "참가 방법",
        value: "게임에 참가하고 싶다면 /참가를 입력해주세요.",
      });
    return embed;
  },
};

export default startNewGame;
