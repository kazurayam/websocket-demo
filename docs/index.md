- Table of contents
{:toc}

# WebSocketプロトコルで連携するクライアントとサーバのデモ --- BunとHTMXによる

- author: kazurayam

- レポジトリ: <https://github.com/kazurayam/websocket-demo/tree/main>

- publish date: 2026-08-03

- last update 2026-08-08

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

`$ROOT/src/vanilla-javascript` と `$ROOT/src/htmx-ws` を作った。

    $ cd $ROOT
    $ mkdir src
    $ cd src
    $ mkdir vanilla-javascript
    $ mkdir htmx-ws
    $ cd -
    $ tree -L 2
    .
    ├── src
    │   ├── htmx-ws
    │   └── vanilla-javascript
    └── README.md

二つのディレクトリそれぞれの下にWebSocketアプリケーションを一つづつ作ろうと考えた。 `vanilla-javascript` ディレクトリの中ではブラウザが提供する [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) を素のJavaScriptが直接ドライブする例を実装しよう。 `htmx-ws` ディレクトリの中では [HtmxのWebSocket Extension](https://htmx.org/extensions/ws/)を利用する例を実装しよう。

`bun init` コマンドでbunプロジェクトを初期化した。

    $ cd $ROOT
    $ bun init -y

`bun add` コマンドによって追加すべき外部パッケージは無い。 `Bun.serve()` がWebSocket APIを標準提供する。それで十分だ。

WebSocketを動かすのにHonoもJSXも必要ではない。ただしWebScoketをHonoやJSXと組み合わせて動かすことはもちろん可能だ。ただしそれは応用問題なので今回のレポートでは言及しない。

## Vanilla JavaScriptによる実装

### 参考にした記事

下記の記事を参考にした。

1.  [DEV / WebSocket with JavaScript and Bun, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-with-javascript-and-bun-4o7c)

2.  [DEV / WebSocket Client with JavaScript, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-client-with-javascript-54ec)

3.  [DEV / WebSocket broadcasting with JavaScript and Bun, by ROBERTO BUTTI](https://dev.to/robertobutti/websocket-broadcasting-with-javascript-and-bun-3mkf)

### Vanilla JavaScriptによる実装を動かしてみる

ROBERTO BUTTI氏の記事を参考にして、わたしは `$ROOT/src/vanilla-javascript` ディレクトリの下に `index.ts` と `index.html` を作った。さらにBroadcastサービスを提供するために `broadcast.ts` も作った。

- [src/vanilla-javascript/](https://github.com/kazurayam/websocket-demo/tree/main/src/vanilla-javascript)

何はともあれ動かしてみよう。サーバーを起動するには、コマンドラインで `$ROOT` ディレクトリにcdして `bun ./src/vanilla-javascript/index.ts` を実行する。

    $ cd $ROOT
    $ bun ./src/vanilla-javascript/index.ts
    🤗 Hello via Bun! 🐰
    🚀 Server (HTTP and WebSocket) is launched http://localhost:8080

サーバーが起動したら、次にブラウザを開き URL `localhost:8080` を開く。するとこんな初期画面が表示される。

![index.ts initial](https://kazurayam.github.io/websocket-demo/images/001_index.ts_initial.png)

Messageの入力フィールドに何らかの文字をキー入力した上で Submit ボタンを押す。するとそのメッセージがechoされて画面の下の方に表示される。例えば「Hello」と入力してSubmit、「こんにちは」と入力してSubmit、「ça va」と入力してSubmitすると３本のメッセージが表示される。

![index.ts exchanged](https://kazurayam.github.io/websocket-demo/images/002_index.ts_exchanged.png)

`vanilla-javascript/index.ts` が提供するのはechoサービスです。broadcastサービスではない。二つのブラウザを同時に立ち上げてそれぞれにメッセージをSubmitすればそれぞれのブラウザにメッセージが応答される。しかし、Firfoxブラウザで「元気ですか」と送信しても、Chromeブラウザには「元気ですか」と表示されません。

![dual browser echo local](https://kazurayam.github.io/websocket-demo/images/003_dual_browser_echo_local.png)

コマンドラインでCTRL+Cをキー入力して `./vanilla-javascript/index.ts` によって起動したサーバを停止しましょう。そして今度は `bun ./src/vanilla-javascript/broadcast.ts` を実行しよう。

    $ cd $ROOT
    $ bun ./src/vanilla-javascript/broadcast.ts
    🤗 Hello via Bun! 🐰
    🚀 Server (HTTP and WebSocket) is launched http://localhost:8080
    Message sent to "the-group-chat": Hello from the Server, this is a periodic message!
    ...

`vanilla-javascript/broadcast.ts` はBroadcastサービスを提供します。二つのブラウザを同時に立ち上げてそれぞれにメッセージをSubmitすればそれぞれのブラウザにメッセージが応答される。それだけでなく、片方のブラウザでメッセージを送信すると、もう片方のブラウザにもそのメッセージが表示されます。

![broadcast](https://kazurayam.github.io/websocket-demo/images/004_broadcast.png)

また `vanilla-javascript/broadcast.ts` はサーバーからクライアントへ単方向なメッセージを一定周期で送信します。ブラウザを開いたままにしておくと、サーバーからメッセージ `Hello from the Server, this is a periodic message!` が繰り返しブラウザに表示されます。

![mono directional messaging](https://kazurayam.github.io/websocket-demo/images/005_mono_directional_messaging.png)

HTTPプロトコルの場合クライアントがrequestしサーバがreplyするの繰り返す。それに対して、WebSocketプロトコルはサーバーからクライアントへの単方向通信も可能であることが特徴です。

### Vanilla JavaScriptによる実装のコード

では、Vanilla JavaScriptによる実装のコードを紹介します。

#### [vanila-javascript/index.ts](https://github.com/kazurayam/websocket-demo/tree/main/src/vanilla-javascript/index.ts)

    // src/vanilla-javascript/index.ts
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

#### [vanilla-javascript/index.html](https://github.com/kazurayam/websocket-demo/tree/main/src/vanilla-javascript/index.html)

    <!-- src/vanilla-javascript/index.html -->
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
                        "<li>" + text + "</li>");
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

#### [vanilla-javascript/broadcast.ts](https://github.com/kazurayam/websocket-demo/tree/main/src/vanilla-javascript/broadcast.ts)

    // src/vanilla-javascript/broadcast.ts
    import { getServerName } from '../shared/utils'

    console.log("🤗 Hello via Bun! 🐰");
    const topic = 'the-group-chat';
    const server = Bun.serve({
        port: 8080, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
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
                ws.send(`serverName: ${getServerName(import.meta.url)}`);
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

わたしは `$ROOT/src/htmx-ws` ディレクトリの下に `index.ts` と `index.html` と `broadcast.ts` を作った。

- [src/htmx-ws/](https://github.com/kazurayam/websocket-demo/tree/main/src/htmx-ws)

<!-- -->

    $ cd $ROOT/src/htmx-ws
    $ tree -L 1
    .
    ├── broadcast.ts
    ├── index.html
    └── index.ts

`cd $ROOT` して `bun ./src/htmx-ws/index.ts` を実行すればサーバーが起動します。ブラウザで `localhost:8080` を開くとechoのデモが動きます。また `bun ./src/htmx-ws/broadcast.ts` を実行すればbroadcastのデモが動きます。画面の見た目はどちらもVanilla JavaScriptによる実装とほとんど同じです。

### [htmx-ws/index.html](https://github.com/kazurayam/websocket-demo/tree/main/src/htmx-ws/index.html)

    <!-- src/htmx-ws/index.html -->
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
                <div hx-ext="ws" ws-connect="/chat"> <!-- (5) -->
                    <form id="form" ws-send>
                        Message: <input type="text" name="message" value="Hello!" id="message"/>
                        <input type="submit" value="Submit" id="btn"/>
                    </form>
                </div>
                <ul id="websocket_events"></ul>
            </main>
        </body>
    </html>

### [htmx-ws/index.ts](https://github.com/kazurayam/websocket-demo/tree/main/src/htmx-ws/index.ts)

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

### [htmx-ws/broadcast.ts](https://github.com/kazurayam/websocket-demo/tree/main/src/htmx-ws/broadcast.ts)

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

## 二つの実装を比べてみよう

ここまでにWebSocketプロトコルで連携するデモを二通りの方法で実装しました。ほとんど同じように動作します。

### 二つの実装のdiff

しかし、コードはまったく違います。Vanilla JavaScriptによる実装は、ブラウザが提供するWebSocket APIの使い方を理解するのに役立ちます。ただしWebSocket APIのお作法をなぞらなければならないのでコードが長くなった。一方、Htmx WebSocket Extensionを利用した実装はコードが簡潔になります。

`diff` コマンドで二つの実装のソースコードの差異を可視化しました。

#### Diff of index.html

    1c1
    < <!-- src/vanilla-javascript/index.html -->
    ---
    > <!-- src/htmx-ws/index.html -->
    6,34c6,11
    <         <script>
    <             let echo_service;
    <             append = function (text) {
    <                 document
    <                 .getElementById("websocket_events")
    <                 .insertAdjacentHTML("beforeend",
    <                     "<li>" + text + "</li>");
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
    >             <div hx-ext="ws" ws-connect="/chat"> <!-- (5) -->
    >                 <form id="form" ws-send>
    >                     Message: <input type="text" name="message" value="Hello!" id="message"/>
    >                     <input type="submit" value="Submit" id="btn"/>
    >                 </form>
    >             </div>
    47,54d23
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
    < // src/vanilla-javascript/index.ts
    ---
    > // src/htmx-ws/index.ts
    23,24c23,25
    <             ws.send(`serverName: ${getServerName(import.meta.url)}`);
    <             ws.send("👋 Welcome baby");
    ---
    >             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>serverName: ${getServerName(import.meta.url)}</li>` +
    >                 '<li>👋 Welcome baby</li>' + "</div>");
    26,29c27,34
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
    < // src/vanilla-javascript/broadcast.ts
    ---
    > // src/htmx-ws/broadcast.ts
    7c7
    <     port: 8080, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
    ---
    >     port: 8080, // (1)
    9c9
    <         "/": new Response(Bun.file(new URL(import.meta.url + "/../index.html"))),
    ---
    >         "/": new Response(Bun.file(new URL(import.meta.url + "/../index.html"))), // (4)
    11,12c11,12
    <         "/chat": (req, server) => {
    <             if (server.upgrade(req)) {
    ---
    >         "/chat": (req, server) => { // (5)
    >             if (server.upgrade(req)) { // (6)
    22,24c22,38
    <         message(ws, message) {
    <             console.log("✉️ A new Websocket Message is received: " + message);
    <             ws.send("✉️ I received a message from you:  " + message);
    ---
    >         open(ws) { // (7)
    >             console.log("👋 A new Websocket Connection");
    >             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>serverName: ${getServerName(import.meta.url)}</li>` +
    >                 '<li>👋 Welcome baby</li>' + "</div>"); // (7)
    >             ws.subscribe(topic); // (8)
    >             ws.publish(topic,
    >                 '<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>🥳 A new friend is joining the Party</li>` +
    >                 "</div>");
    >         }, // a socket is opened
    >         message(ws, data) { // (15)
    >             let d = JSON.parse(data.toString()) // (15)
    >             console.log("✉️ A new Websocket Message is received: " + d.message);
    >             ws.send('<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>✉️ Server received a message from you: ${d.message}</li>` +
    >                 "</div>"); // (16)
    27c41,43
    <                 `📢 Message from ${ws.remoteAddress}: ${message}`,
    ---
    >                 '<div hx-swap-oob="beforeend:#websocket_events">' +
    >                 `<li>📢 Message from ${ws.remoteAddress}: ${d.message}</li>` +
    >                 "</div>" // (17)
    30,36d45
    <         open(ws) {
    <             console.log("👋 A new Websocket Connection");
    <             ws.subscribe(topic);
    <             ws.send(`serverName: ${getServerName(import.meta.url)}`);
    <             ws.send("👋 Welcome baby");
    <             ws.publish(topic, "🥳 A new friend is joining the Party");
    <         }, // a socket is opened
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
    54a68
    > 

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
<td style="text-align: left;"><p><code>{"message": "こんにちは","HEADERS": {"HX-Request": "true","HX-Trigger": "form","HX-Trigger-Name": null,"HX-Target": "form","HX-Current-URL": "http://localhost:8080/"}}</code></p></td>
</tr>
<tr>
<td style="text-align: left;"><p>ブラウザ ← サーバ</p></td>
<td style="text-align: left;"><p><code>&lt;div hx-swap-oob="beforeend:#websocket_events"&gt;&lt;li&gt;✉️ Server received a message from you: こんにちは&lt;/li&gt;&lt;/div&gt;</code></p></td>
</tr>
</tbody>
</table>

Htmx WebSocket Extensionを使った実装では、HtmxがJSON形式のテキストをサーバへ送信します。FORMに入力された「こんにちは」という文字列がJSONの内容の一部として運ばれます。Htmxがどうしてそのような動作をするのか？HTMLの下記のコード片をみよ。

    <!-- src/htmx-ws/index.html -->
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

この `<ul id="websocket_events"></ul>` をターゲットとして特定することができました。Htmxは `<ul id="websocket_events"></ul>` の内容の末尾に サーバから送信されてきた HTML Fragment の内容 `<li>…​</li>` を挿入します。

これを見ればわかるように、Htmx WebSocket拡張を使った実装の場合、サーバーの `message(ws, data) { …​ }` イベントハンドラが ターゲットとしてのHTMLのコードとやや密に結合しています。HTMLのマークアップが変更されたら同時にWebSocketサーバも変更しなければならない可能性があります。

## Publish/subscribeパターンの処理シーケンス

下記の図は [htmx-ws/broadcast.ts](https://github.com/kazurayam/websocket-demo/tree/main/src/htmx-ws/broadcast.ts) を実行した場合のシーケンスです。

![シーケンス図](https://kazurayam.github.io/websocket-demo/diagrams/out/sequence/sequence.png)

シーケンス図に注釈を加えます。シーケンス図の細部とプログラムのソースコードにカッコ付き数字 `(1)` を目印として書き込みました。

**(1)** ターミナルで `$cd $ROOT/htmx-ws; bun ./broadcast.ts` を実行すると [`broadcast.ts`](https://github.com/kazurayam/websocket-demo/tree/main/) は `new Bun.serve()` を呼び出してHTTPサーバを立ち上げる。参考情報: [Server - Bun](https://bun.com/docs/runtime/http/server)

**(2)** `new Bun.serve({websocket: {…​}})` を契機としてHTTPサーバの中でサーバーサイドのWebSocketハンドラーが起動される。

**(3)** テスターがブラウザを起動し URL `http://localhost:8080/` を開く

**(4)** HTTPリクエスト `GET /` に対して HTTP Responseが応答される。その中身はファイル `src/htmx-ws/index.html` に格納されたHTMLコードである。

**(5)** サーバーから `src/htmx-ws/index.html` のHTMLがブラウザに応答される。ブラウザがHTMLをロードすると `<script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.10/dist/htmx.min.js"` と `<script src="https://cdn.jsdelivr.net/npm/htmx-ext-ws@2.0.4"` というコードがあることから、htmxがロードされ、htmxのWebSocket拡張がロードされる。さらに `<div hx-ext="ws" ws-connect="/chat">` というコードを見つける。これによりhtmxのWebSocket拡張が URLパス `/chat` に HTTP GET要求を上げる。

**(6)** URLパス `/chat` へのHTTP GET要求を受けたサーバは クライアントとのTCPコネクションをHTTPプロトコルからWebSocketプロトコルへと [upgrade](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Protocol_upgrade_mechanism) する。これよりあと、クライアントとサーバの間の通信はHTTPプロトコルではなくWebSocketプロトコルで行われる。

**(7)** サーバサイドのWebSocketハンドラに対し `open` イベントが発火する。`open` イベントのハンドラがクライアントに対して "Welcome baby" というメッセージを送信する。

**(8)** サーバサイドのWebSocketハンドラが `open` イベントのハンドラの中で `ws.subscribe(topic)` というコードを実行する。これによって一つのクライアントとサーバの間のWebSocket接続の端点が Publish/subscribe のtopic (具体的には"the-group-chat")に連結される。この一行こそ、このサンプルコードのなかで **いちばん意味深な一行** だとkazurayamは思う。

**(9)** サーバサイドのWebSocketハンドラが `open` イベントのハンドラの中で "A new friend is joining the Party" というメッセージを発信しようとして `ws.publish(topic, メッセージ)` を実行する。ただしメッセージはプレーンなテキストではなくHTMLフラグメントである。`<div hx-swap-oob="beforeend:#websocket_events">` の `hx-swap-oob` 属性はHtmxのWebSocket拡張がこのHTMLフラグメントを適切に処理できるようにするための手がかりを与える。

**(10)** `ws.publish(topic, メッセージ)` の実行を契機として、topicにsubscribeしている他のすべてのsubscriberに対して同じメッセージが配信される。

**(11)** クライアントサイドのWebSocketハンドラすなわちHtmxのWebSocket拡張はメッセージを受信するとただちにWebページのDOMを更新する。応答されたHTMLフラグメントの最上位要素が `<div hx-swap-oob="beforeend:#websocket_events">` とコーディングされていることと、DOMの中に `<ul id="websocket_events"></ul>` という箇所があること、この２つが与えられた。だから `<ul>` 要素の内容としての `<li>` のリストの最後尾に、新しいメッセージ `<li>🥳 A new friend is joining the Party</li>` を挿入する。DOMが更新されると同時にテスタは画面の中に新しいメッセージが表示されるのを見るだろう。

**(12)** テスターがチャット画面のMessage入力フィールドに "Hello!" とキー入力して、Submitボタンを押したとしよう。

**(13)** HTMLに `<form id="form" ws-send>` と書いてある。`ws-send` 属性に注目せよ。これがあるのでデータはWebSocketプロトコルでクライアントサイドのWebSocketハンドラからサーバサイドのWebSocketハンドラへ送信される。

> ここで `<form>` 要素にもしも `ws-send` 属性を書き忘れるとどうなるだろうか？
>
> もしも `<form>` に `action="/some/path"` のようにURLが書いてあればそのパスに対してHTTP POST要求を投げるだろう。しかし `htmx-ws/index.html` の\`&lt;form&gt;\` にはaction属性が書いていない。だからデフォルトとして `action="/"` が仮定される。今回実装したサーバは パス `/` に対してはチャット画面の初期状態を応答するだろう。つまり\`&lt;form&gt;\` 要素に `ws-send` 属性を書き忘れると、Submitボタンを押すたびにチャット画面の初期状態が応答されるだろう。
>
> これではチャットにならない。だから `<form>` 要素に `ws-send` 属性を書き忘れないように注意しよう。
>
> — 
> text

**(14)** HtmxのWebSocket拡張はJSON形式のテキストを生成してそれをWebSocketプロトコルでサーバに送信する。そのJSONは例えばこんな形をしているだろう。

    {"message": "こんにちは","HEADERS": {"HX-Request": "true","HX-Trigger": "form","HX-Trigger-Name": null,"HX-Target": "form","HX-Current-URL": "http://localhost:8080/"}}

この中に `"message":"こんにちは"` というkey-value pairが含まれていることに注意。htmxのWebSocket拡張はJSONの中にこのデータを含めるべきだということをどうやって知ったのだろうか？--- それはHTMLの `<input>` 要素に `name` 属性が指定されているからだ。

                    <form id="form" ws-send>
                        Message: <input ... name="message" .../>

> もしも `<input>` 要素に `name` 属性を付けるのを忘れたらどうなるだろうか？ ---- クライアントからサーバへ送信されるJSONがこうなるだろう。
>
> {"HEADERS": {"HX-Request": "true","HX-Trigger": "form","HX-Trigger-Name": null,"HX-Target": "form","HX-Current-URL": "http://localhost:8080/"}}
>
> つまり `<input>` 要素にキー入力されたはずの文字列が含まれていない、HEADERだけのJSONになる。サーバー側から見るとクライアントからキー入力された文字列が届かなかったと気づくが、どこで脱落したか分かりにくい。デバッグに難儀するだろう。
>
> — 
> text

**(15)** サーバーサイドのWebSocketハンドラは `message(ws, data) {` イベントを受け取る。受け取ったdataはJSON形式のテキストなので、その内容にアクセスするために `let d = JSON.parse(data.toString())` とやってJSONからJavaScriotオブジェクトへ型変換をする。

**(16)** サーバーサイドのWebSocketハンドラは、(7)でやったのと同様に、HTMLフラグメントを構築してクライアントへ送信する。

**(17)** サーバーサイドのWebSocketハンドラは、(9)でやったのと同様に、HTMLフラグメントを構築して `ws.publish(topic, メッセージ)` を実行する。

**(18)** サーバーサイドのメッセージ・ルータは、(9)やったのと同様に、当該topicにsubscribeしている全てのsubscriberに対してメッセージを配信する。

**(19)** クライアントサイドのWebSocketハンドラはメッセージを受け取ると、(11)でやったのと同様に、DOMを更新する。DOMが更新されれは、ブラウザ上の画面が自動的に更新される。

**(20)** テスターがブラウザでチャット画面を操作してメッセージをSubmitすることを契機とするだけでなく、サーバ・サイドで発生した任意の契機によってメッセージを発生させ、メッセージをすべてのsubscriberに送信するというシナリオもある。例えばリアルタイムの株価を送信してオンライン取引ツールの画面を自動的に更新するとか。その場合、サーバーサイドでメッセージを発生させる処理がメッセージ・ルーターに対して `server.publish(topic, メッセージ)` をダイレクトにcallすれば足りる。

**(21)** メッセージ・ルーターに対してpublishされたメッセージがシステムを通って流れていく通路はひとつだけだ。クライアントの操作を契機とするpublishも、サーバ・サイドで発動されたpublishも、同じように処理される。

## 結び

Htmx WebSocket Extensionを使えば `<script>` を自作しないで済むからコード行数が少なくなって楽だ。しかしHtmxがWebSocket APIをすっかり隠してしまう。そのせいでHtmx WebSocket Extensionがどう動くのか、どう使えば良いのか、わからなかった。白状するとわたしは [Htmx WebSocket Extensionのドキュメント](https://htmx.org/extensions/ws/) を読んでも理解できなかった。WebSocket APIを活用するJavaScriptプログラミングに熟達したプログラマならばあのドキュメントを解読できるかもしれないが、技量不足なわたしにはさっぱりだった。

自分の技量不足を自覚したので、私はHTMLの中に `<script>` タグでWebSocket APIをドライブするカスタムなJavaScriptを書くやり方と、もう一つHtmxのWebSocket拡張を利用するやり方との、二通りのWebSocketのデモを作ってみた。Vanilla JavaScriptによる実装を作って動かすことに成功してはじめて、「ははあ、Htmx WebSocket Extensionって、つまりこれと同じような処理をしているのだな」と類推することができた。

WebSocketクライアントとしてのHtmx WebSocket ExtensionとWeb Socketサーバーとの間でデータがどういうフォーマットで交換されるか、それを理解すること、あるいはそれを仕様として定義すること、それが出発点なのだ。昔、わたしが職場で使っていた言葉使いに則るなら「接続仕様」を決めることが最初にすべきことなのだ。交換されるデータのフォーマットを規定した後でようやくWebSocketのクライアントとサーバのコードを書くことができる。なぜわたしが[Htmx WebSocket Extensionのドキュメント](https://htmx.org/extensions/ws/) を理解できなかったのか？今ならわかる。このドキュメントには「接続仕様」が説明されていない。もしかしたらHtmxのドキュメントのどこかに書かれているのかもしれないがわたしはまだ見つけることができていない。
