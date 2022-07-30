var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// ../../node_modules/tapzero/fast-deep-equal.js
var require_fast_deep_equal = __commonJS({
  "../../node_modules/tapzero/fast-deep-equal.js"(exports, module) {
    "use strict";
    module.exports = /* @__PURE__ */ __name(function equal(a, b) {
      if (a === b)
        return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor)
          return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length)
            return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i]))
              return false;
          return true;
        }
        if (a.constructor === RegExp)
          return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf)
          return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString)
          return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length)
          return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
            return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key]))
            return false;
        }
        return true;
      }
      return a !== a && b !== b;
    }, "equal");
  }
});

// ../../node_modules/tapzero/index.js
var require_tapzero = __commonJS({
  "../../node_modules/tapzero/index.js"(exports) {
    "use strict";
    var deepEqual = require_fast_deep_equal();
    var NEW_LINE_REGEX = /\n/g;
    var OBJ_TO_STRING = Object.prototype.toString;
    var AT_REGEX = new RegExp("^(?:[^\\s]*\\s*\\bat\\s+)(?:(.*)\\s+\\()?((?:\\/|[a-zA-Z]:\\\\)[^:\\)]+:(\\d+)(?::(\\d+))?)\\)$");
    var CACHED_FILE;
    var Test = class {
      constructor(name, fn, runner) {
        this.name = name;
        this.fn = fn;
        this.runner = runner;
        this._result = {
          pass: 0,
          fail: 0
        };
        this.done = false;
        this.strict = runner.strict;
      }
      comment(msg) {
        this.runner.report("# " + msg);
      }
      deepEqual(actual, expected, msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(deepEqual(actual, expected), actual, expected, msg || "should be equivalent", "deepEqual");
      }
      notDeepEqual(actual, expected, msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(!deepEqual(actual, expected), actual, expected, msg || "should not be equivalent", "notDeepEqual");
      }
      equal(actual, expected, msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(actual == expected, actual, expected, msg || "should be equal", "equal");
      }
      notEqual(actual, expected, msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(actual != expected, actual, expected, msg || "should not be equal", "notEqual");
      }
      fail(msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(false, "fail called", "fail not called", msg || "fail called", "fail");
      }
      ok(actual, msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(!!actual, actual, "truthy value", msg || "should be truthy", "ok");
      }
      ifError(err2, msg) {
        if (this.strict && !msg)
          throw new Error("tapzero msg required");
        this._assert(!err2, err2, "no error", msg || String(err2), "ifError");
      }
      throws(fn, expected, message) {
        if (typeof expected === "string") {
          message = expected;
          expected = void 0;
        }
        if (this.strict && !message)
          throw new Error("tapzero msg required");
        let caught = null;
        try {
          fn();
        } catch (err2) {
          caught = err2;
        }
        let pass = !!caught;
        if (expected instanceof RegExp) {
          pass = !!(caught && expected.test(caught.message));
        } else if (expected) {
          throw new Error(`t.throws() not implemented for expected: ${typeof expected}`);
        }
        this._assert(pass, caught, expected, message || "show throw", "throws");
      }
      _assert(pass, actual, expected, description, operator) {
        if (this.done) {
          throw new Error("assertion occurred after test was finished: " + this.name);
        }
        const report = this.runner.report;
        const prefix = pass ? "ok" : "not ok";
        const id = this.runner.nextId();
        report(`${prefix} ${id} ${description}`);
        if (pass) {
          this._result.pass++;
          return;
        }
        const atErr = new Error(description);
        let err2 = atErr;
        if (actual && OBJ_TO_STRING.call(actual) === "[object Error]") {
          err2 = actual;
          actual = err2.message;
        }
        this._result.fail++;
        report("  ---");
        report(`    operator: ${operator}`);
        let ex = JSON.stringify(expected, null, "  ") || "undefined";
        let ac = JSON.stringify(actual, null, "  ") || "undefined";
        if (Math.max(ex.length, ac.length) > 65) {
          ex = ex.replace(NEW_LINE_REGEX, "\n      ");
          ac = ac.replace(NEW_LINE_REGEX, "\n      ");
          report(`    expected: |-
      ${ex}`);
          report(`    actual:   |-
      ${ac}`);
        } else {
          report(`    expected: ${ex}`);
          report(`    actual:   ${ac}`);
        }
        const at = findAtLineFromError(atErr);
        if (at) {
          report(`    at:       ${at}`);
        }
        report("    stack:    |-");
        const st = (err2.stack || "").split("\n");
        for (const line of st) {
          report(`      ${line}`);
        }
        report("  ...");
      }
      async run() {
        this.runner.report("# " + this.name);
        const maybeP = this.fn(this);
        if (maybeP && typeof maybeP.then === "function") {
          await maybeP;
        }
        this.done = true;
        return this._result;
      }
    };
    __name(Test, "Test");
    exports.Test = Test;
    function getTapZeroFileName() {
      if (CACHED_FILE)
        return CACHED_FILE;
      const e = new Error("temp");
      const lines = (e.stack || "").split("\n");
      for (const line of lines) {
        const m = AT_REGEX.exec(line);
        if (!m) {
          continue;
        }
        let fileName = m[2];
        if (m[4] && fileName.endsWith(`:${m[4]}`)) {
          fileName = fileName.slice(0, fileName.length - m[4].length - 1);
        }
        if (m[3] && fileName.endsWith(`:${m[3]}`)) {
          fileName = fileName.slice(0, fileName.length - m[3].length - 1);
        }
        CACHED_FILE = fileName;
        break;
      }
      return CACHED_FILE || "";
    }
    __name(getTapZeroFileName, "getTapZeroFileName");
    function findAtLineFromError(e) {
      const lines = (e.stack || "").split("\n");
      const dir = getTapZeroFileName();
      for (const line of lines) {
        const m = AT_REGEX.exec(line);
        if (!m) {
          continue;
        }
        if (m[2].slice(0, dir.length) === dir) {
          continue;
        }
        return `${m[1] || "<anonymous>"} (${m[2]})`;
      }
      return "";
    }
    __name(findAtLineFromError, "findAtLineFromError");
    var TestRunner = class {
      constructor(report) {
        this.report = report || printLine;
        this.tests = [];
        this.onlyTests = [];
        this.scheduled = false;
        this._id = 0;
        this.completed = false;
        this.rethrowExceptions = true;
        this.strict = false;
      }
      nextId() {
        return String(++this._id);
      }
      add(name, fn, only2) {
        if (this.completed) {
          throw new Error("Cannot add() a test case after tests completed.");
        }
        const t = new Test(name, fn, this);
        const arr = only2 ? this.onlyTests : this.tests;
        arr.push(t);
        if (!this.scheduled) {
          this.scheduled = true;
          setTimeout(() => {
            const promise = this.run();
            if (this.rethrowExceptions) {
              promise.then(null, rethrowImmediate);
            }
          }, 0);
        }
      }
      async run() {
        const ts = this.onlyTests.length > 0 ? this.onlyTests : this.tests;
        this.report("TAP version 13");
        let total = 0;
        let success = 0;
        let fail = 0;
        for (const test3 of ts) {
          const result = await test3.run();
          total += result.fail + result.pass;
          success += result.pass;
          fail += result.fail;
        }
        this.completed = true;
        this.report("");
        this.report(`1..${total}`);
        this.report(`# tests ${total}`);
        this.report(`# pass  ${success}`);
        if (fail) {
          this.report(`# fail  ${fail}`);
        } else {
          this.report("");
          this.report("# ok");
        }
        if (typeof process !== "undefined" && typeof process.exit === "function" && typeof process.on === "function" && Reflect.get(process, "browser") !== true) {
          process.on("exit", function(code) {
            if (typeof code === "number" && code !== 0) {
              return;
            }
            if (fail) {
              process.exit(1);
            }
          });
        }
      }
    };
    __name(TestRunner, "TestRunner");
    exports.TestRunner = TestRunner;
    function printLine(line) {
      console.log(line);
    }
    __name(printLine, "printLine");
    var GLOBAL_TEST_RUNNER2 = new TestRunner();
    exports.GLOBAL_TEST_RUNNER = GLOBAL_TEST_RUNNER2;
    function only(name, fn) {
      if (!fn)
        return;
      GLOBAL_TEST_RUNNER2.add(name, fn, true);
    }
    __name(only, "only");
    exports.only = only;
    function skip(_name, _fn) {
    }
    __name(skip, "skip");
    exports.skip = skip;
    function setStrict(strict) {
      GLOBAL_TEST_RUNNER2.strict = strict;
    }
    __name(setStrict, "setStrict");
    exports.setStrict = setStrict;
    function test2(name, fn) {
      if (!fn)
        return;
      GLOBAL_TEST_RUNNER2.add(name, fn, false);
    }
    __name(test2, "test");
    test2.only = only;
    test2.skip = skip;
    exports.test = test2;
    function rethrowImmediate(err2) {
      setTimeout(rethrow, 0);
      function rethrow() {
        throw err2;
      }
      __name(rethrow, "rethrow");
    }
    __name(rethrowImmediate, "rethrowImmediate");
  }
});

