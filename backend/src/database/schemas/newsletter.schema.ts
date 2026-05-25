import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true, collection: 'newsletters' })
export class Newsletter extends Document {
  @Prop({ required: true, unique: true }) email: string;
  @Prop() name: string;
  @Prop({ default: 'active' }) status: string;
  @Prop() source: string;
}
export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
