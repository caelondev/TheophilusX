import { GuildMember, MessageFlags } from "discord.js";
import { TXEvent } from "../../structures/TXEvent";
import RoleManager from "../../database/models/RoleManager";

export default new TXEvent("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const { guild, customId } = interaction;
  if (!guild || !customId.startsWith("role-mngr-")) return;

  try {
    const roleId = customId.split("-").pop()!;
    const member = interaction.member as GuildMember;

    const roleManager = await RoleManager.findOne({ guildId: guild.id });
    
    if (!roleManager) {
      return interaction.reply({
        content: "Role manager not found for this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const roleMessage = roleManager.roleMessages.find(
      (rm) => rm.messageId === interaction.message.id
    );

    if (!roleMessage) {
      return interaction.reply({
        content: "This role manager message is no longer valid.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!roleMessage.roleIds.includes(roleId)) {
      return interaction.reply({
        content: "This role is not configured for this button.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);

      return interaction.reply({
        content: `Removed the <@&${roleId}> role.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await member.roles.add(roleId);

      return interaction.reply({
        content: `You now have the <@&${roleId}> role.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    return interaction.reply({
      content: "An error occurred while updating your roles... Maybe that role has a higher role hierarchy than mine",
      flags: MessageFlags.Ephemeral,
    });
  }
});
