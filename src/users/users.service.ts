import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { LanguageCodeEnum } from "../common/enums/enum";
import { Context } from "telegraf";
import { i18n } from "../bot/i18n.provider";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: {
        telegram_id: id,
      },
      relations: [],
    });
    if (!user) {
      return "user not found";
    }
    return user;
  }

  async saveUserTelegramId(id: number) {
    const newUser = await this.userRepo.save({ telegram_id: id });

    return newUser;
  }

  async updateLanguage(id: number, lang: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException("User topilmadi.");
    }

    await this.userRepo.update(
      { telegram_id: id },
      { language_code: lang as LanguageCodeEnum, state: "username" }
    );
  }

  async updateUsername(id: number, username: string) {
    await this.userRepo.update({ telegram_id: id }, { username, state: "end" });
  }

  async onConfirmStop(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { telegram_id: ctx.from!.id },
    });
    const lang = user!.language_code;
    await this.userRepo.delete({ telegram_id: ctx.from!.id });

    await ctx.reply(i18n.t(lang, "stop.user_deleted"));
  }
}
