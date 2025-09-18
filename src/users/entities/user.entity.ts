import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LanguageCodeEnum } from "../../common/enums/enum";

@Entity("user")
export class User {
  @ApiProperty({
    example: 1,
    description: "User's unique ID",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 123456,
    description: "User's telegram id",
  })
  @Column({ type: "bigint", unique: true })
  telegram_id: number;

  @ApiProperty({
    example: "John",
    description: "User's username",
  })
  @Column({ type: "varchar", nullable: true })
  username: string;

  @ApiProperty({
    example: LanguageCodeEnum.UZ,
    description: "Language code: uz, ru or en",
    enum: LanguageCodeEnum,
  })
  @Column({
    type: "enum",
    enum: LanguageCodeEnum,
    default: LanguageCodeEnum.UZ,
  })
  language_code: LanguageCodeEnum;

  @Column({ type: "varchar", default: "lang" })
  state: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
