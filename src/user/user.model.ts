import { Optional } from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserRole } from 'src/common/utils/enum';

export interface UserAttrs {
  readonly id: string;
  readonly login: string;
  readonly passwordHash: string;
  readonly refreshTokenHash: string | null;
  readonly role: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type UserCreation = Optional<
  UserAttrs,
  'id' | 'refreshTokenHash' | 'createdAt' | 'updatedAt'
>;

@Table({ tableName: 'User' })
export class User extends Model<UserCreation, UserAttrs> {
  @Column({
    type: DataType.UUID,
    unique: true,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING })
  declare login: string;

  @Column({ type: DataType.STRING })
  declare passwordHash: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare refreshTokenHash: string | null;

  @Column({ type: DataType.ENUM(...Object.values(UserRole)) })
  declare role: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
