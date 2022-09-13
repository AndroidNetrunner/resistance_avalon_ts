import Game from "./Game";
import Host from "./Host";

type channelId = string;

export const active_hosts: Map<channelId, Host> = new Map();
export const active_games: Map<channelId, Game> = new Map();
