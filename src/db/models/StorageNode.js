import mongoose from "mongoose";
import StorageNodeSchema from "./StorageNode.schema.js";

import { promisify } from "util";

import { posix as path_posix } from "path";
import { Client } from "ssh2";

const StorageNode = mongoose.model("StorageNode", StorageNodeSchema);

StorageNode.prototype.getConn = function() {
  return new Promise((resolve, reject) => {
    if (!this.conn) {
      this.conn = new Client();
      this.conn
        .on("end", err => {
          console.log(`connection ended (with error ? ${err ? "yes" : "no"})`);
          this.conn = null;
        })
        .connect({
          host: this.host,
          username: this.user,
          privateKey: this.private_key,
          port: this.port
        });
    }

    // if already ready, resolve now
    if (this.conn.ready) resolve(this.conn);
    else
      this.conn
        .on("ready", () => {
          console.log("resolving ssh");
          this.conn.ready = true;
          resolve(this.conn);
        })
        .on("error", e => {
          console.error(e);
          reject(e);
        });
  });
};

StorageNode.prototype.getSftp = function() {
  return new Promise((resolve, reject) => {
    this.getConn().then(conn => {
      console.log("got connection, getting sftp");
      conn.sftp((err, sftp) => (err && reject(err)) || resolve(sftp));
    }, reject);
  });
};

// this function is kinda stolen from https://github.com/jyu213/ssh2-sftp-client
StorageNode.prototype.mkdirp = function(path) {
  return this.getSftp().then(sftp => {
    let doMkdir = p =>
      new Promise((resolve, reject) =>
        sftp.mkdir(p, err => {
          console.log("creating ", p);
          if (err) {
            reject(
              new Error(`Failed to create directory ${p}: ${err.message}`)
            );
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
  });
};

StorageNode.prototype.execCmd = async function(cmd) {
  console.log("will cmd: ", cmd);
  const conn = await this.getConn();
  console.log("got conn ");
  const { code, signal, stdout, stderr } = await new Promise(
    (resolve, reject) => {
      console.log("executing cmd: ", cmd);
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);

        let stdout = "";
        let stderr = "";

        stream
          .on("close", function(code, signal) {
            resolve({ code, signal, stdout, stderr });
          })
          .on("data", function(data) {
            console.log("stdout:", data);
            stdout += data;
          })
          .stderr.on("data", function(data) {
            console.log("stderr:", data);
            stderr += data;
          });
      });
    }
  );

  if (code !== "0" && !/^[a-f0-9]{32}$/.test(stdout)) {
    throw new Error(
      `
Error from ssh exec!
Server: ${this.host}
Cmd: ${cmd}
Code: ${code}
Signal: ${signal}
STDOUT: ${stdout}
STDERR: ${stderr}
    `.trim()
    );
  }

  return { code, signal, stdout, stderr };
};

StorageNode.prototype.writeFile = async function(file, stream) {
  console.log("calling sftp");
  const sftp = await this.getSftp();
  console.log("has sftp");

  const tmp_file = `/home/data/tmp/${file.md5}`;
  const str = sftp.createWriteStream(`${tmp_file}`);

  console.log("will write file");

  await new Promise((resolve, reject) => {
    str
      .on("finish", resolve)
      .on("error", reject)
      .on("open", () => {
        stream.pipe(str);
      });
  });

  console.log("did write file");

  const { stdout } = await this.execCmd(`md5sum ${tmp_file} | head -c 32`);

  if (stdout != file.md5)
    throw new Error(
      `File transfer failed! MD5 mismatch: ${stdout} != ${file.md5}`
    );

  const path = `/home/data/files/${file.md5.match(/.{1,4}/g).join("/")}`;
  await this.mkdirp(path);

  await new Promise((resolve, reject) =>
    sftp.rename(
      tmp_file,
      `${path}/${file.md5}`,
      err => (err && reject(err)) || resolve()
    )
  );

  file.storage_nodes = [...file.storage_nodes, this._id].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  if (this.conn) this.conn.end();
};

StorageNode.prototype.readFile = async function(file) {
  const sftp = await this.getSftp();
  const path = `/home/data/files/${file.md5.match(/.{1,4}/g).join("/")}`;
  console.log(`reading file ${path}/${file.md5}`);
  const stream = sftp.createReadStream(`${path}/${file.md5}`);
  stream.on("end", sftp.end.bind(sftp));

  return stream;
};

export default StorageNode;
