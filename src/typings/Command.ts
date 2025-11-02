/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from "discord.js";
import TheophilusX from "../structures/TheophilusX";

export interface GuildInteraction extends CommandInteraction {
  member: GuildMember;
}
interface ExecuteOptions {
  client: TheophilusX;
  interaction: GuildInteraction;
  args: CommandInteractionOptionResolver;
}

type ExecuteFunction = (options: ExecuteOptions) => any;

export type CommandType = {
  userPermissions?: PermissionResolvable[];
  cooldown?: number;
  private?: boolean;
  execute: ExecuteFunction;
} & ChatInputApplicationCommandData;
