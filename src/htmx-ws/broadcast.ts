// src/htmx-ws/broadcast.ts
import { getServerName } from '../shared/utils'

console.log("🤗 Hello via Bun! 🐰");
const topic = 'the-group-chat';
const server = Bun.serve({
    port: 8080, // (1)
    routes: {
        "/": new Response(Bun.file(new URL(import.meta.url + "/../index.html"))), // (4)
        "/surprise": new Response("🎁"),
        "/chat": (req, server) => { // (5)
            if (server.upgrade(req)) { // (6)
                return; // do not return a Response
            }
            return new Response("Filed upgrading to WebSocket", { status: 400 });
        }
    },
    fetch(req, server) {
        return new Response("404!");
    },
    websocket: {
        open(ws) { // (7)
            console.log("👋 A new Websocket Connection");
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>serverName: ${getServerName(import.meta.url)}</li>` +
                '<li>👋 Welcome baby</li>' + "</div>"); // (7)
            ws.subscribe(topic); // (8)
            ws.publish(topic,
                '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>🥳 A new friend is joining the Party</li>` +
                "</div>");
        }, // a socket is opened
        message(ws, data) { // (15)
            let d = JSON.parse(data.toString()) // (15)
            console.log("✉️ A new Websocket Message is received: " + d.message);
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>✉️ Server received a message from you: ${d.message}</li>` +
                "</div>"); // (16)
            ws.publish(
                topic,
                '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>📢 Message from ${ws.remoteAddress}: ${d.message}</li>` +
                "</div>" // (17)
            );
        }, // a message is received
        close(ws, code, message) {
            console.log("⏹️ A Websocket Connection is CLOSED");
            const msg = '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>A Friend has left the chat</li>` +
                "</div>";
            ws.unsubscribe(topic);
            ws.publish(topic, msg);
        }, // a socket is closed
        drain(ws) {
            console.log("DRAIN EVENT");
        }, // the socket is ready to receive more data
    },
});
console.log(`🚀 Server (HTTP and WebSocket) is launched ${server.url.origin}`);

setInterval(() => {
    const msg = '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>Hello from the Server, this is a periodic message!</li>` +
                "</div>";
    server.publish(topic, msg);
    console.log(`Message sent to "${topic}": ${msg}`);
}, 5000); // 5000 ms = 5 seconds

