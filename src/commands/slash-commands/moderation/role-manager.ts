import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Role,
  TextChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import TXSlashCommand from "../../../structures/TXSlashCommand";
import RoleManager, {
  IRoleManager,
} from "../../../database/models/RoleManager";
import GuildConfigs, {
  IGuildConfigs,
} from "../../../database/models/GuildConfigs";
import buildEmbed from "../../../utils/buildEmbed";

const BUTTON_STYLES = ["primary", "secondary", "success", "danger"] as const;

const BUTTON_STYLE_MAP: Record<string, ButtonStyle> = {
  PRIMARY: ButtonStyle.Primary,
  SECONDARY: ButtonStyle.Secondary,
  SUCCESS: ButtonStyle.Success,
  DANGER: ButtonStyle.Danger,
};

export default new TXSlashCommand({
  name: "role-manager",
  description: "Manage role buttons",
  options: [
    {
      name: "initialize",
      description: "Initialize a message for role manager",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel where the message will be sent",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
        {
          name: "message",
          description: "The message content you want to put",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "embed-name",
          description:
            "Embed name from `/embed-builder` (can be multiple, comma-separated)",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "attach-role",
      description: "Attach a role in the role manager message",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "message-id",
          description: "The message ID where you want to attach the role",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "role",
          description: "The role you want to add",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: "button-style",
          description: "The color/style of the button",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: BUTTON_STYLES.map((style) => ({
            name: style,
            value: style.toUpperCase(),
          })),
        },
        {
          name: "button-label",
          description: "The text/label displayed in the button",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "emoji",
          description: "The emoji you want to add for the button",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ],
  userPermissions: [PermissionFlagsBits.ManageRoles],
  serverOnly: true,
  execute: async ({ interaction, args }) => {
    const subcommand = args.getSubcommand();
    await interaction.deferReply();

    switch (subcommand) {
      case "initialize": {
        const channel = args.getChannel("channel") as TextChannel;
        const message = args.getString("message");
        const embedNames = args.getString("embed-name");

        if (!channel || !channel.isTextBased()) {
          return interaction.editReply({
            content: "Please provide a valid text channel.",
          });
        }

        if (!message && !embedNames) {
          return interaction.editReply({
            content:
              "You must provide at least a message or embed names (or both).",
          });
        }

        let roleManager = await RoleManager.findOne({
          guildId: interaction.guild!.id,
        });

        if (!roleManager) {
          roleManager = new RoleManager({
            guildId: interaction.guild!.id,
            roleMessages: [],
          });
        }

        const embeds = [];
        if (embedNames) {
          const guildConfig = await GuildConfigs.findOne({
            guildId: interaction.guild!.id,
          });

          if (!guildConfig) {
            return interaction.editReply({
              content:
                "No guild configuration found. Create embeds first with `/embed-builder`.",
            });
          }

          const requestedEmbedNames = embedNames
            .split(",")
            .map((name) => name.trim());

          for (const embedName of requestedEmbedNames) {
            const embedConfig = guildConfig.embeds.find(
              (e) => e.name.toLowerCase() === embedName.toLowerCase(),
            );

            if (!embedConfig) {
              return interaction.editReply({
                content: `Embed "${embedName}" not found in your saved embeds.`,
              });
            }

            const builtEmbed = await buildEmbed(embedConfig, {
              guild: interaction.guild!,
              member: interaction.member,
              user: interaction.user,
            });

            embeds.push(builtEmbed);
          }
        }

        const sentMessage = await channel.send({
          content: message || undefined,
          embeds: embeds.length > 0 ? embeds : undefined,
        });

        roleManager.roleMessages.push({
          messageId: sentMessage.id,
          channelId: channel.id,
          roleIds: [],
        });

        await roleManager.save();

        return interaction.editReply({
          content: `Successfully initialized a role manager message in ${channel}\nMessage ID: \`${sentMessage.id}\``,
        });
      }

      case "attach-role": {
        const messageId = args.getString("message-id", true);
        const role = args.getRole("role") as Role;
        const buttonStyleInput =
          args.getString("button-style")?.toUpperCase() || "PRIMARY";
        const buttonLabel = args.getString("button-label", true);
        const buttonEmoji = args.getString("emoji") || null;

        if (!role) {
          return interaction.editReply({
            content: "Invalid role provided.",
          });
        }

        const botMember = interaction.guild!.members.me!;
        if (role.position >= botMember.roles.highest.position) {
          return interaction.editReply({
            content: `I cannot manage ${role} because it is higher than or equal to my highest role in the hierarchy.`,
          });
        }

        if (role.id === interaction.guild!.id) {
          return interaction.editReply({
            content: "You cannot use the @everyone role.",
          });
        }

        if (role.managed) {
          return interaction.editReply({
            content: `${role} is a managed role (bot/integration role) and cannot be assigned manually.`,
          });
        }

        const buttonStyleEnum =
          BUTTON_STYLE_MAP[buttonStyleInput] || ButtonStyle.Primary;

        const roleManager = await RoleManager.findOne({
          guildId: interaction.guild!.id,
        });

        if (!roleManager) {
          return interaction.editReply({
            content:
              "No role manager found for this server. Create one with `/role-manager initialize`.",
          });
        }

        const roleMessage = roleManager.roleMessages.find(
          (rm) => rm.messageId === messageId,
        );

        if (!roleMessage) {
          return interaction.editReply({
            content: `Role manager message with ID \`${messageId}\` not found.`,
          });
        }

        if (roleMessage.roleIds.includes(role.id)) {
          return interaction.editReply({
            content: `Role ${role} is already attached to this message.`,
          });
        }

        const foundChannel = interaction.guild!.channels.cache.get(
          roleMessage.channelId,
        ) as TextChannel;

        if (!foundChannel) {
          return interaction.editReply({
            content:
              "Could not find the channel for this role manager message.",
          });
        }

        const discordMessage = await foundChannel.messages.fetch(messageId);

        const button = new ButtonBuilder()
          .setLabel(buttonLabel)
          .setStyle(buttonStyleEnum)
          .setCustomId(`role-mngr-${role.id}`);

        if (buttonEmoji) {
          button.setEmoji(buttonEmoji);
        }

        const rows: ActionRowBuilder<ButtonBuilder>[] =
          discordMessage.components.map((row) =>
            ActionRowBuilder.from<ButtonBuilder>(row as any),
          );

        let buttonAdded = false;

        for (const row of rows) {
          if (row.components.length < 5) {
            row.addComponents(button);
            buttonAdded = true;
            break;
          }
        }

        if (!buttonAdded) {
          if (rows.length >= 5) {
            return interaction.editReply({
              content:
                "Cannot add more buttons to this message (max 25 buttons).",
            });
          }

          const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            button,
          );
          rows.push(newRow);
        }

        await discordMessage.edit({
          components: rows,
        });

        roleMessage.roleIds.push(role.id);
        await roleManager.save();

        return interaction.editReply({
          content: `Successfully added ${role} button to the role manager message.`,
        });
      }
    }
  },
});
