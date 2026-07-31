console.log("🤗 Hello via Bun! 🐰");
const server = Bun.serve({
    port: 8080, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
    fetch(req, server) {
        const url = new URL(req.url);
        if (url.pathname === "/") return new Response(Bun.file("./index.html"));
        if (url.pathname === "/surprise") return new Response("🎁");

        if (url.pathname === "/chat") {
            if (server.upgrade(req)) {
                return; // do not return a Response
            }
            return new Response("Upgrade failed", { status: 400 });
        }

        return new Response("404!");
    },
    websocket: {
        open(ws) {
            console.log("👋 A new Websocket Connection");
            ws.subscribe("the-group-chat");
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                '<li>👋 Welcome baby</li>' + "</div>");
            ws.publish("the-group-chat",
                '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>🥳 A new friend is joining the Party</li>` +
                "</div>");
        }, // a socket is opened
        message(ws, message) {
            console.log("✉️ A new Websocket Message is received: " + message);
            ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                '<li>👋 Welcome baby</li>' + "</div>");
            ws.publish(
                "the-group-chat",
                '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>📢 Message from ${ws.remoteAddress}: ${message}</li>` +
                "</div>"
            );
        }, // a message is received
        close(ws, code, message) {
            console.log("⏹️ A Websocket Connection is CLOSED");
            const msg = '<div hx-swap-oob="beforeend:#websocket_events">' +
                `<li>A Friend has left the chat</li>` +
                "</div>";
            ws.unsubscribe("the-group-chat");
            ws.publish("the-group-chat", msg);
        }, // a socket is closed
        drain(ws) {
            console.log("DRAIN EVENT");
        }, // the socket is ready to receive more data
    },
});
console.log(`🚀 Server (HTTP and WebSocket) is launched ${server.url.origin}`);

setInterval(() => {
    const msg = "Hello from the Server, this is a periodic message!";
    server.publish("the-group-chat", msg);
    console.log(`Message sent to "the-group-chat": ${msg}`);
}, 5000); // 5000 ms = 5 seconds

