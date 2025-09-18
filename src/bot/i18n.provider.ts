import { I18n } from "@edjopato/telegraf-i18n";
import * as path from "path";

export const i18n = new I18n({
  defaultLanguage: "uz",
  allowMissing: false,
  directory: path.resolve(__dirname, "../../locales/"),
});