// ../../node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "../../node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1)
        validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    __name(getLens, "getLens");
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    __name(byteLength, "byteLength");
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    __name(_byteLength, "_byteLength");
    function toByteArray(b64) {
      var tmp2;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp2 = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp2 >> 16 & 255;
        arr[curByte++] = tmp2 >> 8 & 255;
        arr[curByte++] = tmp2 & 255;
      }
      if (placeHoldersLen === 2) {
        tmp2 = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp2 & 255;
      }
      if (placeHoldersLen === 1) {
        tmp2 = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp2 >> 8 & 255;
        arr[curByte++] = tmp2 & 255;
      }
      return arr;
    }
    __name(toByteArray, "toByteArray");
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    __name(tripletToBase64, "tripletToBase64");
    function encodeChunk(uint8, start, end) {
      var tmp2;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp2 = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp2));
      }
      return output.join("");
    }
    __name(encodeChunk, "encodeChunk");
    function fromByteArray(uint8) {
      var tmp2;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp2 = uint8[len2 - 1];
        parts.push(lookup[tmp2 >> 2] + lookup[tmp2 << 4 & 63] + "==");
      } else if (extraBytes === 2) {
        tmp2 = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(lookup[tmp2 >> 10] + lookup[tmp2 >> 4 & 63] + lookup[tmp2 << 2 & 63] + "=");
      }
      return parts.join("");
    }
    __name(fromByteArray, "fromByteArray");
  }
});

