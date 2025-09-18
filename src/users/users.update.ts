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
}
