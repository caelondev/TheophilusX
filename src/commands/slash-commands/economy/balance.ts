import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from "discord.js";
import TXSlashCommand from "../../../structures/TXSlashCommand";
import { PrettyLogger as log, LogTag } from "../../../utils/PrettyLogger";
import Users from "../../../database/models/Users";

export default new TXSlashCommand({
  name: "balance",
  description: "Check you or someone's balance",
  options: [
    {
      name: "user",
      description: "The user you want to check the balance",
      type: ApplicationCommandOptionType.User
    }
  ],
  cooldown: 3000,
  execute: async ({ interaction, args }) => {
    const targetUser = args.getUser("user") || interaction.user
    const balanceEmbed = new EmbedBuilder().setColor("Blurple").setFooter({ 
      text: `Requested by ${interaction.user.displayName}`,
      iconURL: interaction.user.avatarURL() || interaction.user.defaultAvatarURL
    })

    if(targetUser.bot) return interaction.reply({
      content: "Cannot inspect a bot's balance",
      flags: MessageFlags.Ephemeral
    })

    try {
      await interaction.deferReply()

      const query = {
        guildId: interaction.guild?.id,
        userId: targetUser.id
      }
      let user = await Users.findOne(query)
      if(!user) user = new Users(query)

      balanceEmbed.setDescription(`${targetUser}'s balance is ${user.balance || 0}`).setTitle(`Inspecting ${targetUser.displayName}'s balance`)
      interaction.editReply({ embeds: [balanceEmbed] })
    } catch (error) {
      log.error({
        message: "Balance error:",
        tag: LogTag.COMMANDS,
        extra: [error]
      })
    }

  }
})