// ../../node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "../../node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// ../../node_modules/buffer/index.js
var require_buffer = __commonJS({
  "../../node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer3;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    __name(typedArraySupport, "typedArraySupport");
    Object.defineProperty(Buffer3.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this))
          return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer3.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this))
          return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    __name(createBuffer, "createBuffer");
    function Buffer3(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError('The "string" argument must be of type string. Received type number');
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    __name(Buffer3, "Buffer");
    Buffer3.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError('The "value" argument must not be of type number. Received type number');
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer3.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b)
        return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    __name(from, "from");
    Buffer3.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer3, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    __name(assertSize, "assertSize");
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    __name(alloc, "alloc");
    Buffer3.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    __name(allocUnsafe, "allocUnsafe");
    Buffer3.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer3.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    __name(fromString, "fromString");
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    __name(fromArrayLike, "fromArrayLike");
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    __name(fromArrayView, "fromArrayView");
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    __name(fromArrayBuffer, "fromArrayBuffer");
    function fromObject(obj) {
      if (Buffer3.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    __name(fromObject, "fromObject");
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    __name(checked, "checked");
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer3.alloc(+length);
    }
    __name(SlowBuffer, "SlowBuffer");
    Buffer3.isBuffer = /* @__PURE__ */ __name(function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer3.prototype;
    }, "isBuffer");
    Buffer3.compare = /* @__PURE__ */ __name(function compare(a, b) {
      if (isInstance(a, Uint8Array))
        a = Buffer3.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array))
        b = Buffer3.from(b, b.offset, b.byteLength);
      if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      }
      if (a === b)
        return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    }, "compare");
    Buffer3.isEncoding = /* @__PURE__ */ __name(function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    }, "isEncoding");
    Buffer3.concat = /* @__PURE__ */ __name(function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer3.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer = Buffer3.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer3.isBuffer(buf))
              buf = Buffer3.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(buffer, buf, pos);
          }
        } else if (!Buffer3.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    }, "concat");
    function byteLength(string, encoding) {
      if (Buffer3.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0)
        return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    __name(byteLength, "byteLength");
    Buffer3.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding)
        encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    __name(slowToString, "slowToString");
    Buffer3.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    __name(swap, "swap");
    Buffer3.prototype.swap16 = /* @__PURE__ */ __name(function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    }, "swap16");
    Buffer3.prototype.swap32 = /* @__PURE__ */ __name(function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    }, "swap32");
    Buffer3.prototype.swap64 = /* @__PURE__ */ __name(function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    }, "swap64");
    Buffer3.prototype.toString = /* @__PURE__ */ __name(function toString() {
      const length = this.length;
      if (length === 0)
        return "";
      if (arguments.length === 0)
        return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    }, "toString");
    Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
    Buffer3.prototype.equals = /* @__PURE__ */ __name(function equals(b) {
      if (!Buffer3.isBuffer(b))
        throw new TypeError("Argument must be a Buffer");
      if (this === b)
        return true;
      return Buffer3.compare(this, b) === 0;
    }, "equals");
    Buffer3.prototype.inspect = /* @__PURE__ */ __name(function inspect2() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max)
        str += " ... ";
      return "<Buffer " + str + ">";
    }, "inspect");
    if (customInspectSymbol) {
      Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
    }
    Buffer3.prototype.compare = /* @__PURE__ */ __name(function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer3.from(target, target.offset, target.byteLength);
      }
      if (!Buffer3.isBuffer(target)) {
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target)
        return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    }, "compare");
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0)
        return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0)
        byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir)
          return -1;
        else
          byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir)
          byteOffset = 0;
        else
          return -1;
      }
      if (typeof val === "string") {
        val = Buffer3.from(val, encoding);
      }
      if (Buffer3.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    __name(bidirectionalIndexOf, "bidirectionalIndexOf");
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      __name(read, "read");
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1)
              foundIndex = i;
            if (i - foundIndex + 1 === valLength)
              return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1)
              i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength)
          byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found)
            return i;
        }
      }
      return -1;
    }
    __name(arrayIndexOf, "arrayIndexOf");
    Buffer3.prototype.includes = /* @__PURE__ */ __name(function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    }, "includes");
    Buffer3.prototype.indexOf = /* @__PURE__ */ __name(function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    }, "indexOf");
    Buffer3.prototype.lastIndexOf = /* @__PURE__ */ __name(function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    }, "lastIndexOf");
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i;
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed))
          return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    __name(hexWrite, "hexWrite");
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    __name(utf8Write, "utf8Write");
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    __name(asciiWrite, "asciiWrite");
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    __name(base64Write, "base64Write");
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    __name(ucs2Write, "ucs2Write");
    Buffer3.prototype.write = /* @__PURE__ */ __name(function write2(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0)
            encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining)
        length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding)
        encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }, "write");
    Buffer3.prototype.toJSON = /* @__PURE__ */ __name(function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    }, "toJSON");
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    __name(base64Slice, "base64Slice");
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    __name(utf8Slice, "utf8Slice");
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
      }
      return res;
    }
    __name(decodeCodePointsArray, "decodeCodePointsArray");
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    __name(asciiSlice, "asciiSlice");
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    __name(latin1Slice, "latin1Slice");
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0)
        start = 0;
      if (!end || end < 0 || end > len)
        end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    __name(hexSlice, "hexSlice");
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    __name(utf16leSlice, "utf16leSlice");
    Buffer3.prototype.slice = /* @__PURE__ */ __name(function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0)
          start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0)
          end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start)
        end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer3.prototype);
      return newBuf;
    }, "slice");
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0)
        throw new RangeError("offset is not uint");
      if (offset + ext > length)
        throw new RangeError("Trying to access beyond buffer length");
    }
    __name(checkOffset, "checkOffset");
    Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = /* @__PURE__ */ __name(function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    }, "readUIntLE");
    Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = /* @__PURE__ */ __name(function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    }, "readUIntBE");
    Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = /* @__PURE__ */ __name(function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      return this[offset];
    }, "readUInt8");
    Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = /* @__PURE__ */ __name(function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    }, "readUInt16LE");
    Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = /* @__PURE__ */ __name(function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    }, "readUInt16BE");
    Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = /* @__PURE__ */ __name(function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    }, "readUInt32LE");
    Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = /* @__PURE__ */ __name(function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    }, "readUInt32BE");
    Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(/* @__PURE__ */ __name(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    }, "readBigUInt64LE"));
    Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(/* @__PURE__ */ __name(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    }, "readBigUInt64BE"));
    Buffer3.prototype.readIntLE = /* @__PURE__ */ __name(function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    }, "readIntLE");
    Buffer3.prototype.readIntBE = /* @__PURE__ */ __name(function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    }, "readIntBE");
    Buffer3.prototype.readInt8 = /* @__PURE__ */ __name(function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128))
        return this[offset];
      return (255 - this[offset] + 1) * -1;
    }, "readInt8");
    Buffer3.prototype.readInt16LE = /* @__PURE__ */ __name(function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    }, "readInt16LE");
    Buffer3.prototype.readInt16BE = /* @__PURE__ */ __name(function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    }, "readInt16BE");
    Buffer3.prototype.readInt32LE = /* @__PURE__ */ __name(function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    }, "readInt32LE");
    Buffer3.prototype.readInt32BE = /* @__PURE__ */ __name(function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    }, "readInt32BE");
    Buffer3.prototype.readBigInt64LE = defineBigIntMethod(/* @__PURE__ */ __name(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    }, "readBigInt64LE"));
    Buffer3.prototype.readBigInt64BE = defineBigIntMethod(/* @__PURE__ */ __name(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    }, "readBigInt64BE"));
    Buffer3.prototype.readFloatLE = /* @__PURE__ */ __name(function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    }, "readFloatLE");
    Buffer3.prototype.readFloatBE = /* @__PURE__ */ __name(function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    }, "readFloatBE");
    Buffer3.prototype.readDoubleLE = /* @__PURE__ */ __name(function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    }, "readDoubleLE");
    Buffer3.prototype.readDoubleBE = /* @__PURE__ */ __name(function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    }, "readDoubleBE");
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer3.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
    }
    __name(checkInt, "checkInt");
    Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = /* @__PURE__ */ __name(function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    }, "writeUIntLE");
    Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = /* @__PURE__ */ __name(function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    }, "writeUIntBE");
    Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = /* @__PURE__ */ __name(function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    }, "writeUInt8");
    Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = /* @__PURE__ */ __name(function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    }, "writeUInt16LE");
    Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = /* @__PURE__ */ __name(function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    }, "writeUInt16BE");
    Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = /* @__PURE__ */ __name(function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    }, "writeUInt32LE");
    Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = /* @__PURE__ */ __name(function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    }, "writeUInt32BE");
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    __name(wrtBigUInt64LE, "wrtBigUInt64LE");
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    __name(wrtBigUInt64BE, "wrtBigUInt64BE");
    Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(/* @__PURE__ */ __name(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    }, "writeBigUInt64LE"));
    Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(/* @__PURE__ */ __name(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    }, "writeBigUInt64BE"));
    Buffer3.prototype.writeIntLE = /* @__PURE__ */ __name(function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    }, "writeIntLE");
    Buffer3.prototype.writeIntBE = /* @__PURE__ */ __name(function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    }, "writeIntBE");
    Buffer3.prototype.writeInt8 = /* @__PURE__ */ __name(function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 127, -128);
      if (value < 0)
        value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    }, "writeInt8");
    Buffer3.prototype.writeInt16LE = /* @__PURE__ */ __name(function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    }, "writeInt16LE");
    Buffer3.prototype.writeInt16BE = /* @__PURE__ */ __name(function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    }, "writeInt16BE");
    Buffer3.prototype.writeInt32LE = /* @__PURE__ */ __name(function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    }, "writeInt32LE");
    Buffer3.prototype.writeInt32BE = /* @__PURE__ */ __name(function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0)
        value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    }, "writeInt32BE");
    Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(/* @__PURE__ */ __name(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64LE"));
    Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(/* @__PURE__ */ __name(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64BE"));
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
      if (offset < 0)
        throw new RangeError("Index out of range");
    }
    __name(checkIEEE754, "checkIEEE754");
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    __name(writeFloat, "writeFloat");
    Buffer3.prototype.writeFloatLE = /* @__PURE__ */ __name(function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    }, "writeFloatLE");
    Buffer3.prototype.writeFloatBE = /* @__PURE__ */ __name(function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    }, "writeFloatBE");
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    __name(writeDouble, "writeDouble");
    Buffer3.prototype.writeDoubleLE = /* @__PURE__ */ __name(function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    }, "writeDoubleLE");
    Buffer3.prototype.writeDoubleBE = /* @__PURE__ */ __name(function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    }, "writeDoubleBE");
    Buffer3.prototype.copy = /* @__PURE__ */ __name(function copy(target, targetStart, start, end) {
      if (!Buffer3.isBuffer(target))
        throw new TypeError("argument should be a Buffer");
      if (!start)
        start = 0;
      if (!end && end !== 0)
        end = this.length;
      if (targetStart >= target.length)
        targetStart = target.length;
      if (!targetStart)
        targetStart = 0;
      if (end > 0 && end < start)
        end = start;
      if (end === start)
        return 0;
      if (target.length === 0 || this.length === 0)
        return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length)
        throw new RangeError("Index out of range");
      if (end < 0)
        throw new RangeError("sourceEnd out of bounds");
      if (end > this.length)
        end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
      }
      return len;
    }, "copy");
    Buffer3.prototype.fill = /* @__PURE__ */ __name(function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val)
        val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    }, "fill");
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = /* @__PURE__ */ __name(class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      }, "NodeError");
    }
    __name(E, "E");
    E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
      if (name) {
        return `${name} is outside of buffer bounds`;
      }
      return "Attempt to access memory outside buffer bounds";
    }, RangeError);
    E("ERR_INVALID_ARG_TYPE", function(name, actual) {
      return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
    }, TypeError);
    E("ERR_OUT_OF_RANGE", function(str, range, input) {
      let msg = `The value of "${str}" is out of range.`;
      let received = input;
      if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
        received = addNumericalSeparator(String(input));
      } else if (typeof input === "bigint") {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
          received = addNumericalSeparator(received);
        }
        received += "n";
      }
      msg += ` It must be ${range}. Received ${received}`;
      return msg;
    }, RangeError);
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    __name(addNumericalSeparator, "addNumericalSeparator");
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    __name(checkBounds, "checkBounds");
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    __name(checkIntBI, "checkIntBI");
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    __name(validateNumber, "validateNumber");
    function boundsError(value, length, type2) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type2);
        throw new errors.ERR_OUT_OF_RANGE(type2 || "offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(type2 || "offset", `>= ${type2 ? 1 : 0} and <= ${length}`, value);
    }
    __name(boundsError, "boundsError");
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2)
        return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    __name(base64clean, "base64clean");
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0)
            break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0)
            break;
          bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0)
            break;
          bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0)
            break;
          bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    __name(utf8ToBytes, "utf8ToBytes");
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    __name(asciiToBytes, "asciiToBytes");
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0)
          break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    __name(utf16leToBytes, "utf16leToBytes");
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    __name(base64ToBytes, "base64ToBytes");
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length)
          break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    __name(blitBuffer, "blitBuffer");
    function isInstance(obj, type2) {
      return obj instanceof type2 || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type2.name;
    }
    __name(isInstance, "isInstance");
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    __name(numberIsNaN, "numberIsNaN");
    var hexSliceLookupTable = function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    }();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    __name(defineBigIntMethod, "defineBigIntMethod");
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
    __name(BufferBigIntNotDefined, "BufferBigIntNotDefined");
  }
});

