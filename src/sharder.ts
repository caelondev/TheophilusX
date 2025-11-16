/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import "dotenv/config"
import { ShardingManager } from "discord.js";
import logTx from "./utils/logTX"
import { PrettyLogger as log, LogTag } from "./utils/PrettyLogger";

const manager = new ShardingManager(`./dist/main.js`, {
  totalShards: "auto",
  token: process.env.DISCORD_TOKEN,
  respawn: true,
  mode: "process",
  execArgv: ["--max-old-space-size=256"],
  shardList: "auto",
  silent: false
});

manager.on("shardCreate", shard => {
  log.info({ message: `Launched shard ${shard.id}`, tag: LogTag.SHARDS });
});

manager.shards.forEach(shard => {
  shard.on("disconnect", () => {
    log.warn({ message: `Shard ${shard.id} disconnected`, tag: LogTag.SHARDS });
    shard.respawn({ delay: 5000, timeout: 300_000 });
  });

  shard.on("reconnecting", () => {
    log.info({ message: `Shard ${shard.id} reconnecting`, tag: LogTag.SHARDS });
  });

  shard.on("resume", () => {
    log.info({ message: `Shard ${shard.id} resumed`, tag: LogTag.SHARDS });
  });
});

logTx()
manager.spawn({ timeout: 300_000 })
