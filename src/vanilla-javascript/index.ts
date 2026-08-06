// src/vanilla-javascript/index.ts
import { getServerName } from '../shared/utils';

console.log("🤗 Hello via Bun! 🐰");
const server = Bun.serve({
    port: 8080,
    fetch(req, server) {
        const url = new URL(req.url);
        if (url.pathname === "/") return new Response(Bun.file(new URL(import.meta.url + "/../index.html")));
        if (url.pathname === "/surprise") return new Response("🎁");
        if (url.pathname === "/chat") {
            if (server.upgrade(req)) {
                return; // do not return a Response
            }
            return new Response("Filed upgrading to WebSocket", {status: 400});
        }
        return new Response("404!");
    },
    websocket: {
        open(ws) {
            console.log("👋 A new Websocket Connection");
            ws.send(`serverName: ${getServerName(import.meta.url)}`);
            ws.send("👋 Welcome baby");
        },
        message(ws, message) {
            console.log(message)
            console.log("✉️ A new Websocket Message is received: " + message);
            ws.send("✉️ Server received a message from you: " + message);
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
