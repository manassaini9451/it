import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor } from '../../database/schemas/visitor.schema';

function parseUA(ua: string) {
  const browser =
    /Edg\//.test(ua)            ? 'Edge'
    : /OPR\/|Opera/.test(ua)    ? 'Opera'
    : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
    : /CriOS/.test(ua)          ? 'Chrome iOS'
    : /FxiOS/.test(ua)          ? 'Firefox iOS'
    : /Chrome\//.test(ua)       ? 'Chrome'
    : /Firefox\//.test(ua)      ? 'Firefox'
    : /Safari\//.test(ua) && /Version\//.test(ua) ? 'Safari'
    : /MSIE|Trident/.test(ua)   ? 'Internet Explorer'
    : 'Other';

  const os =
    /Windows NT/.test(ua)    ? 'Windows'
    : /Mac OS X/.test(ua)    ? 'macOS'
    : /Android/.test(ua)     ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Linux/.test(ua)       ? 'Linux'
    : 'Other';

  const deviceType =
    /Mobi|Android.*Mobile|iPhone/.test(ua) ? 'mobile'
    : /iPad|Android(?!.*Mobile)/.test(ua)  ? 'tablet'
    : 'desktop';

  return { browser, os, deviceType };
}

function getRealIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip && ip !== '::1' && ip !== '127.0.0.1') return ip;
  }
  const realIp = req.headers['x-real-ip'] as string;
  if (realIp && realIp !== '::1' && realIp !== '127.0.0.1') return realIp;

  const socket = req.socket.remoteAddress || '';
  if (socket.startsWith('::ffff:')) return socket.replace('::ffff:', '');
  return socket || 'unknown';
}

// Returns real client IP sent from the frontend
// In dev localhost, IP will be 127.0.0.1 — we use the free ip-api.com
// to geolocate. For localhost we skip geo (nothing to look up).
async function geolocate(ip: string): Promise<{ country: string; city: string } | null> {
  // Skip private/loopback addresses — no geo data available
  if (
    !ip ||
    ip === 'unknown' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return null;
  }

  try {
    // ip-api.com: free, no API key needed, 45 req/min limit
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(3000), // 3s timeout — never block the response
    });
    const data = await res.json();
    if (data.status === 'success') {
      return { country: data.country || '', city: data.city || '' };
    }
  } catch (_) {}

  return null;
}

@Controller({ path: 'visitor-ping', version: '1' })
export class VisitorPingController {
  constructor(@InjectModel(Visitor.name) private model: Model<Visitor>) {}

  @Post()
  async ping(
    @Body('path') path: string,
    @Body('sessionId') bodySessionId: string,
    @Body('ip') clientSentIp: string,   // frontend can optionally send real IP
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const ua = req.headers['user-agent'] || '';
      const isBot = /bot|crawler|spider|curl|wget|slurp|bingbot|googlebot/i.test(ua);
      if (isBot) return { ok: true };

      const sessionId = bodySessionId || (req.cookies?.sid as string);
      if (!sessionId) return { ok: true }; // no session = ignore

      const ip = clientSentIp || getRealIP(req);
      const normalizedPath = (path || '/').split('?')[0] || '/';

      const existing = await this.model.findOne({ sessionId });

      if (!existing) {
        const { browser, os, deviceType } = parseUA(ua);
        const referrer = (req.headers['referer'] as string) || '';

        // Geolocate in parallel — don't await before creating, do it after
        const geo = await geolocate(ip);

        await this.model.create({
          sessionId,
          ip,
          country: geo?.country,
          city: geo?.city,
          userAgent: ua,
          browser, os, deviceType,
          referrer: referrer || undefined,
          isBot: false,
          isReturning: false,
          pageViews: 1,
          landingPage: normalizedPath,
          lastSeenAt: new Date(),
          pageHistory: [{ url: normalizedPath, enteredAt: new Date() }],
        });

        res.cookie('sid', sessionId, {
          httpOnly: true, sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      } else {
        const last = existing.pageHistory?.[existing.pageHistory.length - 1];
        const isDuplicate =
          last?.url === normalizedPath &&
          Date.now() - new Date(last.enteredAt).getTime() < 2000;

        if (!isDuplicate) {
          await this.model.findByIdAndUpdate(existing._id, {
            $set: { lastSeenAt: new Date(), isReturning: true },
            $inc: { pageViews: 1 },
            $push: {
              pageHistory: {
                $each: [{ url: normalizedPath, enteredAt: new Date() }],
                $slice: -20,
              },
            },
          });
        }

        // Backfill geo if it was missing (e.g. first hit was localhost)
        if (!existing.country && !existing.city) {
          const geo = await geolocate(ip);
          if (geo) {
            await this.model.findByIdAndUpdate(existing._id, {
              $set: { country: geo.country, city: geo.city, ip },
            });
          }
        }
      }
    } catch (_) {}

    return { ok: true };
  }
}