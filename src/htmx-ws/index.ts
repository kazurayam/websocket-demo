// src/htmx-ws/index.ts
import { getServerName } from '../shared/utils';

console.log("🤗 Hello via Bun! 🐰");
const server = Bun.serve({
    port: 8080,
    routes: {
        "/": new Response(Bun.file(new URL(import.meta.url + "/../index.html"))),
        "/surprise": new Response("🎁"),
        "/chat": (req, server) => {
            if (server.upgrade(req)) {
                return; // do not return a Response
            }
            return new Response("Filed upgrading to WebSocket", { status: 400 });
        }
    },
    fetch(req, server) {
        return new Response("404!");
    },
    websocket: {
        open(ws) {
            console.log("👋 A new Websocket Connection");
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>serverName: ${getServerName(import.meta.url)}</li>` +
                '<li>👋 Welcome baby</li>' + "</div>");
        },
        message(ws, data) {
            console.log(data)
            let d = JSON.parse(data.toString())
            let response = '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>✉️ Server received a message from you: ${d.message}</li>` +
                "</div>";
            console.log(response);
            ws.send(response);
        },
        close(ws, code, message) {
            console.log("⏹️ A Websocket Connection is CLOSED");
        },
        drain(ws) {
            console.log("DRAIN EVENT");
        }, // the socket is ready to receive more data
    }
});
console.log(`🚀 Server (HTTP and WebSocket) is launched ${server.url.origin}`);