// ../../events.js
var R = typeof Reflect === "object" ? Reflect : null;
var ReflectApply = R && typeof R.apply === "function" ? R.apply : /* @__PURE__ */ __name(function ReflectApply2(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
}, "ReflectApply");
var ReflectOwnKeys;
if (R && typeof R.ownKeys === "function") {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = /* @__PURE__ */ __name(function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  }, "ReflectOwnKeys");
} else {
  ReflectOwnKeys = /* @__PURE__ */ __name(function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target);
  }, "ReflectOwnKeys");
}
function ProcessEmitWarning(warning) {
  if (console && console.warn)
    console.warn(warning);
}
__name(ProcessEmitWarning, "ProcessEmitWarning");
var NumberIsNaN = Number.isNaN;
function EventEmitter() {
  EventEmitter.init.call(this);
}
__name(EventEmitter, "EventEmitter");
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = void 0;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = void 0;
var defaultMaxListeners = 10;
function checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}
__name(checkListener, "checkListener");
Object.defineProperty(EventEmitter, "defaultMaxListeners", {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
    }
    defaultMaxListeners = arg;
  }
});
EventEmitter.init = function() {
  if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
    this._events = /* @__PURE__ */ Object.create(null);
    this._eventsCount = 0;
  }
  this._maxListeners = this._maxListeners || void 0;
};
EventEmitter.prototype.setMaxListeners = /* @__PURE__ */ __name(function setMaxListeners(n) {
  if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
  }
  this._maxListeners = n;
  return this;
}, "setMaxListeners");
function _getMaxListeners(that) {
  if (that._maxListeners === void 0) {
    return EventEmitter.defaultMaxListeners;
  }
  return that._maxListeners;
}
__name(_getMaxListeners, "_getMaxListeners");
EventEmitter.prototype.getMaxListeners = /* @__PURE__ */ __name(function getMaxListeners() {
  return _getMaxListeners(this);
}, "getMaxListeners");
EventEmitter.prototype.emit = /* @__PURE__ */ __name(function emit(type2) {
  const args = [];
  for (let i = 1; i < arguments.length; i++)
    args.push(arguments[i]);
  let doError = type2 === "error";
  const events = this._events;
  if (events !== void 0) {
    doError = doError && events.error === void 0;
  } else if (!doError) {
    return false;
  }
  if (doError) {
    let er;
    if (args.length > 0) {
      er = args[0];
    }
    if (er instanceof Error) {
      throw er;
    }
    const err2 = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
    err2.context = er;
    throw err2;
  }
  const handler = events[type2];
  if (handler === void 0) {
    return false;
  }
  if (typeof handler === "function") {
    ReflectApply(handler, this, args);
  } else {
    const len = handler.length;
    const listeners2 = arrayClone(handler, len);
    for (let i = 0; i < len; ++i) {
      ReflectApply(listeners2[i], this, args);
    }
  }
  return true;
}, "emit");
function _addListener(target, type2, listener, prepend) {
  let m;
  let events;
  let existing;
  checkListener(listener);
  events = target._events;
  if (events === void 0) {
    events = target._events = /* @__PURE__ */ Object.create(null);
    target._eventsCount = 0;
  } else {
    if (events.newListener !== void 0) {
      target.emit("newListener", type2, listener.listener ? listener.listener : listener);
      events = target._events;
    }
    existing = events[type2];
  }
  if (existing === void 0) {
    existing = events[type2] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === "function") {
      existing = events[type2] = prepend ? [listener, existing] : [existing, listener];
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      const w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type2) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      w.name = "MaxListenersExceededWarning";
      w.emitter = target;
      w.type = type2;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }
  return target;
}
__name(_addListener, "_addListener");
EventEmitter.prototype.addListener = /* @__PURE__ */ __name(function addListener(type2, listener) {
  return _addListener(this, type2, listener, false);
}, "addListener");
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener = /* @__PURE__ */ __name(function prependListener(type2, listener) {
  return _addListener(this, type2, listener, true);
}, "prependListener");
function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0) {
      return this.listener.call(this.target);
    }
    return this.listener.apply(this.target, arguments);
  }
}
__name(onceWrapper, "onceWrapper");
function _onceWrap(target, type2, listener) {
  const state = { fired: false, wrapFn: void 0, target, type: type2, listener };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}
