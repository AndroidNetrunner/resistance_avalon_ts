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
    this._activeSpecialRoles.set("loyal", [roles.Merlin]);
    this._activeSpecialRoles.set("evil", [roles.Assassin]);
  }
  addNewPlayerToPlayerList(user: User) {
    this.userList.push(user);
  }
  addSpecialRole(role: Role) {
    if (
      this._activeSpecialRoles.get("loyal")?.includes(role) ||
      this._activeSpecialRoles.get("evil")?.includes(role)
    )
      return `${role}은(는) 이미 추가된 역할입니다.`;
    if (team.loyal.includes(role))
      this._activeSpecialRoles.get("loyal")?.push(role);
    else this._activeSpecialRoles.get("evil")?.push(role);
    return `${role}이(가) 게임에 추가되었습니다.`;
  }
  removeSpecialRole(role: Role) {
    if (this._activeSpecialRoles.get("evil")?.includes(role)) {
      const index = this._activeSpecialRoles.get("evil")?.indexOf(role);
      this._activeSpecialRoles.get("evil")?.splice(index as number, 1);
    } else if (this._activeSpecialRoles.get("loyal")?.includes(role)) {
      const index = this._activeSpecialRoles.get("loyal")?.indexOf(role);
      this._activeSpecialRoles.get("loyal")?.splice(index as number, 1);
    } else return `${role}은(는) 추가되지 않은 역할입니다.`;
    return `${role}이(가) 게임에서 삭제되었습니다.`;
  }
}

export default Host;
