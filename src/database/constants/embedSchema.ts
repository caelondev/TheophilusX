/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { model, Schema, Document } from "mongoose";

export interface IEmbedAuthor {
  name: string;
  iconURL?: string | null;
  url?: string | null;
}

export interface IEmbed {
  name: string;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  color: string;
  thumbnail?: string | null;
  image?: string | null;
  footer?: string | null;
  footerIconURL?: string | null;
  timestamp: boolean;
  author?: IEmbedAuthor | null;
}

const embedAuthorSchema = new Schema<IEmbedAuthor>(
  {
    name: { type: String, required: true },
    iconURL: { type: String, default: null },
    url: { type: String, default: null },
  },
  { _id: false },
);

export const embedSchema = new Schema<IEmbed>(
  {
    name: { type: String, required: true },
    title: { type: String, default: null },
    description: { type: String, default: null },
    url: { type: String, default: null },
    color: { type: String, default: "#ffffff" },
    thumbnail: { type: String, default: null },
    image: { type: String, default: null },
    footer: { type: String, default: null },
    footerIconURL: { type: String, default: null },
    timestamp: { type: Boolean, default: false },
    author: { type: embedAuthorSchema, default: null },
  },
  { _id: false },
);
