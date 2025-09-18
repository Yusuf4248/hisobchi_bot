import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { UsersModule } from "../users/users.module";
import { UsersUpdate } from "../users/users.update";

@Module({
  imports: [UsersModule],
  controllers: [],
  providers: [BotService, UsersUpdate, BotUpdate],
})
export class BotModule {}
