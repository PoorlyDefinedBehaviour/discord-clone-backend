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

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  domain: string;

  @BeforeInsert()
  async hash_password() {
    this.password = await hash(this.password, 10);
  }

  constructor(email: string, password: string) {
    super();
    this.email = email;
    this.password = password;
  }
}
