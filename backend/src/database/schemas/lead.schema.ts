import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true, collection: 'leads' })
export class Lead extends Document {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop({ required: true }) email: string;
  @Prop() phone: string;
  @Prop() company: string;
  @Prop() website: string;
  @Prop() service: string;
  @Prop() budget: string;
  @Prop() message: string;
  @Prop({ default: 'new' }) status: string;
  @Prop() source: string;
  @Prop({ default: 50 }) score: number;
  @Prop({ type: Types.ObjectId, ref: 'User' }) assignedTo: Types.ObjectId;
  @Prop({ type: Object }) utm: Record<string, any>;
  @Prop({ type: [{ type: Object }], default: [] }) notes: any[];
}
export const LeadSchema = SchemaFactory.createForClass(Lead);
