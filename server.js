"use strict";

require("@babel/register");

const server = require("./src/server");

server.listen(3000, "0.0.0.0", (err, address) => {
  if (err) throw err;
  server.log.info(`Server listening on ${address}`);
});
