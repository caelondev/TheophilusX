/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { ApplicationCommandOptionType } from "discord.js";
import TXSlashCommand from "../../../structures/TXSlashCommand";

export default new TXSlashCommand({
  name: "echo",
  description: "Echoes your message",
  options: [
    {
      name: "message",
      description: "The message to echo",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  execute: async ({ interaction, args }) => {
    const message = args.getString("message")!;

    return await interaction.reply({
      content: message,
    });
  },
});
