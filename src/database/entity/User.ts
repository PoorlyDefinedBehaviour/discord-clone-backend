import { Entity, Column, ObjectIdColumn } from "typeorm";

@Entity()
export class User {
  @ObjectIdColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  domain: string;
}
