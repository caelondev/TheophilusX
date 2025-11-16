/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import prettyMilliseconds from "pretty-ms";
import { EmbedBuilder, MessageFlags } from "discord.js";
import TXSlashCommand from "../../../structures/TXSlashCommand";
import os from "os";

export default new TXSlashCommand({
  name: "ping",
  description: "Shows network and system info",
  cooldown: 3000,
  execute: async ({ interaction, client }) => {
    try {
      const start = Date.now();
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral
      });
      const end = Date.now();
      const restLatency = end - start;
      const wsLatency = Math.round(client.ws.ping);

      const memUsage = process.memoryUsage();
      const childRAM = (memUsage.rss / 1024 / 1024).toFixed(2);
      const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(2);
      const appRAM = (
        memUsage.rss / 1024 / 1024 +
        memUsage.heapTotal / 1024 / 1024
      ).toFixed(2);

      const uptime = prettyMilliseconds(process.uptime() * 1000, {
        verbose: true,
      });
      const nodeVersion = process.version;
      const shardId = client.shard?.ids[0] ?? 0;
      const totalShards = client.shard?.count ?? 1;

      const embed = new EmbedBuilder()
        .setTitle(`Pong!`)
        .setColor("Blurple")
        .setDescription("Overview of this bot process and system usage")
        .setThumbnail(client.user!.avatarURL() as string)
        .addFields(
          {
            name: "Latency",
            value: `• REST API: **${restLatency} ms**\n• Websocket Ping: **${wsLatency} ms**`,
            inline: true,
          },
          {
            name: "Node",
            value: `• Version: **${nodeVersion}**\n• Uptime: **${uptime}**`,
            inline: true,
          },
          {
            name: "Memory",
            value: `• Child Process RAM: **${childRAM} MB**\n• App Process Total: \`${appRAM} MB**\n• System RAM: **${totalRAM} MB**`,
            inline: false,
          },
          {
            name: "Shard Info",
            value: `• Shard ID: **${shardId}**\n• Total Shards: **${totalShards}**`,
            inline: false,
          },
        )
        .setFooter({ text: `${client.user?.username} • Bot Stats`, iconURL: client.user!.avatarURL() as string })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply("Failed to fetch ping stats.");
    }
  },
});
