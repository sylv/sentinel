const http = require("http");

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      data: "Hello World!",
    })
  );
});

server.listen(8000, "0.0.0.0");
console.log("Listening on http://127.0.0.1:8000", { argv: process.argv });
