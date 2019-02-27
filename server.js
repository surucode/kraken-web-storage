'use strict'

const path = require('path')
const fs = require('fs')
const { promisify } = require("util");

const fileUpload = require('fastify-file-upload')
const Client = require('ssh2').Client;

const fastify = require('fastify')({
  logger: true
})

fastify.register(fileUpload)

const servers = [
    "one",
    "two",
    "three",
    "four"
].map((srv) => ({
    host: `storage_${srv}`,
    pkey: fs.readFileSync(__dirname+`/storages/${srv}/id_rsa`)
}));

const uuid = (a) => a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

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

const getSftp = (storage) => new Promise((resolve, reject) => {
    const client = new Client();
    console.log(storage);

    client.on('ready', function() {
        client.sftp((err, sftp) => {
            if(err) return reject(err);
            resolve({sftp, client});
        });
    }).on('error', function(e){ 
        console.log(e)
    }).connect({
        host: storage.host,
        username: "data",
        privateKey: storage.pkey,
        port: 22,
    });
});


const files = {};

fastify.post('/upload', async (request, reply) => {
    // some code to handle file
    const file = request.raw.files['data'];

    const filename = uuid();
    files[filename] = [];
    const storages = shuffle(servers).slice(0,3)
    console.log(storages);

    await Promise.all(storages.map(async storage => {
        const { sftp, client } = await getSftp(storage);

        const str = sftp.createWriteStream(`/files/${filename}`);

        await new Promise((resolve, reject) => {
            str.on("finish", resolve).on("error", reject).on("open", () => {
                str.end(file.data);
            });
        });
        files[filename].push(storage);
        client.end();
    }));

    return filename;
});

fastify.get('/', async (request, reply) => {
  reply.type('application/json').code(200)
  return { hello: 'world' }
})

fastify.get('/files/:file_id', async (request, reply) => {
    const filename = request.params.file_id
    const file_storages = files[filename];
    if(file_storages) {
        const storage = shuffle(file_storages)[0];
        const { sftp, client } = await getSftp(storage);

        await new Promise((resolve, reject) => {
            sftp.stat('/files/'+filename, (err, stats) => {
                if(err) return reject(err);

                console.log(stats);

                const str = sftp.createReadStream(`/files/${filename}`);

                if(str) {
                    str.on("finish", resolve).on("error", reject).on("open", () => { 
                        reply.send(str);
                    });
                }
            });
        });
    }
});

fastify.listen(3000, '0.0.0.0', (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
