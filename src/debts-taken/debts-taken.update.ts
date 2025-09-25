import { Action, Ctx, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { DebtsTakenService } from "./debts-taken.service";

@Update()
export class DebtsTakenUpdate {
  constructor(private readonly debtsGivenService: DebtsTakenService) {}

  @Action("debt:i_owe")
  async onDebtIOwe(@Ctx() ctx: Context) {
    return this.debtsGivenService.onDebtIOwe(ctx);
  }

  @Action("given_debt_add")
  async onGivenDebtAdd(ctx: Context) {
    return this.debtsGivenService.onGivenDebtAdd(ctx);
  }

  @Action("given_debt_list")
  async onGivenDebtList(ctx: Context) {
    return this.debtsGivenService.onGivenDebtList(ctx);
  }

  @Action("given_debt_close")
  async onGivenDebtClose(ctx: Context) {
    await ctx.reply("Qarz yopish uchun amal...");
  }

  @Action("indebtedness_menu")
  async onBackToIndebtnessMenu(ctx: Context) {
    return this.debtsGivenService.onBackToIndebtnessMenu(ctx);
  }

  @Action("given_debt_back")
  async onBackToMyDebtsMenu(@Ctx() ctx: Context) {
    return this.debtsGivenService.onDebtIOwe(ctx);
  }
}
