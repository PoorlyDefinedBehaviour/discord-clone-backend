import Mongoose from "../MongoDB";

import { NextFunction } from "express";

const ServerSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      select: true
    },
    owner: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: false,
      select: true
    },
    staff: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        unique: false,
        select: true
      }
    ],
    logo: {
      type: String,
      required: false,
      unique: false,
      select: true,
      default:
        "https://esports-betting-tips.com/wp-content/uploads/2018/02/Discord-Logo-1200x1200.png"
    },
    members: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        select: true
      }
    ]
  },
  {
    timestamps: true
  }
);

function populate(this: any, next: NextFunction): void {
  this.populate("owner");
  this.populate("members");
  this.populate("staff");
  next();
}

ServerSchema.pre("find", populate);
ServerSchema.pre("findOne", populate);

export interface IServer extends Mongoose.Document {
  owner: Mongoose.Types.ObjectId;
  name: string;
  logo: string;
  staff: Mongoose.Types.ObjectId[];
  members: Mongoose.Types.ObjectId[];
}

export const Server: Mongoose.Model<IServer> = Mongoose.model<IServer>(
  "Server",
  ServerSchema
);
