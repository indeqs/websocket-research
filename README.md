# Web socket request smuggling

Apparently, the header `Transfer-Encoding: chunked` is supported in web sockets which make web sockets interesting in the context of request smuggling

This is a simple app that uses websockets to test out this idea

## How to run
1. `npm install express ws body-parser`
2. `node server.js`

server runs on `localhost:3000`