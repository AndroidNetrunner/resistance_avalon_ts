import { Channel, TextChannel, User } from "discord.js";
import roles, { ASSASSIN, MERLIN } from "./roles";

class Host {
    userList: User[];
    activeSpecialRoles: Map<string, string[]>;
    channelStartedGame: TextChannel;
    constructor(user: User, channelStartedGame: TextChannel) {
        this.userList = [user];
        this.channelStartedGame = channelStartedGame;
        this.activeSpecialRoles = new Map();
        this.activeSpecialRoles.set('loyal', [MERLIN]);
        this.activeSpecialRoles.set('evil', [ASSASSIN]);
    }
    addNewPlayerToPlayerList(user: User) {
        this.userList.push(user);
    }
    addSpecialRole(role: string) {
        if (!(roles.loyal.includes(role) || roles.evil.includes(role)))
            return `${role}은(는) 존재하지 않는 역할입니다.`;
        if (this.activeSpecialRoles.get('evil')?.includes(role))
            return `${role}은(는) 이미 추가된 역할입니다.`;
        if (roles.loyal.includes(role))
            this.activeSpecialRoles.get('loyal')?.push(role);
        else
            this.activeSpecialRoles.get('evil')?.push(role);
        return false;
    }
    removeSpecialRole(role: string) {
        if (!(roles.loyal.includes(role) || roles.evil.includes(role)))
            return `${role}은(는) 존재하지 않는 역할입니다.`;
        if (this.activeSpecialRoles.get('evil')?.includes(role)) {
            const index = this.activeSpecialRoles.get('evil')?.indexOf(role);
            this.activeSpecialRoles.get('evil')?.splice(index as number, 1);
        }
        else if (this.activeSpecialRoles.get('loyal')?.includes(role)) {
            const index = this.activeSpecialRoles.get('loyal')?.indexOf(role);
            this.activeSpecialRoles.get('loyal')?.splice(index as number, 1);
        }
        else
            return `${role}은(는) 추가되지 않은 역할입니다.`;
        return false;
    }
}

export default Host;