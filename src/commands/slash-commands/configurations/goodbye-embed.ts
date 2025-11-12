/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from "discord.js";
import TXSlashCommand from "../../../structures/TXSlashCommand";
import GuildConfigs from "../../../database/models/GuildConfigs";
import { TXVariableParserContext } from "../../../typings/Variables";
import buildEmbed from "../../../utils/buildEmbed";

export default new TXSlashCommand({
  name: "goodbye-embed",
  description: "Manage your goodbye embed",
  userPermissions: [PermissionFlagsBits.ManageGuild],
  serverOnly: true,
  options: [
    {
      name: "set",
      description: "Set your goodbye embed",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "embed-name",
          description: "Name of the embed (configurable in /embed-builder)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "Name of the embed (configurable in /embed-builder)",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
      name: "toggle",
      description: "Toggle the goodbye embed on/off",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "test",
      description: "Preview the current goodbye embed",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const guildConfig = await GuildConfigs.findOne({
      guildId: interaction.guild?.id,
    });

    if (!guildConfig) {
      return interaction.editReply({
        content:
          "No guild config found in this server...\nCreate one with `/embed-builder`",
      });
    }

    const subcommand = args.getSubcommand();

    switch (subcommand) {
      case "set": {
        const embedName = args.getString("embed-name")!;
        const channel = args.getChannel("channel")!
        const embedConfig = guildConfig.embeds.find(
          (data) => data.name === embedName,
        );

        if (!embedConfig) {
          return interaction.editReply({
            content: `An embed with a name of "${embedName}" was not found...\nCreate one with \`/embed-builder\``,
          });
        }

        guildConfig.goodbyeChannel = channel.id
        guildConfig.goodbyeEmbed = embedConfig;
        await guildConfig.save();

        const context: TXVariableParserContext = {
          user: interaction.user,
          member: interaction.member,
          guild: interaction.guild!,
          channel: interaction.channel!,
        };

        const previewEmbed = await buildEmbed(embedConfig, context);

        return interaction.editReply({
          content: `Goodbye embed has been set to "${embedName}"!`,
          embeds: [previewEmbed],
        });
      }

      case "toggle": {
        guildConfig.goodbyeToggle = !guildConfig.goodbyeToggle;
        await guildConfig.save();

        const status = guildConfig.goodbyeToggle ? "enabled" : "disabled";

        return interaction.editReply({
          content: `Goodbye embed has been **${status}**!`,
        });
      }

      case "test": {
        if (!guildConfig.goodbyeEmbed) {
          return interaction.editReply({
            content:
              "No goodbye embed has been set yet!\nSet one with `/goodbye-embed set`",
          });
        }

        const context: TXVariableParserContext = {
          user: interaction.user,
          member: interaction.member,
          guild: interaction.guild!,
          channel: interaction.channel!,
        };

        const testEmbed = await buildEmbed(guildConfig.goodbyeEmbed, context);

        return interaction.editReply({
          content: "**Goodbye Embed Preview:**",
          embeds: [testEmbed],
        });
      }

      default:
        return interaction.editReply({
          content: "Invalid subcommand!",
        });
    }
  },
});