__name(_onceWrap, "_onceWrap");
EventEmitter.prototype.once = /* @__PURE__ */ __name(function once(type2, listener) {
  checkListener(listener);
  this.on(type2, _onceWrap(this, type2, listener));
  return this;
}, "once");
EventEmitter.prototype.prependOnceListener = /* @__PURE__ */ __name(function prependOnceListener(type2, listener) {
  checkListener(listener);
  this.prependListener(type2, _onceWrap(this, type2, listener));
  return this;
}, "prependOnceListener");
EventEmitter.prototype.removeListener = /* @__PURE__ */ __name(function removeListener(type2, listener) {
  let position, i, originalListener;
  checkListener(listener);
  const events = this._events;
  if (events === void 0) {
    return this;
  }
  const list = events[type2];
  if (list === void 0) {
    return this;
  }
  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0) {
      this._events = /* @__PURE__ */ Object.create(null);
    } else {
      delete events[type2];
      if (events.removeListener) {
        this.emit("removeListener", type2, list.listener || listener);
      }
    }
  } else if (typeof list !== "function") {
    position = -1;
    for (i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }
    if (position < 0) {
      return this;
    }
    if (position === 0) {
      list.shift();
    } else {
      spliceOne(list, position);
    }
    if (list.length === 1) {
      events[type2] = list[0];
    }
    if (events.removeListener !== void 0) {
      this.emit("removeListener", type2, originalListener || listener);
    }
  }
  return this;
}, "removeListener");
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.removeAllListeners = /* @__PURE__ */ __name(function removeAllListeners(type2) {
  let i;
  const events = this._events;
  if (events === void 0) {
    return this;
  }
  if (events.removeListener === void 0) {
    if (arguments.length === 0) {
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
    } else if (events[type2] !== void 0) {
      if (--this._eventsCount === 0) {
        this._events = /* @__PURE__ */ Object.create(null);
      } else {
        delete events[type2];
      }
    }
    return this;
  }
  if (arguments.length === 0) {
    const keys = Object.keys(events);
    let key;
    for (i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (key === "removeListener")
        continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners("removeListener");
    this._events = /* @__PURE__ */ Object.create(null);
    this._eventsCount = 0;
    return this;
  }
  const listeners2 = events[type2];
  if (typeof listeners2 === "function") {
    this.removeListener(type2, listeners2);
  } else if (listeners2 !== void 0) {
    for (i = listeners2.length - 1; i >= 0; i--) {
      this.removeListener(type2, listeners2[i]);
    }
  }
  return this;
}, "removeAllListeners");
function _listeners(target, type2, unwrap) {
  const events = target._events;
  if (events === void 0) {
    return [];
  }
  const evlistener = events[type2];
  if (evlistener === void 0) {
    return [];
  }
  if (typeof evlistener === "function") {
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  }
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}
__name(_listeners, "_listeners");
EventEmitter.prototype.listeners = /* @__PURE__ */ __name(function listeners(type2) {
  return _listeners(this, type2, true);
}, "listeners");
EventEmitter.prototype.rawListeners = /* @__PURE__ */ __name(function rawListeners(type2) {
  return _listeners(this, type2, false);
}, "rawListeners");
EventEmitter.listenerCount = function(emitter, type2) {
  if (typeof emitter.listenerCount === "function") {
    return emitter.listenerCount(type2);
  } else {
    return listenerCount.call(emitter, type2);
  }
};
EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type2) {
  const events = this._events;
  if (events !== void 0) {
    const evlistener = events[type2];
    if (typeof evlistener === "function") {
      return 1;
    } else if (evlistener !== void 0) {
      return evlistener.length;
    }
  }
  return 0;
}
__name(listenerCount, "listenerCount");
EventEmitter.prototype.eventNames = /* @__PURE__ */ __name(function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
}, "eventNames");
function arrayClone(arr, n) {
  const copy = new Array(n);
  for (let i = 0; i < n; ++i) {
    copy[i] = arr[i];
  }
  return copy;
}
__name(arrayClone, "arrayClone");
function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) {
    list[index] = list[index + 1];
  }
  list.pop();
}
__name(spliceOne, "spliceOne");
function unwrapListeners(arr) {
  const ret = new Array(arr.length);
  for (let i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}
__name(unwrapListeners, "unwrapListeners");
function once2(emitter, name) {
  return new Promise(function(resolve2, reject) {
    function errorListener(err2) {
      emitter.removeListener(name, resolver);
      reject(err2);
    }
    __name(errorListener, "errorListener");
    function resolver() {
      if (typeof emitter.removeListener === "function") {
        emitter.removeListener("error", errorListener);
      }
      resolve2([].slice.call(arguments));
    }
    __name(resolver, "resolver");
    ;
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== "error") {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}
__name(once2, "once");
function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === "function") {
    eventTargetAgnosticAddListener(emitter, "error", handler, flags);
  }
}
__name(addErrorHandlerIfEventEmitter, "addErrorHandlerIfEventEmitter");
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === "function") {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === "function") {
    emitter.addEventListener(name, /* @__PURE__ */ __name(function wrapListener(arg) {
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    }, "wrapListener"));
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}
__name(eventTargetAgnosticAddListener, "eventTargetAgnosticAddListener");
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.once = once2;

