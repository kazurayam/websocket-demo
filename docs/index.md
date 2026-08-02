- Table of contents
{:toc}

# BunとHtmxによるWebSocketのデモ

## 概要

WebSocketを使ったサーバとクライアントを紹介します。サーバはBunの上にTypeScript言語で実装した。クライアントはwebブラウザにHTMLをロードする形で実装した。ただしクライアントを実装するのに二通りの方法を試みた。ひとつは `<script>` タグの中にJavaScriptでコードをゴリゴリ書く素朴なやり方。もう一つは [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/) を利用するやり方。同じように動く二つのアプリケーションを作ることにより、HtmxのWebSocket Extensionの使い方をより良く理解することができる。

## 動機

書籍 [「JavaScriptレスの動的UI開発 htmx入門」](https://www.amazon.co.jp/dp/487311920X) 太田智暉 著、C＆R研究所 （以下で "htmx本" と略する）のサンプルコードを読んで htmx を活用したwebアプリケーションを開発する手法を学ぼうと思った。htmx本の著者はPythonの [FastAPI](https://fastapi.tiangolo.com/advanced/websockets/#in-production) フレームワークを使ってサンプルアプリを作る方法を解説している。それはさておき、わたしはTypeScript言語とBunで作りたいと思った。htmx本のSECTION-024 "TODOアプリ" まで読み進めたところでQiitaに記事を書いて公開した: [Htmx and Playwright Tests in TypeScript](https://qiita.com/kazurayam/items/4a310e6a1470e01b1453)。続けて SECTION-025 "チャットアプリの作成" に進んだがつまづいてしまった。別のテキストを読んでWebSocketを基礎から学習しようと思った。

## WebSocketとは

AIによる要約:

&gt;WebSocket is a protocol that enables a persistent, bidirectional communication channel over a single TCP connection, allowing servers to push data to clients without prior requests. The WebSocket API in browsers lets you create and manage a WebSocket connection using the WebSocket() constructor and handle events like open, message, error, and close.

- [WikipediaのWebSocketのページ](https://ja.wikipedia.org/wiki/WebSocket)

- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 目標

この記事でわたしはクライアントを実装するために二通りの方法を試した。第一に、ブラウザが提供している [素のJavaScriptのWebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) だけを使う。第二に、[Htmx](https://htmx.org/docs/#introduction) を導入してクライアントを実装し、素のJavaScriptによるWebSocketアプリと [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/) で同じように動作させることを目指す。素のJavaScriptによるコードがHtmxのWebSocket Extensionの解説になることを期待して。なおサーバーは [BunのWebSocket API](https://bun.com/docs/runtime/http/websockets) だけを使って実装する。クライアントの実装方法がどうあれサーバーの実装はほとんど同じで済むだろうと予想したが、本当にそ雨かどうかは、やってみないとわからない。

## 環境を構築する

### ルートプロジェクトを作る

自分のマシンで適当なディレクトリを作る。この記事ではそのディレクトリを `ROOT` という記号で呼ぶことにする。下記の操作例ではわたしのMacのホームディレクトリの直下に `websocket-demo` ディレクトリを作った。そしてそのフルパスを一時的なシェル変数 `ROOT` に代入して参照している。

    $ cd ~/websocket-demo
    $ ROOT=`pwd`
    $ echo $ROOT
    /Users/kazurayam/websocket-demo

### ２つのサブディレクトリを作る

`$ROOT/packages/vanilla-javascript` と `$ROOT/packages/htmx-ws` を作った。

    $ cd $ROOT
    $ mkdir packages
    $ cd packages
    $ mkdir vanilla-javascript
    $ mkdir htmx-ws
    $ cd -
    $ tree -L 2
    .
    ├── packages
    │   ├── htmx-ws
    │   └── vanilla-javascript
    └── README.md

二つのディレクトリそれぞれの下にWebSocketアプリケーションを一つづつ作ろう。 `vanilla-javascript` ディレクトリの中ではブラウザが提供する [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) を素のJavaScriptが直接ドライブする例を実装しよう。 `htmx-ws` ディレクトリの中では [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/)を利用する例を実装しよう。

## Vanilla JavaScriptによる実装

### 参考にした記事

下記の記事を参考にした。

1.  [DEV / WebSocket with JavaScript and Bun, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-with-javascript-and-bun-4o7c)

2.  [DEV / WebSocket Client with JavaScript, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-client-with-javascript-54ec)

3.  [DEV / WebSocket broadcasting with JavaScript and Bun, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-broadcasting-with-javascript-and-bun-3mkf)

### Vanilla JavaScriptによる実装のコード

#### vanilla-javascript/index.ts

    // packages/vanilla-javascript/index.ts

    console.log("🤗 Hello via Bun! 🐰");
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
                const serverName = "vanilla-javascript/index.ts"
                ws.send(`serverName: ${serverName}`);
                ws.send("👋 Welcome baby");
            },
            message(ws, message) {
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

#### vanilla-javascript/index.html

    <!-- packages/vanilla-javascript/index.html -->
    <!doctype html>
    <html>
        <head>
            <title>WebSocket with Bun and JavaScript</title>
            <script>
                let echo_service;
                append = function (text) {
                    document
                    .getElementById("websocket_events")
                    .insertAdjacentHTML("beforeend",
                        "<li>" + text + ";</li>");
                };
                window.onload = function () {
                    echo_service = new WebSocket("ws://127.0.0.1:8080/chat");
                    echo_service.onmessage = function (event) {
                        append(event.data);
                    };
                    echo_service.onopen = function () {
                        append("🚀 Connected to WebSocket!");
                    };
                    echo_service.onclose = function () {
                        append("Connection closed");
                    };
                    echo_service.onerror = function () {
                        append("Error happens");
                    };
                };

                function sendMessage() {
                    let message = document.getElementById("message").value;
                    echo_service.send(message);
                }
            </script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
        </head>
        <body>
            <main class="container">
                Message: <input value="Hello!" type="text" id="message" />
                <input
                    type="button"
                    value="Submit"
                    id="btn"
                />
                <br />
                <ul id="websocket_events"></ul>
            </main>
            <script>
                let msg = document.querySelector('input#message');
                let btn = document.querySelector('input#btn');
                btn.addEventListener("click", function (event) {
                    sendMessage(event);
                    msg.value = '';
                })
            </script>
        </body>
    </html>

#### vanilla-javascript/broadcast.ts

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

### Vanilla JavaScriptによる実装を動かしてみる

サーバーを起動するには、コマンドラインで `$ROOT/packages/vanilla-javascript` ディレクトリにcdして `bun ./index.ts` を実行する。

    $ cd $ROOT/packages/vanilla-javascript
    $ bun ./index.ts
    $ bun ./index.ts
    🤗 Hello via Bun! 🐰
    🚀 Server (HTTP and WebSocket) is launched http://localhost:8080

サーバーが起動したら、次にブラウザを開き URL `localhost:8080` を開く。するとこんな初期画面が表示される。

![index.ts initial](https://kazurayam.github.io/websocket-demo/images/001_index.ts_initial.png)

Messageの入力フィールドに何らかの文字をキー入力した上で Submit ボタンを押す。するとそのメッセージがechoされて画面の下の方に表示される。例えば「Hello」と入力してSubmit、「こんにちは」と入力してSubmit、「ça va」と入力してSubmitすると３本のメッセージが表示される。

![index.ts exchanged](https://kazurayam.github.io/websocket-demo/images/002_index.ts_exchanged.png)

`./index.ts` が提供するのはechoサービスです。broadcastサービスではない。二つのブラウザを同時に立ち上げてそれぞれにメッセージをSubmitすればそれぞれのブラウザにメッセージが応答される。しかし、片方のブラウザでメッセージを送信しても、もう片方のブラウザにはそのメッセージは表示されません。

![dual browser echo local](https://kazurayam.github.io/websocket-demo/images/003_dual_browser_echo_local.png)

コマンドラインでCTRL+Cをキー入力して `./index.ts` によって起動したサーバを停止しましょう。そして今度は `bun ./broadcast.ts` を実行しよう。

    $ cd $ROOT/packages/vanilla-javascript
    $ bun ./broadcast.ts
    $ bun ./broadcast.ts
    🤗 Hello via Bun! 🐰
    🚀 Server (HTTP and WebSocket) is launched http://localhost:8080
    Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
    ...

`` ./broadcast.ts`はBroadcastサービスを提供します。二つのブラウザを同時に立ち上げてそれぞれにメッセージをSubmitすればそれぞれのブラウザにメッセージが表示されるだけでなく、片方のブラウザでメッセージを送信すると、もう片方のブラウザにもそのメッセージが表示されます。また `./broadcast.ts`はサーバーからの定期的なメッセージ( ` `` )をブラウザに送信します。ブラウザを開いたままにしておくと、サーバーからの定期的なメッセージがブラウザに表示されます。

![broadcast](https://kazurayam.github.io/websocket-demo/images/004_broadcast.png)

## Htmx WebSocket Extensionを使った実装

## Demonstrating the Echo service using htmx websocket Extension

    $ cd $ROOT/htmx-ws
    $ HTMXWS=`pwd`

Start the server:

    $ cd $HTMXWS
    $ bun ./index.ts

You want to open a browser and navigate to `localhost:8080`.

\![htmx index.ts initial\](<https://kazurayam.github.io/websocket-demo/images/011_index.ts_initial.png>)

Now you are ready to type a message and submit it.

The following screenshot shows how it looks like after a few times of message exchanges.

\![index.ts exchanged\](<https://kazurayam.github.io/websocket-demo/images/012_index.ts_exchanged.png>)

As you see, the "htmx-ws" demonstration presents almost the same Web page view.

### Comparing the 2 implementation

The 2 implementation codes are quite different. If you read the 2 codes, compare in detail, you will understand the htmx websocket extension --- how it works, how you should use it.

| Vanilla JavaScript | | Htmx WebSocket extension |
| ----- |--- | ----- |
| \[index.html\](<https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.html>) | &lt;⇒ | \[index.html\](<https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.html>) |
| \[index.ts\](<https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.ts>) | &lt;⇒ |\[index.ts\](<https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.ts>) |

#### Diff of index.html

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

#### Diff of index.ts

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

## Demonstrating the Broadcast service by Vanilla JavaScript

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

## Demonstrating the Broadcast service using Htmx WebSocket Extension
