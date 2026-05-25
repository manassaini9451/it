import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from '../../database/schemas/service.schema';
@Injectable()
export class ServiceService {
  constructor(@InjectModel(Service.name) private model: Model<Service>) {}
  async findAll(page=1,limit=20,query: any={}) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) filter.title = new RegExp(query.search,'i');
    const [items,total] = await Promise.all([this.model.find(filter).skip((page-1)*limit).limit(limit).sort({order:1,createdAt:-1}),this.model.countDocuments(filter)]);
    return { services: items, total, page, pages: Math.ceil(total/limit) };
  }
  async findBySlug(slug: string) { const i=await this.model.findOne({slug}); if(!i) throw new NotFoundException(); return i; }
  async findOne(id: string) { const i=await this.model.findById(id); if(!i) throw new NotFoundException(); return i; }
  async create(data: any) { return this.model.create(data); }
  async update(id: string, data: any) { const i=await this.model.findByIdAndUpdate(id,data,{new:true}); if(!i) throw new NotFoundException(); return i; }
  async remove(id: string) { await this.model.findByIdAndDelete(id); return {message:'Deleted'}; }
}
