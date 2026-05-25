import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true, collection: 'projects' })
export class Project extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop() description: string;
  @Prop() image: string;
  @Prop() client: string;
  @Prop() industry: string;
  @Prop({ type: [String] }) results: string[];
  @Prop({ default: 'published' }) status: string;
  @Prop({ type: Object }) seo: Record<string, any>;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);
