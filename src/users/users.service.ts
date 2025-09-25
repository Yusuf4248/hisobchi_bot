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
      relations: [],
    });
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

  async onConfirmStop(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { telegram_id: ctx.from!.id },
    });
    if (!user) {
      return await ctx.editMessageText("❌ User not found");
    }
    const lang = user.language_code;
    await this.userRepo.delete({ telegram_id: ctx.from!.id });

    await ctx.editMessageText(i18n.t(lang, "stop.user_deleted"));
  }

  async onCancelStop(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { telegram_id: ctx.from!.id },
    });
    const lang = user!.language_code;

    await ctx.editMessageText(i18n.t(lang, "stop.cancelled"), {
      parse_mode: "HTML",
    });
  }

  async onChangeName(ctx: Context) {
    if (ctx.from) {
      const user = await this.findOne(ctx.from.id);
      if (!user) {
        await ctx.replyWithHTML(i18n.t("uz", "user_not_found"));
        return;
      }
      await this.userRepo.update(
        { telegram_id: ctx.from.id },
        { main_state: UserStateEnum.ON_CHANGE_NAME }
      );

      await ctx.editMessageText(i18n.t(user.language_code, "ask_username"));
    }
  }

  async onChangeLang(ctx: Context) {
    if (ctx.from) {
      const user = await this.findOne(ctx.from.id);
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
        ],
      ])
    );

    return;
  }
}
