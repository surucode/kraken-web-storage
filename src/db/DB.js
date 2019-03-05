import mongoose from "mongoose";
import config from "config";

export const connect = () =>
  mongoose.connect(config.db, {
    server: {
      auto_reconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }
    }
  });

export default { connect };
