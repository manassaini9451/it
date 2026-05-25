import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor } from '../../database/schemas/visitor.schema';
@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Visitor.name) private model: Model<Visitor>) {}
  async getDashboard(from: Date, to: Date) {
    const match = { createdAt:{$gte:from,$lte:to} };
    const [total,unique,returning,devices,countries,browsers,daily,hourly,topPages] = await Promise.all([
      this.model.countDocuments(match),
      this.model.countDocuments({...match,isReturning:false}),
      this.model.countDocuments({...match,isReturning:true}),
      this.model.aggregate([{$match:{...match,isBot:false}},{$group:{_id:'$deviceType',count:{$sum:1}}},{$sort:{count:-1}}]),
      this.model.aggregate([{$match:{...match,isBot:false,country:{$exists:true}}},{$group:{_id:'$country',count:{$sum:1}}},{$sort:{count:-1}},{$limit:10}]),
      this.model.aggregate([{$match:{...match,isBot:false}},{$group:{_id:'$browser',count:{$sum:1}}},{$sort:{count:-1}},{$limit:8}]),
      this.model.aggregate([{$match:{...match,isBot:false}},{$group:{_id:{y:{$year:'$createdAt'},m:{$month:'$createdAt'},d:{$dayOfMonth:'$createdAt'}},count:{$sum:1},uniqueCount:{$sum:{$cond:['$isReturning',0,1]}}}},{$sort:{'_id.y':1,'_id.m':1,'_id.d':1}}]),
      this.model.aggregate([{$match:{...match,isBot:false}},{$group:{_id:{$hour:'$createdAt'},count:{$sum:1}}},{$sort:{_id:1}}]),
      this.model.aggregate([{$match:{...match,isBot:false}},{$unwind:'$pageHistory'},{$group:{_id:'$pageHistory.url',count:{$sum:1}}},{$sort:{count:-1}},{$limit:10}]),
    ]);
    return { summary:{totalVisitors:total,uniqueVisitors:unique,returningVisitors:returning,bounceRate:unique>0?Math.round(((unique-returning)/unique)*100):0}, deviceBreakdown:devices, countryBreakdown:countries, browserBreakdown:browsers, dailyTraffic:daily, hourlyTraffic:hourly, topPages };
  }
  async getActive() { return this.model.countDocuments({lastSeenAt:{$gte:new Date(Date.now()-5*60*1000)},isBot:false}); }
  async getRealtime() {
    const [activeNow,recent] = await Promise.all([
      this.getActive(),
      this.model.find({lastSeenAt:{$gte:new Date(Date.now()-30*60*1000)},isBot:false}).sort({lastSeenAt:-1}).limit(20).select('ip country city deviceType browser landingPage lastSeenAt'),
    ]);
    return { activeNow, recentVisitors: recent };
  }
}
