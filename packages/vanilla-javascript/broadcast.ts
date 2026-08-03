// packages/vanilla-javascript/broadcast.ts
console.log("🤗 Hello via Bun! 🐰");
const topic = 'the-group-chat';
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
        message(ws, message) {
            console.log("✉️ A new Websocket Message is received: " + message);
            ws.send("✉️ I received a message from you:  " + message);
            ws.publish(
                topic,
                `📢 Message from ${ws.remoteAddress}: ${message}`,
            );
        }, // a message is received
        open(ws) {
            console.log("👋 A new Websocket Connection");
            ws.subscribe(topic);
            const serverName = "vanilla-javascript/broadcast.ts"
            ws.send(`serverName: ${serverName}`);
            ws.send("👋 Welcome baby");
            ws.publish(topic, "🥳 A new friend is joining the Party");
        }, // a socket is opened
        close(ws, code, message) {
            console.log("⏹️ A Websocket Connection is CLOSED");
            const msg = `A Friend has left the chat`;
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
    const msg = "Hello from the Server, this is a periodic message!";
    server.publish(topic, msg);
    console.log(`Message sent to "${topic}": ${msg}`);
}, 5000); // 5000 ms = 5 seconds

