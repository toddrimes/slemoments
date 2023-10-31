import { io } from 'socket.io-client';
const SOCKET_PORT = process.env.SOCKET_PORT || 5501;

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : `http://localhost:${SOCKET_PORT}`;
export const socket = io(URL, {
    autoConnect: false
});
