import mongoose, { Schema, Document } from "mongoose";
import { UserRole, UserStatus, UserDto } from "@examcenter/contracts";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  toDto(): UserDto;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["candidate", "admin"],
      default: "candidate",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).passwordHash;
        return ret;
      },
    },
  }
);

UserSchema.methods.toDto = function (): UserDto {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);
