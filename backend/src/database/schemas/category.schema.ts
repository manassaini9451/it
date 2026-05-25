import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true, collection: 'categories' })
export class Category extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop() description: string;
  @Prop() image: string;
  @Prop({ default: 'blog' }) type: string;
  @Prop({ default: 0 }) order: number;
}
export const CategorySchema = SchemaFactory.createForClass(Category);
