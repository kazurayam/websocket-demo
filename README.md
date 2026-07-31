# websocket-demo

I will transcript the articles by ROBERTO BUTTI in Dec 2024:

1. [WebSocket with JavaScript and Bun](https://dev.to/robertobutti/websocket-with-javascript-and-bun-4o7c)
2. [WebSocket Client with JavaScript](https://dev.to/robertobutti/websocket-client-with-javascript-54ec)
3. [WebSocket broadcasting with JavaScript and Bun](https://dev.to/robertobutti/websocket-broadcasting-with-javascript-and-bun-3mkf)

## Set ROOT

```
$ cd ~/github/websocket-demo
$ ROOT=`pwd`
```

## Demonstrating the Echo service by Vanilla Javascript

```
$ cd $ROOT/vanilla-javascript
$ VANILLA=`pwd`
```

Start the server:

```
$ cd $VANILLA
$ bun ./index.ts
```

You want to open a browser and navigate to `localhost:8080`.

![index.ts initial](https://kazurayam.github.io/websocket-demo/images/001_index.ts_initial.png)

Now you are ready to type a message and submit it.

The following screenshot shows how it looks like after a few times of message exchanges.

![index.ts exchanged](https://kazurayam.github.io/websocket-demo/images/002_index.ts_exchanged.png)

## Demonstrating the Echo service using htmx websocket Extension

```
$ cd $ROOT/htmx-ws
$ HTMXWS=`pwd`
```

Start the server:

```
$ cd $HTMXWS
$ bun ./index.ts
```

You want to open a browser and navigate to `localhost:8080`.

![htmx index.ts initial](https://kazurayam.github.io/websocket-demo/images/011_index.ts_initial.png)

Now you are ready to type a message and submit it.

The following screenshot shows how it looks like after a few times of message exchanges.

![index.ts exchanged](https://kazurayam.github.io/websocket-demo/images/012_index.ts_exchanged.png)

As you see, the "htmx-ws" demonstration presents almost the same Web page view.

### Comparing the 2 implementation

The 2 implementation codes are quite different. If you read the 2 codes, compare in detail, you will understand the htmx websocket extension --- how it works, how you should use it.

| Vanilla JavaScript | | Htmx WebSocket extension |
| ----- |--- |  ----- |
| [index.html](https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.html) | <=> | [index.html](https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.html) |
| [index.ts](https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.ts) | <=> |[index.ts](https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.ts) |


#### Diff of index.html

```
$ diff packages/vanilla-javascript/index.html packages/htmx-ws/index.html
6,34c6,11
<         <script>
<             let echo_service;
<             append = function (text) {
<                 document
<                 .getElementById("websocket_events")
<                 .insertAdjacentHTML("beforeend",
<                     "<li>" + text + ";</li>");
<             };
<             window.onload = function () {
<                 echo_service = new WebSocket("ws://127.0.0.1:8080/chat");
<                 echo_service.onmessage = function (event) {
<                     append(event.data);
<                 };
<                 echo_service.onopen = function () {
<                     append("🚀 Connected to WebSocket!");
<                 };
<                 echo_service.onclose = function () {
<                     append("Connection closed");
<                 };
<                 echo_service.onerror = function () {
<                     append("Error happens");
<                 };
<             };
<
<             function sendMessage() {
<                 let message = document.getElementById("message").value;
<                 echo_service.send(message);
<             }
<         </script>
---
>         <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.10/dist/htmx.min.js"
>             integrity="sha384-H5SrcfygHmAuTDZphMHqBJLc3FhssKjG7w/CeCpFReSfwBWDTKpkzPP8c+cLsK+V"
>             crossorigin="anonymous"></script>
>         <script src="https://cdn.jsdelivr.net/npm/htmx-ext-ws@2.0.4"
>             integrity="sha384-1RwI/nvUSrMRuNj7hX1+27J8XDdCoSLf0EjEyF69nacuWyiJYoQ/j39RT1mSnd2G"
>             crossorigin="anonymous"></script>
39,44c16,21
<             Message: <input value="Hello!" type="text" id="message" />
<             <input
<                 type="button"
<                 value="Submit"
<                 id="btn"
<             />
---
>             <div hx-ext="ws" ws-connect="/chat">
>                 <form id="form" ws-send>
>                     Message: <input type="text" name="message" value="Hello!" />
>                     <input type="submit" value="Submit" />
>                 </form>
>             </div>c
48,55d24
<         <script>
<             let msg = document.querySelector('input#message');
<             let btn = document.querySelector('input#btn');
<             btn.addEventListener("click", function (event) {
<                 sendMessage(event);
<                 msg.value = '';
<             })
<         </script>
```

#### Diff of index.ts

```
$ diff packages/vanilla-javascript/index.ts packages/htmx-ws/index.ts
19c19,20
<             ws.send("👋 Welcome baby");
---
>             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
>                 '<li>👋 Welcome baby</li>' + "</div>");
21,23c22,27
<         message(ws, message) {
<             console.log("✉️ A new Websocket Message is received: " + message);
<             ws.send("✉️ Server received a message from you: " + message);
---
>         message(ws, data) {
>             let d = JSON.parse(data.toString())
>             console.log("✉️ A new Websocket Message is received: " + d.message);
>             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
>                 `<li>✉️ Server received a message from you: ${d.message}</li>` +
>                 "</div>");
```


## Demonstrating the Broadcast service by Vanilla JavaScript

```
$ bun ./broadcast.ts
🤗 Hello via Bun! 🐰
🚀 Server (HTTP and WebSocket) is launched http://localhost:8080
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
...
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
👋 A new Websocket Connection
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
...
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
👋 A new Websocket Connection
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
...
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
✉️ A new Websocket Message is received: ça va
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
...
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
✉️ A new Websocket Message is received: こんにちは
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
...
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
⏹️ A Websocket Connection is CLOSED
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
...
Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
^C
```

## Demonstrating the Broadcast service using Htmx WebSocket Extension


