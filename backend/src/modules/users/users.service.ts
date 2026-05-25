import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}
  async findAll(page=1,limit=20,search='') {
    const q = search ? { $or:[{firstName:new RegExp(search,'i')},{email:new RegExp(search,'i')}] } : {};
    const [users,total] = await Promise.all([this.model.find(q).populate('role').skip((page-1)*limit).limit(limit).sort({createdAt:-1}), this.model.countDocuments(q)]);
    return { users, total, page, limit, pages: Math.ceil(total/limit) };
  }
  async findById(id: string) {
    const u = await this.model.findById(id).populate('role');
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  async update(id: string, data: any) {
    const u = await this.model.findByIdAndUpdate(id, data, { new: true }).populate('role');
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  async remove(id: string) { await this.model.findByIdAndDelete(id); return { message: 'Deleted' }; }
  async getStats() {
    const [total, active, admins] = await Promise.all([this.model.countDocuments(), this.model.countDocuments({status:'active'}), this.model.countDocuments()]);
    return { total, active, admins };
  }
}
