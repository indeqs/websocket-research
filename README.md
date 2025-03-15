# Web socket request smuggling

Apparently, the header `Transfer-Encoding: chunked` is supported in web sockets which make web sockets interesting in the context of request smuggling

This is a simple app that uses websockets to test out this idea

## How to run
1. `npm install express ws body-parser`
2. `node server.js`

server runs on `localhost:3000`

## npm packages used
- [ws](https://www.npmjs.com/package/ws) -> for web sockets
- [body-parser](https://www.npmjs.com/package/body-parser) -> to parse incoming request bodies in a middleware before handlers, making the data available under `req.body` for easier processing.

---

## Other similar work and random notes
- [Issues with WebSocket reverse proxying allowing to smuggle HTTP requests from 0ang3el](https://github.com/0ang3el/websocket-smuggle)
- [From hacktricks](https://book.hacktricks.wiki/en/pentesting-web/h2c-smuggling.html)
