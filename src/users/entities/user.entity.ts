import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LanguageCodeEnum, UserStateEnum } from "../../common/enums/enum";

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
  state: UserStateEnum;

  @Column({ default: 0 })
  balance: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
