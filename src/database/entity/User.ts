import {
  Entity,
  Column,
  ObjectIdColumn,
  BeforeInsert,
  BaseEntity
} from "typeorm";

import { hash } from "bcryptjs";

@Entity()
export default class User extends BaseEntity {
  @ObjectIdColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  domain: string;

  @BeforeInsert()
  async hash_password() {
    this.password = await hash(this.password, 10);
  }
}
