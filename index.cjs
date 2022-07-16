"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var io_exports = {};
__export(io_exports, {
  bluetooth: () => import_bluetooth.default,
  buffer: () => import_buffer.default,
  dgram: () => import_dgram.default,
  dns: () => import_dns.default,
  events: () => import_events.default,
  fs: () => import_fs.default,
  ipc: () => import_ipc.default,
  net: () => import_net.default,
  os: () => import_os.default,
  stream: () => import_streamx.default
});
module.exports = __toCommonJS(io_exports);
var import_buffer = __toESM(require("buffer"), 1);
var import_streamx = __toESM(require("streamx"), 1);
var import_dgram = __toESM(require("./dgram.js"), 1);
var import_dns = __toESM(require("./dns.js"), 1);
var import_events = __toESM(require("./events.js"), 1);
var import_fs = __toESM(require("./fs/index.js"), 1);
var import_ipc = __toESM(require("./ipc.js"), 1);
var import_net = __toESM(require("./net.js"), 1);
var import_os = __toESM(require("./os.js"), 1);
var import_bluetooth = __toESM(require("./bluetooth.js"), 1);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bluetooth,
  buffer,
  dgram,
  dns,
  events,
  fs,
  ipc,
  net,
  os,
  stream
});
