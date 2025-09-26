import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
