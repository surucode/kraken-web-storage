"use strict";

require("@babel/register");

const db = require("./src/db");
const server = require("./src/server");

db.connect();
server.listen(3000, "0.0.0.0", (err, address) => {
  if (err) throw err;
  server.log.info(`Server listening on ${address}`);
});
