import TXSlashCommand from "../../../structures/TXSlashCommand";
import Users from "../../../database/models/Users";
import { EmbedBuilder } from "discord.js";
import { PrettyLogger as log, LogTag } from "../../../utils/PrettyLogger";
import prettyMs from "pretty-ms";
import getRandomRange from "../../../utils/getRandomRange"

export default new TXSlashCommand({
  name: "daily",
  description: "Take your daily money",
  cooldown: 3000,
  execute: async ({ interaction }) => {
    if (interaction.user.bot) return;

    const dailyEmbed = new EmbedBuilder().setFooter({
      text: `Requested by ${interaction.user.displayName}`,
      iconURL: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
    }).setColor("Blurple");

    try {
      await interaction.deferReply();

      const query = {
        guildId: interaction.guild?.id,
        userId: interaction.user.id,
      };

      let user = await Users.findOne(query);
      if (!user) user = new Users(query);

      const cooldown = 1000 * 60 * 60 * 24;
      const lastDaily = user.lastDaily?.getTime() ?? 0;
      const diff = Date.now() - lastDaily;

      if (diff < cooldown) {
        const remaining = cooldown - diff;
        dailyEmbed.setDescription(`You can claim again in ${prettyMs(remaining, { verbose: true })}`);
        return interaction.editReply({ embeds: [dailyEmbed] });
      }

      const reward = getRandomRange(200, 1000)
      user.balance = (user.balance || 0) + reward;
      user.lastDaily = new Date();
      await user.save();

      dailyEmbed.setDescription(`You claimed ${reward} coins`).setTitle(`Daily reward claimed!`);
      return interaction.editReply({ embeds: [dailyEmbed] });
    } catch (error) {
      dailyEmbed.setDescription(`An error occurred whilst processing your request`).setColor("Red");
      interaction.editReply({ embeds: [dailyEmbed] });
      log.error({
        message: "Daily error:",
        tag: LogTag.COMMANDS,
        extra: [error],
      });
    }
  },
});