// ../../errors.js
var errors_exports = {};
__export(errors_exports, {
  ABORT_ERR: () => ABORT_ERR,
  AbortError: () => AbortError,
  ENCODING_ERR: () => ENCODING_ERR,
  EncodingError: () => EncodingError,
  FinalizationRegistryCallbackError: () => FinalizationRegistryCallbackError,
  INDEX_SIZE_ERR: () => INDEX_SIZE_ERR,
  INVALID_ACCESS_ERR: () => INVALID_ACCESS_ERR,
  IndexSizeError: () => IndexSizeError,
  InternalError: () => InternalError,
  InvalidAccessError: () => InvalidAccessError,
  NETWORK_ERR: () => NETWORK_ERR,
  NOT_ALLOWED_ERR: () => NOT_ALLOWED_ERR,
  NOT_FOUND_ERR: () => NOT_FOUND_ERR,
  NOT_SUPPORTED_ERR: () => NOT_SUPPORTED_ERR,
  NetworkError: () => NetworkError,
  NotAllowedError: () => NotAllowedError,
  NotFoundError: () => NotFoundError,
  NotSupportedError: () => NotSupportedError,
  OPERATION_ERR: () => OPERATION_ERR,
  OperationError: () => OperationError,
  TIMEOUT_ERR: () => TIMEOUT_ERR,
  TimeoutError: () => TimeoutError,
  kInternalErrorCode: () => kInternalErrorCode
});
var ABORT_ERR = 20;
var ENCODING_ERR = 32;
var INVALID_ACCESS_ERR = 15;
var INDEX_SIZE_ERR = 1;
var NETWORK_ERR = 19;
var NOT_ALLOWED_ERR = 31;
var NOT_FOUND_ERR = 8;
var NOT_SUPPORTED_ERR = 9;
var OPERATION_ERR = 30;
var TIMEOUT_ERR = 23;
var AbortError = class extends Error {
  static get code() {
    return ABORT_ERR;
  }
  constructor(reason, signal, ...args) {
    if (reason?.reason) {
      signal = reason;
      reason = signal.reason;
    }
    super(reason || signal?.reason || "The operation was aborted", ...args);
    this.signal = signal || null;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, AbortError);
    }
  }
  get name() {
    return "AbortError";
  }
  get code() {
    return "ABORT_ERR";
  }
};
__name(AbortError, "AbortError");
var EncodingError = class extends Error {
  static get code() {
    return ENCODING_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, EncodingError);
    }
  }
  get name() {
    return "EncodingError";
  }
  get code() {
    return "ENCODING_ERR";
  }
};
__name(EncodingError, "EncodingError");
var FinalizationRegistryCallbackError = class extends Error {
  static get code() {
    return 0;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, FinalizationRegistryCallbackError);
    }
  }
  get name() {
    return "FinalizationRegistryCallbackError";
  }
  get code() {
    return "FINALIZATION_REGISTRY_CALLBACK_ERR";
  }
};
__name(FinalizationRegistryCallbackError, "FinalizationRegistryCallbackError");
var IndexSizeError = class extends Error {
  static get code() {
    return INDEX_SIZE_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, IndexSizeError);
    }
  }
  get name() {
    return "IndexSizeError";
  }
  get code() {
    return "INDEX_SIZE_ERR";
  }
};
__name(IndexSizeError, "IndexSizeError");
var kInternalErrorCode = Symbol.for("InternalError.code");
var InternalError = class extends Error {
  static get code() {
    return 0;
  }
  constructor(message, code, ...args) {
    super(message, code, ...args);
    if (code) {
      this[kInternalErrorCode] = code;
    }
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InternalError);
    }
  }
  get name() {
    return "InternalError";
  }
  get code() {
    return this[kInternalErrorCode] || "INTERNAL_ERR";
  }
};
__name(InternalError, "InternalError");
var InvalidAccessError = class extends Error {
  static get code() {
    return INVALID_ACCESS_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidAccessError);
    }
  }
  get name() {
    return "InvalidAccessError";
  }
  get code() {
    return "INVALID_ACCESS_ERR";
  }
};
__name(InvalidAccessError, "InvalidAccessError");
var NetworkError = class extends Error {
  static get code() {
    return NETWORK_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    this.name = "NetworkError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, NetworkError);
    }
  }
  get name() {
    return "NetworkError";
  }
  get code() {
    return "NETWORK_ERR";
  }
};
__name(NetworkError, "NetworkError");
var NotAllowedError = class extends Error {
  static get code() {
    return NOT_ALLOWED_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, NotAllowedError);
    }
  }
  get name() {
    return "NotAllowedError";
  }
  get code() {
    return "NOT_ALLOWED_ERR";
  }
};
__name(NotAllowedError, "NotAllowedError");
var NotFoundError = class extends Error {
  static get code() {
    return NOT_FOUND_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
  get name() {
    return "NotFoundError";
  }
  get code() {
    return "NOT_FOUND_ERR";
  }
};
__name(NotFoundError, "NotFoundError");
var NotSupportedError = class extends Error {
  static get code() {
    return NOT_SUPPORTED_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, NotSupportedError);
    }
  }
  get name() {
    return "NotSupportedError";
  }
  get code() {
    return "NOT_SUPPORTED_ERR";
  }
};
__name(NotSupportedError, "NotSupportedError");
var OperationError = class extends Error {
  static get code() {
    return OPERATION_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, OperationError);
    }
  }
  get name() {
    return "OperationError";
  }
  get code() {
    return "OPERATION_ERR";
  }
};
__name(OperationError, "OperationError");
var TimeoutError = class extends Error {
  static get code() {
    return TIMEOUT_ERR;
  }
  constructor(message, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
  get name() {
    return "TimeoutError";
  }
  get code() {
    return "TIMEOUT_ERR";
  }
};
__name(TimeoutError, "TimeoutError");

// ../../ipc.js
function getErrorClass(type2, fallback) {
  if (typeof window !== "undefined" && typeof window[type2] === "function") {
    return window[type2];
  }
  if (typeof errors_exports[type2] === "function") {
    return errors_exports[type2];
  }
  return fallback || Error;
}
__name(getErrorClass, "getErrorClass");
function maybeMakeError(error, caller) {
  const errors = {
    AbortError: getErrorClass("AbortError"),
    AggregateError: getErrorClass("AggregateError"),
    EncodingError: getErrorClass("EncodingError"),
    IndexSizeError: getErrorClass("IndexSizeError"),
    InternalError,
    InvalidAccessError: getErrorClass("InvalidAccessError"),
    NetworkError: getErrorClass("NetworkError"),
    NotAllowedError: getErrorClass("NotAllowedError"),
    NotFoundError: getErrorClass("NotFoundError"),
    NotSupportedError: getErrorClass("NotSupportedError"),
    OperationError: getErrorClass("OperationError"),
    RangeError: getErrorClass("RangeError"),
    TimeoutError,
    TypeError: getErrorClass("TypeError"),
    URIError: getErrorClass("URIError")
  };
  if (!error) {
    return null;
  }
  if (error instanceof Error) {
    return error;
  }
  error = { ...error };
  const type2 = error.type || "Error";
  const code = error.code;
  let err2 = null;
  delete error.type;
  if (type2 in errors) {
    err2 = new errors[type2](error.message || "", error);
  } else {
    for (const E of Object.values(errors)) {
      if (type2 === E.code || code === E.code) {
        err2 = new E(error.message || "", error);
      }
    }
  }
  if (!err2) {
    err2 = new Error(error.message || "", error);
  }
  Object.assign(err2, error);
  if (typeof Error.captureStackTrace === "function" && typeof caller === "function") {
    Error.captureStackTrace(err2, caller);
  }
  return err2;
}
__name(maybeMakeError, "maybeMakeError");
var OK = 0;
var ERROR = 1;
var TIMEOUT = 32 * 1e3;
var kDebugEnabled = Symbol.for("ipc.debug.enabled");
function parseSeq(seq, options) {
  const value = String(seq).replace(/^R/i, "").replace(/n$/, "");
  return options?.bigint === true ? BigInt(value) : parseInt(value);
}
__name(parseSeq, "parseSeq");
function debug(enable) {
  if (enable === true) {
    debug.enabled = true;
  } else if (enable === false) {
    debug.enabled = false;
  }
  return debug.enabled;
}
__name(debug, "debug");
Object.defineProperty(debug, "enabled", {
  enumerable: false,
  set(value) {
    debug[kDebugEnabled] = Boolean(value);
  },
  get() {
    if (debug[kDebugEnabled] === void 0) {
      return typeof window === "undefined" ? false : Boolean(window.process?.debug);
    }
    return debug[kDebugEnabled];
  }
});
var Result = class {
  static from(result) {
    if (result instanceof Result) {
      return result;
    }
    if (result instanceof Error) {
      return new this(null, result);
    }
    const err2 = maybeMakeError(result?.err, Result.from);
    const data = result?.data !== null && result?.data !== void 0 ? result.data : result;
    return new this(data, err2);
  }
  constructor(data, err2) {
    this.data = data || null;
    this.err = err2 || null;
    Object.defineProperty(this, 0, {
      value: data,
      enumerable: false,
      configurable: false
    });
    Object.defineProperty(this, 1, {
      value: err2,
      enumerable: false,
      configurable: false
    });
  }
  get length() {
    if (this.data !== null && this.err !== null) {
      return 2;
    }
  }
  *[Symbol.iterator]() {
    yield this.data;
    yield this.err;
  }
};
__name(Result, "Result");
async function ready() {
  await new Promise((resolve2, reject) => {
    if (typeof window === "undefined") {
      return reject(new TypeError("Global window object is not defined."));
    }
    return loop();
    function loop() {
      if (window._ipc) {
        return resolve2();
      }
      queueMicrotask(loop);
    }
    __name(loop, "loop");
  });
}
__name(ready, "ready");
function sendSync(command, params) {
  if (typeof window === "undefined") {
    if (debug.enabled) {
      console.debug("Global window object is not defined");
    }
    return {};
  }
  const request2 = new window.XMLHttpRequest();
  const index = window.process ? window.process.index : 0;
  const seq = window._ipc ? window._ipc.nextSeq++ : 0;
  const uri = `ipc://${command}`;
  params = new URLSearchParams(params);
  params.set("index", index);
  params.set("seq", seq);
  const query = `?${params}`;
  if (debug.enabled) {
    console.debug("io.ipc.sendSync: %s", uri + query);
  }
  request2.open("GET", uri + query, false);
  request2.send(null);
  try {
    return Result.from(JSON.parse(request2.response));
  } catch (err2) {
    if (debug.enabled) {
      console.warn(err2.message || err2);
    }
  }
  return Result.from(request2.response);
}
__name(sendSync, "sendSync");
async function emit2(...args) {
  await ready();
  if (debug.enabled) {
    console.debug("io.ipc.emit:", ...args);
  }
  return await window._ipc.emit(...args);
}
__name(emit2, "emit");
async function resolve(...args) {
  await ready();
  if (debug.enabled) {
    console.debug("io.ipc.resolve:", ...args);
  }
  return await window._ipc.resolve(...args);
}
__name(resolve, "resolve");
async function send(...args) {
  await ready();
  if (debug.enabled) {
    console.debug("io.ipc.send:", ...args);
  }
  return await window._ipc.send(...args);
}
__name(send, "send");
async function write(command, params, buffer, options) {
  if (typeof window === "undefined") {
    console.warn("Global window object is not defined");
    return {};
  }
  const signal = options?.signal;
  const request2 = new window.XMLHttpRequest();
  const index = window.process ? window.process.index : 0;
  const seq = window._ipc ? window._ipc.nextSeq++ : 0;
  const uri = `ipc://${command}`;
  let resolved = false;
  let aborted = false;
  let timeout = null;
  if (signal) {
    if (signal.aborted) {
      return Result.from(new AbortError(signal));
    }
    signal.addEventListener("abort", () => {
      if (!aborted && !resolved) {
        aborted = true;
        request2.abort();
      }
    });
  }
  params = new URLSearchParams(params);
  params.set("index", index);
  params.set("seq", seq);
  const query = `?${params}`;
  request2.open("PUT", uri + query, true);
  request2.send(buffer || null);
  if (debug.enabled) {
    console.debug("io.ipc.write:", uri + query, buffer || null);
  }
  return await new Promise((resolve2) => {
    if (options?.timeout) {
      timeout = setTimeout(() => {
        resolve2(Result.from(new TimeoutError("ipc.write timedout")));
        request2.abort();
      }, typeof options.timeout === "number" ? options.timeout : TIMEOUT);
    }
    request2.onabort = () => {
      aborted = true;
      if (options?.timeout) {
        clearTimeout(timeout);
      }
      resolve2(Result.from(new AbortError(signal)));
    };
    request2.onreadystatechange = () => {
      if (aborted) {
        return;
      }
      if (request2.readyState === window.XMLHttpRequest.DONE) {
        resolved = true;
        clearTimeout(timeout);
        let data = request2.response;
        try {
          data = JSON.parse(request2.response);
        } catch (err2) {
          if (debug.enabled) {
            console.warn(err2.message || err2);
          }
        }
        const result = Result.from(data);
        if (debug.enabled) {
          console.debug("io.ipc.write: (resolved)", command, result);
        }
        return resolve2(data);
      }
    };
    request2.onerror = () => {
      resolved = true;
      clearTimeout(timeout);
      resolve2(Result.from(new Error(request2.responseText)));
    };
  });
}
__name(write, "write");
async function request(command, data, options) {
  await ready();
  const signal = options?.signal;
  const params = { ...data };
  for (const key in params) {
    if (params[key] === void 0) {
      delete params[key];
    }
  }
  if (debug.enabled) {
    console.debug("io.ipc.request:", command, data);
  }
  let aborted = false;
  let timeout = null;
  const parent3 = typeof window === "object" ? window : globalThis;
  const promise = parent3._ipc.send(command, params);
  const { seq, index } = promise;
  const resolved = promise.then((result) => {
    cleanup();
    if (debug.enabled) {
      console.debug("io.ipc.request: (resolved)", command, result);
    }
    if (result?.data instanceof ArrayBuffer) {
      return Result.from(new Uint8Array(result.data));
    }
    return Result.from(result);
  });
  const onabort = /* @__PURE__ */ __name(() => {
    aborted = true;
    cleanup();
    resolve(seq, ERROR, {
      err: new TimeoutError("ipc.request  timedout")
    });
  }, "onabort");
  if (signal) {
    if (signal.aborted) {
      return Result.from(new AbortError(signal));
    }
    signal.addEventListener("abort", onabort);
  }
  if (options?.timeout !== false) {
    timeout = setTimeout(onabort, typeof options?.timeout === "number" ? options.timeout : TIMEOUT);
  }
  parent3.addEventListener("data", ondata);
  return Object.assign(resolved, { seq, index });
  function cleanup() {
    window.removeEventListener("data", ondata);
    if (timeout) {
      clearTimeout(timeout);
    }
  }
  __name(cleanup, "cleanup");
  function ondata(event) {
    if (aborted) {
      cleanup();
      return resolve(seq, ERROR, {
        err: new AbortError(signal)
      });
    }
    if (event.detail?.data) {
      const { data: data2, params: params2 } = event.detail;
      if (parseSeq(params2.seq) === parseSeq(seq)) {
        cleanup();
        resolve(seq, OK, { data: data2 });
      }
    }
  }
  __name(ondata, "ondata");
}
__name(request, "request");
var ipc_default = {
  OK,
  ERROR,
  TIMEOUT,
  debug,
  emit: emit2,
  ready,
  resolve,
  request,
  send,
  sendSync,
  write
};

// ../../process.js
var didEmitExitEvent = false;
function homedir() {
  process2.env.HOME || "";
}
__name(homedir, "homedir");
function exit(code) {
  if (!didEmitExitEvent) {
    queueMicrotask(() => process2.emit("exit", code));
  }
  sendSync("exit", { value: code || 0 });
}
__name(exit, "exit");
var parent = typeof window === "object" ? window : globalThis;
var process2 = Object.create(null, Object.getOwnPropertyDescriptors({
  ...EventEmitter.prototype,
  homedir,
  exit,
  argv0: parent?.process?.argv?.[0],
  ...parent?.process
}));
EventEmitter.call(process2);
process2.once("exit", () => {
  didEmitExitEvent = true;
});
var process_default = process2;

// src/index.js
var import_tapzero2 = __toESM(require_tapzero(), 1);

// ../../util.js
var import_buffer = __toESM(require_buffer(), 1);
var TypedArray = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor;
var kCustomInspect = inspect.custom = Symbol.for("nodejs.util.inspect.custom");
function hasOwnProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, String(property));
}
__name(hasOwnProperty, "hasOwnProperty");
function isTypedArray(object) {
  return object instanceof TypedArray;
}
__name(isTypedArray, "isTypedArray");
function isArrayLike(object) {
  return Array.isArray(object) || isTypedArray(object);
}
__name(isArrayLike, "isArrayLike");
function isFunction(value) {
  return typeof value === "function" && !/^class/.test(value.toString());
}
__name(isFunction, "isFunction");
function toProperCase(string) {
  return string[0].toUpperCase() + string.slice(1);
}
__name(toProperCase, "toProperCase");
var tmp = new BigUint64Array(1);
function inspect(value, options) {
  const ctx = {
    seen: options?.seen || [],
    depth: typeof options?.depth !== "undefined" ? options.depth : 2,
    showHidden: options?.showHidden || false,
    customInspect: options?.customInspect === void 0 ? true : options.customInspect,
    ...options,
    options
  };
  return formatValue(ctx, value, ctx.depth);
  function formatValue(ctx2, value2, depth) {
    if (ctx2.customInspect && !(value2?.constructor && value2?.constructor?.prototype === value2)) {
      if (isFunction(value2?.inspect) && value2?.inspect !== inspect) {
        const formatted = value2.inspect(depth, ctx2);
        if (typeof formatted !== "string") {
          return formatValue(ctx2, formatted, depth);
        }
        return formatted;
      } else if (isFunction(value2?.[kCustomInspect]) && value2?.[kCustomInspect] !== inspect) {
        const formatted = value2[kCustomInspect](depth, ctx2, ctx2.options, inspect);
        if (typeof formatted !== "string") {
          return formatValue(ctx2, formatted, depth);
        }
        return formatted;
      }
    }
    if (value2 === void 0) {
      return "undefined";
    }
    if (value2 === null) {
      return "null";
    }
    if (typeof value2 === "string") {
      const formatted = JSON.stringify(value2).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"');
      return `'${formatted}'`;
    }
    if (typeof value2 === "number" || typeof value2 === "boolean") {
      return String(value2);
    }
    let typename = "";
    const braces = ["{", "}"];
    const isArrayLikeValue = isArrayLike(value2);
    const keys = new Set(Object.keys(value2));
    const enumerableKeys = Object.fromEntries(Array.from(keys).map((k) => [k, true]));
    if (ctx2.showHidden) {
      try {
        const hidden = Object.getOwnPropertyNames(value2);
        for (const key of hidden) {
          keys.add(key);
        }
      } catch (errr) {
        void err;
      }
    }
    if (isArrayLikeValue) {
      braces[0] = "[";
      braces[1] = "]";
    }
    if (isFunction(value2)) {
      const name = value2.name ? `: ${value2.name}` : "";
      typename = `[Function${name}]`;
    }
    if (value2 instanceof RegExp) {
      typename = `${RegExp.prototype.toString.call(value2)}`;
    }
    if (value2 instanceof Date) {
      typename = `${Date.prototype.toUTCString.call(value2)}`;
    }
    if (value2 instanceof Error) {
      typename = `[${Error.prototype.toString.call(value2)}]`;
    }
    if (keys.size === 0) {
      if (isFunction(value2)) {
        return typename;
      } else if (!isArrayLikeValue || value2.length === 0) {
        return `${braces[0]}${typename}${braces[1]}`;
      } else if (!isArrayLikeValue) {
        return typename;
      }
    }
    if (depth < 0) {
      if (value2 instanceof RegExp) {
        return RegExp.prototype.toString.call(value2);
      }
      return `[Object]`;
    }
    ctx2.seen.push(value2);
    const output = [];
    if (isArrayLikeValue) {
      for (let i = 0; i < value2.length; ++i) {
        const key = String(i);
        if (hasOwnProperty(value2, key)) {
          output.push(formatProperty(ctx2, value2, depth, enumerableKeys, key, true));
        }
      }
      for (const key of keys) {
        if (!/^\d+$/.test(key)) {
          output.push(...Array.from(keys).map((key2) => formatProperty(ctx2, value2, depth, enumerableKeys, key2, true)));
        }
      }
    } else {
      output.push(...Array.from(keys).map((key) => formatProperty(ctx2, value2, depth, enumerableKeys, key, false)));
    }
    ctx2.seen.pop();
    const length = output.reduce((p, c) => p + c.length + 1, 0);
    if (length > 60) {
      return `${braces[0]}
${!typename ? "" : ` ${typename}
`}  ${output.join(",\n  ")}
${braces[1]}`;
    }
    return `${braces[0]}${typename} ${output.join(", ")} ${braces[1]}`;
  }
  __name(formatValue, "formatValue");
  function formatProperty(ctx2, value2, depth, enumerableKeys, key, isArrayLikeValue) {
    const descriptor = { value: void 0 };
    const output = ["", ""];
    try {
      descriptor.value = value2[key];
    } catch (err2) {
    }
    try {
      Object.assign(descriptor, Object.getOwnPropertyDescriptor(value2, key));
    } catch (err2) {
    }
    if (descriptor.get && descriptor.set) {
      output[1] = "[Getter/Setter]";
    } else if (descriptor.get) {
      output[1] = "[Getter]";
    } else if (descriptor.set) {
      output[1] = "[Setter]";
    }
    if (!hasOwnProperty(enumerableKeys, key)) {
      output[0] = `[${key}]`;
    }
    if (!output[1]) {
      if (ctx2.seen.includes(descriptor.value)) {
        output[1] = "[Circular]";
      } else {
        if (depth === null) {
          output[1] = formatValue(ctx2, descriptor.value, null);
        } else {
          output[1] = formatValue(ctx2, descriptor.value, depth - 1);
        }
        if (output[1].includes("\n")) {
          if (isArrayLikeValue) {
            output[1] = output[1].split("\n").map((line) => `  ${line}`).join("\n").slice(2);
          } else {
            output[1] = "\n" + output[1].split("\n").map((line) => `    ${line}`).join("\n");
          }
        }
      }
    }
    if (!output[0]) {
      if (isArrayLikeValue && /^\d+$/.test(key)) {
        return output[1];
      }
      output[0] = JSON.stringify(String(key)).replace(/^"/, "").replace(/"$/, "").replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
    }
    return output.join(": ");
  }
  __name(formatProperty, "formatProperty");
}
__name(inspect, "inspect");
function format(format2, ...args) {
  if (typeof format2 !== "string") {
    return [format2].concat(args).map((arg) => inspect(arg)).join(" ");
  }
  const regex = /%[sdj%]/g;
  let i = 0;
  let str = format2.replace(regex, (x) => {
    if (x === "%%") {
      return "%";
    }
    if (i >= args.length) {
      return x;
    }
    switch (x) {
      case "%s":
        return String(args[i++]);
      case "%d":
        return Number(args[i++]);
      case "%d":
        return BigInt(args[i++]);
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return "[Circular]";
        }
    }
    return x;
  });
  for (const arg of args.slice(i)) {
    if (arg === null || typeof arg !== "object") {
      str += " " + arg;
    } else {
      str += " " + inspect(arg);
    }
  }
  return str;
}
__name(format, "format");

