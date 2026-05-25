import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter } from '../../database/schemas/newsletter.schema';

@Injectable()
export class NewsletterService {
  constructor(@InjectModel(Newsletter.name) private model: Model<Newsletter>) {}

  async subscribe(email: string, name?: string, source = 'website') {
    const existing = await this.model.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        await existing.save();
        return { message: 'Resubscribed successfully', resubscribed: true };
      }
      throw new ConflictException('Email already subscribed');
    }
    await this.model.create({ email: email.toLowerCase(), name, source, status: 'active' });
    return { message: 'Subscribed successfully' };
  }

  async unsubscribe(email: string) {
    await this.model.findOneAndUpdate({ email: email.toLowerCase() }, { status: 'unsubscribed' });
    return { message: 'Unsubscribed successfully' };
  }

  async findAll(page = 1, limit = 20, search = '') {
    const filter: any = search ? { email: new RegExp(search, 'i') } : {};
    const [items, total] = await Promise.all([
      this.model.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getStats() {
    const [total, active, unsubscribed] = await Promise.all([
      this.model.countDocuments(),
      this.model.countDocuments({ status: 'active' }),
      this.model.countDocuments({ status: 'unsubscribed' }),
    ]);
    return { total, active, unsubscribed };
  }
}
