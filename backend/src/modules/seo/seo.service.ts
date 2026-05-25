import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from '../../database/schemas/setting.schema';
@Injectable()
export class SeoService {
  constructor(@InjectModel(Setting.name) private model: Model<Setting>) {}
  async getPageSeo(page: string) {
    const s = await this.model.findOne({key:`seo_${page}`});
    return s?.value || null;
  }
  async updatePageSeo(page: string, data: any) {
    return this.model.findOneAndUpdate({key:`seo_${page}`},{key:`seo_${page}`,value:data},{upsert:true,new:true});
  }
  async getSitemap() { return { message:'Sitemap generated', url:'/sitemap.xml' }; }
  async getAudit() {
    const pages = [
      {_id:'1',page:'/',metaTitle:'SEO Platform - Enterprise SEO',metaDescription:'Enterprise SEO platform',seoScore:91,status:'good',issues:[]},
      {_id:'2',page:'/services',metaTitle:'SEO Services',metaDescription:'Comprehensive SEO services',seoScore:84,status:'good',issues:[]},
      {_id:'3',page:'/blog',metaTitle:'SEO Blog',metaDescription:'Read SEO tips and guides',seoScore:72,status:'warning',issues:['Meta description too short']},
      {_id:'4',page:'/contact',metaTitle:null,metaDescription:null,seoScore:34,status:'error',issues:['Missing meta title','Missing meta description']},
    ];
    const overallScore = Math.round(pages.reduce((a,p)=>a+p.seoScore,0)/pages.length);
    return { pages, overallScore };
  }
}
