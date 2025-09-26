import { Module } from "@nestjs/common";
import { IndebtednessService } from "./indebtedness.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [IndebtednessService],
  exports: [IndebtednessService],
})
export class IndebtednessModule {}
