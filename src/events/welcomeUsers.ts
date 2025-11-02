/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { client } from "../main";
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("guildMemberAdd", (member) => {
  if(member.user.id === client.user?.id) return
  const channel = member.guild.systemChannel;

  if (channel) {
    channel.send(`Welcome to the server, ${member.user.tag}!`);
  }
});

