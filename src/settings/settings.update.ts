import { Context } from "telegraf";
import { SettingsService } from "./settings.service";
import { Action, Ctx, Update } from "nestjs-telegraf";

@Update()
export class SettingsUpdate {
  constructor(private readonly settingsService: SettingsService) {}

  @Action("settings")
  async onSettings(@Ctx() ctx: Context) {
    return this.settingsService.onSettings(ctx);
  }

  @Action("delete_account")
  async onDeleteAccount(@Ctx() ctx: Context) {
    return this.settingsService.onDeleteAccount(ctx);
  }

  @Action("change_lang")
  async onChangeLang(@Ctx() ctx: Context) {
    return this.settingsService.onChangeLang(ctx);
  }

  @Action(/lang:(.+)/)
  async onBotLanguage(@Ctx() ctx: Context) {
    return this.settingsService.onLanguageChange(ctx);
  }

  @Action("change_name")
  async onChangeName(@Ctx() ctx: Context) {
    return this.settingsService.onChangeName(ctx);
  }

  @Action("back_to_settings_menu")
  async onBackToSettingMenu(@Ctx() ctx: Context) {
    return this.settingsService.onSettings(ctx);
  }

  @Action("confirm_stop")
  async onConfirmStop(@Ctx() ctx: Context) {
    return this.settingsService.onConfirmStop(ctx);
  }

  @Action("cancel_stop")
  async onCancelStop(@Ctx() ctx: Context) {
    return this.settingsService.onCancelStop(ctx);
  }
}
