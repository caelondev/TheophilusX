/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import TXSlashCommand from "../../../structures/TXSlashCommand";

export default new TXSlashCommand({
  name: "ping",
  description: "Pong!",
  execute: async ({ interaction, client }) => {
    try {
      const start = new Date().getMilliseconds();
      await interaction.deferReply();
      const end = new Date().getMilliseconds();
      interaction.editReply(
        `Pong! Websocket: ${client.ws.ping}ms | Client: ${start - end}ms`,
      );
    } catch (error) {
      console.error(`Ping error: ${error}`);
    }
  },
});
