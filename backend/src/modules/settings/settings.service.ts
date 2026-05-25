import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from '../../database/schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private model: Model<Setting>) {}

  async get(key: string) {
    const s = await this.model.findOne({ key });
    return s?.value || null;
  }

  async set(key: string, value: any) {
    return this.model.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
  }

  async getAll() {
    const all = await this.model.find();
    return all.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async getStats() {
    const s = await this.model.findOne({ key: 'stats' });
    if (s?.value) return s.value;
    // fallback
    return { totalClients: 2500, avgTrafficIncrease: 340, keywordsRanked: '50M+', clientRetention: 98, awardsWon: 48, yearsExperience: 10 };
  }

  async getHero() {
    const s = await this.model.findOne({ key: 'hero' });
    return s?.value || null;
  }

  async getAbout() {
    const s = await this.model.findOne({ key: 'about' });
    return s?.value || null;
  }

  async getContact() {
    const s = await this.model.findOne({ key: 'contact' });
    return s?.value || null;
  }

  async getFaqs() {
    const s = await this.model.findOne({ key: 'faqs' });
    if (s?.value) return s.value;
    return [];
  }

  async getPricing() {
    const s = await this.model.findOne({ key: 'pricing' });
    return s?.value || null;
  }

  async getFeatures() {
    const s = await this.model.findOne({ key: 'features' });
    if (s?.value) return s.value;
    return [];
  }

  async getCta() {
    const s = await this.model.findOne({ key: 'cta' });
    return s?.value || null;
  }

  async getGeneral() {
    const s = await this.model.findOne({ key: 'general' });
    return s?.value || null;
  }
}
