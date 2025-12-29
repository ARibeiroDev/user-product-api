export interface IUser {
  readonly _id?: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  isActive: boolean;
  refreshToken?: string | undefined;
  emailVerificationToken?: string | undefined;
  emailVerificationExpires?: Date | undefined;
  passwordResetToken?: string | undefined;
  passwordResetExpires?: Date | undefined;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
