import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { UsersService } from "./users.service";
import { Context } from "telegraf";

@Update()
export class UsersUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Action("balance")
  async onBalance(@Ctx() ctx: Context) {
    return this.usersService.onBalance(ctx);
  }

  @Action("bal_view")
  async onViewBalance(@Ctx() ctx: Context) {
    return this.usersService.onViewBalance(ctx);
  }

  @Action("bal_add")
  async onAddBalance(@Ctx() ctx: Context) {
    return this.usersService.onAddBalance(ctx);
  }

  @Action("bal_go_back")
  async onGoBalanceBack(@Ctx() ctx: Context) {
    return this.usersService.onGoBalanceBack(ctx);
  }
}
