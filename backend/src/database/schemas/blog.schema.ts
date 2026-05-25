import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'blogs' })
export class Blog extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop({ required: true }) excerpt: string;
  @Prop({ required: true }) content: string;
  @Prop() featuredImage: string;
  @Prop() featuredImageAlt: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) author: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] }) categories: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }] }) tags: Types.ObjectId[];
  @Prop({ default: 'draft' }) status: string;
  @Prop() publishedAt: Date;
  @Prop({ default: 0 }) viewCount: number;
  @Prop({ default: 0 }) readingTime: number;
  @Prop({ type: Object }) seo: Record<string, any>;
  @Prop({ default: false }) isFeatured: boolean;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' }, { weights: { title: 10, excerpt: 5, content: 1 } });
BlogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.readingTime = Math.ceil(this.content.split(/\s+/).length / 200);
  }
  next();
});
