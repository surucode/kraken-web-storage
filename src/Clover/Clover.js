const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const Client = require("ssh2").Client;

export const servers = ["one", "two", "three", "four"].map(srv => ({
  host: `storage_${srv}`,
  pkey: fs.readFileSync(__dirname + `/../../support/storages/${srv}/id_rsa`)
}));

export function uuid(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}

export function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const getSftp = storage =>
  new Promise((resolve, reject) => {
    const client = new Client();
    console.log(storage);

    client
      .on("ready", function() {
        client.sftp((err, sftp) => {
          if (err) return reject(err);
          resolve({ sftp, client });
        });
      })
      .on("error", function(e) {
        console.log(e);
      })
      .connect({
        host: storage.host,
        username: "data",
        privateKey: storage.pkey,
        port: 22
      });
  });

const files = {};

export default { shuffle, uuid, getSftp, files };
