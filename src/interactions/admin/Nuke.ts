import { userMention } from "@discordjs/builders";
import * as DJS from "discord.js";
import { Bot } from "structures/Bot";
import { ValidateReturn } from "structures/Command/BaseCommand";
import { SubCommand } from "structures/Command/SubCommand";
import { threadChannels } from "./LockChannel";

export default class RemoveRoleCommand extends SubCommand {
  constructor(bot: Bot) {
    super(bot, {
      commandName: "admin",
      name: "nuke",
      description:
        "Nuke the current channel. Note: The channel will instantly be deleted and re-created.",
      botPermissions: [DJS.Permissions.FLAGS.MANAGE_CHANNELS],
      memberPermissions: [DJS.Permissions.FLAGS.ADMINISTRATOR],
    });
  }

  async validate(
    interaction: DJS.ChatInputCommandInteraction<"cached">,
    lang: typeof import("@locales/english").default,
  ): Promise<ValidateReturn> {
    if (threadChannels.includes(interaction.channel?.type!)) {
      return {
        ok: false,
        error: { ephemeral: true, content: lang.ADMIN.CANNOT_USE_CMD_THREAD },
      };
    }

    return { ok: true };
  }

  async execute(
    interaction: DJS.ChatInputCommandInteraction<"cached">,
    lang: typeof import("@locales/english").default,
  ) {
    const channel = interaction.channel;
    if (!channel?.isText()) {
      return interaction.reply({
        ephemeral: true,
        content: "Invalid channel",
      });
    }

    if (!channel.deletable) {
      return interaction.reply({
        ephemeral: true,
        content: lang.ADMIN.CHANNEL_CANNOT_BE_DELETED,
      });
    }

    const position = channel.position;
    const topic = channel.topic;

    const channel2 = await channel.clone({ position, topic: topic ?? "" });

    await channel.delete();

    await channel2.send({
      content: `${lang.ADMIN.NUKE_NUKED}. ${userMention(interaction.user.id)}`,
    });
  }
}
