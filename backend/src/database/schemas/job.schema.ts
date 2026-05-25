import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true, collection: 'jobs' })
export class Job extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop() department: string;
  @Prop() location: string;
  @Prop() type: string;
  @Prop() description: string;
  @Prop() requirements: string;
  @Prop() salary: string;
  @Prop({ default: 'published' }) status: string;
}
export const JobSchema = SchemaFactory.createForClass(Job);
