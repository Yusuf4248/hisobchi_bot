import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DebtsTaken } from "./entities/debts-taken.entity";
import { Repository } from "typeorm";
import { Context, Markup } from "telegraf";
import { i18n } from "../bot/i18n.provider";
import { UsersService } from "../users/users.service";

@Injectable()
export class DebtsTakenService {
  constructor(
    @InjectRepository(DebtsTaken)
    private readonly debtsTakenRepo: Repository<DebtsTaken>,
    private readonly userService: UsersService
  ) {}

  async onDebtIOwe(ctx: Context) {
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
      i18n.t(user.language_code, "indebtedness.given_debts.title"),
      {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.given_debts.add"),
              "given_debt_add"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.given_debts.list"),
              "given_debt_list"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.given_debts.close"),
              "given_debt_close"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "menu.back"),
              "indebtedness_menu"
            ),
          ],
        ]),
      }
    );
  }

  async onGivenDebtAdd(ctx: Context) {}

  async onGivenDebtList(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.userService.findOne(ctx.from.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }

    const debts = await this.debtsTakenRepo.find({
      where: { user: { telegram_id: user.telegram_id } },
    });

    if (!debts.length) {
      await ctx.editMessageText(
        i18n.t(user.language_code, "indebtedness.given_debts.empty"),
        {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                i18n.t(user.language_code, "menu.back"),
                "given_debt_back"
              ),
            ],
          ]),
        }
      );
      return;
    }

    let message = `${i18n.t(user.language_code, "indebtedness.given_debts.list_title")}\n\n`;

    debts.forEach((debt, index) => {
      message += `${index + 1}. 💵 ${debt.amount} ${debt.currency}\n`;
      message += `👤 ${debt.debtor_name}\n`;
      message += `📅 ${debt.created_at.toLocaleDateString()}\n\n`;
    });

    await ctx.replyWithHTML(message, {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            i18n.t(user.language_code, "menu.back"),
            "given_debt_back"
          ),
        ],
      ]),
    });
  }

  async onGivenDebtClose(ctx: Context) {}

  async onBackToIndebtnessMenu(ctx: Context) {
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
        ]),
      }
    );
    return;
  }
}
