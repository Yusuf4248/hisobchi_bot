import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LanguageCodeEnum, UserStateEnum } from "../../common/enums/enum";
import { DebtsTaken } from "../../debts-taken/entities/debts-taken.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint", unique: true })
  telegram_id: number;

  @Column({ type: "varchar", default: "" })
  username: string;

  @Column({
    type: "enum",
    enum: LanguageCodeEnum,
    nullable: true,
  })
  language_code: LanguageCodeEnum;

  @Column({
    type: "enum",
    enum: UserStateEnum,
    default: UserStateEnum.LANGUAGE,
  })
  main_state: UserStateEnum;

  @Column({ type: "integer", nullable: true })
  current_step: number | null;

  @Column({ default: 0 })
  balance: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => DebtsTaken, (debts_taken) => debts_taken.user, {
    onDelete: "CASCADE",
    nullable: true,
  })
  debts_taken: DebtsTaken[];
}