// src/console.js
patch(console, "log");
patch(console, "info");
patch(console, "warn");
patch(console, "error");
patch(console, "debug");
function patch(console2, method) {
  const original = console2[method].bind(console2);
  console2[method] = (...args) => original(format(...args));
}
__name(patch, "patch");

// ../../os.js
var UNKNOWN = "unknown";
var cache = {
  arch: UNKNOWN,
  type: UNKNOWN,
  platform: UNKNOWN
};
function arch() {
  let value = UNKNOWN;
  if (cache.arch !== UNKNOWN) {
    return cache.arch;
  }
  if (typeof window !== "object") {
    if (typeof process === "object" && typeof process.arch === "string") {
      return process.arch;
    }
  }
  if (typeof window === "object") {
    value = window.process?.arch || sendSync("getPlatformArch")?.data || UNKNOWN;
  }
  if (value === "arm64") {
    return value;
  }
  cache.arch = value.replace("x86_64", "x64").replace("x86", "ia32").replace(/arm.*/, "arm");
  return cache.arch;
}
__name(arch, "arch");
function platform() {
  let value = UNKNOWN;
  if (cache.platform !== UNKNOWN) {
    return cache.platform;
  }
  if (typeof window !== "object") {
    if (typeof process === "object" && typeof process.platform === "string") {
      return process.platform;
    }
  }
  if (typeof window === "object") {
    value = window.process?.os || sendSync("getPlatformOS")?.data || window.process?.platform || UNKNOWN;
  }
  cache.platform = value.replace(/^mac/i, "darwin");
  return cache.platform;
}
__name(platform, "platform");
function type() {
  let value = "unknown";
  if (cache.type !== UNKNOWN) {
    return cache.type;
  }
  if (typeof window !== "object") {
    switch (platform()) {
      case "linux":
        return "Linux";
      case "mac":
      case "darwin":
        return "Darwin";
      case "win32":
        return "Windows";
    }
  }
  if (typeof window == "object") {
    value = window.process?.platform || sendSync("getPlatformType")?.data || UNKNOWN;
  }
  if (value !== UNKNOWN) {
    value = toProperCase(value);
  }
  cache.type = value;
  return cache.type;
}
__name(type, "type");
var EOL = (() => {
  if (/win/i.test(type())) {
    return "\r\n";
  }
  return "\n";
})();

// src/os.js
var import_tapzero = __toESM(require_tapzero(), 1);
(0, import_tapzero.test)("os.arch()", (t) => {
  t.ok(arch(), "os.arch()");
});
(0, import_tapzero.test)("os.platform()", (t) => {
  t.ok(platform(), "os.platform()");
});
(0, import_tapzero.test)("os.type()", (t) => {
  t.ok(type(), "os.type()");
});
(0, import_tapzero.test)("os.networkInterfaces()", (t) => {
});
(0, import_tapzero.test)("os.EOL", (t) => {
  if (/windows/i.test(type())) {
    t.equal(EOL, "\r\n");
  } else {
    t.equal(EOL, "\n");
  }
});

// src/index.js
var parent2 = typeof window === "object" ? window : globalThis;
ipc_default.debug.enabled = false;
if (typeof parent2?.addEventListener === "function") {
  parent2.addEventListener("error", (err2) => {
    console.error("Uncaught:", err2.message);
    process_default.exit(1);
  });
}
setTimeout(/* @__PURE__ */ __name(function poll() {
  if (import_tapzero2.GLOBAL_TEST_RUNNER.completed) {
    return process_default.exit(0);
  }
  setTimeout(poll);
}, "poll"));
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
