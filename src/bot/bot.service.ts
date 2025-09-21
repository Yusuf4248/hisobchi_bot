import { Injectable } from "@nestjs/common";
import { Context } from "telegraf";
import { UsersService } from "../users/users.service";
import { i18n } from "./i18n.provider";
import { Markup } from "telegraf";
import { LanguageCodeEnum, UserStateEnum } from "../common/enums/enum";

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
    if (isUserExist) {
      await ctx.replyWithHTML(i18n.t("uz", "help"));
      return;
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
      const lang = (ctx as any).match[1] as LanguageCodeEnum;

      const user = await this.userService.findOne(ctx.from!.id);
      if (!user) {
        await ctx.reply(i18n.t(lang, "errors.not_registered"));
        return;
      }

      const shouldChangeState = !user.username;
      await this.userService.updateUserLanguage(
        ctx.from!.id,
        lang,
        shouldChangeState
      );

      await ctx.answerCbQuery();
      const user1 = await this.userService.findOne(ctx.from!.id);
      if (!user1) {
        await ctx.reply(i18n.t(lang, "errors.not_registered"));
        return;
      }

      await ctx.editMessageText(i18n.t(lang, "language_set"));
      if (user1.state == UserStateEnum.USERNAME)
        await ctx.reply(i18n.t(lang, "ask_username"));
    } catch (error) {
      await ctx.reply(i18n.t("uz", "errors.user_not_found"));
    }
  }

  async onDeleteAccount(ctx: Context) {
    const user = await this.userService.findOne(ctx.from!.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    } else {
      await ctx.editMessageText(i18n.t(user.language_code, "stop.confirm"), {
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

  async onText(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.userService.findOne(ctx.from.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }

    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply(i18n.t(user.language_code, "help"));
      return;
    }

    const text = ctx.message.text;

    if (user.state === UserStateEnum.USERNAME) {
      await this.userService.updateUsername(ctx.from.id, text);

      await ctx.replyWithHTML(i18n.t(user.language_code, "username_saved"), {
        ...Markup.keyboard([
          [i18n.t(user.language_code, "menu.add_new_operation")],
          [
            i18n.t(user.language_code, "menu.indebtedness"),
            i18n.t(user.language_code, "menu.balans"),
          ],
          [
            i18n.t(user.language_code, "menu.reports"),
            i18n.t(user.language_code, "menu.settings"),
          ],
        ]).resize(),
      });
      return;
    }

    if (text === i18n.t(user.language_code, "menu.settings")) {
      await ctx.reply(i18n.t(user.language_code, "settings.choose_option"), {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "settings.change_name"),
              "change_name"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "settings.change_lang"),
              "change_lang"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "settings.change_currency"),
              "change_currency"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "settings.delete_account"),
              "delete_account"
            ),
          ],
        ]),
      });
      return;
    }

    if (text === i18n.t(user.language_code, "menu.balans")) {
      await ctx.reply(
        i18n.t(user.language_code, "balance.choose_option"),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "balance.view"),
              "bal_view"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "balance.add_income"),
              "bal_add"
            ),
          ],
        ])
      );

      return;
    }

    if (user.state === UserStateEnum.ADD_BALANCE) {
      if (isNaN(Number(text)) || Number(text) <= 0) {
        await ctx.reply(i18n.t(user.language_code, "errors.invalid_balance"));
        return;
      }
      const newBalance = user.balance + Number(text);
      await this.userService.updateUserBalance(ctx.from.id, newBalance);

      await ctx.reply(
        `${i18n.t(user.language_code, "balance.add_success")}\n${i18n.t(user.language_code, "balance.title")}: ${newBalance}`
      );

      return;
    }

    if (user.state === UserStateEnum.ON_CHANGE_NAME) {
      await this.userService.updateUsername(ctx.from.id, text);
      await ctx.replyWithHTML(i18n.t(user.language_code, "username_saved"));
      return;
    }

    await ctx.reply(i18n.t(user.language_code, "help"));
    return;
  }
}
