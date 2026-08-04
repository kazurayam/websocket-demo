- Table of contents
{:toc}

# WebSocketプロトコルで連携するクライアントとサーバのデモ --- BunとHTMXによる

- date: 2026-08-03

- author: kazurayam

- レポジトリ: <https://github.com/kazurayam/websocket-demo>

## 概要

WebSocketプロトコルで連携するサーバとクライアントを紹介します。サーバはBunの上にTypeScript言語で実装した。クライアントはwebブラウザにHTMLをロードする形で実装した。クライアントを実装するのに二通りの方法を試みた。ひとつは `<script>` タグの中にJavaScriptでコードをゴリゴリ書く素朴なやり方。もう一つは [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/) を利用するやり方。HtmxのWebSocket拡張の使い方を理解することができた。

## WebSocketとは

AIによる説明:

> WebSocketは、単一のTCP接続上で永続的かつ双方向の通信チャネルを可能にするプロトコルであり、サーバーが事前のリクエストなしにクライアントにデータをプッシュできるようにします。ブラウザのWebSocket APIでは、WebSocket()コンストラクタを使ってWebSocket接続を作成・管理し、開く、メッセージ、エラー、クローズなどのイベントを処理できます。

参考情報:

1.  [WikipediaのWebSocketのページ](https://ja.wikipedia.org/wiki/WebSocket)

2.  [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

3.  [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/)

## 環境を構築する

### 所与の環境

- macOS Tahoe 26.5.2

- Bun 1.3.14

- Chrome 150.0.7871.187

- Firefox 153.0.1

- VSCode 1.130.0

### ルート・ディレクトリを作る

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

二つのディレクトリそれぞれの下にWebSocketアプリケーションを一つづつ作ろうと考えた。 `vanilla-javascript` ディレクトリの中ではブラウザが提供する [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) を素のJavaScriptが直接ドライブする例を実装しよう。 `htmx-ws` ディレクトリの中では [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/)を利用する例を実装しよう。

`bun init` コマンドでbunプロジェクトを初期化した。

    $ cd $ROOT/packages/vanilla-javascript
    $ bun -init -y
    $ cd $ROOT/packages/htmx-ws
    $ bun -init -y

`bun add` コマンドで追加すべき外部パッケージは無い。 `Bun.serve()` がWebSocket APIを標準提供する。それで十分だ。

## Vanilla JavaScriptによる実装

### 参考にした記事

下記の記事を参考にした。

1.  [DEV / WebSocket with JavaScript and Bun, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-with-javascript-and-bun-4o7c)

2.  [DEV / WebSocket Client with JavaScript, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-client-with-javascript-54ec)

3.  [DEV / WebSocket broadcasting with JavaScript and Bun, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-broadcasting-with-javascript-and-bun-3mkf)

### Vanilla JavaScriptによる実装を動かしてみる

ROBERTO BUTTI氏の記事を参考にして、わたしは `$ROOT/packages/vanilla-javascript` ディレクトリの下に `index.ts` と `index.html` を作った。さらにBroadcastサービスを提供するために `broadcast.ts` も作った。

- [packages/vanilla-javascript/](https://github.com/kazurayam/websocket-demo/tree/main/packages/vanilla-javascript)

何はともあれ動かしてみよう。サーバーを起動するには、コマンドラインで `$ROOT/packages/vanilla-javascript` ディレクトリにcdして `bun ./index.ts` を実行する。

    $ cd $ROOT/packages/vanilla-javascript
    $ bun ./index.ts
    🤗 Hello via Bun! 🐰
    🚀 Server (HTTP and WebSocket) is launched http://localhost:8080

サーバーが起動したら、次にブラウザを開き URL `localhost:8080` を開く。するとこんな初期画面が表示される。

![index.ts initial](https://kazurayam.github.io/websocket-demo/images/001_index.ts_initial.png)

Messageの入力フィールドに何らかの文字をキー入力した上で Submit ボタンを押す。するとそのメッセージがechoされて画面の下の方に表示される。例えば「Hello」と入力してSubmit、「こんにちは」と入力してSubmit、「ça va」と入力してSubmitすると３本のメッセージが表示される。

![index.ts exchanged](https://kazurayam.github.io/websocket-demo/images/002_index.ts_exchanged.png)

`./index.ts` が提供するのはechoサービスです。broadcastサービスではない。二つのブラウザを同時に立ち上げてそれぞれにメッセージをSubmitすればそれぞれのブラウザにメッセージが応答される。しかし、Firfoxブラウザで「元気ですか」と送信しても、Chromeブラウザには「元気ですか」と表示されません。

![dual browser echo local](https://kazurayam.github.io/websocket-demo/images/003_dual_browser_echo_local.png)

コマンドラインでCTRL+Cをキー入力して `./index.ts` によって起動したサーバを停止しましょう。そして今度は `bun ./broadcast.ts` を実行しよう。

    $ cd $ROOT/packages/vanilla-javascript
    $ bun ./broadcast.ts
    $ bun ./broadcast.ts
    🤗 Hello via Bun! 🐰
    🚀 Server (HTTP and WebSocket) is launched http://localhost:8080
    Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
    ...

`./broadcast.ts` はBroadcastサービスを提供します。二つのブラウザを同時に立ち上げてそれぞれにメッセージをSubmitすればそれぞれのブラウザにメッセージが応答される。それだけでなく、片方のブラウザでメッセージを送信すると、もう片方のブラウザにもそのメッセージが表示されます。

![broadcast](https://kazurayam.github.io/websocket-demo/images/004_broadcast.png)

また `./broadcast.ts` はサーバーからクライアントへ単方向なメッセージを一定周期で送信します。ブラウザを開いたままにしておくと、サーバーからメッセージ `Hello from the Server, this is a periodic message!` が繰り返しブラウザに表示されます。

![mono directional messaging](https://kazurayam.github.io/websocket-demo/images/005_mono_directional_messaging.png)

HTTPプロトコルの場合クライアントがrequestしサーバがreplyするの繰り返す。それに対して、WebSocketプロトコルはサーバーからクライアントへの単方向通信も可能であることが特徴です。

### Vanilla JavaScriptによる実装のコード

では、Vanilla JavaScriptによる実装のコードを紹介します。

#### [vanila-javascript/index.ts](https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.ts)

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

#### [vanilla-javascript/index.html](https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.html)

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

#### [vanilla-javascript/broadcast.ts](https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/broadcast.ts)

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

## Htmx WebSocket Extensionを使った実装

わたしは `$ROOT/packages/htmx-ws` ディレクトリの下に `index.ts` と `index.html` と `broadcast.ts` を作った。

- [packages/htmx-ws/](https://github.com/kazurayam/websocket-demo/tree/main/packages/htmx-ws)

<!-- -->

    $ cd $ROOT/packages/htmx-ws
    $ tree -L 1
    .
    ├── broadcast.ts
    ├── bun.lock
    ├── index.html
    ├── index.ts
    ├── node_modules
    ├── package.json
    └── tsconfig.json

`cd $ROOT/packages/htmx-ws` したうえで `bun ./index.ts` を実行してサーバーを起動しブラウザで `localhost:8080` を開くとechoのデモが動きます。また `bun ./broadcast.ts` を実行すればbroadcastのデモが動きます。どちらもVanilla JavaScriptによる実装と見た目は同じです。

### [htmx-ws/index.html](https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.html)

    <!-- packages/htmx-ws/index.html -->
    <!doctype html>
    <html>
        <head>
            <title>WebSocket with Bun and JavaScript</title>
            <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.10/dist/htmx.min.js"
                integrity="sha384-H5SrcfygHmAuTDZphMHqBJLc3FhssKjG7w/CeCpFReSfwBWDTKpkzPP8c+cLsK+V"
                crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/htmx-ext-ws@2.0.4"
                integrity="sha384-1RwI/nvUSrMRuNj7hX1+27J8XDdCoSLf0EjEyF69nacuWyiJYoQ/j39RT1mSnd2G"
                crossorigin="anonymous"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
        </head>
        <body>
            <main class="container">
                <div hx-ext="ws" ws-connect="/chat">
                    <form id="form" ws-send>
                        Message: <input type="text" name="message" value="Hello!" />
                        <input type="submit" value="Submit" />
                    </form>
                </div>
                <br />
                <ul id="websocket_events"></ul>
            </main>
        </body>
    </html>

### [htmx-ws/index.ts](https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.ts)

    // packages/htmx-ws/index.ts
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
                const serverName = "htmx-ws/index.ts"
                ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                    `<li>serverName: ${serverName}</li>` +
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

### [htmx-ws/broadcast.ts](https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/broadcast.ts)

    // packages/htmx-ws/broadcast.ts
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
            open(ws) {
                console.log("👋 A new Websocket Connection");
                const serverName = "htmx-ws/broadcast.ts"
                ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                    `<li>serverName: ${serverName}</li>` +
                    '<li>👋 Welcome baby</li>' + "</div>");
                ws.subscribe(topic);
                ws.publish(topic,
                    '<div hx-swap-oob="beforeend:#websocket_events">' +
                    `<li>🥳 A new friend is joining the Party</li>` +
                    "</div>");
            }, // a socket is opened
            message(ws, data) {
                let d = JSON.parse(data.toString())
                console.log("✉️ A new Websocket Message is received: " + d.message);
                ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
                    `<li>✉️ Server received a message from you: ${d.message}</li>` +
                    "</div>");
                ws.publish(
                    topic,
                    '<div hx-swap-oob="be:qforeend:#websocket_events">' +
                    `<li>📢 Message from ${ws.remoteAddress}: ${d.message}</li>` +
                    "</div>"
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

## 二つの実装を比べてみよう

ここまでにWebSocketプロトコルで連携するデモを二通りの方法で実装しました。ほとんど同じように動作します。

### 二つの実装のdiff

しかし、コードはまったく違います。Vanilla JavaScriptによる実装は、ブラウザが提供するWebSocket APIの使い方を理解するのに役立ちます。ただしWebSocket APIのお作法をなぞらなければならないのでコードが長くなった。一方、Htmx WebSocket Extensionを利用した実装はコードが簡潔になります。

`diff` コマンドで二つの実装のソースコードの差異を可視化しました。

#### Diff of index.html

    1c1
    < <!-- packages/vanilla-javascript/index.html -->
    ---
    > <!-- packages/htmx-ws/index.html -->
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
    >             </div>
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

    1c1
    < // packages/vanilla-javascript/index.ts
    ---
    > // packages/htmx-ws/index.ts
    20,22c20,23
    <             const serverName = "vanilla-javascript/index.ts"
    <             ws.send(`serverName: ${serverName}`);
    <             ws.send("👋 Welcome baby");
    ---
    >             const serverName = "htmx-ws/index.ts"
    >             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>serverName: ${serverName}</li>` +
    >                 '<li>👋 Welcome baby</li>' + "</div>");
    24,27c25,32
    <         message(ws, message) {
    <             console.log(message)
    <             console.log("✉️ A new Websocket Message is received: " + message);
    <             ws.send("✉️ Server received a message from you: " + message);
    ---
    >         message(ws, data) {
    >             console.log(data)
    >             let d = JSON.parse(data.toString())
    >             let response = '<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>✉️ Server received a message from you: ${d.message}</li>` +
    >                 "</div>";
    >             console.log(response);
    >             ws.send(response);

#### Diff of broadcast.ts

    1c1
    < // packages/vanilla-javascript/broadcast.ts
    ---
    > // packages/htmx-ws/broadcast.ts
    21,28d20
    <         message(ws, message) {
    <             console.log("✉️ A new Websocket Message is received: " + message);
    <             ws.send("✉️ I received a message from you:  " + message);
    <             ws.publish(
    <                 topic,
    <                 `📢 Message from ${ws.remoteAddress}: ${message}`,
    <             );
    <         }, // a message is received
    30a23,26
    >             const serverName = "htmx-ws/broadcast.ts"
    >             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>serverName: ${serverName}</li>` +
    >                 '<li>👋 Welcome baby</li>' + "</div>");
    32,35c28,31
    <             const serverName = "vanilla-javascript/broadcast.ts"
    <             ws.send(`serverName: ${serverName}`);
    <             ws.send("👋 Welcome baby");
    <             ws.publish(topic, "🥳 A new friend is joining the Party");
    ---
    >             ws.publish(topic,
    >                 '<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>🥳 A new friend is joining the Party</li>` +
    >                 "</div>");
    36a33,45
    >         message(ws, data) {
    >             let d = JSON.parse(data.toString())
    >             console.log("✉️ A new Websocket Message is received: " + d.message);
    >             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>✉️ Server received a message from you: ${d.message}</li>` +
    >                 "</div>");
    >             ws.publish(
    >                 topic,
    >                 '<div hx-swap-oob="be:qforeend:#websocket_events">' +
    >                 `<li>📢 Message from ${ws.remoteAddress}: ${d.message}</li>` +
    >                 "</div>"
    >             );
    >         }, // a message is received
    39c48,50
    <             const msg = `A Friend has left the chat`;
    ---
    >             const msg = '<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>A Friend has left the chat</li>` +
    >                 "</div>";
    51c62,64
    <     const msg = "Hello from the Server, this is a periodic message!";
    ---
    >     const msg = '<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>Hello from the Server, this is a periodic message!</li>` +
    >                 "</div>";

### クライアントとサーバの間で送受信されるメッセージの内容を比較する

Chat画面に「こんにちは」とメッセージを入力しSubmitした時、ブラウザとサーバの間でどんな内容がWebSocketによって伝送されるのか、Vanilla JavaScript実装の場合とHtmx WebSocket Extensionを利用した実装の場合と比較してみました。

#### Vanilla JavaScriptの場合

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">方向</th>
<th style="text-align: left;">送受信されるメッセージの内容</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><p>ブラウザ → サーバ</p></td>
<td style="text-align: left;"><p><code>こんにちは</code></p></td>
</tr>
<tr>
<td style="text-align: left;"><p>ブラウザ ← サーバ</p></td>
<td style="text-align: left;"><p><code>✉️ A new Websocket Message is received: こんにちは</code></p></td>
</tr>
</tbody>
</table>

Vanilla JavaScriptによる実装では、`<script>` のなかのカスタムなJavaScriptコードがWebSocket APIを直接使っていて、「こんにちは」という文字列を修飾なしに送受信しています。

Vanilla JavaScriptによる実装では、サーバはメッセージとしての「こんにちは」という文字列を単純にechoするだけです。「こんにちは」という文字列をブラウザ上の画面に反映する処理はクライアントのJavaScriptに任されている。サーバのコードは画面編集にまったく関与しません。

#### Htmx WebSocket Extensionの場合

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 80%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">方向</th>
<th style="text-align: left;">送受信されるメッセージの内容</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><p>ブラウザ → サーバ</p></td>
<td style="text-align: left;"><p><code>{"message":"こんにちは","HEADERS":{"HX-Request":"true","HX-Trigger":"form","HX-Trigger-Name":null,"HX-Target":"form","HX-Current-URL":"http://localhost:8080/"}}</code></p></td>
</tr>
<tr>
<td style="text-align: left;"><p>ブラウザ ← サーバ</p></td>
<td style="text-align: left;"><p><code>&lt;div hx-swap-oob="beforeend:#websocket_events"&gt;&lt;li&gt;✉️ Server received a message from you: こんにちは&lt;/li&gt;&lt;/div&gt;</code></p></td>
</tr>
</tbody>
</table>

Htmx WebSocket Extensionを使った実装では、HtmxがJSON形式のテキストをサーバへ送信します。FORMに入力された「こんにちは」という文字列がJSONの内容の一部として運ばれます。Htmxがどうしてそのような動作をするのか？HTMLの下記のコード片をみよ。

    <!-- packages/htmx-ws/index.html -->
    ...
                        Message: <input type="text" name="message" value="Hello!" />

`<input>` タグに `name` 属性が付与されていてその値が `message` と指定されていることに注意。このように指定されているからHTMXは Formがsubmitされた時にサーバへ投げるJSONの中に `{"message":"こんにちは", …​` というkey-value pairを埋め込みます。もしも `<input>` タグに `name` 属性を付与するのを忘れるとHTMXはJSONに埋め込むべきデータを認識できなくて、有意なデータを持たないJSONがサーバに届くことになります。それじゃダメ。

`htmx-ws` のサーバーはJSONを構文解析して「こんにちは」を取り出す仕事をします。またサーバはHTML構文のfragmentを組み立てて応答しています。`htmx-ws/index.ts` ファイルの25行目あたりにこの処理が記述されています。

            message(ws, data) {
                console.log(data)
                let d = JSON.parse(data.toString())
                let response = '<div hx-swap-oob="beforeend:#websocket_events">' +
                    `<li>✉️ Server received a message from you: ${d.message}</li>` +
                    "</div>";
                console.log(response);
                ws.send(response);
            },

ブラウザ上で動いているHtmxの実行系はサーバから送信されたHTML Frament を構文解析して `<div hx-swap-oob="beforeend:#websocket_events">` のなかの `hx-swap-oob="beforeend:#websocket_events"` という属性に注目します。一方DOMの中には `websocket_events` と言うIDを持つHTML要素がある。

                <br />
                <ul id="websocket_events"></ul>
            </main>

この `<ul id="websocket_events"></ul>` をターゲットとして特定します。Htmxは `<ul id="websocket_events"></ul>` の内容の末尾に サーバから送信されてきた HTML Fragment の内容 `<li>…​</li>` を挿入します。

これを見ればわかるように、Htmx WebSocket拡張を使った実装の場合、サーバーの `message(ws, data) { …​ }` イベントハンドラが ターゲットとしてのHTMLのコードとやや密に結合しています。HTMLのマークアップが変更されたら同時にWebSocketサーバも変更しなければならない可能性があります。

## 結び

Htmx WebSocket Extensionを使えば `<script>` を自作しないで済むからコード行数が少なくなって楽だ。しかしHtmxがWebSocket APIをすっかり隠してしまう。そのせいでHtmx WebSocket Extensionがどう動くのか、どう使えば良いのか、わからなかった。白状するとわたしは [Htmx WebSocket Extensionのドキュメント](https://htmx.org/extensions/ws/) を読んでも理解できなかった。WebSocket APIを活用するJavaScriptプログラミングに熟達したプログラマならばあのドキュメントを解読できるかもしれないが、技量不足なわたしにはさっぱりだった。

自分の技量不足を自覚したので、私はHTMLの中に `<script>` タグでWebSocket APIをドライブするカスタムなJavaScriptを書くやり方と、もう一つHtmxのWebSocket拡張を利用するやり方との、二通りのWebSocketのデモを作ってみた。Vanilla JavaScriptによる実装を作って動かすことに成功してはじめて、「ははあ、Htmx WebSocket Extensionって、つまりこれと同じような処理をしているのだな」と類推することができた。

WebSocketクライアントとしてのHtmx WebSocket ExtensionとWeb Socketサーバーとの間でデータがどういうフォーマットで交換されるか、それを理解すること、あるいはそれを仕様として定義すること、それが出発点なのだ。昔、わたしが職場で使っていた言葉使いに則るなら「接続仕様」を決めることが最初にすべきことなのだ。交換されるデータのフォーマットを規定した後でようやくWebSocketのクライアントとサーバのコードを書くことができる。なぜわたしが[Htmx WebSocket Extensionのドキュメント](https://htmx.org/extensions/ws/) を理解できなかったのか？今ならわかる。このドキュメントには「接続仕様」が説明されていない。もしかしたらHtmxのドキュメントのどこかに書かれているのかもしれないがわたしはまだ見つけることができていない。
