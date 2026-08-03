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
>
> — 
> text

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

### htmx-ws/index.html

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

### htmx-ws/index.ts

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

### htmx-ws/broadcast.ts

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

ここまでにWebSocketプロトコルで連携するデモを二通りの方法で実装しました。どちらもほとんど同じように動きます。しかし、コードの中身は全く違います。Vanilla JavaScriptによる実装は、ブラウザが提供するWebSocket APIを直接使っているので、WebSocketの仕組みを理解するのに役立ちます。一方、Htmx WebSocket Extensionを使った実装は、Htmxが提供する便利な機能を使っているので、コードが簡潔になります。

ソースコードへのリンクを下記の表にまとめました。

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Vanilla JavaScriptによる実装</th>
<th style="text-align: left;">HtmxのWebSocket拡張による実装</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><p><a href="https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.html">vanila-javascript/index.html</a></p></td>
<td style="text-align: left;"><p><a href="https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.html">htmx-ws/index.html</a></p></td>
</tr>
<tr>
<td style="text-align: left;"><p><a href="https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/index.ts">vanilla-javascript/index.ts</a></p></td>
<td style="text-align: left;"><p><a href="https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/index.ts">htmx-ws/index.ts</a></p></td>
</tr>
<tr>
<td style="text-align: left;"><p><a href="https://github.com/kazurayam/websocket-demo/blob/main/packages/vanilla-javascript/broadcast.ts">vanilla-javascript/broadcast.ts</a></p></td>
<td style="text-align: left;"><p><a href="https://github.com/kazurayam/websocket-demo/blob/main/packages/htmx-ws/broadcast.ts">htmx-ws/broadcast.ts</a></p></td>
</tr>
</tbody>
</table>

### 二つの実装の差異を読み解く

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

`vanilla-javascript/index.ts` と `htmx-ws/index.ts` の二つのサーバーを起動して、ブラウザでそれぞれのクライアントを開き、ブラウザの開発者ツールのNetworkタブでWebSocket通信の内容を観察しました。どちらの場合も `<input type="text">` の中に「こんにちは」という文字を入力してSubmitしました。Submitされたモノをサーバが受け取ったところでそれをconsole.logに表示してみました。

#### Vanilla JavaScriptの場合

`vanilla-javascript/index.ts` サーバーを起動して、ブラウザでそれぞれのクライアントを開き、ブラウザの開発者ツールのNetworkタブでWebSocket通信の内容を観察しました。

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

Vanilla JavaScriptによる実装では、ブラウザがWebSocket APIを直接使っているので、送受信されるメッセージの内容は素の文字列です。

Vanilla JavaScriptによる実装では、サーバはメッセージとしての「こんにちは」という文字列を単純にechoするだけであって、サーバのコードはHTMLのコードと結びついていません。

#### Htmx WebSocketの場合

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

Htmx WebSocket Extensionを使った実装では、HtmxがJSON形式のテキストをサーバへ送信します。FORMに入力された「こんにちは」という文字はJSONの一部として運ばれます。 `vanila-javascirpt/index.ts` はJSONを構文解析して「こんにちは」を取り出す仕事をします。またサーバが送り返すテキストは HTML構文のfragmentになっています。Htmxは `<div hx-swap-oob="beforeend:#websocket_events">` というコードから `websocket_events` というIDを持つHTML要素（具体的には `<ul>` ）をターゲットとして特定します。Htmxはターゲットの内容の末尾に `<li>…​</li>` を挿入します。これを見ればわかるように、Htmx WebSocket拡張を使った実装の場合、サーバーの `onMessage` イベントハンドラが ターゲットとしてのHTMLのコードを少し意識したコードになってしまいます。

## 結び

HTMLの中に `<script>` タグでWebSocket APIをドライブするカスタムなJavaScriptを書くやり方と、もう一つHtmxのWebSocket拡張を利用するやり方と、ふた通りのデモを実装した。`<script>` をHtmxで置き換えることができるのでHtmxを使えばコードの行数が全体として少なくなる。そのメリットは大きい。ただしWebSocket APIを操作する細部をHtmxが隠蔽するので、Htmx WebSocket Extensionの使い方はいささか理解しづらい。Vanilla JavaScriptによる実装と比較してようやくHtmx WebSocket Extensionを理解することができた。
