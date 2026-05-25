import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor } from '../../database/schemas/visitor.schema';

@Injectable()
export class VisitorService {
  constructor(@InjectModel(Visitor.name) private model: Model<Visitor>) {}

  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [visitors, total] = await Promise.all([
      this.model
        .find({ isBot: false })
        .sort({ lastSeenAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('sessionId ip country city deviceType browser os userAgent referrer utm isReturning pageViews landingPage lastSeenAt pageHistory createdAt'),
      this.model.countDocuments({ isBot: false }),
    ]);
    return { visitors, total, page, pages: Math.ceil(total / limit) };
  }

  async getActive(minutesAgo = 5) {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000);
    const visitors = await this.model
      .find({ lastSeenAt: { $gte: since }, isBot: false })
      .sort({ lastSeenAt: -1 })
      .limit(50)
      .select('sessionId ip country city deviceType browser os landingPage lastSeenAt pageViews');
    return { activeVisitors: visitors.length, visitors };
  }

  async getSummary() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, todayCount, weekCount, monthCount, returning, topCountries, topDevices, topPages] = await Promise.all([
      this.model.countDocuments({ isBot: false }),
      this.model.countDocuments({ isBot: false, createdAt: { $gte: today } }),
      this.model.countDocuments({ isBot: false, createdAt: { $gte: thisWeek } }),
      this.model.countDocuments({ isBot: false, createdAt: { $gte: thisMonth } }),
      this.model.countDocuments({ isBot: false, isReturning: true }),
      this.model.aggregate([
        { $match: { isBot: false, country: { $exists: true, $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.model.aggregate([
        { $match: { isBot: false } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.model.aggregate([
        { $match: { isBot: false } },
        { $group: { _id: '$landingPage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      total, today: todayCount, thisWeek: weekCount, thisMonth: monthCount,
      returningCount: returning,
      returningRate: total > 0 ? Math.round((returning / total) * 100) : 0,
      topCountries, topDevices, topPages,
    };
  }

  async exportCSV(from: Date, to: Date): Promise<string> {
    const visitors = await this.model
      .find({ isBot: false, createdAt: { $gte: from, $lte: to } })
      .sort({ createdAt: -1 })
      .select('ip country city browser os deviceType landingPage pageViews isReturning referrer createdAt lastSeenAt pageHistory')
      .lean();

    const headers = [
      'IP', 'Country', 'City', 'Browser', 'OS', 'Device',
      'Landing Page', 'Page Views', 'Type', 'Referrer',
      'First Visit', 'Last Seen', 'Pages Visited',
    ];

    const escape = (v: any) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = visitors.map(v => [
      escape(v.ip),
      escape(v.country),
      escape(v.city),
      escape(v.browser),
      escape(v.os),
      escape(v.deviceType),
      escape(v.landingPage),
      escape(v.pageViews),
      escape(v.isReturning ? 'Returning' : 'New'),
      escape(v.referrer),
      escape(v.createdAt ? new Date(v.createdAt).toISOString() : ''),
      escape(v.lastSeenAt ? new Date(v.lastSeenAt).toISOString() : ''),
      escape((v.pageHistory as any[] || []).map((p: any) => p.url).join(' → ')),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  async deleteOld(daysOld = 90) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await this.model.deleteMany({ createdAt: { $lt: cutoff } });
    return { deleted: result.deletedCount };
  }
}