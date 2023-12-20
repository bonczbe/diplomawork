import Echo from 'laravel-echo';

window.Pusher = require('pusher-js');

/* Creating a new instance of the Echo class. */
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: "livepost_key",
    cluster: "mt1",
    disableStats: false,
    forceTLS: false, //TODO: SSL AKKOR TRUE
    wsHost: window.location.hostname,
    wsPort: 6001,
    'encrypted': false,  //TODO: SSL AKKOR TRUE
    enabledTransports: ['ws', 'wss']

});

/**
 * It returns a websocket channel that is public and can be accessed by anyone.
 * @param name - The name of the channel.
 * @returns A channel object.
 */
export default function WebsocketPublicChannel(name) {
    return window.Echo.channel(name)
}
/**
 * It returns a private channel for the authenticated user.
 * @param name - The name of the channel.
 * @returns A private channel.
 */
export function WebsocketPrivateChannel(name) {
    return window.Echo.private(name)
}
/**
 * It returns a channel object that is used to listen for events on the channel.
 * @param name - The name of the channel.
 * @returns A channel object.
 */
export function WebsocketPresenceChannel(name) {
    return window.Echo.join(name)
}


