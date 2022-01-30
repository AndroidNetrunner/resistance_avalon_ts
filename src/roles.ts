import { MessageEmbed } from "discord.js";
import Player from "./Player";

export const LOYAL = "선의 세력";
export const EVIL = "악의 하수인";
export const MERLIN = "멀린";
export const ASSASSIN = "암살자";
export const PERCIVAL = "퍼시발";
export const MORDRED = "모드레드";
export const MORGANA = "모르가나";
export const OBERON = "오베론";

export async function merlin(player: Player, playerList: Player[]) {
    const visiblePlayers = [];
    for (let opponent of playerList) {
        if (roles.evil.includes(opponent.role) && opponent.role !== MORDRED)
            visiblePlayers.push(opponent.user.username);
    }
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 멀린입니다.')
    .setDescription('모드레드를 제외한 악의 하수인들을 알 수 있지만,\n당신이 암살당한다면 선의 세력은 패배합니다!')
    .setColor('BLUE')
    .setFields({
        name: '당신의 눈에 보이는 악의 세력은...',
        value: `${visiblePlayers.join()}입니다!`
    })
    await player.user.send({embeds:[embed]});
}

export async function loyal(player: Player) {
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 선의 세력입니다.')
    .setDescription('다른 선의 세력을 파악해 미션을 성공시켜 게임에서 승리하세요!')
    .setColor('BLUE');
    await player.user.send({embeds:[embed]});
}

export async function evil(player: Player, playerList: Player[]) {
    const visiblePlayers = [];
    for (let opponent of playerList) {
        if (opponent !== player && roles.evil.includes(opponent.role) && opponent.role !== OBERON)
            visiblePlayers.push(opponent.user.username);
    }
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 악의 하수인입니다.')
    .setDescription('선의 세력을 속여 미션을 실패시키면 게임에서 승리합니다!')
    .setColor('RED')
    .setFields({
        name: '당신의 눈에 보이는 악의 세력은...',
        value: `${visiblePlayers.join()}입니다!`
    });
    await player.user.send({embeds: [embed]});
}

export async function percival(player: Player, playerList: Player[]) {
    const visiblePlayers = [];
    for (let opponent of playerList) {
        if ([MERLIN, MORGANA].includes(opponent.role))
            visiblePlayers.push(opponent.user.username);
    }
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 퍼시발입니다.')
    .setDescription('멀린이 누구인지 알 수 있지만, 모르가나도 위장한 채 당신에게 보일 것입니다!')
    .setColor('BLUE')
    .setFields({
        name: '당신의 눈에 보이는 멀린 후보는...',
        value: `${visiblePlayers.join()}입니다!`
    });
    await player.user.send({embeds: [embed]});
}

export async function assassin(player: Player, playerList: Player[]) {
    const visiblePlayers = [];
    for (let opponent of playerList) {
        if (opponent !== player && roles.evil.includes(opponent.role) && opponent.role !== OBERON)
            visiblePlayers.push(opponent.user.username);
    }
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 암살자입니다.')
    .setDescription('악의 하수인이 패배하기 직전, 멀린 암살에 성공한다면 악의 세력은 역전승합니다!')
    .setColor('RED')
    .setFields({
        name: '당신의 눈에 보이는 악의 세력은...',
        value: `${visiblePlayers.join()}입니다!`
    });
    await player.user.send({embeds: [embed]});
}

export async function mordred(player: Player, playerList: Player[]) {
    const visiblePlayers = [];
    for (let opponent of playerList) {
        if (opponent !== player && roles.evil.includes(opponent.role) && opponent.role !== OBERON)
            visiblePlayers.push(opponent.user.username);
    }
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 모드레드입니다.')
    .setDescription('당신은 악의 하수인이지만, 멀린에게 정체가 보이지 않습니다!')
    .setColor('RED')
    .setFields({
        name: '당신의 눈에 보이는 악의 세력은...',
        value: `${visiblePlayers.join()}입니다!`
    });
    await player.user.send({embeds: [embed]});
}

export async function morgana(player: Player, playerList: Player[]) {
    const visiblePlayers = [];
    for (let opponent of playerList) {
        if (opponent !== player && roles.evil.includes(opponent.role) && opponent.role !== OBERON)
            visiblePlayers.push(opponent.user.username);
    }
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 모르가나입니다.')
    .setDescription('퍼시발에게는 당신이 멀린으로 위장한 채 보입니다!')
    .setColor('RED')
    .setFields({
        name: '당신의 눈에 보이는 악의 세력은...',
        value: `${visiblePlayers.join()}입니다!`
    });
    await player.user.send({embeds:[embed]});
}

export async function oberon(player: Player) {
    const embed = new MessageEmbed()
    .setTitle('당신의 역할은 오베론입니다.')
    .setDescription('악의 하수인이지만, 다른 악의 하수인들과 정체를 서로 모릅니다.')
    .setColor('RED');
    await player.user.send({embeds: [embed]});
}

const roles = {
    loyal: [MERLIN, PERCIVAL, LOYAL],
    evil: [ASSASSIN, MORDRED, MORGANA, OBERON, EVIL]
}

export default roles;