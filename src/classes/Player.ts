import { User } from "discord.js";
import Role from "./Role";

class Player {
  private _role: Role;
  private _user: User;
  private _emoticon: string;

  get role() {
    return this._role;
  }

  get user() {
    return this._user;
  }

  get emoticon() {
    return this._emoticon;
  }

  constructor(user: User, role: Role, emoticon: string) {
    this._user = user;
    this._role = role;
    this._emoticon = emoticon;
  }
}

export default Player;
