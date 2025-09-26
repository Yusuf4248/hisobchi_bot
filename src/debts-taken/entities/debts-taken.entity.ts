import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CurrencyEnum } from "../../common/enums/enum";
import { User } from "../../users/entities/user.entity";

@Entity("debts-taken")
export class DebtsTaken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", default: "" })
  debtor_name: string;

  @Column({ type: "decimal", default: 0 })
  amount: number;

  @Column({ type: "enum", enum: CurrencyEnum, default: CurrencyEnum.UZS })
  currency: CurrencyEnum;

  @Column({ type: "date", nullable: true })
  due_date: Date;

  @Column({ type: "boolean", default: false })
  is_paid: boolean;

  @Column({ type: "text", default: "" })
  note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.debts_taken, {
    nullable: true,
    onDelete: "CASCADE",
  })
  user: User;
}
