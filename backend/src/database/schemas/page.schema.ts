import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true, collection: 'pages' })
export class Page extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop() content: string;
  @Prop({ type: [Object], default: [] }) sections: any[];
  @Prop({ default: 'published' }) status: string;
  @Prop({ type: Object }) seo: Record<string, any>;
  @Prop({ type: Types.ObjectId, ref: 'User' }) author: Types.ObjectId;
}
export const PageSchema = SchemaFactory.createForClass(Page);
