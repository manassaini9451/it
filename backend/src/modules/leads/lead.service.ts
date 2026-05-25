import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../../database/schemas/lead.schema';
@Injectable()
export class LeadService {
  constructor(@InjectModel(Lead.name) private model: Model<Lead>) {}
  async findAll(page=1,limit=20,query: any={}) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) filter.$or=[{firstName:new RegExp(query.search,'i')},{email:new RegExp(query.search,'i')},{company:new RegExp(query.search,'i')}];
    const [leads,total] = await Promise.all([this.model.find(filter).populate('assignedTo','firstName lastName').skip((page-1)*limit).limit(limit).sort({createdAt:-1}),this.model.countDocuments(filter)]);
    return { leads, total, page, pages: Math.ceil(total/limit) };
  }
  async findOne(id: string) { const l=await this.model.findById(id); if(!l) throw new NotFoundException(); return l; }
  async create(data: any) { return this.model.create(data); }
  async update(id: string, data: any) { const l=await this.model.findByIdAndUpdate(id,data,{new:true}); if(!l) throw new NotFoundException(); return l; }
  async remove(id: string) { await this.model.findByIdAndDelete(id); return {message:'Deleted'}; }
  async addNote(id: string, note: any) {
    const l=await this.model.findByIdAndUpdate(id,{$push:{notes:{...note,createdAt:new Date()}}},{new:true});
    if(!l) throw new NotFoundException(); return l;
  }
  async getStats() {
    const [total,newLeads,won,lost] = await Promise.all([
      this.model.countDocuments(), this.model.countDocuments({status:'new'}),
      this.model.countDocuments({status:'won'}), this.model.countDocuments({status:'lost'}),
    ]);
    return { total, new: newLeads, won, lost, conversionRate: total>0?Math.round((won/total)*100):0 };
  }
}
