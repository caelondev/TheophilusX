/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { model, Schema, Document } from "mongoose";
import { embedSchema, IEmbed } from "../constants/embedSchema";

export interface IGuildConfigs extends Document {
  guildId: string;

  welcomeChannelId: string;
  welcomeEmbedIsEnabled: boolean;
  welcomeMessage: string | null;
  welcomeEmbeds: IEmbed[];

  goodbyeChannelId: string;
  goodbyeEmbedIsEnabled: boolean;
  goodbyeMessage: string | null;
  goodbyeEmbeds: IEmbed[];

  verifyEmbeds: IEmbed[];
  verifyRole: string;
  verifyChannel: string;

  embeds: IEmbed[];
}

const guildConfigsSchema = new Schema<IGuildConfigs>({
  guildId: { type: String, required: true },

  welcomeChannelId: { type: String, default: null },
  welcomeEmbedIsEnabled: { type: Boolean, default: true },
  welcomeMessage: { type: String, default: null },
  welcomeEmbeds: [embedSchema],

  goodbyeChannelId: { type: String, default: null },
  goodbyeEmbedIsEnabled: { type: Boolean, default: true },
  goodbyeMessage: { type: String, default: null },
  goodbyeEmbeds: [embedSchema],

  verifyEmbeds: { type: [embedSchema], default: [] },
  verifyRole: { type: String, default: null },
  verifyChannel: { type: String, default: null },

  embeds: { type: [embedSchema], default: [] },
});

export default model("GuildConfigs", guildConfigsSchema);
