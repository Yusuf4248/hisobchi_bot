import { IndebtednessService } from "./indebtedness.service";
import { Action, Ctx, Update } from "nestjs-telegraf";
import { Context } from "telegraf";

@Update()
export class IndebtednessUpdate {
  constructor(private readonly indebtednessService: IndebtednessService) {}

  @Action("indebtedness")
  async onIndebtedness(@Ctx() ctx: Context) {
    return this.indebtednessService.onIndebtedness(ctx);
  }
}
