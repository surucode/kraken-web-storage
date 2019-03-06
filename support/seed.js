"use strict";

require("@babel/register");

const path = require("path");
const fs = require("fs");
const db = require("../src/db");

db.connect();
Promise.all(
  ["one", "two", "three", "four"].map(srv =>
    db.StorageNode.create({
      host: `storage_${srv}`,
      user: "data",
      private_key: String(
        fs.readFileSync(__dirname + `/storages/${srv}/id_rsa`)
      ).trim()
    }).then(console.log, console.error)
  )
).then(db.disconnect);
