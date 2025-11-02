/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { CommandInteractionOptionResolver, MessageFlags, EmbedBuilder } from "discord.js";
import { client } from "../main";
import { TXEvent } from "../structures/TXEvent";
import { GuildInteraction } from "../typings/Command";
import { PrettyLogger as log, LogTag } from "../utils/PrettyLogger";

const cooldowns = new Map<string, number>();

const getKey = (commandName: string, id: string) => `${commandName}-${id}`;

const isOnCooldown = (key: string) => {
  const expiry = cooldowns.get(key);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    cooldowns.delete(key);
    return false;
  }
  return true;
};

const setCooldown = (key: string, durationMs: number) => {
  cooldowns.set(key, Date.now() + durationMs);
};

const getRemainingCooldown = (key: string) => {
  const expiry = cooldowns.get(key);
  if (!expiry) return 0;
  return (Math.max(0, (expiry - Date.now()) / 1000)).toFixed(2);
};

export default new TXEvent("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;
  const command = client.commands.get(commandName);
  const key = getKey(commandName, interaction.user.id);

  if (isOnCooldown(key)) {
    const remaining = getRemainingCooldown(key);
    const cooldownEmbed = new EmbedBuilder()
      .setTitle("Command on Cooldown")
      .setDescription(`You cannot use the **${commandName}** command yet.`)
      .addFields(
        { name: "Command's Cooldown", value: `${(command?.cooldown || 0) / 1000}s`, inline: true },
        { name: "Time Remaining", value: `${remaining}s`, inline: true }
      )
      .setColor("Blurple");

    return interaction.reply({ embeds: [cooldownEmbed], flags: MessageFlags.Ephemeral });
  }

  if (!command) {
    return interaction.reply({
      content: `The command "${commandName}" does not exist. Please try again later...`,
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await command.execute({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as GuildInteraction,
    });

    if (command.cooldown) setCooldown(key, command.cooldown);
  } catch (error) {
    log.error({
      message: `An error occurred whilst trying to execute the command "${interaction.commandName}"`,
      tag: LogTag.COMMANDS,
      extra: [error]
    });
  }
});
