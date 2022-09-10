import { Channel, TextBasedChannel, User } from "discord.js";
import { team, Role, roles } from "./roles";

class Host {
    userList: User[];
    private _activeSpecialRoles: Map<string, string[]>;
    private _channelStartedGame: TextBasedChannel;

    get channelStartedGame() {
        return this._channelStartedGame;
    }

    get activeSpecialRoles() {
        return this._activeSpecialRoles;
    }

    get numberOfPlayers() {
        return this.userList.length;
    }

    constructor(user: User, channelStartedGame: TextBasedChannel) {
        this.userList = [user];
        this._channelStartedGame = channelStartedGame;
        this._activeSpecialRoles = new Map();
        this._activeSpecialRoles.set('loyal', [roles.Merlin]);
        this._activeSpecialRoles.set('evil', [roles.Assassin]);
    }
    addNewPlayerToPlayerList(user: User) {
        this.userList.push(user);
    }
    addSpecialRole(role: Role) {
        if (!(team.loyal.includes(role) || team.evil.includes(role)))
            return `${role}은(는) 존재하지 않는 역할입니다.`;
        if ((Object.values(this.activeSpecialRoles).includes(role)))
            return `${role}은(는) 이미 추가된 역할입니다.`;
        this.addRoleToActiveSpecialRoles(role);
        return `${role}이(가) 게임에 추가되었습니다.`;
    }
    removeSpecialRole(role: Role) {
        if (!(team.loyal.includes(role) || team.evil.includes(role)))
            return `${role}은(는) 게임에 존재하지 않는 역할입니다.`;
        if (!(Object.values(this.activeSpecialRoles).includes(role)))
            return `${role}은 추가되지 않은 역할입니다.`;
        this.removeRoleFromActiveSpecialRoles(role);
        return `${role}이(가) 게임에서 삭제되었습니다.`;
    }

    private addRoleToActiveSpecialRoles(targetRole: Role) {
        for (let team in this.activeSpecialRoles) 
        {
            const teamArray = this.activeSpecialRoles.get(team);
            if (teamArray && teamArray.includes(targetRole))
                teamArray.push(targetRole);
        }
    }

    private removeRoleFromActiveSpecialRoles(targetRole: Role) {
        for (let team in this.activeSpecialRoles) {
            const teamArray = this._activeSpecialRoles.get(team)?.filter(activeRole => activeRole !== targetRole);
            if (teamArray)
                this._activeSpecialRoles.set(team, teamArray);
        }
    }
}

export default Host;