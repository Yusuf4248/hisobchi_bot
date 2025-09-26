import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { LanguageCodeEnum, UserStateEnum } from "../common/enums/enum";
import { Context, Markup } from "telegraf";
import { i18n } from "../bot/i18n.provider";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async findOne(id: number) {
    return await this.userRepo.findOne({
      where: {
        telegram_id: id,
      },
      relations: ["debts_taken"],
    });
  }

  async delete(id: number) {
    await this.userRepo.delete({ telegram_id: id });
  }

  async saveUserTelegramId(id: number) {
    return await this.userRepo.save({ telegram_id: id });
  }

  async updateUserLanguage(
    id: number,
    lang: LanguageCodeEnum,
    changeState = false
  ) {
    const user = await this.findOne(id);

    const updateData: Partial<User> = {
      language_code: lang,
    };

    if (changeState) {
      updateData.main_state = UserStateEnum.USERNAME;
    }

    await this.userRepo.update({ telegram_id: id }, updateData);
  }

  async updateUsername(id: number, username: string) {
    await this.userRepo.update(
      { telegram_id: id },
      { username, main_state: UserStateEnum.END }
    );
  }

  async updateUserBalance(telegram_id: number, amount: number) {
    await this.userRepo.update(
      { telegram_id },
      { balance: amount, main_state: UserStateEnum.END }
    );
  }

  async updateUserState(id: number, state: UserStateEnum) {
    await this.userRepo.update({ telegram_id: id }, { main_state: state });
  }

  async updateUserStep(id: number, action: "NEXT" | "PREV" | "RESET") {
    const user = await this.userRepo.findOne({
      where: { telegram_id: id },
      select: ["id", "current_step"],
    });

    if (!user) return;

    let newStep: number | null = user.current_step ?? 0;

    switch (action) {
      case "NEXT":
        newStep = (user.current_step ?? 0) + 1;
        break;
      case "PREV":
        newStep =
          user.current_step && user.current_step > 0
            ? user.current_step - 1
            : 0;
        break;
      case "RESET":
        newStep = null;
        break;
    }

    await this.userRepo.update({ telegram_id: id }, { current_step: newStep });
  }

  async onBalance(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.findOne(ctx.from.id);
    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }
    await ctx.editMessageText(
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
          Markup.button.callback(
            i18n.t(user.language_code, "menu.back"),
            "back_main_menu"
          ),
        ],
      ])
    );

    return;
  }

  async onViewBalance(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.findOne(ctx.from.id);

    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }

    await ctx.editMessageText(
      `${i18n.t(user.language_code, "balance.title")}: ${user.balance}`,
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

  async onAddBalance(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.findOne(ctx.from.id);

    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }
    await this.userRepo.update(
      { telegram_id: ctx.from.id },
      { main_state: UserStateEnum.ADD_BALANCE }
    );
    await ctx.editMessageText(
      i18n.t(user.language_code, "balance.add_income"),
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

  async onGoBalanceBack(ctx: Context) {
    if (!ctx.from) {
      await ctx.reply(i18n.t("uz", "internal_server_error"));
      return;
    }

    const user = await this.findOne(ctx.from.id);

    if (!user) {
      await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
      return;
    }

    await this.userRepo.update(
      { telegram_id: ctx.from.id },
      { main_state: UserStateEnum.END }
    );

    await ctx.editMessageText(
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
          Markup.button.callback(
            i18n.t(user.language_code, "menu.back"),
            "back_main_menu"
          ),
        ],
      ])
    );

    return;
  }
}
