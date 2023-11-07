import {io} from 'socket.io-client/dist/socket.io.js';
const dotenv = require('dotenv')

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === 'production' ? 'https://momentsapi-tr-0b46d75889bf.herokuapp.com/' : 'http://localhost:5501';
const URL = 'https://momentsapi-tr-0b46d75889bf.herokuapp.com/';
console.log('socket URL is ' + URL);
export const socket = io(URL, {
    autoConnect: false
});
