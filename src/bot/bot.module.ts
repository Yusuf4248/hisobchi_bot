import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { UsersModule } from "../users/users.module";
import { UsersUpdate } from "../users/users.update";
import { DebtsTakenModule } from "../debts-taken/debts-taken.module";
import { DebtsTakenUpdate } from "../debts-taken/debts-taken.update";
import { SettingsModule } from "../settings/settings.module";
import { SettingsUpdate } from "../settings/settings.update";
import { IndebtednessUpdate } from "../indebtedness/indebtedness.update";
import { IndebtednessModule } from "../indebtedness/indebtedness.module";

@Module({
  imports: [UsersModule, IndebtednessModule, DebtsTakenModule, SettingsModule],
  providers: [
    BotService,
    IndebtednessUpdate,
    SettingsUpdate,
    DebtsTakenUpdate,
    UsersUpdate,
    BotUpdate,
  ],
})
export class BotModule {}
