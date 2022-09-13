import DiscordJS, { Intents } from "discord.js";
import WOKCommands from "wokcommands";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.login(process.env.TOKEN).then(() => {
  client.user?.setAvatar("resistance_avalon.jpg");
  client.user?.setActivity("/명령어", { type: "PLAYING" });
});

client.on("ready", () => {
  console.log("The bot is ready");

  new WOKCommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    typeScript: true,
  });
});
