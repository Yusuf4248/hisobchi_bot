import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { UsersService } from "./users.service";
import { Context } from "telegraf";

@Update()
export class UsersUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Action("confirm_stop")
  async onConfirmStop(@Ctx() ctx: Context) {
    return this.usersService.onConfirmStop(ctx);
  }

  @Action("cancel_stop")
  async onCancelStop(@Ctx() ctx: Context) {
    return this.usersService.onCancelStop(ctx);
  }

  @Action("change_name")
  async onChangeName(@Ctx() ctx: Context) {
    return this.usersService.onChangeName(ctx);
  }

  @Action("change_lang")
  async onChangeLang(@Ctx() ctx: Context) {
    return this.usersService.onChangeLang(ctx);
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
