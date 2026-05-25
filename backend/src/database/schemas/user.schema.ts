import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop({ required: true, unique: true, lowercase: true }) email: string;
  @Prop({ select: false }) password: string;
  @Prop() phone: string;
  @Prop() avatar: string;
  @Prop({ type: Types.ObjectId, ref: 'Role' }) role: Types.ObjectId;
  @Prop({ default: 'active' }) status: string;
  @Prop({ default: 'local' }) provider: string;
  @Prop() googleId: string;
  @Prop({ default: false }) emailVerified: boolean;
  @Prop({ select: false }) emailVerificationToken: string;
  @Prop() emailVerificationExpires: Date;
  @Prop({ select: false }) passwordResetToken: string;
  @Prop() passwordResetExpires: Date;
  @Prop({ select: false }) refreshToken: string;
  @Prop({ default: 0 }) loginCount: number;
  @Prop() lastLoginAt: Date;
  @Prop() lastLoginIp: string;
  @Prop({ type: Object }) profile: Record<string, any>;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', { virtuals: true, transform: (_doc, ret) => {
  delete ret.password; delete ret.refreshToken;
  delete ret.emailVerificationToken; delete ret.passwordResetToken;
  return ret;
}});
