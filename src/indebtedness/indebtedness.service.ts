import { Injectable } from "@nestjs/common";
import { Context, Markup } from "telegraf";
import { UsersService } from "../users/users.service";
import { i18n } from "../bot/i18n.provider";

@Injectable()
export class IndebtednessService {
  constructor(private readonly userService: UsersService) {}

  async onIndebtedness(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.userService.findOne(ctx.from.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }
    await ctx.editMessageText(
      i18n.t(user.language_code, "indebtedness.choose_option"),
      {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.i_owe"),
              "debt:i_owe"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.my_debtors"),
              "debt:my_debtors"
            ),
          ],
          [
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
}
