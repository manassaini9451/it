import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'roles' })
export class Role extends Document {
  @Prop({ required: true, unique: true }) name: string;
  @Prop() displayName: string;
  @Prop() description: string;
  @Prop({ type: [String], default: [] }) permissions: string[];
  @Prop({ default: false }) isSystem: boolean;
}
export const RoleSchema = SchemaFactory.createForClass(Role);
