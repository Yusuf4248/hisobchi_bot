import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { UsersModule } from "../users/users.module";
import { UsersUpdate } from "../users/users.update";
import { DebtsTakenModule } from "../debts-taken/debts-taken.module";
import { DebtsTakenUpdate } from "../debts-taken/debts-taken.update";

@Module({
  imports: [UsersModule, DebtsTakenModule],
  providers: [BotService, DebtsTakenUpdate, UsersUpdate, BotUpdate],
})
export class BotModule {}
