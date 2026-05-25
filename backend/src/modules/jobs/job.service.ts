import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from '../../database/schemas/job.schema';
@Injectable()
export class JobService {
  constructor(@InjectModel(Job.name) private model: Model<Job>) {}
  async findAll(page=1,limit=20,q: any={}) {
    const f: any={};
    if(q.status) f.status=q.status;
    if(q.search) f.name=new RegExp(q.search,'i');
    const [items,total]=await Promise.all([this.model.find(f).skip((page-1)*limit).limit(limit).sort({createdAt:-1}),this.model.countDocuments(f)]);
    return {items,total,page,pages:Math.ceil(total/limit)};
  }
  async findBySlug(slug: string) { const i=await this.model.findOne({slug} as any); if(!i) throw new NotFoundException(); return i; }
  async findOne(id: string) { const i=await this.model.findById(id); if(!i) throw new NotFoundException(); return i; }
  async create(data: any) { return this.model.create(data); }
  async update(id: string, data: any) { const i=await this.model.findByIdAndUpdate(id,data,{new:true}); if(!i) throw new NotFoundException(); return i; }
  async remove(id: string) { await this.model.findByIdAndDelete(id); return {message:'Deleted'}; }
}
