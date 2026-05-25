import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class PageHistoryEntry {
  @Prop({ required: true }) url: string;
  @Prop({ required: true }) enteredAt: Date;
}

const PageHistoryEntrySchema = SchemaFactory.createForClass(PageHistoryEntry);

@Schema({ timestamps: true, collection: 'visitors' })
export class Visitor extends Document {
  @Prop({ required: true, index: true }) sessionId: string;
  @Prop() ip: string;

  @Prop() country: string;
  @Prop() city: string;

  @Prop() deviceType: string;
  @Prop() browser: string;
  @Prop() os: string;

  @Prop() userAgent: string;
  @Prop() referrer: string;

  @Prop({ type: Object })
  utm: Record<string, string>;

  @Prop({ default: false })
  isReturning: boolean;

  @Prop({ default: false })
  isBot: boolean;

  @Prop({ default: 0 })
  pageViews: number;

  @Prop()
  landingPage: string;

  @Prop()
  lastSeenAt: Date;

  @Prop({ type: [PageHistoryEntrySchema], default: [] })
  pageHistory: PageHistoryEntry[];

  // ✅ Add these
  createdAt: Date;
  updatedAt: Date;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);

// TTL: auto-delete after 90 days
VisitorSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7_776_000 },
);