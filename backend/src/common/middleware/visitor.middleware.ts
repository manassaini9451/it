import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor } from '../../database/schemas/visitor.schema';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Tiny UA parser — no extra dependency needed
// ---------------------------------------------------------------------------
function parseUA(ua: string): { browser: string; os: string; deviceType: string } {
  const browser =
    /Edg\//.test(ua)           ? 'Edge'
    : /OPR\/|Opera/.test(ua)   ? 'Opera'
    : /SamsungBrowser/.test(ua)? 'Samsung Internet'
    : /CriOS/.test(ua)         ? 'Chrome iOS'
    : /FxiOS/.test(ua)         ? 'Firefox iOS'
    : /Chrome\//.test(ua)      ? 'Chrome'
    : /Firefox\//.test(ua)     ? 'Firefox'
    : /Safari\//.test(ua) && /Version\//.test(ua) ? 'Safari'
    : /MSIE|Trident/.test(ua)  ? 'Internet Explorer'
    : 'Other';

  const os =
    /Windows NT/.test(ua)  ? 'Windows'
    : /Mac OS X/.test(ua)  ? 'macOS'
    : /Android/.test(ua)   ? 'Android'
    : /iPhone|iPad/.test(ua)? 'iOS'
    : /Linux/.test(ua)     ? 'Linux'
    : 'Other';

  const deviceType =
    /Mobi|Android.*Mobile|iPhone/.test(ua) ? 'mobile'
    : /iPad|Android(?!.*Mobile)/.test(ua)  ? 'tablet'
    : 'desktop';

  return { browser, os, deviceType };
}

function parseUTM(query: Record<string, any>): Record<string, string> | undefined {
  const keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  const utm: Record<string, string> = {};
  let found = false;
  for (const k of keys) {
    if (query[k]) { utm[k.replace('utm_', '')] = String(query[k]); found = true; }
  }
  return found ? utm : undefined;
}

@Injectable()
export class VisitorMiddleware implements NestMiddleware {
  constructor(@InjectModel(Visitor.name) private model: Model<Visitor>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip API and static asset paths
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();

    try {
      const sessionId = (req.cookies?.sid as string) || uuidv4();
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';
      const ua = req.headers['user-agent'] || '';
      const isBot = /bot|crawler|spider|curl|wget|slurp|bingbot|googlebot/i.test(ua);

      const existing = await this.model.findOne({ sessionId });

      if (!existing) {
        // ── First visit: collect everything ──────────────────────────────
        const { browser, os, deviceType } = parseUA(ua);
        const referrer = (req.headers['referer'] as string) || '';
        const utm = parseUTM(req.query as Record<string, any>);

        await this.model.create({
          sessionId,
          ip,
          userAgent: ua,
          browser,
          os,
          deviceType,
          referrer: referrer || undefined,
          utm,
          isBot,
          isReturning: false,
          pageViews: 1,
          landingPage: req.path,
          lastSeenAt: new Date(),
          pageHistory: [{ url: req.path, enteredAt: new Date() }],
        });

        // Set session cookie so the same visitor is recognised on next request
        res.cookie('sid', sessionId, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      } else {
        // ── Returning visit: only track page navigation ───────────────────
        // Avoid double-counting the same page hit within 2 s (e.g. React double renders)
        const lastPage = existing.pageHistory?.[existing.pageHistory.length - 1];
        const isDuplicate =
          lastPage?.url === req.path &&
          Date.now() - new Date(lastPage.enteredAt).getTime() < 2000;

        if (!isDuplicate) {
          await this.model.findByIdAndUpdate(existing._id, {
            $set: { lastSeenAt: new Date(), isReturning: true },
            $inc: { pageViews: 1 },
            $push: {
              pageHistory: {
                $each: [{ url: req.path, enteredAt: new Date() }],
                $slice: -20,
              },
            },
          });
        }
      }
    } catch (_) {
      // Never block the request on tracking errors
    }

    next();
  }
}