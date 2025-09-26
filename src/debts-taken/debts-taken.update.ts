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

  @Action("taken_debt_add")
  async onTakenDebtAdd(ctx: Context) {
    return this.debtsGivenService.onTakenDebtAdd(ctx);
  }

  @Action("taken_debt_list")
  async onTakenDebtList(ctx: Context) {
    return this.debtsGivenService.onTakenDebtList(ctx);
  }

  @Action("taken_debt_close")
  async onTakenDebtClose(ctx: Context) {
    return this.debtsGivenService.onTakenDebtClose(ctx);
  }

  @Action("indebtedness_menu")
  async onBackToIndebtnessMenu(ctx: Context) {
    return this.debtsGivenService.onBackToIndebtnessMenu(ctx);
  }

  // @Action(/^taken_debt_back_(\d+)$/)
  @Action("taken_debt_back")
  async onBackToMyDebtsMenu(@Ctx() ctx: Context) {
    return this.debtsGivenService.onDebtIOwe(ctx);
  }
}
