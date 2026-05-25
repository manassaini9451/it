'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setActiveVisitors } from '@/store/slices/uiSlice';
import { selectIsAuth } from '@/store/slices/authSlice';

const Ctx = createContext<{ socket: Socket | null; connected: boolean }>({ socket: null, connected: false });
export const useSocket = () => useContext(Ctx);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);

  useEffect(() => {
    // Only connect when user is authenticated
    if (!isAuth) {
      if (ref.current) {
        ref.current.disconnect();
        ref.current = null;
        setConnected(false);
      }
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const socket = io(`${wsUrl}/ws`, {
      auth: { token },
      transports: ['polling', 'websocket'], // start with polling, upgrade to ws
      reconnection: true,
      reconnectionAttempts: 5,       // stop after 5 tries instead of infinite
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    ref.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      // Silently handle — backend may not be available
      console.debug('[Socket] connection error:', err.message);
      setConnected(false);
    });
    socket.on('analytics:active-visitors', ({ count }: any) => dispatch(setActiveVisitors(count)));

    return () => {
      socket.disconnect();
      ref.current = null;
    };
  }, [isAuth]);

  return <Ctx.Provider value={{ socket: ref.current, connected }}>{children}</Ctx.Provider>;
}
