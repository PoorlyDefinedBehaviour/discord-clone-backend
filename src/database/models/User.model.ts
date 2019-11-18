import Mongoose from "../MongoDB";
import { hash } from "bcryptjs";

import { NextFunction } from "express";

const UserSchema = new Mongoose.Schema(
  {
    active: {
      type: Boolean,
      required: false,
      unique: false,
      select: true,
      default: true
    },
    username: {
      type: String,
      required: true,
      unique: false,
      select: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      select: true
    },
    password: {
      type: String,
      required: true,
      unique: false,
      select: false
    },
    avatar: {
      type: String,
      required: false,
      unique: false,
      select: true,
      default:
        "https://esports-betting-tips.com/wp-content/uploads/2018/02/Discord-Logo-1200x1200.png"
    },
    friends: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        select: true
      }
    ],
    friend_requests: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        select: true
      }
    ],
    servers: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Server",
        required: false,
        select: true
      }
    ]
  },
  {
    timestamps: true
  }
).index({ username: "text" });

UserSchema.pre("save", async function(
  this: any,
  next: NextFunction
): Promise<void> {
  const password: string = this.get("password");

  if (password && this.isModified("password")) {
    this.set("password", await hash(password, 10));
  }

  next();
});

export interface IUser extends Mongoose.Document {
  _id: string;
  active: boolean;
  username: string;
  email: string;
  password: string;
  avatar: string;
  friends: Mongoose.Types.ObjectId[];
  servers: Mongoose.Types.ObjectId[];
  friend_requests: Mongoose.Types.ObjectId[];
}

export const User: Mongoose.Model<IUser> = Mongoose.model<IUser>(
  "User",
  UserSchema
);
