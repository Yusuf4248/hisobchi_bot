import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DebtsTaken } from "./entities/debts-taken.entity";
import { Repository } from "typeorm";
import { Context, Markup } from "telegraf";
import { i18n } from "../bot/i18n.provider";
import { UsersService } from "../users/users.service";
import { UserStateEnum } from "../common/enums/enum";
import { User } from "../users/entities/user.entity";

@Injectable()
export class DebtsTakenService {
  constructor(
    @InjectRepository(DebtsTaken)
    private readonly debtsTakenRepo: Repository<DebtsTaken>,
    private readonly userService: UsersService
  ) {}

  async createNewDebtTaken(user: User) {
    return this.debtsTakenRepo.save({
      user,
    });
  }

  async findOne(id: number) {}

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
      i18n.t(user.language_code, "indebtedness.my_debts.title"),
      {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.my_debts.add"),
              "taken_debt_add"
            ),
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.my_debts.list"),
              "taken_debt_list"
            ),
          ],
          [
            Markup.button.callback(
              i18n.t(user.language_code, "indebtedness.my_debts.pay"),
              "taken_debt_close"
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

  async onTakenDebtAdd(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.userService.findOne(ctx.from.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }

    const debt = await this.createNewDebtTaken(user);

    await ctx.editMessageText(
      i18n.t(user.language_code, "indebtedness.my_debts.debt_add.step1"),
      {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t(user.language_code, "cancel"),
              `taken_debt_back_${debt.id}`
            ),
          ],
        ]),
      }
    );

    await this.userService.updateUserState(
      ctx.from.id,
      UserStateEnum.NEW_DEBT_TAKEN
    );
    await this.userService.updateUserStep(ctx.from.id, "NEXT");
    return;
  }

  async onTakenDebtList(ctx: Context) {
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
        i18n.t(user.language_code, "indebtedness.my_debts.empty"),
        {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                i18n.t(user.language_code, "menu.back"),
                "taken_debt_back"
              ),
            ],
          ]),
        }
      );
      return;
    }

    let message = `${i18n.t(user.language_code, "indebtedness.my_debts.list_title")}\n\n`;

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
            "taken_debt_back"
          ),
        ],
      ]),
    });
  }

  async onTakenDebtClose(ctx: Context) {}

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
          [
            Markup.button.callback(
              i18n.t(user.language_code, "menu.back"),
              "back_main_menu"
            ),
          ]
        ]),
      }
    );
    return;
  }
}
