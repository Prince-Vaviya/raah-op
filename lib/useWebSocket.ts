import { useEffect, useState } from 'react';
import { WS_URL } from './api';

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    let socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log('Connected to WS');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (err) {
        console.error('Invalid WS message', err);
      }
    };

    socket.onclose = () => {
      console.log('WS disconnected');
      // basic reconnect logic
      setTimeout(() => {
        setWs(new WebSocket(WS_URL));
      }, 3000);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  return { ws, lastMessage };
}
