import {
  Entity,
  Column,
  ObjectIdColumn,
  BeforeInsert,
  BaseEntity
} from "typeorm";

import { ObjectID } from "mongodb";

import { hash } from "bcryptjs";

@Entity()
export default class User extends BaseEntity {
  @ObjectIdColumn({ select: true })
  _id: ObjectID;

  @Column({ unique: true, nullable: false, select: true })
  email: string;

  @Column({ default: false, nullable: false, select: true })
  email_confirmed: boolean;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ default: null, select: true })
  domain: string | null;

  @BeforeInsert()
  async hash_password() {
    this.password = await hash(this.password, 10);
  }

  constructor(email: string, password: string) {
    super();
    this.email = email;
    this.email_confirmed = false;
    this.domain = null;
    this.password = password;
  }
}
