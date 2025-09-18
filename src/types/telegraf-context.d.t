import "telegraf";
import { I18nContext } from "nestjs-i18n";

declare module "telegraf" {
  export interface Context {
    i18n: I18nContext;
  }
}
