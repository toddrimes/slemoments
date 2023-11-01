// import { io } from 'socket.io-client';
import {io} from 'socket.io-client/dist/socket.io.js';

const SOCKET_PORT = process.env.SOCKET_PORT || 5501;
// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? 'https://momentsapi-tr-0b46d75889bf.herokuapp.com/' : `http://localhost:${SOCKET_PORT}`;
console.log('socket URL is ' + URL);
export const socket = io(URL, {
    autoConnect: true
});
