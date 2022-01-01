import { User } from "discord.js";
import Game from "./Game";

class Player {
    role: string;
    user: User;
    emoticon: string;
    constructor(user: User, role : string, emoticon: string) {
        this.user = user;
        this.role = role;
        this.emoticon = emoticon;
    }
}

export default Player;