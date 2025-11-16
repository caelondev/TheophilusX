/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { TXEvent } from "../../structures/TXEvent";
import GuildConfigs from "../../database/models/GuildConfigs";
import TXVariable from "../../structures/TXVariables";
import { TXVariableParserContext } from "../../typings/Variables";
import { EmbedBuilder } from "discord.js";
import { IEmbed } from "../../database/constants/embedSchema";
import buildEmbed from "../../utils/buildEmbed";

export default new TXEvent("guildMemberAdd", async (member) => {
  const guild = member.guild;
  const guildConfig = await GuildConfigs.findOne({ guildId: guild.id });

  if (
    !guildConfig?.welcomeChannelId ||
    !guildConfig.welcomeEmbedIsEnabled ||
    (!guildConfig.welcomeMessage && !guildConfig.welcomeEmbeds)
  )
    return;

  const channel = guild.channels.cache.get(guildConfig.welcomeChannelId);
  if (!channel || !channel.isTextBased()) return;

  const context: TXVariableParserContext = {
    user: member.user,
    guild,
  };

  const rawContent = guildConfig.welcomeMessage 
    ? await new TXVariable().parse(guildConfig.welcomeMessage, context)
    : null;
  const content = rawContent ?? undefined;
  const embeds: EmbedBuilder[] = await setupEmbeds(guildConfig.welcomeEmbeds, context);

  channel.send({
    content,
    embeds,
  });
});

async function setupEmbeds(
  embedConfigs: IEmbed[],
  context: TXVariableParserContext,
): Promise<EmbedBuilder[]> {
  const embeds: EmbedBuilder[] = [];

  for (const config of embedConfigs) {
    if (embeds.length >= 10) break;

    const builtEmbed = await buildEmbed(config, context);
    embeds.push(builtEmbed);
  }

  return embeds;
}
