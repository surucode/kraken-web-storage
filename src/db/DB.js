import mongoose from "mongoose";
import config from "config";

const connect = () =>
  mongoose.connect(config.db, {
    auto_reconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 },
    useNewUrlParser: true
  });

const disconnect = () => mongoose.disconnect();

const DB = { connect, disconnect };

module.exports.default = module.exports = DB;
