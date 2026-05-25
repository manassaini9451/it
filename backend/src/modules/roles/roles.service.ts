import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../database/schemas/role.schema';
@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private model: Model<Role>) {}
  async findAll() { return this.model.find(); }
  async findByName(name: string) { return this.model.findOne({name}); }
  async seed() {
    const roles = [
      { name:'super-admin', displayName:'Super Admin', permissions:['*'], isSystem:true },
      { name:'admin', displayName:'Admin', permissions:['users:*','blogs:*','leads:*','analytics:read'], isSystem:true },
      { name:'editor', displayName:'Editor', permissions:['blogs:*','media:*','seo:*'], isSystem:true },
      { name:'user', displayName:'User', permissions:['profile:*'], isSystem:true },
    ];
    for (const r of roles) { await this.model.findOneAndUpdate({name:r.name},{$setOnInsert:r},{upsert:true,new:true}); }
    return { message:'Roles seeded' };
  }
}
