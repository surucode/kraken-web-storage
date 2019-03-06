import * as models from "./models";
import DB from "./DB";

module.exports.default = module.exports = {
  ...DB,
  ...models
};
