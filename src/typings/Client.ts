/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { ApplicationCommandDataResolvable } from "discord.js";

export interface RegisterCommandOptions {
  guildId?: string,
  commands: ApplicationCommandDataResolvable[]
}
