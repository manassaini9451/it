import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true, collection: 'services' })
export class Service extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop() excerpt: string;
  @Prop() content: string;
  @Prop() icon: string;
  @Prop() image: string;
  @Prop({ default: 'from-blue-500 to-cyan-500' }) color: string;
  @Prop({ default: 'published' }) status: string;
  @Prop({ default: 0 }) order: number;
  @Prop({ type: [String] }) features: string[];
  @Prop({ type: Object }) seo: Record<string, any>;
  @Prop({ type: [String] }) benefits: string[];
}
export const ServiceSchema = SchemaFactory.createForClass(Service);