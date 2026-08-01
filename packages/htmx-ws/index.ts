console.log("🤗 Hello via Bun! 🐰");
const serverName = "htmx-ws/index.ts"
const server = Bun.serve({
    port: 8080,
    fetch(req, server) {
        const url = new URL(req.url);
        if (url.pathname === "/") return new Response(Bun.file("./index.html"));
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
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>serverName: ${serverName}</li>` +
                '<li>👋 Welcome baby</li>' + "</div>");
        },
        message(ws, data) {
            let d = JSON.parse(data.toString())
            console.log("✉️ A new Websocket Message is received: " + d.message);
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>✉️ Server received a message from you: ${d.message}</li>` +
                "</div>");
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
