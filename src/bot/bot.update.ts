import { BotService } from "./bot.service";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { Context } from "telegraf";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.onStart(ctx);
  }

  @Action("back_main_menu")
  async onBackMainMenu(@Ctx() ctx: Context) {
    return this.botService.onBackToMainMenu(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    return this.botService.onText(ctx);
  }
}
