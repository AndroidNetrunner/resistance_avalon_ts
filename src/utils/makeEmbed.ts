import Player from "../classes/Player";
import Role from "../classes/Role";
import { MessageEmbed } from "discord.js";

const makeEmbed = ({
  title,
  description,
  color,
  fields,
}: {
  title?: string;
  description?: string;
  color?: "BLUE" | "RED";
  fields?: {
    name: string;
    value: string;
  }[];
}) => {
  const embed = new MessageEmbed();
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (color) embed.setColor(color);
  if (fields) embed.addFields(fields);
  return embed;
};

export default makeEmbed;
