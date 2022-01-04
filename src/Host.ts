import { Channel, TextChannel, User } from "discord.js";
import roles, { ASSASSIN, MERLIN } from "./roles";

class Host {
     userList: User[];
    private _activeSpecialRoles: Map<string, string[]>;
    private _channelStartedGame: TextChannel;

    get channelStartedGame() {
        return this._channelStartedGame;
    }

    get activeSpecialRoles() {
        return this._activeSpecialRoles;
    }

    get numberOfPlayers() {
        return this.userList.length;
    }

    constructor(user: User, channelStartedGame: TextChannel) {
        this.userList = [user];
        this._channelStartedGame = channelStartedGame;
        this._activeSpecialRoles = new Map();
        this._activeSpecialRoles.set('loyal', [MERLIN]);
        this._activeSpecialRoles.set('evil', [ASSASSIN]);
    }
    addNewPlayerToPlayerList(user: User) {
        this.userList.push(user);
    }
    addSpecialRole(role: string) {
        if (!(roles.loyal.includes(role) || roles.evil.includes(role)))
            return `${role}은(는) 존재하지 않는 역할입니다.`;
        if (this._activeSpecialRoles.get('evil')?.includes(role))
            return `${role}은(는) 이미 추가된 역할입니다.`;
        if (roles.loyal.includes(role))
            this._activeSpecialRoles.get('loyal')?.push(role);
        else
            this._activeSpecialRoles.get('evil')?.push(role);
        return false;
    }
    removeSpecialRole(role: string) {
        if (!(roles.loyal.includes(role) || roles.evil.includes(role)))
            return `${role}은(는) 존재하지 않는 역할입니다.`;
        if (this._activeSpecialRoles.get('evil')?.includes(role)) {
            const index = this._activeSpecialRoles.get('evil')?.indexOf(role);
            this._activeSpecialRoles.get('evil')?.splice(index as number, 1);
        }
        else if (this._activeSpecialRoles.get('loyal')?.includes(role)) {
            const index = this._activeSpecialRoles.get('loyal')?.indexOf(role);
            this._activeSpecialRoles.get('loyal')?.splice(index as number, 1);
        }
        else
            return `${role}은(는) 추가되지 않은 역할입니다.`;
        return false;
    }
}

export default Host;