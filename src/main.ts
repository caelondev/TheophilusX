/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import "dotenv/config";
import TheophilusX from "./structures/TheophilusX";
import TXDatabase from "./structures/TXDatabase";
import Web from "./web";
import { PrettyLogger as log, LogTag } from "./utils/PrettyLogger";

export const database = new TXDatabase();
export const client = new TheophilusX();

const main = async () => {
  await database.initialize();
  await client.instantiate();
  Web();
};

process.on("unhandledRejection", (e) => {
  log.error({
    message: `Unhandled rejection: ${e}`,
    tag: LogTag.OTHER,
  });
});

main();
