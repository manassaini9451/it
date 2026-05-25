'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;

      return (
        c === 'x'
          ? r
          : (r & 0x3) | 0x8
      ).toString(16);
    },
  );
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sid = localStorage.getItem('visitor_sid');

  if (!sid) {
    sid = randomId();

    localStorage.setItem('visitor_sid', sid);
  }

  return sid;
}

async function getPublicIP(): Promise<string> {
  if (typeof window === 'undefined') return '';

  const cached = sessionStorage.getItem('visitor_ip');

  if (cached) return cached;

  try {
    const res = await fetch(
      'https://api.ipify.org?format=json',
      {
        signal: AbortSignal.timeout(3000),
      },
    );

    const data = await res.json();

    const ip = data.ip || '';

    if (ip) {
      sessionStorage.setItem('visitor_ip', ip);
    }

    return ip;
  } catch {
    return '';
  }
}

export default function PageTracker() {
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const lastTracked = useRef<string>('');

  useEffect(() => {
    const url =
      pathname +
      (searchParams.toString()
        ? `?${searchParams.toString()}`
        : '');

    if (lastTracked.current === url) return;

    lastTracked.current = url;

    if (pathname.startsWith('/admin')) return;

    const sessionId = getSessionId();

    getPublicIP().then((ip) => {
      fetch(`${API_URL}/v1/visitor-ping`, {
        method: 'POST',

        credentials: 'include',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          path: pathname,
          sessionId,
          ip,
        }),
      }).catch(() => {});
    });
  }, [pathname, searchParams]);

  return null;
}