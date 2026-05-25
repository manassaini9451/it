/**
 * SEO Platform — Complete MongoDB Seed Script
 * Run: npm run seed
 *
 * Seeds: roles, users, settings (stats, faqs, hero, about, pricing, features, cta),
 *        services, testimonials, categories, tags, blogs, projects (case studies), jobs
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seoplatform';

// ─── Schemas (minimal inline for seed script) ────────────────────────────────
const RoleSchema = new mongoose.Schema({ name: String, displayName: String, description: String, permissions: [String], isSystem: { type: Boolean, default: false } }, { timestamps: true, collection: 'roles' });
const UserSchema = new mongoose.Schema({ firstName: String, lastName: String, email: { type: String, lowercase: true }, password: String, role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, status: { type: String, default: 'active' }, provider: { type: String, default: 'local' }, emailVerified: { type: Boolean, default: true } }, { timestamps: true, collection: 'users' });
const SettingSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed }, { timestamps: true, collection: 'settings' });
const ServiceSchema = new mongoose.Schema({ title: String, slug: { type: String, unique: true }, excerpt: String, content: String, icon: String, color: String, features: [String], status: { type: String, default: 'published' }, order: { type: Number, default: 0 }, seo: mongoose.Schema.Types.Mixed }, { timestamps: true, collection: 'services' });
const TestimonialSchema = new mongoose.Schema({ name: String, role: String, company: String, content: String, avatar: String, rating: { type: Number, default: 5 }, trafficIncrease: String, status: { type: String, default: 'published' }, order: { type: Number, default: 0 } }, { timestamps: true, collection: 'testimonials' });
const CategorySchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String, type: { type: String, default: 'blog' }, order: { type: Number, default: 0 } }, { timestamps: true, collection: 'categories' });
const TagSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String }, { timestamps: true, collection: 'tags' });
const BlogSchema = new mongoose.Schema({ title: String, slug: { type: String, unique: true }, excerpt: String, content: String, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], status: { type: String, default: 'published' }, publishedAt: Date, readingTime: { type: Number, default: 5 }, viewCount: { type: Number, default: 0 }, isFeatured: { type: Boolean, default: false }, seo: mongoose.Schema.Types.Mixed }, { timestamps: true, collection: 'blogs' });
const ProjectSchema = new mongoose.Schema({ title: String, slug: { type: String, unique: true }, description: String, client: String, industry: String, challenge: String, solution: String, results: [String], metrics: mongoose.Schema.Types.Mixed, image: String, status: { type: String, default: 'published' }, seo: mongoose.Schema.Types.Mixed }, { timestamps: true, collection: 'projects' });
const JobSchema = new mongoose.Schema({ title: String, slug: { type: String, unique: true }, department: String, location: String, type: String, description: String, requirements: String, benefits: String, salary: String, status: { type: String, default: 'published' } }, { timestamps: true, collection: 'jobs' });

const Role = mongoose.model('Role', RoleSchema);
const User = mongoose.model('User', UserSchema);
const Setting = mongoose.model('Setting', SettingSchema);
const Service = mongoose.model('Service', ServiceSchema);
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
const Category = mongoose.model('Category', CategorySchema);
const Tag = mongoose.model('Tag', TagSchema);
const Blog = mongoose.model('Blog', BlogSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Job = mongoose.model('Job', JobSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  // Clear all collections
  await Promise.all([
    Role.deleteMany({}), User.deleteMany({}), Setting.deleteMany({}),
    Service.deleteMany({}), Testimonial.deleteMany({}), Category.deleteMany({}),
    Tag.deleteMany({}), Blog.deleteMany({}), Project.deleteMany({}), Job.deleteMany({}),
  ]);
  console.log('🗑️  Cleared all collections');

  // ── Roles ─────────────────────────────────────────────────────────────────
  const roles = await Role.insertMany([
    { name: 'super-admin', displayName: 'Super Admin', description: 'Full system access', permissions: ['*'], isSystem: true },
    { name: 'admin', displayName: 'Admin', description: 'Administrative access', permissions: ['manage:content','manage:leads','manage:users'], isSystem: true },
    { name: 'editor', displayName: 'Editor', description: 'Content management', permissions: ['manage:content'], isSystem: true },
    { name: 'user', displayName: 'User', description: 'Basic user access', permissions: ['read:content'], isSystem: true },
  ]);
  const superAdminRole = roles[0];
  const editorRole = roles[2];
  console.log('✅ Roles seeded:', roles.length);

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@1234', 12);
  const editorPass = await bcrypt.hash('Editor@1234', 12);
  const users = await User.insertMany([
    { firstName: 'Super', lastName: 'Admin', email: 'admin@seoplatform.com', password: adminPass, role: superAdminRole._id, status: 'active', emailVerified: true },
    { firstName: 'John', lastName: 'Editor', email: 'editor@seoplatform.com', password: editorPass, role: editorRole._id, status: 'active', emailVerified: true },
  ]);
  const adminUser = users[0];
  console.log('✅ Users seeded — admin@seoplatform.com / Admin@1234');

  // ── Settings ──────────────────────────────────────────────────────────────
  await Setting.insertMany([
    {
      key: 'general',
      value: {
        siteName: 'SEO Platform',
        tagline: 'Enterprise SEO & Digital Marketing',
        siteUrl: 'https://seoplatform.com',
        supportEmail: 'hello@seoplatform.com',
        phone: '+1 (800) 555-1234',
        address: '123 SEO Street, San Francisco, CA 94105',
        timezone: 'America/Los_Angeles',
        logo: '/logo.svg',
        favicon: '/favicon.ico',
        socialLinks: {
          twitter: 'https://twitter.com/seoplatform',
          linkedin: 'https://linkedin.com/company/seoplatform',
          facebook: 'https://facebook.com/seoplatform',
          instagram: 'https://instagram.com/seoplatform',
          youtube: 'https://youtube.com/seoplatform',
        },
      },
    },
    {
      key: 'stats',
      value: {
        totalClients: 2500,
        avgTrafficIncrease: 340,
        keywordsRanked: '50M+',
        clientRetention: 98,
        awardsWon: 48,
        yearsExperience: 10,
        countriesServed: 35,
        teamSize: 120,
      },
    },
    {
      key: 'hero',
      value: {
        badge: '#1 Rated SEO Platform — G2 2024',
        headline1: 'Rank Higher.',
        headline2: 'Grow Faster.',
        headline3: 'Win Online.',
        subheadline: 'Enterprise-grade SEO powered by AI. We help businesses achieve top Google rankings, drive qualified traffic, and generate more revenue.',
        ctaPrimary: { label: 'Get Free SEO Audit', href: '/contact' },
        ctaSecondary: { label: 'Watch 2-min demo', href: '/about' },
        perks: [
          'No long-term contracts',
          'Real-time reporting',
          'Dedicated SEO manager',
          '30-day money-back guarantee',
        ],
        reviewCount: 2500,
        reviewScore: '4.9',
        statsCards: [
          { val: '+340%', label: 'Avg Traffic Increase', color: 'green' },
          { val: '2,500+', label: 'Happy Clients', color: 'blue' },
          { val: '48', label: 'Awards Won', color: 'yellow' },
        ],
      },
    },
    {
      key: 'about',
      value: {
        founded: '2015',
        headquartersCity: 'San Francisco',
        mission: 'To democratize enterprise SEO and help every business compete online.',
        vision: 'A world where every business can rank on the first page of Google.',
        story: 'Founded in 2015 by a team of ex-Google engineers and digital marketing veterans, SEO Platform was built to bridge the gap between enterprise SEO tools and small-to-medium businesses. We believe powerful SEO should not be reserved for Fortune 500 companies.',
        team: [
          { name: 'Alex Johnson', role: 'CEO & Founder', bio: '15+ years in SEO. Former Google employee and author of "SEO at Scale".', initials: 'AJ', linkedIn: '#' },
          { name: 'Sarah Chen', role: 'Head of SEO Strategy', bio: 'Expert in technical SEO, e-commerce SEO, and international SEO strategy.', initials: 'SC', linkedIn: '#' },
          { name: 'Mike Roberts', role: 'Director, Link Building', bio: 'White-hat link acquisition specialist with 10+ years of experience.', initials: 'MR', linkedIn: '#' },
          { name: 'Lisa Park', role: 'Head of Content', bio: 'SEO-driven content strategy expert. Former editor at Search Engine Journal.', initials: 'LP', linkedIn: '#' },
          { name: 'David Kim', role: 'Technical SEO Lead', bio: 'Core Web Vitals and JavaScript SEO specialist. Google certified.', initials: 'DK', linkedIn: '#' },
          { name: 'Emma Wilson', role: 'Analytics Director', bio: 'SEO attribution modeling and data science expert.', initials: 'EW', linkedIn: '#' },
        ],
        timeline: [
          { year: '2015', event: 'Founded in San Francisco with a mission to democratize enterprise SEO' },
          { year: '2017', event: 'Reached 500 clients and launched our AI SEO analysis tool' },
          { year: '2019', event: 'Expanded to enterprise clients and launched real-time analytics platform' },
          { year: '2021', event: 'Crossed $10M ARR and opened offices in London and Singapore' },
          { year: '2023', event: 'Launched AI-powered recommendations and hit 2,000+ clients' },
          { year: '2024', event: 'Named #1 SEO Platform by G2 with 2,500+ global clients' },
        ],
        awards: [
          { name: 'G2 Leader 2024', category: 'SEO Software' },
          { name: 'Clutch Top SEO Agency', category: 'Digital Marketing' },
          { name: 'Inc. 5000', category: 'Fastest Growing Companies' },
        ],
        values: [
          { title: 'Transparency', description: 'We show you exactly what we do and why it works.' },
          { title: 'Results-First', description: 'Every strategy is tied to measurable business outcomes.' },
          { title: 'Innovation', description: 'We stay ahead of every Google algorithm update.' },
          { title: 'Partnership', description: 'Your success is our success — we are in this together.' },
        ],
      },
    },
    {
      key: 'contact',
      value: {
        email: 'hello@seoplatform.com',
        phone: '+1 (800) 555-1234',
        address: '123 SEO Street, San Francisco, CA 94105',
        hours: 'Mon–Fri, 9am–6pm PST',
        mapEmbed: '',
        whatsapp: '+18005551234',
        calendlyUrl: 'https://calendly.com/seoplatform/free-audit',
        officeLocations: [
          { city: 'San Francisco', country: 'USA', address: '123 SEO Street, SF, CA 94105', phone: '+1 (800) 555-1234', isPrimary: true },
          { city: 'London', country: 'UK', address: '10 Digital Lane, London EC1A 1BB', phone: '+44 20 7946 0123', isPrimary: false },
          { city: 'Singapore', country: 'Singapore', address: '1 Marina Blvd, Singapore 018989', phone: '+65 6123 4567', isPrimary: false },
        ],
      },
    },
    {
      key: 'faqs',
      value: [
        { q: 'How long does SEO take to show results?', a: 'Most clients see initial improvements in 3–6 months. Significant, sustained results typically appear in 6–12 months depending on your competition, domain authority, and strategy.' },
        { q: 'What makes SEO Platform different from other agencies?', a: 'We combine AI-powered insights, technical expertise, and complete transparency. Every strategy is tied to measurable business outcomes — not vanity metrics. You get a dedicated manager, real-time dashboard, and weekly reports.' },
        { q: 'Do you guarantee #1 rankings?', a: 'No ethical SEO agency can guarantee specific rankings. We guarantee measurable improvement in traffic, rankings, and conversions, backed by our proven track record across 2,500+ clients.' },
        { q: 'How much does SEO cost?', a: 'Our plans start at $499/month for startups and small businesses. Enterprise packages start at $2,499/month. Every investment includes clear deliverables and measurable ROI targets.' },
        { q: 'Do you work with any industry?', a: 'Yes. We have deep vertical expertise in e-commerce, SaaS, healthcare, legal, real estate, and finance. Our strategies are customized for your specific industry and competitive landscape.' },
        { q: 'Can I cancel anytime?', a: 'Absolutely. We do not require long-term contracts. We earn your business every month through consistent, measurable results. You can pause or cancel with 30 days notice.' },
        { q: 'What is included in the free SEO audit?', a: 'Our free audit covers technical SEO health, on-page optimization scores, backlink profile analysis, competitor gap analysis, keyword opportunity assessment, and a custom 90-day action plan.' },
        { q: 'Do you work with international businesses?', a: 'Yes. We serve clients in 35+ countries and have expertise in international SEO including hreflang, multilingual content strategy, and geo-targeted campaigns.' },
      ],
    },
    {
      key: 'pricing',
      value: {
        headline: 'Simple, transparent pricing',
        subheadline: 'No hidden fees. No lock-in contracts. Cancel anytime.',
        plans: [
          {
            name: 'Starter',
            price: 499,
            billingPeriod: '/mo',
            description: 'Perfect for small businesses and startups.',
            popular: false,
            features: [
              'Up to 5 target keywords',
              'Monthly SEO audit',
              'On-page optimization',
              '5 quality backlinks/mo',
              'Monthly performance reports',
              'Email support (48h response)',
            ],
            cta: { label: 'Get Started', href: '/contact' },
          },
          {
            name: 'Professional',
            price: 999,
            billingPeriod: '/mo',
            description: 'For growing businesses serious about SEO.',
            popular: true,
            features: [
              'Up to 20 target keywords',
              'Weekly SEO audits',
              'Full on-page & off-page optimization',
              '20 quality backlinks/mo',
              '4 SEO blog posts/mo',
              'Weekly reports + live dashboard',
              'Priority support (same day)',
              'Competitor analysis',
              'Google Business Profile',
            ],
            cta: { label: 'Get Started', href: '/contact' },
          },
          {
            name: 'Enterprise',
            price: 2499,
            billingPeriod: '/mo',
            description: 'For enterprises that demand top results.',
            popular: false,
            features: [
              'Unlimited target keywords',
              'Daily monitoring & alerts',
              'Full technical SEO suite',
              '50+ quality backlinks/mo',
              '16 SEO blog posts/mo',
              'Real-time analytics dashboard',
              'Dedicated SEO manager',
              'Custom content strategy',
              'API & CMS integration',
              'Quarterly strategy sessions',
              'SLA-backed support',
            ],
            cta: { label: 'Contact Sales', href: '/contact' },
          },
        ],
        addons: [
          { name: 'Extra Blog Posts', price: 99, unit: 'per post' },
          { name: 'Extra Backlinks', price: 149, unit: 'per 5 links' },
          { name: 'Local SEO Add-on', price: 199, unit: '/mo per location' },
          { name: 'Google Ads Management', price: 499, unit: '/mo' },
        ],
      },
    },
    {
      key: 'features',
      value: [
        { icon: 'Bot', title: 'AI-Powered SEO', desc: 'ML-driven ranking predictions, automated recommendations, and NLP-optimized content scoring.', badge: 'AI' },
        { icon: 'BarChart2', title: 'Real-Time Analytics', desc: 'Live dashboards updated every 60 seconds with full attribution across all channels.', badge: 'Live' },
        { icon: 'Globe', title: 'Global SEO', desc: 'Multi-language, hreflang configuration, and international SEO strategies for 35+ markets.', badge: 'Global' },
        { icon: 'Layers', title: 'Content Optimization', desc: 'AI-powered content scoring, semantic analysis, and keyword density optimization.', badge: 'Smart' },
        { icon: 'Lock', title: 'Enterprise Security', desc: 'SOC 2 Type II compliant with RBAC, audit logs, SSO, and end-to-end encryption.', badge: 'Secure' },
        { icon: 'Zap', title: 'Core Web Vitals', desc: 'Automated LCP, CLS, FID monitoring with green-score optimization recommendations.', badge: 'Fast' },
      ],
    },
    {
      key: 'cta',
      value: {
        headline: 'Ready to dominate search results?',
        subheadline: 'Join 2,500+ businesses growing with SEO Platform. Get your free audit today.',
        primaryCta: { label: 'Get Free SEO Audit', href: '/contact' },
        secondaryCta: { label: 'View Pricing', href: '/pricing' },
        footnote: 'No credit card required • Free 30-minute consultation',
      },
    },
    {
      key: 'seo',
      value: {
        defaultTitle: 'SEO Platform - Enterprise SEO & Digital Marketing',
        defaultDescription: 'Enterprise-grade SEO platform. Rank higher on Google, drive qualified traffic, and grow your business.',
        defaultOgImage: '/og-image.jpg',
        twitterHandle: '@seoplatform',
        googleVerification: '',
        bingVerification: '',
        robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /auth/\nSitemap: https://seoplatform.com/sitemap.xml',
        schemaOrg: {
          type: 'Organization',
          name: 'SEO Platform',
          url: 'https://seoplatform.com',
          logo: 'https://seoplatform.com/logo.png',
          sameAs: ['https://twitter.com/seoplatform', 'https://linkedin.com/company/seoplatform'],
        },
      },
    },
  ]);
  console.log('✅ Settings seeded (general, stats, hero, about, contact, faqs, pricing, features, cta, seo)');

  // ── Services ──────────────────────────────────────────────────────────────
  const services = await Service.insertMany([
    {
      title: 'SEO Services', slug: 'seo', icon: 'Search', color: 'from-blue-500 to-cyan-500', order: 1,
      excerpt: 'Comprehensive SEO strategies to dominate search results and drive sustainable organic growth.',
      content: '<h2>What is SEO?</h2><p>Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search engine results pages (SERPs). Our SEO services cover everything from technical audits to content strategy and link building.</p>',
      features: ['Keyword Research & Mapping', 'On-Page Optimization', 'Content Strategy', 'Monthly Analytics Reports', 'Competitor Analysis', 'Rank Tracking Dashboard'],
      seo: { metaTitle: 'SEO Services — Enterprise Search Optimization', metaDescription: 'Comprehensive SEO services for businesses of all sizes. Boost rankings, drive traffic, increase revenue.' },
    },
    {
      title: 'Local SEO', slug: 'local-seo', icon: 'MapPin', color: 'from-green-500 to-emerald-500', order: 2,
      excerpt: 'Capture local customers, appear in Google Maps, and dominate the 3-pack for your service area.',
      content: '<h2>Local SEO That Drives Foot Traffic</h2><p>Local SEO helps your business appear when nearby customers search for your services. We optimize your Google Business Profile, build local citations, and execute geo-targeted content strategies.</p>',
      features: ['Google Business Profile Optimization', 'Local Citation Building', 'Local Keyword Strategy', 'Review Management', 'Geo-Targeted Content', 'Local Schema Markup'],
      seo: { metaTitle: 'Local SEO Services — Rank #1 in Your City', metaDescription: 'Dominate local search results. Get more calls, visits, and customers with expert local SEO.' },
    },
    {
      title: 'Link Building', slug: 'link-building', icon: 'Link2', color: 'from-purple-500 to-violet-500', order: 3,
      excerpt: 'High-authority, white-hat backlinks that boost your domain authority and improve rankings.',
      content: '<h2>White-Hat Link Building</h2><p>Backlinks remain one of Google\'s top ranking factors. Our link building campaigns focus on quality over quantity, securing placements on authoritative websites in your niche.</p>',
      features: ['Guest Post Outreach', 'Digital PR Campaigns', 'Broken Link Building', 'Competitor Link Replication', 'Niche Edits', 'Monthly Link Reports'],
      seo: { metaTitle: 'Link Building Services — High-Authority Backlinks', metaDescription: 'Build a strong backlink profile with white-hat link building. Boost domain authority and rankings.' },
    },
    {
      title: 'Content Marketing', slug: 'content', icon: 'FileText', color: 'from-orange-500 to-amber-500', order: 4,
      excerpt: 'SEO-optimized content that attracts qualified traffic and converts readers into customers.',
      content: '<h2>Content That Ranks and Converts</h2><p>Our content marketing strategy is 100% data-driven. Every piece is optimized for target keywords, user intent, and semantic relevance to help you rank and convert.</p>',
      features: ['SEO Blog Writing', 'Landing Page Copy', 'Pillar Page Creation', 'Content Calendar Planning', 'Content Refreshes', 'FAQ & Schema Content'],
      seo: { metaTitle: 'Content Marketing Services — SEO Content That Ranks', metaDescription: 'Data-driven SEO content strategy. Blog posts, landing pages, and pillar content that rank and convert.' },
    },
    {
      title: 'Technical SEO', slug: 'technical-seo', icon: 'Zap', color: 'from-yellow-500 to-orange-500', order: 5,
      excerpt: 'Fix crawlability, site speed, Core Web Vitals, and all technical issues holding back your rankings.',
      content: '<h2>Technical SEO Excellence</h2><p>Technical SEO forms the foundation of your entire SEO strategy. Without a technically sound website, even the best content and links won\'t achieve their potential rankings.</p>',
      features: ['Core Web Vitals Optimization', 'Schema Markup Implementation', 'Site Speed Optimization', 'Mobile-First Audit', 'Crawl Budget Analysis', 'JavaScript SEO'],
      seo: { metaTitle: 'Technical SEO Services — Core Web Vitals & Speed Optimization', metaDescription: 'Fix technical SEO issues that hurt your rankings. Core Web Vitals, schema markup, speed optimization.' },
    },
    {
      title: 'E-Commerce SEO', slug: 'ecommerce-seo', icon: 'ShoppingCart', color: 'from-red-500 to-pink-500', order: 6,
      excerpt: 'Specialized SEO for online stores to rank product pages and category pages at scale.',
      content: '<h2>E-Commerce SEO That Drives Sales</h2><p>E-commerce SEO requires a specialized approach. We optimize product pages, category architecture, faceted navigation, and product schema to help you capture high-intent shoppers.</p>',
      features: ['Product Page Optimization', 'Category Architecture', 'Faceted Navigation SEO', 'Product Schema Markup', 'Shopping Feed Optimization', 'Review Schema Integration'],
      seo: { metaTitle: 'E-Commerce SEO Services — Rank Products, Drive Sales', metaDescription: 'Specialized e-commerce SEO to rank product and category pages. Drive more organic revenue.' },
    },
    {
      title: 'AI Marketing', slug: 'ai-marketing', icon: 'Bot', color: 'from-indigo-500 to-purple-500', order: 7,
      excerpt: 'Future-proof your SEO with AI-driven content strategies, entity optimization, and LLM SEO.',
      content: '<h2>AI-Ready SEO Strategy</h2><p>With AI overviews changing how users interact with search, your SEO strategy must evolve. We help you optimize for AI search engines, LLMs, and voice search — not just traditional Google.</p>',
      features: ['AI Overview Optimization', 'Entity-Based SEO', 'Semantic Content Strategy', 'LLM Content Optimization', 'Voice Search SEO', 'Featured Snippet Targeting'],
      seo: { metaTitle: 'AI Marketing & SEO Services — Future-Ready Strategy', metaDescription: 'Optimize for AI search, entity SEO, and LLMs. Stay ahead of every algorithm change.' },
    },
  ]);
  console.log('✅ Services seeded:', services.length);

  // ── Testimonials ──────────────────────────────────────────────────────────
  await Testimonial.insertMany([
    { name: 'Sarah Johnson', role: 'CEO', company: 'TechStartup Inc', content: 'SEO Platform took us from page 5 to #1 for our main keyword in just 6 months. The ROI has been absolutely incredible — organic revenue is up over $400k this year alone.', rating: 5, avatar: 'SJ', trafficIncrease: '+420%', order: 1 },
    { name: 'Michael Chen', role: 'Marketing Director', company: 'E-Shop Pro', content: 'Their technical SEO expertise is truly unmatched. Organic traffic doubled in 90 days after the technical audit and fixes. I recommend them to every e-commerce founder I meet.', rating: 5, avatar: 'MC', trafficIncrease: '+285%', order: 2 },
    { name: 'Emily Roberts', role: 'Founder', company: 'Local Business Hub', content: 'The local SEO campaign changed our business completely. We now rank in the top 3 for all our target keywords, and the phone rings constantly. Best investment we have made.', rating: 5, avatar: 'ER', trafficIncrease: '+190%', order: 3 },
    { name: 'David Park', role: 'VP Growth', company: 'SaaS Co', content: 'The real-time dashboard is phenomenal. We see exactly what keywords are moving, why, and what to do next. Best-in-class transparency — no other agency comes close.', rating: 5, avatar: 'DP', trafficIncrease: '+340%', order: 4 },
    { name: 'Lisa Martinez', role: 'Head of Digital', company: 'National Retail Chain', content: 'E-commerce SEO results exceeded every expectation. Revenue from organic search is up 380% year over year. They understand retail SEO better than anyone.', rating: 5, avatar: 'LM', trafficIncrease: '+380%', order: 5 },
    { name: 'James Wilson', role: 'CMO', company: 'B2B Solutions Ltd', content: 'The content strategy positioned us as genuine industry thought leaders. Our blog now drives over 60% of new leads. Extraordinary work from a world-class team.', rating: 5, avatar: 'JW', trafficIncrease: '+260%', order: 6 },
  ]);
  console.log('✅ Testimonials seeded: 6');

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Technical SEO', slug: 'technical-seo', description: 'Crawlability, site speed, Core Web Vitals, and schema markup.', type: 'blog', order: 1 },
    { name: 'Link Building', slug: 'link-building', description: 'Backlink acquisition strategies and authority building.', type: 'blog', order: 2 },
    { name: 'Content Marketing', slug: 'content-marketing', description: 'SEO content strategy, writing, and optimization.', type: 'blog', order: 3 },
    { name: 'Local SEO', slug: 'local-seo', description: 'Google Business Profile, citations, and local rankings.', type: 'blog', order: 4 },
    { name: 'SEO Strategy', slug: 'seo-strategy', description: 'High-level SEO planning and competitive analysis.', type: 'blog', order: 5 },
    { name: 'AI & SEO', slug: 'ai-seo', description: 'AI overviews, LLM optimization, and future SEO trends.', type: 'blog', order: 6 },
  ]);
  console.log('✅ Categories seeded:', categories.length);

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tags = await Tag.insertMany([
    { name: 'Core Web Vitals', slug: 'core-web-vitals', description: 'LCP, CLS, FID optimization' },
    { name: 'Google Algorithm', slug: 'google-algorithm', description: 'Google updates and changes' },
    { name: 'Keyword Research', slug: 'keyword-research', description: 'Finding and targeting the right keywords' },
    { name: 'E-Commerce', slug: 'ecommerce', description: 'SEO for online stores' },
    { name: 'Backlinks', slug: 'backlinks', description: 'Link building and authority' },
    { name: 'AI Search', slug: 'ai-search', description: 'AI overviews and LLM SEO' },
    { name: 'On-Page SEO', slug: 'on-page-seo', description: 'Title tags, meta, content optimization' },
    { name: 'Schema Markup', slug: 'schema-markup', description: 'Structured data and rich snippets' },
  ]);
  console.log('✅ Tags seeded:', tags.length);

  // ── Blogs ─────────────────────────────────────────────────────────────────
  await Blog.insertMany([
    {
      title: 'The Ultimate Guide to Technical SEO in 2025',
      slug: 'technical-seo-guide-2025',
      excerpt: 'Master Core Web Vitals, JavaScript SEO, crawl budget optimization, schema markup, and every technical factor that Google uses to rank your website in 2025.',
      content: `<h2>What is Technical SEO?</h2>
<p>Technical SEO refers to optimizing your website's infrastructure so that search engines can efficiently crawl, index, and render your content. It's the foundation that every other SEO strategy depends on.</p>
<h2>Core Web Vitals in 2025</h2>
<p>Google's Core Web Vitals — Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) — are now confirmed ranking signals. Here's how to achieve green scores across all three metrics.</p>
<h3>Improving LCP</h3>
<p>LCP measures loading performance. To achieve a good LCP score (under 2.5 seconds): optimize and compress images, implement lazy loading, use a CDN, and minimize render-blocking resources.</p>
<h2>Schema Markup Implementation</h2>
<p>Structured data helps Google understand your content and can unlock rich results. Implement Organization, LocalBusiness, Article, FAQ, and BreadcrumbList schemas on every relevant page.</p>
<h2>Crawl Budget Optimization</h2>
<p>For large websites, ensuring Googlebot crawls your most important pages efficiently is critical. Audit your robots.txt, fix crawl errors, consolidate duplicate content with canonicals, and use internal linking strategically.</p>`,
      author: adminUser._id,
      categories: [categories[0]._id],
      tags: [tags[0]._id, tags[6]._id],
      status: 'published',
      publishedAt: new Date('2025-01-15'),
      readingTime: 12,
      viewCount: 8420,
      isFeatured: true,
      seo: {
        metaTitle: 'Technical SEO Guide 2025 — Core Web Vitals, Schema & More',
        metaDescription: 'The complete technical SEO guide for 2025. Master Core Web Vitals, schema markup, crawl optimization, and JavaScript SEO.',
        focusKeyword: 'technical SEO guide 2025',
        seoScore: 92,
      },
    },
    {
      title: 'How to Build High-Authority Backlinks in 2025',
      slug: 'build-high-authority-backlinks-2025',
      excerpt: 'Discover the proven link building strategies top agencies use to acquire high-authority backlinks that boost domain authority and drive sustainable ranking improvements.',
      content: `<h2>Why Backlinks Still Matter in 2025</h2>
<p>Despite years of algorithm updates, backlinks remain one of Google's top three ranking factors. The key is quality over quantity — one link from a DR90 authoritative site outweighs 100 links from low-quality directories.</p>
<h2>Guest Post Outreach at Scale</h2>
<p>Guest posting on relevant, high-authority websites remains one of the most effective link building tactics. The key is targeting websites with genuine editorial standards, real traffic, and topical relevance to your niche.</p>
<h2>Digital PR for SEO</h2>
<p>Digital PR involves creating newsworthy content — original research, industry surveys, data studies — that earns natural editorial backlinks from major publications. A single successful campaign can generate 50+ high-authority links.</p>
<h2>Broken Link Building</h2>
<p>Find broken links on authoritative websites in your niche, create better content to replace the linked resource, then reach out to the site owner. This technique has extremely high response rates.</p>`,
      author: adminUser._id,
      categories: [categories[1]._id],
      tags: [tags[4]._id, tags[2]._id],
      status: 'published',
      publishedAt: new Date('2025-02-01'),
      readingTime: 8,
      viewCount: 6150,
      isFeatured: false,
      seo: {
        metaTitle: 'How to Build High-Authority Backlinks in 2025',
        metaDescription: 'Proven link building strategies for 2025. Guest posts, digital PR, broken link building, and more.',
        focusKeyword: 'high authority backlinks 2025',
        seoScore: 87,
      },
    },
    {
      title: 'Local SEO Strategy: Rank #1 in Google Maps in 2025',
      slug: 'local-seo-google-maps-2025',
      excerpt: 'Step-by-step local SEO tactics to dominate the Google Maps 3-pack, drive more calls, and beat every competitor in your service area.',
      content: `<h2>The Google Maps 3-Pack Opportunity</h2>
<p>The Google Maps 3-pack appears at the very top of local search results, above all organic listings. Businesses in the 3-pack receive 70% of all local search clicks. Here is exactly how to get there.</p>
<h2>Google Business Profile Optimization</h2>
<p>Your Google Business Profile (GBP) is the single most important factor for local SEO. Ensure your Name, Address, and Phone (NAP) are consistent, select the most accurate primary category, add all services, upload 20+ high-quality photos, and post weekly updates.</p>
<h2>Local Citation Building</h2>
<p>Citations are mentions of your business name, address, and phone number across the web. Build consistent citations on Yelp, Yellow Pages, BBB, Bing Places, Apple Maps, and 50+ industry-specific directories.</p>
<h2>Review Management Strategy</h2>
<p>Google reviews are a confirmed local ranking factor. Implement a systematic review request process — email and SMS follow-ups after service completion. Respond to every review, positive or negative, within 24 hours.</p>`,
      author: adminUser._id,
      categories: [categories[3]._id],
      tags: [tags[2]._id, tags[6]._id],
      status: 'published',
      publishedAt: new Date('2025-02-15'),
      readingTime: 10,
      viewCount: 5890,
      isFeatured: false,
      seo: {
        metaTitle: 'Local SEO Strategy 2025 — Rank #1 in Google Maps',
        metaDescription: 'Step-by-step local SEO strategy to dominate the Google Maps 3-pack. More calls, more customers.',
        focusKeyword: 'local SEO strategy 2025',
        seoScore: 90,
      },
    },
    {
      title: 'Core Web Vitals: Complete Optimization Guide for 2025',
      slug: 'core-web-vitals-guide-2025',
      excerpt: 'Everything you need to know about LCP, INP, and CLS — how to measure them, what causes failures, and the exact fixes to pass all Core Web Vitals thresholds.',
      content: `<h2>Understanding Core Web Vitals</h2>
<p>Core Web Vitals are a set of metrics that Google uses to measure the real-world user experience of your website. They became a ranking factor in 2021 and continue to be refined. In 2024, FID was replaced by INP (Interaction to Next Paint).</p>
<h2>Largest Contentful Paint (LCP)</h2>
<p>LCP measures how long it takes for the largest content element to load. Good: under 2.5s. Needs improvement: 2.5–4s. Poor: over 4s. Common causes include slow servers, render-blocking resources, unoptimized images, and lack of CDN.</p>
<h2>Interaction to Next Paint (INP)</h2>
<p>INP replaced FID and measures the overall responsiveness of your page to user interactions. Good: under 200ms. Needs improvement: 200–500ms. Poor: over 500ms. JavaScript optimization is the primary lever for improving INP.</p>
<h2>Cumulative Layout Shift (CLS)</h2>
<p>CLS measures visual stability — how much the page layout shifts unexpectedly. Good: under 0.1. Always specify dimensions for images and video embeds, and avoid inserting content above existing content after the page loads.</p>`,
      author: adminUser._id,
      categories: [categories[0]._id],
      tags: [tags[0]._id, tags[7]._id],
      status: 'published',
      publishedAt: new Date('2025-03-01'),
      readingTime: 15,
      viewCount: 4320,
      isFeatured: false,
      seo: {
        metaTitle: 'Core Web Vitals Guide 2025 — LCP, INP, CLS Optimization',
        metaDescription: 'Complete guide to Core Web Vitals optimization. Fix LCP, INP, and CLS issues and pass Google\'s thresholds.',
        focusKeyword: 'core web vitals optimization 2025',
        seoScore: 94,
      },
    },
    {
      title: 'SEO Content Strategy: How to Create Content That Ranks',
      slug: 'seo-content-strategy-guide',
      excerpt: 'A proven, step-by-step content strategy for building topical authority, capturing search demand, and turning blog readers into paying customers.',
      content: `<h2>The Pillar-Cluster Content Model</h2>
<p>The pillar-cluster content model is the gold standard for building topical authority. Create one comprehensive pillar page covering a broad topic, then create multiple cluster pages targeting specific subtopics that link back to the pillar.</p>
<h2>Keyword Research for Content Strategy</h2>
<p>Effective keyword research for content goes beyond search volume. Look for keywords with clear informational intent, moderate competition, and strong commercial downstream intent — topics where readers are likely to convert after consuming your content.</p>
<h2>Writing SEO-Optimized Content</h2>
<p>SEO content writing is about satisfying user intent first and optimizing for search engines second. Include your primary keyword in the H1, first 100 words, at least one H2, and the meta description. Use semantic keywords naturally throughout.</p>
<h2>Content Promotion and Distribution</h2>
<p>Publishing content is only half the job. Promote every piece through email newsletters, social media, industry communities, podcast mentions, and direct outreach for link building. Content that isn't promoted rarely ranks.</p>`,
      author: adminUser._id,
      categories: [categories[2]._id],
      tags: [tags[2]._id, tags[6]._id],
      status: 'published',
      publishedAt: new Date('2025-03-15'),
      readingTime: 11,
      viewCount: 3210,
      isFeatured: false,
      seo: {
        metaTitle: 'SEO Content Strategy Guide — Rank Higher with Better Content',
        metaDescription: 'Build a winning SEO content strategy. Pillar pages, cluster content, keyword research, and promotion tactics.',
        focusKeyword: 'SEO content strategy',
        seoScore: 88,
      },
    },
    {
      title: 'How to Optimize for Google AI Overviews and LLM Search',
      slug: 'optimize-google-ai-overviews-llm-seo',
      excerpt: 'Google AI Overviews are changing how traffic reaches your website. Learn how to optimize your content to appear in AI summaries and stay ahead of the AI search revolution.',
      content: `<h2>Understanding Google AI Overviews</h2>
<p>Google AI Overviews (formerly Search Generative Experience) generate AI-powered summaries at the top of search results. These summaries draw from multiple sources and can significantly reduce clicks to organic listings — or send high-quality traffic to sites that appear as sources.</p>
<h2>How to Appear in AI Overviews</h2>
<p>To appear as a cited source in AI overviews: create authoritative, factually accurate long-form content, implement comprehensive schema markup, build strong E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness), and ensure your content directly answers common questions.</p>
<h2>Entity-Based SEO</h2>
<p>AI search engines understand entities — people, places, organizations, concepts — rather than just keywords. Build entity associations by consistently mentioning related topics, building author authority pages, and getting mentions from authoritative entities in your space.</p>
<h2>Optimizing for LLMs</h2>
<p>Large Language Models like ChatGPT and Claude pull information from indexed web content. Create clear, accurate, well-structured content with explicit statements of facts, proper citations, and clear authorship to maximize your brand's presence in AI-generated responses.</p>`,
      author: adminUser._id,
      categories: [categories[5]._id],
      tags: [tags[5]._id, tags[1]._id],
      status: 'published',
      publishedAt: new Date('2025-04-01'),
      readingTime: 9,
      viewCount: 7840,
      isFeatured: true,
      seo: {
        metaTitle: 'How to Optimize for Google AI Overviews in 2025',
        metaDescription: 'Appear in Google AI Overviews. Optimize your content for AI search, LLMs, and entity-based SEO.',
        focusKeyword: 'Google AI Overviews optimization',
        seoScore: 91,
      },
    },
  ]);
  console.log('✅ Blogs seeded: 6');

  // ── Projects (Case Studies) ───────────────────────────────────────────────
  await Project.insertMany([
    {
      title: 'TechStartup Inc — From Page 5 to #1 in 6 Months',
      slug: 'techstartup-seo-case-study',
      description: 'How we grew TechStartup Inc\'s organic traffic by 420% and dominated their most competitive keywords in under 6 months.',
      client: 'TechStartup Inc',
      industry: 'SaaS / Technology',
      challenge: 'TechStartup Inc had been stuck on page 5 for their primary keyword for over 2 years. Their website had critical technical issues, thin content, and zero backlink strategy.',
      solution: 'We conducted a comprehensive technical audit, fixed 47 critical SEO issues, rebuilt their content strategy around pillar pages, and executed a targeted link building campaign securing 35 high-authority backlinks in the first 90 days.',
      results: ['+420% organic traffic in 6 months', '#1 ranking for primary keyword', '+$380k incremental organic revenue', '85% reduction in page load time', '2x improvement in conversion rate'],
      metrics: { trafficBefore: 4200, trafficAfter: 21840, keywordsBefore: 120, keywordsAfter: 890, domainRatingBefore: 22, domainRatingAfter: 48, timeframe: '6 months' },
      status: 'published',
      seo: { metaTitle: 'TechStartup SEO Case Study — 420% Traffic Growth', metaDescription: 'How SEO Platform grew TechStartup Inc from page 5 to #1 in 6 months with 420% organic traffic growth.' },
    },
    {
      title: 'E-Shop Pro — $1.2M in Organic Revenue Recovered',
      slug: 'eshop-pro-ecommerce-seo-case-study',
      description: 'After a Google algorithm update wiped out 60% of their traffic, we rebuilt E-Shop Pro\'s SEO foundation and recovered $1.2M in annual organic revenue.',
      client: 'E-Shop Pro',
      industry: 'E-Commerce / Retail',
      challenge: 'E-Shop Pro lost 60% of their organic traffic following the Google Helpful Content Update. Their product pages had duplicate content issues, poor page speed, and a thin backlink profile.',
      solution: 'Emergency technical audit identified 200+ duplicate pages. We implemented proper canonical tags, rewrote all product descriptions with unique copy, optimized page speed from 7.2s to 1.8s LCP, and rebuilt their link profile.',
      results: ['+285% organic traffic recovery', '$1.2M in recovered organic revenue', '#1 for 3 high-value product categories', 'LCP improved from 7.2s to 1.8s', '42% improvement in conversion rate'],
      metrics: { trafficBefore: 28000, trafficAfter: 107800, keywordsBefore: 2100, keywordsAfter: 8900, domainRatingBefore: 38, domainRatingAfter: 62, timeframe: '9 months' },
      status: 'published',
      seo: { metaTitle: 'E-Commerce SEO Case Study — $1.2M Revenue Recovery', metaDescription: 'How we recovered $1.2M in organic revenue for E-Shop Pro after a Google algorithm update penalty.' },
    },
    {
      title: 'Local Business Hub — #1 in Google Maps for 28 Keywords',
      slug: 'local-business-hub-local-seo-case-study',
      description: 'We helped Local Business Hub dominate the Google Maps 3-pack for 28 target keywords, generating 3x more calls and 185% more in-store visits.',
      client: 'Local Business Hub',
      industry: 'Local Services / Home Services',
      challenge: 'Despite 10 years in business, Local Business Hub was invisible in local search. Competitors with less experience were capturing all the local SEO visibility.',
      solution: 'Complete Google Business Profile overhaul, systematic citation building across 80+ directories, geo-targeted content creation for each service area, and a review generation system that collected 200+ new 5-star reviews.',
      results: ['#1 in Google Maps 3-pack for 28 keywords', '+190% increase in phone calls', '+185% increase in in-store visits', '200+ new 5-star Google reviews', 'Featured in local news coverage'],
      metrics: { trafficBefore: 890, trafficAfter: 2580, keywordsBefore: 15, keywordsAfter: 180, reviewsBefore: 42, reviewsAfter: 267, timeframe: '4 months' },
      status: 'published',
      seo: { metaTitle: 'Local SEO Case Study — #1 Google Maps for 28 Keywords', metaDescription: 'Local SEO case study: dominating Google Maps 3-pack, 190% more calls, 185% more in-store visits.' },
    },
    {
      title: 'SaaS Co — 340% Traffic Growth with Content-Led SEO',
      slug: 'saas-co-content-seo-case-study',
      description: 'A content-led SEO strategy that positioned SaaS Co as the definitive authority in their niche, driving 340% traffic growth and making their blog their #1 lead generation channel.',
      client: 'SaaS Co',
      industry: 'SaaS / B2B Software',
      challenge: 'SaaS Co was competing against well-funded competitors with massive content libraries. Their blog had 8 posts, no clear keyword strategy, and was generating zero leads.',
      solution: 'Built a comprehensive topical authority strategy around 6 pillar pages and 48 cluster articles. Created a link-worthy data study that earned 120+ backlinks from major industry publications.',
      results: ['+340% organic traffic in 12 months', 'Blog became #1 lead generation channel', '120+ editorial backlinks from data study', '60% of new MQLs from organic content', 'Featured in TechCrunch, Forbes, G2'],
      metrics: { trafficBefore: 3200, trafficAfter: 14080, keywordsBefore: 280, keywordsAfter: 2100, domainRatingBefore: 29, domainRatingAfter: 55, timeframe: '12 months' },
      status: 'published',
      seo: { metaTitle: 'SaaS SEO Case Study — 340% Traffic Growth with Content Strategy', metaDescription: 'Content-led SEO case study for SaaS Co. 340% traffic growth, blog as #1 lead channel.' },
    },
  ]);
  console.log('✅ Projects (Case Studies) seeded: 4');

  // ── Jobs ──────────────────────────────────────────────────────────────────
  await Job.insertMany([
    {
      title: 'Senior SEO Strategist',
      slug: 'senior-seo-strategist',
      department: 'SEO',
      location: 'San Francisco, CA (Hybrid)',
      type: 'Full-time',
      salary: '$90,000 – $120,000',
      description: `<p>We are looking for a Senior SEO Strategist to lead complex client engagements and mentor junior team members. You will own the SEO strategy for a portfolio of 8–12 enterprise clients across various verticals.</p>
<h3>What You'll Do</h3>
<ul><li>Develop and execute comprehensive SEO strategies for enterprise clients</li><li>Conduct technical SEO audits and prioritize remediation roadmaps</li><li>Lead keyword research, content strategy, and link building campaigns</li><li>Present monthly performance reports to C-suite stakeholders</li><li>Mentor 2–3 junior SEO analysts</li></ul>`,
      requirements: `<ul><li>5+ years of in-house or agency SEO experience</li><li>Deep expertise in technical SEO, content strategy, and link building</li><li>Experience with Semrush, Ahrefs, Screaming Frog, Google Search Console</li><li>Proven track record of driving measurable organic growth</li><li>Excellent written and verbal communication skills</li></ul>`,
      benefits: `<ul><li>Competitive salary + performance bonus</li><li>Remote-friendly with quarterly team meetups</li><li>$1,500 annual learning & development budget</li><li>Full health, dental, and vision coverage</li><li>Flexible PTO policy</li></ul>`,
      status: 'published',
    },
    {
      title: 'Content Marketing Manager',
      slug: 'content-marketing-manager',
      department: 'Content',
      location: 'Remote (USA)',
      type: 'Full-time',
      salary: '$70,000 – $95,000',
      description: `<p>We are seeking a Content Marketing Manager to lead our content production team and drive our clients' content-led SEO strategies. You will oversee a team of 4 writers and manage content calendars for 15+ clients.</p>
<h3>What You'll Do</h3>
<ul><li>Develop and manage SEO content strategies for multiple client accounts</li><li>Brief, edit, and publish high-quality blog posts, landing pages, and pillar pages</li><li>Manage a team of 4 freelance and in-house writers</li><li>Perform content audits and identify refresh opportunities</li><li>Track content performance and report on organic KPIs</li></ul>`,
      requirements: `<ul><li>3+ years of content marketing or SEO content writing experience</li><li>Strong understanding of SEO content principles and keyword research</li><li>Excellent editing and quality control skills</li><li>Experience managing multiple projects simultaneously</li><li>Portfolio of SEO content that ranks</li></ul>`,
      benefits: `<ul><li>Fully remote position with flexible hours</li><li>Competitive salary + content performance bonuses</li><li>Full benefits package</li><li>$1,000 home office setup budget</li><li>Unlimited PTO</li></ul>`,
      status: 'published',
    },
    {
      title: 'Technical SEO Analyst',
      slug: 'technical-seo-analyst',
      department: 'Technical SEO',
      location: 'London, UK (Hybrid)',
      type: 'Full-time',
      salary: '£45,000 – £60,000',
      description: `<p>Join our growing Technical SEO team in London. You will work on Core Web Vitals optimization, JavaScript SEO, log file analysis, and schema markup for clients across the UK and Europe.</p>
<h3>What You'll Do</h3>
<ul><li>Conduct comprehensive technical SEO audits</li><li>Optimize Core Web Vitals and page speed</li><li>Implement and test schema markup</li><li>Analyze server log files with Screaming Frog Log Analyzer</li><li>Collaborate with developer teams on technical implementations</li></ul>`,
      requirements: `<ul><li>2+ years of technical SEO experience</li><li>Proficiency with Screaming Frog, Google Search Console, PageSpeed Insights</li><li>Understanding of HTML, CSS, and JavaScript</li><li>Experience with Core Web Vitals optimization</li><li>Analytical mindset with attention to detail</li></ul>`,
      benefits: `<ul><li>Hybrid working (2 days London office, 3 days remote)</li><li>Competitive salary + annual bonus</li><li>25 days holiday + bank holidays</li><li>Private health insurance</li><li>Regular training and certification support</li></ul>`,
      status: 'published',
    },
    {
      title: 'Link Building Specialist',
      slug: 'link-building-specialist',
      department: 'Link Building',
      location: 'Remote (Global)',
      type: 'Full-time',
      salary: '$55,000 – $75,000',
      description: `<p>We are looking for a Link Building Specialist who lives and breathes digital PR and outreach. You will be responsible for acquiring high-quality, white-hat backlinks for a portfolio of 10–15 clients per month.</p>
<h3>What You'll Do</h3>
<ul><li>Develop and execute link building campaigns including guest posts, digital PR, and niche edits</li><li>Build and manage outreach lists using tools like Hunter.io, BuzzStream, and Ahrefs</li><li>Write compelling outreach emails that get replies</li><li>Report on link acquisition metrics monthly</li><li>Stay current on Google's link spam policies</li></ul>`,
      requirements: `<ul><li>2+ years of link building or digital PR experience</li><li>Strong written English communication skills</li><li>Experience with Ahrefs, Moz, or Semrush for backlink analysis</li><li>Proven track record of acquiring DA 50+ links</li><li>Understanding of white-hat link building best practices</li></ul>`,
      benefits: `<ul><li>Fully remote — work from anywhere</li><li>Performance bonuses for link targets</li><li>Flexible 4-day work week option</li><li>Annual team retreats</li><li>Learning & development budget</li></ul>`,
      status: 'published',
    },
  ]);
  console.log('✅ Jobs seeded: 4');

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('Admin Login: admin@seoplatform.com');
  console.log('Password:    Admin@1234');
  console.log('─────────────────────────────────────────\n');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
