import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true, collection: 'testimonials' })
export class Testimonial extends Document {
  @Prop({ required: true }) name: string;
  @Prop() role: string;
  @Prop() company: string;
  @Prop({ required: true }) content: string;
  @Prop() avatar: string;
  @Prop({ default: 5 }) rating: number;
  @Prop() trafficIncrease: string;
  @Prop({ default: 'published' }) status: string;
  @Prop({ default: 0 }) order: number;
}
export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
