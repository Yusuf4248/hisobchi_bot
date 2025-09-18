import { Injectable } from "@nestjs/common";
import { Context } from "telegraf";
import { UsersService } from "../users/users.service";
import { i18n } from "./i18n.provider";
import { Markup } from "telegraf";
import { LanguageCodeEnum } from "../common/enums/enum";

@Injectable()
export class BotService {
  constructor(private readonly userService: UsersService) {}

  async onStart(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply(
        "Kutilmagan xatolik yuz berdi. Iltimos qayta urinib koring"
      );
    }
    const isUserExist = await this.userService.findOne(ctx.from.id);
    if (isUserExist !== "user not found") {
      const lang = isUserExist.language_code || "uz";
      await ctx.reply(i18n.t(lang, "help"));
    }
    await this.userService.saveUserTelegramId(ctx.from.id);
    await ctx.reply(
      "Kerakli tilni tanlang: 🇺🇿👇\nВыберите язык: 🇷🇺👇\nPlease choose a language: 🇬🇧👇",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(" 🇺🇿 ", "lang:uz"),
          Markup.button.callback(" 🇷🇺 ", "lang:ru"),
          Markup.button.callback(" 🇬🇧 ", "lang:en"),
        ],
      ])
    );
  }

  async onLanguageChange(ctx: Context) {
    try {
      // Extract language code
      const lang = (ctx as any).match[1] as LanguageCodeEnum;

      // Find user
      const user = await this.userService.findOne(ctx.from!.id);
      if (!user) {
        await ctx.reply(i18n.t(lang, "errors.not_registered"));
        return;
      }

      // Update language in DB
      await this.userService.updateLanguage(ctx.from!.id, lang);

      // Close callback spinner
      await ctx.answerCbQuery();

      // Translate success message
      const successMessage = i18n.t(lang, "language_set") as string;

      // Edit message with success text
      await ctx.editMessageText(successMessage);
      await ctx.reply(i18n.t(lang, "ask_username"));
    } catch (error) {
      await ctx.reply(i18n.t("uz", "errors.user_not_found"));
    }
  }

  async onText(ctx: Context) {
    if (!ctx.from) {
      return await ctx.reply(i18n.t("uz", "internal_server_error"));
    }
    const user = await this.userService.findOne(ctx.from.id);
    if (typeof user == "string") {
      return await ctx.reply(i18n.t("uz", "user_not_found"));
    }

    if (user.state == "username" && ctx.message && "text" in ctx.message) {
      await this.userService.updateUsername(ctx.from.id, ctx.message!.text);

      return await ctx.replyWithHTML("✅ Ism muvaffaqiyatli saqlandi!", {
        ...Markup.keyboard([
          [i18n.t(user.language_code, "menu.add_new_operation")],
          [
            i18n.t(user.language_code, "menu.indebtedness"),
            i18n.t(user.language_code, "menu.balans"),
          ],
          [
            i18n.t(user.language_code, "menu.reports"),
            i18n.t(user.language_code, "menu.setting"),
          ],
        ]).resize(),
      });
    }

    await ctx.reply(i18n.t(user.language_code, "help"));
  }

  async onStop(ctx: Context) {
    const user = await this.userService.findOne(ctx.from!.id);
    if (user == "user not found") {
      await ctx.reply(i18n.t("uz", "user_not_found"));
    } else {
      await ctx.reply(i18n.t(user.language_code, "stop.confirm"), {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: i18n.t(user.language_code, "stop.yes"),
                callback_data: "confirm_stop",
              },
              {
                text: i18n.t(user.language_code, "stop.no"),
                callback_data: "cancel_stop",
              },
            ],
          ],
        },
      });
    }
  }
}
