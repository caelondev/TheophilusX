import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import TXCommand from "../../../structures/TXCommand";
import { GuildMessage } from "../../../typings/Command";

export default new TXCommand({
  name: "joke",
  description: "Sends a random joke",
  syntax: "joke",
  cooldown: 5000,
  execute: async ({ message }: { message: GuildMessage }) => {
    try {
      const response = await fetch("https://v2.jokeapi.dev/joke/Any");
      if (!response.ok)
        throw new Error(`Non-200 response: ${response.status}`);

      const json = await response.json();

      if (json?.error) throw new Error(json?.additionalInfo);

      // Check for unsafe jokes
      if (!json.safe) {
        const proceed = await notifyUser(message, json);
        if (!proceed) return; // user exited
      }

      // Build the base embed
      const jokeEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setFooter({
          text: `Requested by ${message.author.displayName}`,
          iconURL: message.author.displayAvatarURL(),
        });

      if (json.type === "twopart") {
        await handleTwoPart(message, json, jokeEmbed);
      } else {
        jokeEmbed
          .setTitle(`Category: ${json.category}`)
          .setDescription(json.joke);
        await message.reply({ embeds: [jokeEmbed] });
      }
    } catch (err: any) {
      const errorEmbed = new EmbedBuilder()
        .setColor("White")
        .setTitle("Oops...")
        .setDescription(`\`\`\`${err.message}\`\`\``);
      await message.reply({ embeds: [errorEmbed] });
    }
  },
});

function getAllFlags(jsonFlags: Record<string, boolean>): string[] {
  const flags: string[] = [];
  for (const [flag, used] of Object.entries(jsonFlags)) {
    if (used) flags.push(flag);
  }
  return flags;
}

async function notifyUser(message: GuildMessage, json: any): Promise<boolean> {
  return new Promise(async (resolve) => {
    const flags = getAllFlags(json.flags);

    const description =
      flags.length > 0
        ? `⚠️ This joke is flagged as **[${flags.join(", ")}]**.\nDo you wish to continue?`
        : `⚠️ This joke has **no specific flags**, but is still marked as **unsafe**.\nDo you wish to continue?`;

    const embed = new EmbedBuilder()
      .setColor("DarkButNotBlack")
      .setTitle("⚠️ Warning")
      .setDescription(description);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("joke-exit")
        .setLabel("Exit")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("joke-continue")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary)
    );

    const reply = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300_000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("This is not your joke session."),
          ],
          ephemeral: true,
        });
      }

      if (interaction.customId === "joke-exit") {
        collector.stop("exit");
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ You cancelled the joke."),
          ],
          ephemeral: true,
        });
      }

      if (interaction.customId === "joke-continue") {
        collector.stop("continue");
        await interaction.deferUpdate();
        resolve(true);
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "exit" || reason === "time") return resolve(false);
      if (reason === "continue") return resolve(true);
    });
  });
}

async function handleTwoPart(
  message: GuildMessage,
  json: any,
  baseEmbed: EmbedBuilder
) {
  const setup = json.setup;
  const delivery = json.delivery;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("joke-next")
      .setLabel("Show punchline")
      .setStyle(ButtonStyle.Primary)
  );

  const setupEmbed = new EmbedBuilder(baseEmbed.toJSON())
    .setTitle(`Category: ${json.category}`)
    .setDescription(setup);

  const reply = await message.reply({ embeds: [setupEmbed], components: [row] });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120_000,
  });

  collector.on("collect", async (interaction) => {
    // prevent others from clicking your button
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("This is not your joke session."),
        ],
        ephemeral: true,
      });
    }

    const punchlineEmbed = new EmbedBuilder(baseEmbed.toJSON())
      .setDescription(delivery)
      .setTitle(null);

    await interaction.deferUpdate();
    await reply.edit({ components: [] });

    if (!message.channel || !message.channel.isTextBased()) return;
   

    await message.channel?.send({ embeds: [punchlineEmbed] });
  });

  collector.on("end", (_, reason) => {
    if (reason === "time") {
      console.warn("Joke session expired — no punchline shown.");
    }
  });
}
