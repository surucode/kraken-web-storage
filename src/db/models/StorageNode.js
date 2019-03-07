import mongoose from "mongoose";
import StorageNodeSchema from "./StorageNode.schema.js";

import { posix as path_posix } from "path";
import { Client } from "ssh2";

const StorageNode = mongoose.model("StorageNode", StorageNodeSchema);

StorageNode.prototype.getSftp = function() {
  return new Promise((resolve, reject) => {
    const client = new Client();

    client
      .on("ready", () =>
        client.sftp((err, sftp) => {
          if (err) return reject(err);
          sftp.end = client.end.bind(client);
          resolve(sftp);
        })
      )
      .on("error", e => reject(e))
      .connect({
        host: this.host,
        username: this.user,
        privateKey: this.private_key,
        port: this.port
      });
  });
};

// this function is kinda stolen from https://github.com/jyu213/ssh2-sftp-client
const mkdirp = function(sftp, path) {
  let doMkdir = p =>
    new Promise((resolve, reject) =>
      sftp.mkdir(p, err => {
        console.log("creating ", p);
        if (err) {
          reject(new Error(`Failed to create directory ${p}: ${err.message}`));
        }
        resolve(`${p} directory created`);
      })
    );

  let exists = p =>
    new Promise((resolve, reject) =>
      sftp.stat(p, (err, stats) => (err && resolve(false)) || resolve(stats))
    );

  let mkdir = p => {
    let { dir } = path_posix.parse(p);
    return exists(dir)
      .then(exists => {
        if (!exists) {
          return mkdir(dir);
        }
      })
      .then(() => {
        return doMkdir(p);
      });
  };

  return exists(path).then(exists => !exists && mkdir(path));
};

StorageNode.prototype.writeFile = async function(file, stream) {
  const sftp = await this.getSftp();

  const path = `/files/${file.md5.match(/.{1,4}/g).join("/")}`;
  await mkdirp(sftp, path);
  const str = sftp.createWriteStream(`${path}/${file.md5}`);

  await new Promise((resolve, reject) => {
    str
      .on("finish", resolve)
      .on("error", reject)
      .on("open", () => {
        stream.pipe(str);
      });
  });

  file.storage_nodes.push(this._id);
  await file.save();
  sftp.end();
};

StorageNode.prototype.readFile = async function(file) {
  const sftp = await this.getSftp();
  const path = `/files/${file.md5.match(/.{1,4}/g).join("/")}`;
  console.log(`reading file ${path}/${file.md5}`);
  const stream = sftp.createReadStream(`${path}/${file.md5}`);
  stream.on("end", sftp.end.bind(sftp));

  return stream;
};

export default StorageNode;
