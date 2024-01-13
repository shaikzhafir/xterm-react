export interface WebSocketConnection {
  connect(): WebSocket;
  disconnect(): void;
}

export function createConnection(websocketUrl: string): WebSocketConnection {
  let socket: WebSocket | null = null;

  return {
    connect: () => {
      // disconnect if already connected
      if (socket) {
        socket.close();
      }
      socket = new WebSocket(websocketUrl);
      return socket;
    },
    disconnect: () => {
      if (socket) {
        socket.close();
      }
    },
  };
}
