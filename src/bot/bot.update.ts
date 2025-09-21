import { BotService } from "./bot.service";
import { Action, Command, Ctx, On, Start, Update } from "nestjs-telegraf";
import { Context } from "telegraf";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.onStart(ctx);
  }

  @Action(/lang:(.+)/)
  async onBotLanguage(@Ctx() ctx: Context) {
    return this.botService.onLanguageChange(ctx);
  }

  @Action("delete_account")
  async onDeleteAccount(@Ctx() ctx: Context) {
    return this.botService.onDeleteAccount(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    return this.botService.onText(ctx);
  }
}
