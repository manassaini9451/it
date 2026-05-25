import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../../database/schemas/blog.schema';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private model: Model<Blog>) {}

  async findAll(page=1, limit=12, query: any={}) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) filter.$text = { $search: query.search };
    if (query.category) filter.categories = query.category;
    if (query.tag) filter.tags = query.tag;
    const exclude = query.exclude ? { _id: { $ne: query.exclude } } : {};
    const [blogs, total] = await Promise.all([
      this.model.find({...filter,...exclude}).populate('author','firstName lastName avatar').populate('categories','name slug').populate('tags','name slug')
        .skip((page-1)*limit).limit(limit).sort({ publishedAt:-1, createdAt:-1 }),
      this.model.countDocuments({...filter,...exclude}),
    ]);
    return { blogs, total, page, limit, pages: Math.ceil(total/limit) };
  }

  async findBySlug(slug: string) {
    const blog = await this.model.findOneAndUpdate({slug},{$inc:{viewCount:1}},{new:true})
      .populate('author','firstName lastName avatar').populate('categories','name slug').populate('tags','name slug');
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async findById(id: string) {
    const blog = await this.model.findById(id).populate('author','firstName lastName').populate('categories','name slug').populate('tags','name slug');
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async create(data: any) { return this.model.create(data); }

  async update(id: string, data: any) {
    const b = await this.model.findByIdAndUpdate(id, data, { new: true });
    if (!b) throw new NotFoundException('Blog not found');
    return b;
  }

  async remove(id: string) { await this.model.findByIdAndDelete(id); return { message: 'Deleted' }; }

  async getFeatured(limit=6) {
    return this.model.find({status:'published',isFeatured:true}).populate('author','firstName lastName').populate('categories','name slug').limit(limit).sort({publishedAt:-1});
  }
}
