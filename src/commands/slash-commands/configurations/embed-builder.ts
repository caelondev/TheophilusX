/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
*/

import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  ColorResolvable,
} from "discord.js";
import TXSlashCommand from "../../../structures/TXSlashCommand";
import GuildConfigs from "../../../database/models/GuildConfigs";
import TXVariable from "../../../structures/TXVariables";

export default new TXSlashCommand({
  name: "embed-builder",
  description: "Create, manage, and preview custom embeds",
  userPermissions: [PermissionFlagsBits.ManageGuild],
  serverOnly: true,
  options: [
    {
      name: "add",
      description: "Create a new embed template",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "embed-name",
          description: "Unique name for this embed",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "title",
          description: "Embed title",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "description",
          description: "Embed description",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "color",
          description: "Hex color code (e.g., #5865F2)",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "title-url",
          description: "URL for clickable title",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-name",
          description: "Author name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-icon",
          description: "Author icon URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-url",
          description: "Author URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "image",
          description: "Image URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "thumbnail",
          description: "Thumbnail URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "footer",
          description: "Footer text",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "footer-icon",
          description: "Footer icon URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "timestamp",
          description: "Show timestamp?",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "view",
      description: "Preview an embed template",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "embed-name",
          description: "Name of the embed to preview",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "List all embed templates in this server",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "set",
      description: "Update an existing embed template",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "embed-name",
          description: "Name of the embed to update",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "title",
          description: "New embed title",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "description",
          description: "New embed description",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "color",
          description: "New hex color code",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "title-url",
          description: "New title URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-name",
          description: "New author name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-icon",
          description: "New author icon URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "author-url",
          description: "New author URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "image",
          description: "New image URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "thumbnail",
          description: "New thumbnail URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "footer",
          description: "New footer text",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "footer-icon",
          description: "New footer icon URL",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "timestamp",
          description: "Show timestamp?",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete an embed template",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "embed-name",
          description: "Name of the embed to delete",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
  execute: async ({ interaction, args, client }) => {
    const subcommand = args.getSubcommand();
    const guildId = interaction.guildId!;

    let guildConfig = await GuildConfigs.findOne({ guildId });
    if (!guildConfig) {
      guildConfig = await GuildConfigs.create({ guildId, embeds: [] });
    }

    // Helper function to build embed from data
    const buildEmbed = async (embedData: any, context: any) => {
      const variableParser = new TXVariable();

      const parsedTitle = embedData.title
        ? await variableParser.parse(embedData.title, context)
        : null;
      const parsedDescription = embedData.description
        ? await variableParser.parse(embedData.description, context)
        : null;
      const parsedFooter = embedData.footer
        ? await variableParser.parse(embedData.footer, context)
        : null;

      const embed = new EmbedBuilder().setColor(
        embedData.color as ColorResolvable,
      );

      if (parsedTitle) embed.setTitle(parsedTitle);
      if (parsedDescription) embed.setDescription(parsedDescription);
      
      // Parse URL before setting
      if (embedData.url) {
        const parsedUrl = await variableParser.parse(embedData.url, context);
        embed.setURL(parsedUrl);
      }
      
      // Parse image URL before setting
      if (embedData.image) {
        const parsedImage = await variableParser.parse(embedData.image, context);
        embed.setImage(parsedImage);
      }
      
      // Parse thumbnail URL before setting
      if (embedData.thumbnail) {
        const parsedThumbnail = await variableParser.parse(embedData.thumbnail, context);
        embed.setThumbnail(parsedThumbnail);
      }
      
      if (embedData.timestamp) embed.setTimestamp();

      // Parse author URLs before setting
      if (embedData.author?.name) {
        const authorData: any = {
          name: await variableParser.parse(embedData.author.name, context),
        };
        
        if (embedData.author.iconURL) {
          const parsedIconURL = await variableParser.parse(embedData.author.iconURL, context);
          authorData.iconURL = parsedIconURL;
        }
        
        if (embedData.author.url) {
          const parsedAuthorUrl = await variableParser.parse(embedData.author.url, context);
          authorData.url = parsedAuthorUrl;
        }
        
        embed.setAuthor(authorData);
      }

      // Parse footer icon URL before setting
      if (parsedFooter) {
        const footerData: any = { text: parsedFooter };
        
        if (embedData.footerIconURL) {
          const parsedFooterIcon = await variableParser.parse(embedData.footerIconURL, context);
          footerData.iconURL = parsedFooterIcon;
        }
        
        embed.setFooter(footerData);
      }

      if (embedData.fields && embedData.fields.length > 0) {
        for (const field of embedData.fields) {
          const parsedName = await variableParser.parse(field.name, context);
          const parsedValue = await variableParser.parse(field.value, context);
          embed.addFields({
            name: parsedName,
            value: parsedValue,
            inline: field.inline,
          });
        }
      }

      return embed;
    };

    const context = {
      user: interaction.user,
      member: interaction.member,
      guild: interaction.guild!,
      channel: interaction.channel!,
    };

    switch (subcommand) {
      case "add": {
        const embedName = args.getString("embed-name", true);
        const title = args.getString("title")!;
        const description = args.getString("description")!;
        const color = args.getString("color") || "#5865F2";
        const titleUrl = args.getString("title-url");
        const authorName = args.getString("author-name");
        const authorIcon = args.getString("author-icon");
        const authorUrl = args.getString("author-url");
        const image = args.getString("image");
        const thumbnail = args.getString("thumbnail");
        const footer = args.getString("footer");
        const footerIcon = args.getString("footer-icon");
        const timestamp = args.getBoolean("timestamp") || false;

        if (
          !title &&
          !description &&
          !titleUrl &&
          !authorName &&
          !authorIcon &&
          !authorUrl &&
          !image &&
          !thumbnail &&
          !footer &&
          !footerIcon &&
          !timestamp
        ) {
          return interaction.reply({
            content:
              "❌ You must provide at least one embed property (e.g. title, description, etc.) — all fields cannot be empty.",
            flags: MessageFlags.Ephemeral,
          });
        }

        // Check if embed name already exists
        const existingEmbed = guildConfig.embeds.find(
          (e: any) => e.name === embedName,
        );
        if (existingEmbed) {
          return interaction.reply({
            content: `An embed with the name \`${embedName}\` already exists. Use \`/embed-builder set\` to update it.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Validate hex color
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
          return interaction.reply({
            content: `Invalid color format. Please use hex format like \`#5865F2\`.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Validate URLs (after parsing variables)
        const urlRegex = /^https?:\/\/\S+$/i;
        const variableParser = new TXVariable();

        const urlsToValidate = [
          { name: "title URL", value: titleUrl },
          { name: "author icon", value: authorIcon },
          { name: "author URL", value: authorUrl },
          { name: "image", value: image },
          { name: "thumbnail", value: thumbnail },
          { name: "footer icon", value: footerIcon },
        ];

        for (const urlData of urlsToValidate) {
          if (!urlData.value) continue;

          // parse variable placeholders first
          const parsedUrl = (await variableParser.parse(urlData.value, context))?.trim();

          if (parsedUrl && !urlRegex.test(parsedUrl)) {
            return interaction.reply({
              content: `Invalid ${urlData.name} URL. Must start with http:// or https://, ${urlData.value}`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        // Create author object if any author data is provided
        let author = null;
        if (authorName) {
          author = {
            name: authorName,
            iconURL: authorIcon,
            url: authorUrl,
          };
        }

        // Create new embed object
        const newEmbed = {
          name: embedName,
          title,
          description,
          color,
          url: titleUrl,
          image,
          thumbnail,
          footer,
          footerIconURL: footerIcon,
          timestamp,
          author,
          fields: [],
        };

        guildConfig.embeds.push(newEmbed);
        await guildConfig.save();

        // Create preview embed
        const previewEmbed = await buildEmbed(newEmbed, context);

        return interaction.reply({
          content: `✅ Successfully created embed template \`${embedName}\`!\n\n**Preview:**`,
          embeds: [previewEmbed],
        });
      }

      case "view": {
        const embedName = args.getString("embed-name", true);

        // Find embed
        const embedData = guildConfig.embeds.find(
          (e: any) => e.name === embedName,
        );
        if (!embedData) {
          return interaction.reply({
            content: `Embed template \`${embedName}\` not found.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Create preview embed
        const previewEmbed = await buildEmbed(embedData, context);

        return interaction.reply({
          content: `**Preview of \`${embedName}\`:**`,
          embeds: [previewEmbed],
        });
      }

      case "list": {
        if (guildConfig.embeds.length === 0) {
          return interaction.reply({
            content: "No embed templates found in this server.",
            flags: MessageFlags.Ephemeral,
          });
        }

        const embedList = guildConfig.embeds
          .map((e: any, index: number) => {
            return `**${index + 1}.** \`${e.name}\`\n└ Title: ${e.title || "None"}`;
          })
          .join("\n\n");

        const listEmbed = new EmbedBuilder()
          .setTitle("Embed Templates")
          .setDescription(embedList)
          .setColor("Blurple")
          .setFooter({ text: `Total: ${guildConfig.embeds.length} embeds` });

        return interaction.reply({
          embeds: [listEmbed],
        });
      }

      case "set": {
        const embedName = args.getString("embed-name", true);
        const title = args.getString("title");
        const description = args.getString("description");
        const color = args.getString("color");
        const titleUrl = args.getString("title-url");
        const authorName = args.getString("author-name");
        const authorIcon = args.getString("author-icon");
        const authorUrl = args.getString("author-url");
        const image = args.getString("image");
        const thumbnail = args.getString("thumbnail");
        const footer = args.getString("footer");
        const footerIcon = args.getString("footer-icon");
        const timestamp = args.getBoolean("timestamp");

        if (
          !title &&
          !description &&
          !titleUrl &&
          !authorName &&
          !authorIcon &&
          !authorUrl &&
          !image &&
          !thumbnail &&
          !footer &&
          !footerIcon &&
          !timestamp
        ) {
          return interaction.reply({
            content:
              "❌ You must provide at least one embed property (e.g. title, description, etc.) — all fields cannot be empty.",
            flags: MessageFlags.Ephemeral,
          });
        }

        const embedIndex = guildConfig.embeds.findIndex(
          (e: any) => e.name === embedName,
        );
        if (embedIndex === -1) {
          return interaction.reply({
            content: `Embed template \`${embedName}\` not found.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
          return interaction.reply({
            content: `Invalid color format. Please use hex format like \`#5865F2\`.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Validate URLs (after parsing variables)
        const urlRegex = /^https?:\/\/\S+$/i;
        const variableParser = new TXVariable();

        const urlsToValidate = [
          { name: "title URL", value: titleUrl },
          { name: "author icon", value: authorIcon },
          { name: "author URL", value: authorUrl },
          { name: "image", value: image },
          { name: "thumbnail", value: thumbnail },
          { name: "footer icon", value: footerIcon },
        ];

        for (const urlData of urlsToValidate) {
          if (!urlData.value) continue;

          // parse variable placeholders first
          const parsedUrl = (await variableParser.parse(urlData.value, context))?.trim();

          if (parsedUrl && !urlRegex.test(parsedUrl)) {
            return interaction.reply({
              content: `Invalid ${urlData.name} URL. Must start with http:// or https://, ${urlData.value}`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        const embed = guildConfig.embeds[embedIndex];
        if (title) embed.title = title;
        if (description) embed.description = description;
        if (color) embed.color = color;
        if (titleUrl) embed.url = titleUrl;
        if (image) embed.image = image;
        if (thumbnail) embed.thumbnail = thumbnail;
        if (footer) embed.footer = footer;
        if (footerIcon) embed.footerIconURL = footerIcon;
        if (timestamp) embed.timestamp = timestamp;

        if (authorName || authorIcon || authorUrl) {
          if (!embed.author) embed.author = { name: "", iconURL: "", url: "" };
          if (authorName) embed.author.name = authorName;
          if (authorIcon) embed.author.iconURL = authorIcon;
          if (authorUrl) embed.author.url = authorUrl;
        }

        await guildConfig.save();

        const previewEmbed = await buildEmbed(embed, context);

        return interaction.reply({
          content: `Successfully updated embed template \`${embedName}\`!\n\n**Updated Preview:**`,
          embeds: [previewEmbed],
        });
      }

      case "delete": {
        const embedName = args.getString("embed-name", true);

        // Find and remove embed
        const embedIndex = guildConfig.embeds.findIndex(
          (e: any) => e.name === embedName,
        );
        if (embedIndex === -1) {
          return interaction.reply({
            content: `Embed template \`${embedName}\` not found.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        guildConfig.embeds.splice(embedIndex, 1);
        await guildConfig.save();

        return interaction.reply({
          content: `Successfully deleted embed template \`${embedName}\`.`,
        });
      }

      default:
        return interaction.reply({
          content: "Invalid subcommand.",
          flags: MessageFlags.Ephemeral,
        });
    }
  },
});
