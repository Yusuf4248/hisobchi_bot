import { Injectable } from "@nestjs/common";
import { Context } from "telegraf";
import { UsersService } from "../users/users.service";
import { i18n } from "./i18n.provider";
import { Markup } from "telegraf";
import { CurrencyEnum, UserStateEnum } from "../common/enums/enum";
import { DebtsTakenService } from "../debts-taken/debts-taken.service";

@Injectable()
export class BotService {
  constructor(
    private readonly userService: UsersService,
    private readonly debtsTakenService: DebtsTakenService
  ) {}

  async onStart(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply(
        "Kutilmagan xatolik yuz berdi. Iltimos qayta urinib koring"
      );
    }
    const user = await this.userService.findOne(ctx.from.id);
    if (user) {
      await ctx.replyWithHTML(i18n.t(user.language_code, "menu.title"), {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.add_new_operation"),
              "add_new_operation"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.indebtedness"),
              "indebtedness"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.balans"),
              "balance"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.reports"),
              "reports"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.settings"),
              "settings"
            ),
          ],
        ]),
      });
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

  async onBackToMainMenu(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.userService.findOne(ctx.from.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }

    await ctx.editMessageText(i18n.t(user.language_code, "menu.title"), {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.add_new_operation"),
            "add_new_operation"
          ),
        ],
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.indebtedness"),
            "indebtedness"
          ),
          Markup.button.callback(
            i18n.t(user.language_code, "menu.balans"),
            "balance"
          ),
        ],
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.reports"),
            "reports"
          ),
          Markup.button.callback(
            i18n.t(user.language_code, "menu.settings"),
            "settings"
          ),
        ],
      ]),
    });
    return;
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

    if (user.main_state === UserStateEnum.LANGUAGE) {
      await ctx.reply(
        `❗ Botdan foydalanish uchun avval tilni tanlashingiz kerak.\n❗ Чтобы пользоваться ботом, сначала выберите язык.\n❗ To use the bot, please choose a language first. `,
        Markup.inlineKeyboard([
          [
            Markup.button.callback(" 🇺🇿 ", "lang:uz"),
            Markup.button.callback(" 🇷🇺 ", "lang:ru"),
            Markup.button.callback(" 🇬🇧 ", "lang:en"),
          ],
        ])
      );
      return;
    }

    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply(i18n.t(user.language_code, "help"));
      return;
    }

    const text = ctx.message.text;

    if (user.main_state === UserStateEnum.USERNAME) {
      await this.userService.updateUsername(ctx.from.id, text);

      await ctx.replyWithHTML(i18n.t(user.language_code, "username_saved"), {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.add_new_operation"),
              "add_new_operation"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.indebtedness"),
              "indebtedness"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.balans"),
              "balance"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.reports"),
              "reports"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.settings"),
              "settings"
            ),
          ],
        ]),
      });
      return;
    }

    if (user.main_state === UserStateEnum.ADD_BALANCE) {
      if (isNaN(Number(text)) || Number(text) <= 0) {
        await ctx.reply(i18n.t(user.language_code, "errors.invalid_balance"));
        return;
      }
      const newBalance = user.balance + Number(text);
      await this.userService.updateUserBalance(ctx.from.id, newBalance);

      await ctx.reply(
        `${i18n.t(user.language_code, "balance.add_success")}\n${i18n.t(user.language_code, "balance.title")}: ${newBalance}`,
        {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                i18n.t(user.language_code, "menu.back"),
                "bal_go_back"
              ),
            ],
          ]),
        }
      );

      return;
    }

    if (user.main_state === UserStateEnum.ON_CHANGE_NAME) {
      await this.userService.updateUsername(ctx.from.id, text);
      await ctx.reply(i18n.t(user.language_code, "username_saved"));
      await ctx.replyWithHTML(i18n.t(user.language_code, "menu.title"), {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.add_new_operation"),
              "add_new_operation"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.indebtedness"),
              "indebtedness"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.balans"),
              "balance"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.reports"),
              "reports"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.settings"),
              "settings"
            ),
          ],
        ]),
      });
      return;
    }

    if (
      user.main_state === UserStateEnum.NEW_DEBT_TAKEN &&
      user.current_step == 1
    ) {
      const debt = await this.userService.updateUserStep(ctx.from.id, "NEXT");
      await ctx.reply(
        i18n.t(user.language_code, "indebtedness.my_debts.debt_add.step2"),
        {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback("🇺🇿 UZS", `currency_${CurrencyEnum.UZS}`),
              Markup.button.callback("🇺🇸 USD", `currency_${CurrencyEnum.USD}`),
            ],
            [
              Markup.button.callback("🇪🇺 EUR", `currency_${CurrencyEnum.EUR}`),
              Markup.button.callback("🇷🇺 RUB", `currency_${CurrencyEnum.RUB}`),
            ],
            [
              Markup.button.callback(
                i18n.t(user.language_code, "menu.back"),
                "new_taken_debt_back"
              ),
              Markup.button.callback(
                i18n.t(user.language_code, "cancel"),
                "taken_debt_back"
              ),
            ],
          ]),
        }
      );
      return;
    }

    if (
      user.main_state === UserStateEnum.NEW_DEBT_TAKEN &&
      user.current_step == 2
    ) {
      await this.debtsTakenService.createNewDebtTaken(user);
      await this.userService.updateUserStep(ctx.from.id, "NEXT");
      await ctx.reply(
        i18n.t(user.language_code, "indebtedness.my_debts.debt_add.step2"),
        {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                i18n.t(user.language_code, "cancel"),
                "taken_debt_back"
              ),
            ],
          ]),
        }
      );
      return;
    }

    await ctx.reply(i18n.t(user.language_code, "menu.title"), {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.add_new_operation"),
            "add_new_operation"
          ),
        ],
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.indebtedness"),
            "indebtedness"
          ),
          Markup.button.callback(
            i18n.t(user.language_code, "menu.balans"),
            "balance"
          ),
        ],
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.reports"),
            "reports"
          ),
          Markup.button.callback(
            i18n.t(user.language_code, "menu.settings"),
            "settings"
          ),
        ],
      ]),
    });
    return;
  }
}
