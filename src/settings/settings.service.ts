import { Injectable } from "@nestjs/common";
import { Context, Markup } from "telegraf";
import { i18n } from "../bot/i18n.provider";
import { UsersService } from "../users/users.service";
import { LanguageCodeEnum, UserStateEnum } from "../common/enums/enum";

@Injectable()
export class SettingsService {
  constructor(private readonly userService: UsersService) {}
  async onSettings(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.userService.findOne(ctx.from.id);
    if (!user) {
      await ctx.editMessageText(i18n.t("uz", "user_not_found"));
      return;
    }
    await ctx.editMessageText(
      i18n.t(user.language_code, "settings.choose_option"),
      {
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
            Markup.button.callback(
              i18n.t(user.language_code, "menu.back"),
              "back_main_menu"
            ),
          ],
        ]),
      }
    );
    return;
  }

  async onDeleteAccount(ctx: Context) {
    const user = await this.userService.findOne(ctx.from!.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    } else {
      await ctx.editMessageText(i18n.t(user.language_code, "stop.confirm"), {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "stop.yes"),
              "confirm_stop"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "stop.no"),
              "cancel_stop"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.back"),
              "back_to_settings_menu"
            ),
          ],
        ]),
      });
    }
  }

  async onConfirmStop(ctx: Context) {
    const user = await this.userService.findOne(ctx.from!.id);
    if (!user) {
      return await ctx.editMessageText("❌ User not found");
    }
    const lang = user.language_code;
    await this.userService.delete(ctx.from!.id);

    await ctx.editMessageText(i18n.t(lang, "stop.user_deleted"));
  }

  async onCancelStop(ctx: Context) {
    const user = await this.userService.findOne(ctx.from!.id);
    if (!user) {
      await ctx.editMessageText(i18n.t("uz", "user_not_found"));
      return;
    }
    const lang = user.language_code;

    await ctx.editMessageText(i18n.t(lang, "stop.cancelled"));
  }

  async onChangeLang(ctx: Context) {
    if (ctx.from) {
      const user = await this.userService.findOne(ctx.from.id);
      if (!user) {
        await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
        return;
      }
      await ctx.editMessageText(
        i18n.t(user.language_code, "choose_lang"),
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🇺🇿", "lang:uz"),
            Markup.button.callback("🇷🇺", "lang:ru"),
            Markup.button.callback("🇬🇧", "lang:en"),
          ],
        ])
      );
    }
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

      const user1 = await this.userService.findOne(ctx.from!.id);
      if (!user1) {
        await ctx.reply(i18n.t(lang, "errors.not_registered"));
        return;
      }

      if (user1.main_state == UserStateEnum.USERNAME) {
        await ctx.editMessageText(i18n.t(lang, "language_set"));
        await ctx.reply(i18n.t(lang, "ask_username"));
      } else {
        await ctx.editMessageText(i18n.t(lang, "menu.title"), {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                i18n.t(user1.language_code, "menu.add_new_operation"),
                "add_new_operation"
              ),
            ],
            [
              Markup.button.callback(
                i18n.t(user1.language_code, "menu.indebtedness"),
                "indebtedness"
              ),
              Markup.button.callback(
                i18n.t(user1.language_code, "menu.balans"),
                "balance"
              ),
            ],
            [
              Markup.button.callback(
                i18n.t(user1.language_code, "menu.reports"),
                "reports"
              ),
              Markup.button.callback(
                i18n.t(user1.language_code, "menu.settings"),
                "settings"
              ),
            ],
          ]),
        });
      }
    } catch (error) {
      await ctx.reply(i18n.t("uz", "errors.user_not_found"));
    }
  }

  async onChangeName(ctx: Context) {
    if (ctx.from) {
      const user = await this.userService.findOne(ctx.from.id);
      if (!user) {
        await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
        return;
      }
      await this.userService.updateUserState(
        ctx.from.id,
        UserStateEnum.ON_CHANGE_NAME
      );

      await ctx.editMessageText(i18n.t(user.language_code, "ask_username"));
    }
  }
}
