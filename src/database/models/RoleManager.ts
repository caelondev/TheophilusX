/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { Schema, model, Document } from "mongoose";

export interface IRoleMessage {
  messageId: string;
  channelId: string;
  roleIds: string[];
}

export interface IRoleManager extends Document {
  guildId: string;
  roleMessages: IRoleMessage[];
}

const roleMessageSchema = new Schema<IRoleMessage>(
  {
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    roleIds: { type: [String], default: [] }
  },
  { _id: false }
);

const roleManagerSchema = new Schema<IRoleManager>({
  guildId: { type: String, required: true, unique: true },
  roleMessages: { type: [roleMessageSchema], default: [] }
});

export default model<IRoleManager>("RoleManager", roleManagerSchema);
