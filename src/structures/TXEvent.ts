/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { ClientEvents } from "discord.js";

export class TXEvent<Key extends keyof ClientEvents> {
  constructor(
    public event: Key,
    public execute: (...args: ClientEvents[Key]) => any
  ){

  }
}
