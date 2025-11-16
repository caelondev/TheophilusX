/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import prettyMilliseconds from "pretty-ms";
import { EmbedBuilder } from "discord.js";
import TXCommand from "../../../structures/TXCommand";
import os from "os";

export default new TXCommand({
  name: "ping",
  description: "Shows network and system info",
  syntax: "ping",
  cooldown: 5000,
  execute: async ({ message, client }) => {
    let ping = null;

    try {
      const start = Date.now();
      ping = await message.reply("Pinging...");
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
        .setTitle("Pong!")
        .setColor("Blurple")
        .setThumbnail(client.user!.avatarURL())
        .setDescription("Overview of this bot process and system usage")
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
            value: `• Child Process RAM: **${childRAM} MB**\n• App Process Total: **${appRAM} MB**\n• System RAM: **${totalRAM} MB**`,
            inline: false,
          },
          {
            name: "Shard Info",
            value: `• Shard ID: **${shardId}**\n• Total Shards: **${totalShards}**`,
            inline: false,
          },
        )
        .setFooter({
          text: "TheophilusX Bot • Bot Stats",
          iconURL: client.user!.avatarURL() as string,
        })
        .setTimestamp();

      await ping.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error(`Ping error: ${error}`);
      if(ping) await ping.edit("Failed to fetch ping stats.");
    }
  },
});
