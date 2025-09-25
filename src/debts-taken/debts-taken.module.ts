import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { DebtsTaken } from "./entities/debts-taken.entity";
import { DebtsTakenService } from "./debts-taken.service";

@Module({
  imports: [TypeOrmModule.forFeature([DebtsTaken]), UsersModule],
  providers: [DebtsTakenService],
  exports: [DebtsTakenService],
})
export class DebtsTakenModule {}
