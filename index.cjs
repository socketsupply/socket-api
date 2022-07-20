var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup2 = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup2[i] = code[i];
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
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
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
    function tripletToBase64(num) {
      return lookup2[num >> 18 & 63] + lookup2[num >> 12 & 63] + lookup2[num >> 6 & 63] + lookup2[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp2;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp2 = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp2));
      }
      return output.join("");
    }
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
        parts.push(lookup2[tmp2 >> 2] + lookup2[tmp2 << 4 & 63] + "==");
      } else if (extraBytes === 2) {
        tmp2 = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(lookup2[tmp2 >> 10] + lookup2[tmp2 >> 4 & 63] + lookup2[tmp2 << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer2, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer2[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer2[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer2[offset + i], i += d, nBits -= 8) {
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
    exports.write = function(buffer2, value, offset, isLE, mLen, nBytes) {
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
      for (; mLen >= 8; buffer2[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer2[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer2[offset + i - d] |= s * 128;
    };
  }
});

// node_modules/buffer/index.js
var require_buffer = __commonJS({
  "node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer6;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer6.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer6.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
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
    Object.defineProperty(Buffer6.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer6.isBuffer(this))
          return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer6.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer6.isBuffer(this))
          return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer6.prototype);
      return buf;
    }
    function Buffer6(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError('The "string" argument must be of type string. Received type number');
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer6.poolSize = 8192;
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
        return Buffer6.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b)
        return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer6.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    Buffer6.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer6.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer6, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
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
    Buffer6.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer6.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer6.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer6.isEncoding(encoding)) {
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
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
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
      Object.setPrototypeOf(buf, Buffer6.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer6.isBuffer(obj)) {
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
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer6.alloc(+length);
    }
    Buffer6.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer6.prototype;
    };
    Buffer6.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array))
        a = Buffer6.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array))
        b = Buffer6.from(b, b.offset, b.byteLength);
      if (!Buffer6.isBuffer(a) || !Buffer6.isBuffer(b)) {
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
    };
    Buffer6.isEncoding = function isEncoding(encoding) {
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
    };
    Buffer6.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer6.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer2 = Buffer6.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer2.length) {
            if (!Buffer6.isBuffer(buf))
              buf = Buffer6.from(buf);
            buf.copy(buffer2, pos);
          } else {
            Uint8Array.prototype.set.call(buffer2, buf, pos);
          }
        } else if (!Buffer6.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer2, pos);
        }
        pos += buf.length;
      }
      return buffer2;
    };
    function byteLength(string, encoding) {
      if (Buffer6.isBuffer(string)) {
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
    Buffer6.byteLength = byteLength;
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
    Buffer6.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer6.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer6.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer6.prototype.swap64 = function swap64() {
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
    };
    Buffer6.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0)
        return "";
      if (arguments.length === 0)
        return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer6.prototype.toLocaleString = Buffer6.prototype.toString;
    Buffer6.prototype.equals = function equals(b) {
      if (!Buffer6.isBuffer(b))
        throw new TypeError("Argument must be a Buffer");
      if (this === b)
        return true;
      return Buffer6.compare(this, b) === 0;
    };
    Buffer6.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max)
        str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer6.prototype[customInspectSymbol] = Buffer6.prototype.inspect;
    }
    Buffer6.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer6.from(target, target.offset, target.byteLength);
      }
      if (!Buffer6.isBuffer(target)) {
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
    };
    function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
      if (buffer2.length === 0)
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
        byteOffset = dir ? 0 : buffer2.length - 1;
      }
      if (byteOffset < 0)
        byteOffset = buffer2.length + byteOffset;
      if (byteOffset >= buffer2.length) {
        if (dir)
          return -1;
        else
          byteOffset = buffer2.length - 1;
      } else if (byteOffset < 0) {
        if (dir)
          byteOffset = 0;
        else
          return -1;
      }
      if (typeof val === "string") {
        val = Buffer6.from(val, encoding);
      }
      if (Buffer6.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
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
      function read2(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
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
            if (read2(arr, i + j) !== read2(val, j)) {
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
    Buffer6.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer6.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer6.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
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
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer6.prototype.write = function write3(string, offset, length, encoding) {
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
    };
    Buffer6.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
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
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
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
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer6.prototype.slice = function slice(start, end) {
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
      Object.setPrototypeOf(newBuf, Buffer6.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0)
        throw new RangeError("offset is not uint");
      if (offset + ext > length)
        throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer6.prototype.readUintLE = Buffer6.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.readUintBE = Buffer6.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.readUint8 = Buffer6.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer6.prototype.readUint16LE = Buffer6.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer6.prototype.readUint16BE = Buffer6.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer6.prototype.readUint32LE = Buffer6.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer6.prototype.readUint32BE = Buffer6.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer6.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
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
    });
    Buffer6.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
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
    });
    Buffer6.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128))
        return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer6.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer6.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer6.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer6.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer6.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer6.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer6.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer6.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer6.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer6.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer6.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
    }
    Buffer6.prototype.writeUintLE = Buffer6.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.writeUintBE = Buffer6.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.writeUint8 = Buffer6.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer6.prototype.writeUint16LE = Buffer6.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer6.prototype.writeUint16BE = Buffer6.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer6.prototype.writeUint32LE = Buffer6.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer6.prototype.writeUint32BE = Buffer6.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
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
    Buffer6.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer6.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer6.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
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
    };
    Buffer6.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 127, -128);
      if (value < 0)
        value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer6.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer6.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer6.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer6.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
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
    };
    Buffer6.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer6.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
      if (offset < 0)
        throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer6.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer6.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer6.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer6.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer6.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer6.isBuffer(target))
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
    };
    Buffer6.prototype.fill = function fill(val, start, end, encoding) {
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
        if (typeof encoding === "string" && !Buffer6.isEncoding(encoding)) {
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
        const bytes = Buffer6.isBuffer(val) ? val : Buffer6.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
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
      };
    }
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
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
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
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
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
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
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
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length)
          break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type2) {
      return obj instanceof type2 || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type2.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
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
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  }
});

// index.js
var io_exports = {};
__export(io_exports, {
  EventEmitter: () => EventEmitter,
  bluetooth: () => bluetooth_default,
  buffer: () => import_buffer5.default,
  dgram: () => dgram_default,
  dns: () => dns_default,
  fs: () => fs_exports,
  ipc: () => ipc_default,
  net: () => net_exports,
  os: () => os_default,
  stream: () => stream_exports
});
module.exports = __toCommonJS(io_exports);
var import_buffer5 = __toESM(require_buffer(), 1);

// stream.js
var stream_exports = {};
__export(stream_exports, {
  Duplex: () => Duplex,
  PassThrough: () => PassThrough,
  Readable: () => Readable,
  Stream: () => Stream,
  Transform: () => Transform,
  Writable: () => Writable,
  isStream: () => isStream,
  isStreamx: () => isStreamx,
  pipeline: () => pipeline,
  pipelinePromise: () => pipelinePromise
});

// events.js
var R = typeof Reflect === "object" ? Reflect : null;
var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
};
var ReflectOwnKeys;
if (R && typeof R.ownKeys === "function") {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target);
  };
}
function ProcessEmitWarning(warning) {
  if (console && console.warn)
    console.warn(warning);
}
var NumberIsNaN = Number.isNaN;
function EventEmitter() {
  EventEmitter.init.call(this);
}
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
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
  }
  this._maxListeners = n;
  return this;
};
function _getMaxListeners(that) {
  if (that._maxListeners === void 0) {
    return EventEmitter.defaultMaxListeners;
  }
  return that._maxListeners;
}
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};
EventEmitter.prototype.emit = function emit(type2) {
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
    const err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
    err.context = er;
    throw err;
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
};
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
EventEmitter.prototype.addListener = function addListener(type2, listener) {
  return _addListener(this, type2, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener = function prependListener(type2, listener) {
  return _addListener(this, type2, listener, true);
};
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
function _onceWrap(target, type2, listener) {
  const state = { fired: false, wrapFn: void 0, target, type: type2, listener };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}
EventEmitter.prototype.once = function once(type2, listener) {
  checkListener(listener);
  this.on(type2, _onceWrap(this, type2, listener));
  return this;
};
EventEmitter.prototype.prependOnceListener = function prependOnceListener(type2, listener) {
  checkListener(listener);
  this.prependListener(type2, _onceWrap(this, type2, listener));
  return this;
};
EventEmitter.prototype.removeListener = function removeListener(type2, listener) {
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
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.removeAllListeners = function removeAllListeners(type2) {
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
};
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
EventEmitter.prototype.listeners = function listeners(type2) {
  return _listeners(this, type2, true);
};
EventEmitter.prototype.rawListeners = function rawListeners(type2) {
  return _listeners(this, type2, false);
};
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
EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};
function arrayClone(arr, n) {
  const copy = new Array(n);
  for (let i = 0; i < n; ++i) {
    copy[i] = arr[i];
  }
  return copy;
}
function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) {
    list[index] = list[index + 1];
  }
  list.pop();
}
function unwrapListeners(arr) {
  const ret = new Array(arr.length);
  for (let i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}
function once2(emitter, name) {
  return new Promise(function(resolve2, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }
    function resolver() {
      if (typeof emitter.removeListener === "function") {
        emitter.removeListener("error", errorListener);
      }
      resolve2([].slice.call(arguments));
    }
    ;
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== "error") {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}
function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === "function") {
    eventTargetAgnosticAddListener(emitter, "error", handler, flags);
  }
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === "function") {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === "function") {
    emitter.addEventListener(name, function wrapListener(arg) {
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.once = once2;

// stream.js
var STREAM_DESTROYED = new Error("Stream was destroyed");
var PREMATURE_CLOSE = new Error("Premature close");
var FixedFIFO = class {
  constructor(hwm) {
    if (!(hwm > 0) || (hwm - 1 & hwm) !== 0)
      throw new Error("Max size for a FixedFIFO should be a power of two");
    this.buffer = new Array(hwm);
    this.mask = hwm - 1;
    this.top = 0;
    this.btm = 0;
    this.next = null;
  }
  push(data) {
    if (this.buffer[this.top] !== void 0)
      return false;
    this.buffer[this.top] = data;
    this.top = this.top + 1 & this.mask;
    return true;
  }
  shift() {
    const last = this.buffer[this.btm];
    if (last === void 0)
      return void 0;
    this.buffer[this.btm] = void 0;
    this.btm = this.btm + 1 & this.mask;
    return last;
  }
  isEmpty() {
    return this.buffer[this.btm] === void 0;
  }
};
var FastFIFO = class {
  constructor(hwm) {
    this.hwm = hwm || 16;
    this.head = new FixedFIFO(this.hwm);
    this.tail = this.head;
  }
  push(val) {
    if (!this.head.push(val)) {
      const prev = this.head;
      this.head = prev.next = new FixedFIFO(2 * this.head.buffer.length);
      this.head.push(val);
    }
  }
  shift() {
    const val = this.tail.shift();
    if (val === void 0 && this.tail.next) {
      const next = this.tail.next;
      this.tail.next = null;
      this.tail = next;
      return this.tail.shift();
    }
    return val;
  }
  isEmpty() {
    return this.head.isEmpty();
  }
};
var FIFO = FastFIFO;
var MAX = (1 << 25) - 1;
var OPENING = 1;
var DESTROYING = 2;
var DESTROYED = 4;
var NOT_OPENING = MAX ^ OPENING;
var READ_ACTIVE = 1 << 3;
var READ_PRIMARY = 2 << 3;
var READ_SYNC = 4 << 3;
var READ_QUEUED = 8 << 3;
var READ_RESUMED = 16 << 3;
var READ_PIPE_DRAINED = 32 << 3;
var READ_ENDING = 64 << 3;
var READ_EMIT_DATA = 128 << 3;
var READ_EMIT_READABLE = 256 << 3;
var READ_EMITTED_READABLE = 512 << 3;
var READ_DONE = 1024 << 3;
var READ_NEXT_TICK = 2049 << 3;
var READ_NEEDS_PUSH = 4096 << 3;
var READ_NOT_ACTIVE = MAX ^ READ_ACTIVE;
var READ_NON_PRIMARY = MAX ^ READ_PRIMARY;
var READ_NON_PRIMARY_AND_PUSHED = MAX ^ (READ_PRIMARY | READ_NEEDS_PUSH);
var READ_NOT_SYNC = MAX ^ READ_SYNC;
var READ_PUSHED = MAX ^ READ_NEEDS_PUSH;
var READ_PAUSED = MAX ^ READ_RESUMED;
var READ_NOT_QUEUED = MAX ^ (READ_QUEUED | READ_EMITTED_READABLE);
var READ_NOT_ENDING = MAX ^ READ_ENDING;
var READ_PIPE_NOT_DRAINED = MAX ^ (READ_RESUMED | READ_PIPE_DRAINED);
var READ_NOT_NEXT_TICK = MAX ^ READ_NEXT_TICK;
var WRITE_ACTIVE = 1 << 16;
var WRITE_PRIMARY = 2 << 16;
var WRITE_SYNC = 4 << 16;
var WRITE_QUEUED = 8 << 16;
var WRITE_UNDRAINED = 16 << 16;
var WRITE_DONE = 32 << 16;
var WRITE_EMIT_DRAIN = 64 << 16;
var WRITE_NEXT_TICK = 129 << 16;
var WRITE_FINISHING = 256 << 16;
var WRITE_NOT_ACTIVE = MAX ^ WRITE_ACTIVE;
var WRITE_NOT_SYNC = MAX ^ WRITE_SYNC;
var WRITE_NON_PRIMARY = MAX ^ WRITE_PRIMARY;
var WRITE_NOT_FINISHING = MAX ^ WRITE_FINISHING;
var WRITE_DRAINED = MAX ^ WRITE_UNDRAINED;
var WRITE_NOT_QUEUED = MAX ^ WRITE_QUEUED;
var WRITE_NOT_NEXT_TICK = MAX ^ WRITE_NEXT_TICK;
var ACTIVE = READ_ACTIVE | WRITE_ACTIVE;
var NOT_ACTIVE = MAX ^ ACTIVE;
var DONE = READ_DONE | WRITE_DONE;
var DESTROY_STATUS = DESTROYING | DESTROYED;
var OPEN_STATUS = DESTROY_STATUS | OPENING;
var AUTO_DESTROY = DESTROY_STATUS | DONE;
var NON_PRIMARY = WRITE_NON_PRIMARY & READ_NON_PRIMARY;
var TICKING = (WRITE_NEXT_TICK | READ_NEXT_TICK) & NOT_ACTIVE;
var ACTIVE_OR_TICKING = ACTIVE | TICKING;
var IS_OPENING = OPEN_STATUS | TICKING;
var READ_PRIMARY_STATUS = OPEN_STATUS | READ_ENDING | READ_DONE;
var READ_STATUS = OPEN_STATUS | READ_DONE | READ_QUEUED;
var READ_FLOWING = READ_RESUMED | READ_PIPE_DRAINED;
var READ_ACTIVE_AND_SYNC = READ_ACTIVE | READ_SYNC;
var READ_ACTIVE_AND_SYNC_AND_NEEDS_PUSH = READ_ACTIVE | READ_SYNC | READ_NEEDS_PUSH;
var READ_PRIMARY_AND_ACTIVE = READ_PRIMARY | READ_ACTIVE;
var READ_ENDING_STATUS = OPEN_STATUS | READ_ENDING | READ_QUEUED;
var READ_EMIT_READABLE_AND_QUEUED = READ_EMIT_READABLE | READ_QUEUED;
var READ_READABLE_STATUS = OPEN_STATUS | READ_EMIT_READABLE | READ_QUEUED | READ_EMITTED_READABLE;
var SHOULD_NOT_READ = OPEN_STATUS | READ_ACTIVE | READ_ENDING | READ_DONE | READ_NEEDS_PUSH;
var READ_BACKPRESSURE_STATUS = DESTROY_STATUS | READ_ENDING | READ_DONE;
var WRITE_PRIMARY_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_DONE;
var WRITE_QUEUED_AND_UNDRAINED = WRITE_QUEUED | WRITE_UNDRAINED;
var WRITE_QUEUED_AND_ACTIVE = WRITE_QUEUED | WRITE_ACTIVE;
var WRITE_DRAIN_STATUS = WRITE_QUEUED | WRITE_UNDRAINED | OPEN_STATUS | WRITE_ACTIVE;
var WRITE_STATUS = OPEN_STATUS | WRITE_ACTIVE | WRITE_QUEUED;
var WRITE_PRIMARY_AND_ACTIVE = WRITE_PRIMARY | WRITE_ACTIVE;
var WRITE_ACTIVE_AND_SYNC = WRITE_ACTIVE | WRITE_SYNC;
var WRITE_FINISHING_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_QUEUED;
var WRITE_BACKPRESSURE_STATUS = WRITE_UNDRAINED | DESTROY_STATUS | WRITE_FINISHING | WRITE_DONE;
var asyncIterator = Symbol.asyncIterator || Symbol.for("asyncIterator");
var WritableState = class {
  constructor(stream, { highWaterMark = 16384, map = null, mapWritable, byteLength, byteLengthWritable } = {}) {
    this.stream = stream;
    this.queue = new FIFO();
    this.highWaterMark = highWaterMark;
    this.buffered = 0;
    this.error = null;
    this.pipeline = null;
    this.byteLength = byteLengthWritable || byteLength || defaultByteLength;
    this.map = mapWritable || map;
    this.afterWrite = afterWrite.bind(this);
    this.afterUpdateNextTick = updateWriteNT.bind(this);
  }
  get ended() {
    return (this.stream._duplexState & WRITE_DONE) !== 0;
  }
  push(data) {
    if (this.map !== null)
      data = this.map(data);
    this.buffered += this.byteLength(data);
    this.queue.push(data);
    if (this.buffered < this.highWaterMark) {
      this.stream._duplexState |= WRITE_QUEUED;
      return true;
    }
    this.stream._duplexState |= WRITE_QUEUED_AND_UNDRAINED;
    return false;
  }
  shift() {
    const data = this.queue.shift();
    const stream = this.stream;
    this.buffered -= this.byteLength(data);
    if (this.buffered === 0)
      stream._duplexState &= WRITE_NOT_QUEUED;
    return data;
  }
  end(data) {
    if (typeof data === "function")
      this.stream.once("finish", data);
    else if (data !== void 0 && data !== null)
      this.push(data);
    this.stream._duplexState = (this.stream._duplexState | WRITE_FINISHING) & WRITE_NON_PRIMARY;
  }
  autoBatch(data, cb) {
    const buffer2 = [];
    const stream = this.stream;
    buffer2.push(data);
    while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED_AND_ACTIVE) {
      buffer2.push(stream._writableState.shift());
    }
    if ((stream._duplexState & OPEN_STATUS) !== 0)
      return cb(null);
    stream._writev(buffer2, cb);
  }
  update() {
    const stream = this.stream;
    while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED) {
      const data = this.shift();
      stream._duplexState |= WRITE_ACTIVE_AND_SYNC;
      stream._write(data, this.afterWrite);
      stream._duplexState &= WRITE_NOT_SYNC;
    }
    if ((stream._duplexState & WRITE_PRIMARY_AND_ACTIVE) === 0)
      this.updateNonPrimary();
  }
  updateNonPrimary() {
    const stream = this.stream;
    if ((stream._duplexState & WRITE_FINISHING_STATUS) === WRITE_FINISHING) {
      stream._duplexState = (stream._duplexState | WRITE_ACTIVE) & WRITE_NOT_FINISHING;
      stream._final(afterFinal.bind(this));
      return;
    }
    if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
      if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
        stream._duplexState |= ACTIVE;
        stream._destroy(afterDestroy.bind(this));
      }
      return;
    }
    if ((stream._duplexState & IS_OPENING) === OPENING) {
      stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING;
      stream._open(afterOpen.bind(this));
    }
  }
  updateNextTick() {
    if ((this.stream._duplexState & WRITE_NEXT_TICK) !== 0)
      return;
    this.stream._duplexState |= WRITE_NEXT_TICK;
    queueMicrotask(this.afterUpdateNextTick);
  }
};
var ReadableState = class {
  constructor(stream, { highWaterMark = 16384, map = null, mapReadable, byteLength, byteLengthReadable } = {}) {
    this.stream = stream;
    this.queue = new FIFO();
    this.highWaterMark = highWaterMark;
    this.buffered = 0;
    this.error = null;
    this.pipeline = null;
    this.byteLength = byteLengthReadable || byteLength || defaultByteLength;
    this.map = mapReadable || map;
    this.pipeTo = null;
    this.afterRead = afterRead.bind(this);
    this.afterUpdateNextTick = updateReadNT.bind(this);
  }
  get ended() {
    return (this.stream._duplexState & READ_DONE) !== 0;
  }
  pipe(pipeTo, cb) {
    if (this.pipeTo !== null)
      throw new Error("Can only pipe to one destination");
    this.stream._duplexState |= READ_PIPE_DRAINED;
    this.pipeTo = pipeTo;
    this.pipeline = new Pipeline(this.stream, pipeTo, cb || null);
    if (cb)
      this.stream.on("error", noop);
    if (isStreamx(pipeTo)) {
      pipeTo._writableState.pipeline = this.pipeline;
      if (cb)
        pipeTo.on("error", noop);
      pipeTo.on("finish", this.pipeline.finished.bind(this.pipeline));
    } else {
      const onerror = this.pipeline.done.bind(this.pipeline, pipeTo);
      const onclose = this.pipeline.done.bind(this.pipeline, pipeTo, null);
      pipeTo.on("error", onerror);
      pipeTo.on("close", onclose);
      pipeTo.on("finish", this.pipeline.finished.bind(this.pipeline));
    }
    pipeTo.on("drain", afterDrain.bind(this));
    this.stream.emit("piping", pipeTo);
    pipeTo.emit("pipe", this.stream);
  }
  push(data) {
    const stream = this.stream;
    if (data === null) {
      this.highWaterMark = 0;
      stream._duplexState = (stream._duplexState | READ_ENDING) & READ_NON_PRIMARY_AND_PUSHED;
      return false;
    }
    if (this.map !== null)
      data = this.map(data);
    this.buffered += this.byteLength(data);
    this.queue.push(data);
    stream._duplexState = (stream._duplexState | READ_QUEUED) & READ_PUSHED;
    return this.buffered < this.highWaterMark;
  }
  shift() {
    const data = this.queue.shift();
    this.buffered -= this.byteLength(data);
    if (this.buffered === 0)
      this.stream._duplexState &= READ_NOT_QUEUED;
    return data;
  }
  unshift(data) {
    let tail;
    const pending = [];
    while ((tail = this.queue.shift()) !== void 0) {
      pending.push(tail);
    }
    this.push(data);
    for (let i = 0; i < pending.length; i++) {
      this.queue.push(pending[i]);
    }
  }
  read() {
    const stream = this.stream;
    if ((stream._duplexState & READ_STATUS) === READ_QUEUED) {
      const data = this.shift();
      if (this.pipeTo !== null && this.pipeTo.write(data) === false)
        stream._duplexState &= READ_PIPE_NOT_DRAINED;
      if ((stream._duplexState & READ_EMIT_DATA) !== 0)
        stream.emit("data", data);
      return data;
    }
    return null;
  }
  drain() {
    const stream = this.stream;
    while ((stream._duplexState & READ_STATUS) === READ_QUEUED && (stream._duplexState & READ_FLOWING) !== 0) {
      const data = this.shift();
      if (this.pipeTo !== null && this.pipeTo.write(data) === false)
        stream._duplexState &= READ_PIPE_NOT_DRAINED;
      if ((stream._duplexState & READ_EMIT_DATA) !== 0)
        stream.emit("data", data);
    }
  }
  update() {
    const stream = this.stream;
    this.drain();
    while (this.buffered < this.highWaterMark && (stream._duplexState & SHOULD_NOT_READ) === 0) {
      stream._duplexState |= READ_ACTIVE_AND_SYNC_AND_NEEDS_PUSH;
      stream._read(this.afterRead);
      stream._duplexState &= READ_NOT_SYNC;
      if ((stream._duplexState & READ_ACTIVE) === 0)
        this.drain();
    }
    if ((stream._duplexState & READ_READABLE_STATUS) === READ_EMIT_READABLE_AND_QUEUED) {
      stream._duplexState |= READ_EMITTED_READABLE;
      stream.emit("readable");
    }
    if ((stream._duplexState & READ_PRIMARY_AND_ACTIVE) === 0)
      this.updateNonPrimary();
  }
  updateNonPrimary() {
    const stream = this.stream;
    if ((stream._duplexState & READ_ENDING_STATUS) === READ_ENDING) {
      stream._duplexState = (stream._duplexState | READ_DONE) & READ_NOT_ENDING;
      stream.emit("end");
      if ((stream._duplexState & AUTO_DESTROY) === DONE)
        stream._duplexState |= DESTROYING;
      if (this.pipeTo !== null)
        this.pipeTo.end();
    }
    if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
      if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
        stream._duplexState |= ACTIVE;
        stream._destroy(afterDestroy.bind(this));
      }
      return;
    }
    if ((stream._duplexState & IS_OPENING) === OPENING) {
      stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING;
      stream._open(afterOpen.bind(this));
    }
  }
  updateNextTick() {
    if ((this.stream._duplexState & READ_NEXT_TICK) !== 0)
      return;
    this.stream._duplexState |= READ_NEXT_TICK;
    queueMicrotask(this.afterUpdateNextTick);
  }
};
var TransformState = class {
  constructor(stream) {
    this.data = null;
    this.afterTransform = afterTransform.bind(stream);
    this.afterFinal = null;
  }
};
var Pipeline = class {
  constructor(src, dst, cb) {
    this.from = src;
    this.to = dst;
    this.afterPipe = cb;
    this.error = null;
    this.pipeToFinished = false;
  }
  finished() {
    this.pipeToFinished = true;
  }
  done(stream, err) {
    if (err)
      this.error = err;
    if (stream === this.to) {
      this.to = null;
      if (this.from !== null) {
        if ((this.from._duplexState & READ_DONE) === 0 || !this.pipeToFinished) {
          this.from.destroy(this.error || new Error("Writable stream closed prematurely"));
        }
        return;
      }
    }
    if (stream === this.from) {
      this.from = null;
      if (this.to !== null) {
        if ((stream._duplexState & READ_DONE) === 0) {
          this.to.destroy(this.error || new Error("Readable stream closed before ending"));
        }
        return;
      }
    }
    if (this.afterPipe !== null)
      this.afterPipe(this.error);
    this.to = this.from = this.afterPipe = null;
  }
};
function afterDrain() {
  this.stream._duplexState |= READ_PIPE_DRAINED;
  if ((this.stream._duplexState & READ_ACTIVE_AND_SYNC) === 0)
    this.updateNextTick();
}
function afterFinal(err) {
  const stream = this.stream;
  if (err)
    stream.destroy(err);
  if ((stream._duplexState & DESTROY_STATUS) === 0) {
    stream._duplexState |= WRITE_DONE;
    stream.emit("finish");
  }
  if ((stream._duplexState & AUTO_DESTROY) === DONE) {
    stream._duplexState |= DESTROYING;
  }
  stream._duplexState &= WRITE_NOT_ACTIVE;
  this.update();
}
function afterDestroy(err) {
  const stream = this.stream;
  if (!err && this.error !== STREAM_DESTROYED)
    err = this.error;
  if (err)
    stream.emit("error", err);
  stream._duplexState |= DESTROYED;
  stream.emit("close");
  const rs = stream._readableState;
  const ws = stream._writableState;
  if (rs !== null && rs.pipeline !== null)
    rs.pipeline.done(stream, err);
  if (ws !== null && ws.pipeline !== null)
    ws.pipeline.done(stream, err);
}
function afterWrite(err) {
  const stream = this.stream;
  if (err)
    stream.destroy(err);
  stream._duplexState &= WRITE_NOT_ACTIVE;
  if ((stream._duplexState & WRITE_DRAIN_STATUS) === WRITE_UNDRAINED) {
    stream._duplexState &= WRITE_DRAINED;
    if ((stream._duplexState & WRITE_EMIT_DRAIN) === WRITE_EMIT_DRAIN) {
      stream.emit("drain");
    }
  }
  if ((stream._duplexState & WRITE_SYNC) === 0)
    this.update();
}
function afterRead(err) {
  if (err)
    this.stream.destroy(err);
  this.stream._duplexState &= READ_NOT_ACTIVE;
  if ((this.stream._duplexState & READ_SYNC) === 0)
    this.update();
}
function updateReadNT() {
  this.stream._duplexState &= READ_NOT_NEXT_TICK;
  this.update();
}
function updateWriteNT() {
  this.stream._duplexState &= WRITE_NOT_NEXT_TICK;
  this.update();
}
function afterOpen(err) {
  const stream = this.stream;
  if (err)
    stream.destroy(err);
  if ((stream._duplexState & DESTROYING) === 0) {
    if ((stream._duplexState & READ_PRIMARY_STATUS) === 0)
      stream._duplexState |= READ_PRIMARY;
    if ((stream._duplexState & WRITE_PRIMARY_STATUS) === 0)
      stream._duplexState |= WRITE_PRIMARY;
    stream.emit("open");
  }
  stream._duplexState &= NOT_ACTIVE;
  if (stream._writableState !== null) {
    stream._writableState.update();
  }
  if (stream._readableState !== null) {
    stream._readableState.update();
  }
}
function afterTransform(err, data) {
  if (data !== void 0 && data !== null)
    this.push(data);
  this._writableState.afterWrite(err);
}
var Stream = class extends EventEmitter {
  constructor(opts) {
    super();
    this._duplexState = 0;
    this._readableState = null;
    this._writableState = null;
    if (opts) {
      if (opts.open)
        this._open = opts.open;
      if (opts.destroy)
        this._destroy = opts.destroy;
      if (opts.predestroy)
        this._predestroy = opts.predestroy;
      if (opts.signal) {
        opts.signal.addEventListener("abort", abort.bind(this));
      }
    }
  }
  _open(cb) {
    cb(null);
  }
  _destroy(cb) {
    cb(null);
  }
  _predestroy() {
  }
  get readable() {
    return this._readableState !== null ? true : void 0;
  }
  get writable() {
    return this._writableState !== null ? true : void 0;
  }
  get destroyed() {
    return (this._duplexState & DESTROYED) !== 0;
  }
  get destroying() {
    return (this._duplexState & DESTROY_STATUS) !== 0;
  }
  destroy(err) {
    if ((this._duplexState & DESTROY_STATUS) === 0) {
      if (!err)
        err = STREAM_DESTROYED;
      this._duplexState = (this._duplexState | DESTROYING) & NON_PRIMARY;
      if (this._readableState !== null) {
        this._readableState.error = err;
        this._readableState.updateNextTick();
      }
      if (this._writableState !== null) {
        this._writableState.error = err;
        this._writableState.updateNextTick();
      }
      this._predestroy();
    }
  }
  on(name, fn) {
    if (this._readableState !== null) {
      if (name === "data") {
        this._duplexState |= READ_EMIT_DATA | READ_RESUMED;
        this._readableState.updateNextTick();
      }
      if (name === "readable") {
        this._duplexState |= READ_EMIT_READABLE;
        this._readableState.updateNextTick();
      }
    }
    if (this._writableState !== null) {
      if (name === "drain") {
        this._duplexState |= WRITE_EMIT_DRAIN;
        this._writableState.updateNextTick();
      }
    }
    return super.on(name, fn);
  }
};
var Readable = class extends Stream {
  constructor(opts) {
    super(opts);
    this._duplexState |= OPENING | WRITE_DONE;
    this._readableState = new ReadableState(this, opts);
    if (opts) {
      if (opts.read)
        this._read = opts.read;
      if (opts.eagerOpen)
        this.resume().pause();
    }
  }
  _read(cb) {
    cb(null);
  }
  pipe(dest, cb) {
    this._readableState.pipe(dest, cb);
    this._readableState.updateNextTick();
    return dest;
  }
  read() {
    this._readableState.updateNextTick();
    return this._readableState.read();
  }
  push(data) {
    this._readableState.updateNextTick();
    return this._readableState.push(data);
  }
  unshift(data) {
    this._readableState.updateNextTick();
    return this._readableState.unshift(data);
  }
  resume() {
    this._duplexState |= READ_RESUMED;
    this._readableState.updateNextTick();
    return this;
  }
  pause() {
    this._duplexState &= READ_PAUSED;
    return this;
  }
  static _fromAsyncIterator(ite, opts) {
    let destroy;
    const rs = new Readable({
      ...opts,
      read(cb) {
        ite.next().then(push).then(cb.bind(null, null)).catch(cb);
      },
      predestroy() {
        destroy = ite.return();
      },
      destroy(cb) {
        destroy.then(cb.bind(null, null)).catch(cb);
      }
    });
    return rs;
    function push(data) {
      if (data.done)
        rs.push(null);
      else
        rs.push(data.value);
    }
  }
  static from(data, opts) {
    if (isReadStreamx(data))
      return data;
    if (data[asyncIterator])
      return this._fromAsyncIterator(data[asyncIterator](), opts);
    if (!Array.isArray(data))
      data = data === void 0 ? [] : [data];
    let i = 0;
    return new Readable({
      ...opts,
      read(cb) {
        this.push(i === data.length ? null : data[i++]);
        cb(null);
      }
    });
  }
  static isBackpressured(rs) {
    return (rs._duplexState & READ_BACKPRESSURE_STATUS) !== 0 || rs._readableState.buffered >= rs._readableState.highWaterMark;
  }
  static isPaused(rs) {
    return (rs._duplexState & READ_RESUMED) === 0;
  }
  [asyncIterator]() {
    const stream = this;
    let error = null;
    let promiseResolve = null;
    let promiseReject = null;
    this.on("error", (err) => {
      error = err;
    });
    this.on("readable", onreadable);
    this.on("close", onclose);
    return {
      [asyncIterator]() {
        return this;
      },
      next() {
        return new Promise(function(resolve2, reject) {
          promiseResolve = resolve2;
          promiseReject = reject;
          const data = stream.read();
          if (data !== null)
            ondata(data);
          else if ((stream._duplexState & DESTROYED) !== 0)
            ondata(null);
        });
      },
      return() {
        return destroy(null);
      },
      throw(err) {
        return destroy(err);
      }
    };
    function onreadable() {
      if (promiseResolve !== null)
        ondata(stream.read());
    }
    function onclose() {
      if (promiseResolve !== null)
        ondata(null);
    }
    function ondata(data) {
      if (promiseReject === null)
        return;
      if (error)
        promiseReject(error);
      else if (data === null && (stream._duplexState & READ_DONE) === 0)
        promiseReject(STREAM_DESTROYED);
      else
        promiseResolve({ value: data, done: data === null });
      promiseReject = promiseResolve = null;
    }
    function destroy(err) {
      stream.destroy(err);
      return new Promise((resolve2, reject) => {
        if (stream._duplexState & DESTROYED)
          return resolve2({ value: void 0, done: true });
        stream.once("close", function() {
          if (err)
            reject(err);
          else
            resolve2({ value: void 0, done: true });
        });
      });
    }
  }
};
var Writable = class extends Stream {
  constructor(opts) {
    super(opts);
    this._duplexState |= OPENING | READ_DONE;
    this._writableState = new WritableState(this, opts);
    if (opts) {
      if (opts.writev)
        this._writev = opts.writev;
      if (opts.write)
        this._write = opts.write;
      if (opts.final)
        this._final = opts.final;
    }
  }
  _writev(batch, cb) {
    cb(null);
  }
  _write(data, cb) {
    this._writableState.autoBatch(data, cb);
  }
  _final(cb) {
    cb(null);
  }
  static isBackpressured(ws) {
    return (ws._duplexState & WRITE_BACKPRESSURE_STATUS) !== 0;
  }
  write(data) {
    this._writableState.updateNextTick();
    return this._writableState.push(data);
  }
  end(data) {
    this._writableState.updateNextTick();
    this._writableState.end(data);
    return this;
  }
};
var Duplex = class extends Readable {
  constructor(opts) {
    super(opts);
    this._duplexState = OPENING;
    this._writableState = new WritableState(this, opts);
    if (opts) {
      if (opts.writev)
        this._writev = opts.writev;
      if (opts.write)
        this._write = opts.write;
      if (opts.final)
        this._final = opts.final;
    }
  }
  _writev(batch, cb) {
    cb(null);
  }
  _write(data, cb) {
    this._writableState.autoBatch(data, cb);
  }
  _final(cb) {
    cb(null);
  }
  write(data) {
    this._writableState.updateNextTick();
    return this._writableState.push(data);
  }
  end(data) {
    this._writableState.updateNextTick();
    this._writableState.end(data);
    return this;
  }
};
var Transform = class extends Duplex {
  constructor(opts) {
    super(opts);
    this._transformState = new TransformState(this);
    if (opts) {
      if (opts.transform)
        this._transform = opts.transform;
      if (opts.flush)
        this._flush = opts.flush;
    }
  }
  _write(data, cb) {
    if (this._readableState.buffered >= this._readableState.highWaterMark) {
      this._transformState.data = data;
    } else {
      this._transform(data, this._transformState.afterTransform);
    }
  }
  _read(cb) {
    if (this._transformState.data !== null) {
      const data = this._transformState.data;
      this._transformState.data = null;
      cb(null);
      this._transform(data, this._transformState.afterTransform);
    } else {
      cb(null);
    }
  }
  _transform(data, cb) {
    cb(null, data);
  }
  _flush(cb) {
    cb(null);
  }
  _final(cb) {
    this._transformState.afterFinal = cb;
    this._flush(transformAfterFlush.bind(this));
  }
};
var PassThrough = class extends Transform {
};
function transformAfterFlush(err, data) {
  const cb = this._transformState.afterFinal;
  if (err)
    return cb(err);
  if (data !== null && data !== void 0)
    this.push(data);
  this.push(null);
  cb(null);
}
function pipelinePromise(...streams) {
  return new Promise((resolve2, reject) => {
    return pipeline(...streams, (err) => {
      if (err)
        return reject(err);
      resolve2();
    });
  });
}
function pipeline(stream, ...streams) {
  const all = Array.isArray(stream) ? [...stream, ...streams] : [stream, ...streams];
  const done = all.length && typeof all[all.length - 1] === "function" ? all.pop() : null;
  if (all.length < 2)
    throw new Error("Pipeline requires at least 2 streams");
  let src = all[0];
  let dest = null;
  let error = null;
  for (let i = 1; i < all.length; i++) {
    dest = all[i];
    if (isStreamx(src)) {
      src.pipe(dest, onerror);
    } else {
      errorHandle(src, true, i > 1, onerror);
      src.pipe(dest);
    }
    src = dest;
  }
  if (done) {
    let fin = false;
    dest.on("finish", () => {
      fin = true;
    });
    dest.on("error", (err) => {
      error = error || err;
    });
    dest.on("close", () => done(error || (fin ? null : PREMATURE_CLOSE)));
  }
  return dest;
  function errorHandle(s, rd, wr, onerror2) {
    s.on("error", onerror2);
    s.on("close", onclose);
    function onclose() {
      if (rd && s._readableState && !s._readableState.ended)
        return onerror2(PREMATURE_CLOSE);
      if (wr && s._writableState && !s._writableState.ended)
        return onerror2(PREMATURE_CLOSE);
    }
  }
  function onerror(err) {
    if (!err || error)
      return;
    error = err;
    for (const s of all) {
      s.destroy(err);
    }
  }
}
function isStream(stream) {
  return !!stream._readableState || !!stream._writableState;
}
function isStreamx(stream) {
  return typeof stream._duplexState === "number" && isStream(stream);
}
function isReadStreamx(stream) {
  return isStreamx(stream) && stream.readable;
}
function isTypedArray(data) {
  return typeof data === "object" && data !== null && typeof data.byteLength === "number";
}
function defaultByteLength(data) {
  return isTypedArray(data) ? data.byteLength : 1024;
}
function noop() {
}
function abort() {
  this.destroy(new Error("Stream aborted."));
}

// dgram.js
var import_buffer2 = __toESM(require_buffer(), 1);

// net.js
var net_exports = {};
__export(net_exports, {
  Server: () => Server,
  Socket: () => Socket,
  connect: () => connect,
  createServer: () => createServer,
  default: () => net_default,
  getNetworkInterfaces: () => getNetworkInterfaces,
  isIPv4: () => isIPv4,
  rand64: () => rand64
});
var _require = typeof require !== "undefined" && require;
var rand64 = () => {
  const method = globalThis.crypto ? globalThis.crypto : _require("crypto").webcrypto;
  return method.getRandomValues(new BigUint64Array(1))[0];
};
var assertType = (name, expected, actual, code) => {
  const msg = `'${name}' must be a '${expected}', received '${actual}'`;
  const err = new TypeError(msg);
  err.code = code;
  throw err;
};
var normalizedArgsSymbol = Symbol("normalizedArgsSymbol");
var kLastWriteQueueSize = Symbol("lastWriteQueueSize");
var normalizeArgs = (args) => {
  let arr;
  if (args.length === 0) {
    arr = [{}, null];
    arr[normalizedArgsSymbol] = true;
    return arr;
  }
  const arg0 = args[0];
  let options = {};
  if (typeof arg0 === "object" && arg0 !== null) {
    options = arg0;
  } else {
    options.port = arg0;
    if (args.length > 1 && typeof args[1] === "string") {
      options.host = args[1];
    }
  }
  const cb = args[args.length - 1];
  if (typeof cb !== "function") {
    arr = [options, null];
  } else {
    arr = [options, cb];
  }
  arr[normalizedArgsSymbol] = true;
  return arr;
};
var Server = class extends EventEmitter {
  constructor(options, handler) {
    super();
    if (typeof options === "undefined") {
      options = handler;
    }
    this._connections = 0;
    this._serverId = rand64();
  }
  onconnection(data) {
    const socket = new Socket(data);
    if (this.maxConnections && this._connections >= this.maxConnections) {
      socket.close(data);
      return;
    }
    this._connections++;
    socket._server = this;
    this.emit("connection", socket);
  }
  listen(port, address, cb) {
    ;
    (async (opts) => {
      const { err, data } = await window._ipc.send("tcpCreateServer", opts);
      if (err && !cb) {
        this.emit("error", err);
        return;
      }
      this._address = { port: data.port, address: data.address, family: data.family };
      this.connections = {};
      window._ipc.streams[opts.serverId] = this;
      if (cb)
        return cb(null, data);
      this.emit("listening", data);
    })({ port, address, serverId: this.serverId });
    return this;
  }
  address() {
    return this._address;
  }
  close(cb) {
    const params = {
      serverId: this._serverId
    };
    (async () => {
      const { err } = await window._ipc.send("tcpClose", params);
      delete window._ipc.streams[this._serverId];
      if (err && !cb)
        this.emit("error", err);
      else if (cb)
        cb(err);
    })();
  }
  getConnections(cb) {
    assertType("Callback", "function", typeof cb, "ERR_INVALID_CALLBACK");
    const params = {
      serverId: this._serverId
    };
    (async () => {
      const {
        err,
        data
      } = await window._ipc.send("tcpServerGetConnections", params);
      if (cb)
        cb(err, data);
    })();
  }
  unref() {
    return this;
  }
};
var Socket = class extends Duplex {
  constructor(options) {
    super();
    this._server = null;
    this._address = null;
    this.allowHalfOpen = options.allowHalfOpen === true;
    this._flowing = false;
  }
  setNoDelay(enable) {
    const params = {
      clientId: this.clientId,
      enable
    };
    window._ipc.send("tcpSetNoDelay", params);
  }
  setKeepAlive(enabled) {
    const params = {
      clientId: this.clientId,
      enabled
    };
    window._ipc.send("tcpSetKeepAlive", params);
  }
  _onTimeout() {
    const handle = this._handle;
    const lastWriteQueueSize = this[kLastWriteQueueSize];
    if (lastWriteQueueSize > 0 && handle) {
      const { writeQueueSize } = handle;
      if (lastWriteQueueSize !== writeQueueSize) {
        this[kLastWriteQueueSize] = writeQueueSize;
        this._unrefTimer();
        return;
      }
    }
    this.emit("timeout");
  }
  address() {
    return { ...this._address };
  }
  _final(cb) {
    if (this.pending) {
      return this.once("connect", () => this._final(cb));
    }
    const params = {
      clientId: this.clientId
    };
    (async () => {
      const { err, data } = await window._ipc.send("tcpShutdown", params);
      if (cb)
        cb(err, data);
    })();
  }
  _destroy(cb) {
    if (this.destroyed)
      return;
    (async () => {
      await window._ipc.send("tcpClose", { clientId: this.clientId });
      if (this._server) {
        this._server._connections--;
        if (this._server._connections === 0) {
          this._server.emit("close");
        }
      }
      cb();
    })();
  }
  destroySoon() {
    if (this.writable)
      this.end();
    if (this.writableFinished) {
      this.destroy();
    } else {
      this.once("finish", this.destroy);
    }
  }
  _writev(data, cb) {
    ;
    (async () => {
      const allBuffers = data.allBuffers;
      let chunks;
      if (allBuffers) {
        chunks = data;
        for (let i = 0; i < data.length; i++) {
          data[i] = data[i].chunk;
        }
      } else {
        chunks = new Array(data.length << 1);
        for (let i = 0; i < data.length; i++) {
          const entry = data[i];
          chunks[i * 2] = entry.chunk;
          chunks[i * 2 + 1] = entry.encoding;
        }
      }
      const requests = [];
      for (const chunk of chunks) {
        const params = {
          clientId: this.clientId,
          data: chunk
        };
        requests.push(window._ipc.send("tcpSend", params));
      }
      try {
        await Promise.all(requests);
      } catch (err) {
        this.destroy(err);
        cb(err);
        return;
      }
      cb();
    })();
  }
  _write(data, cb) {
    const params = {
      clientId: this.clientId,
      data
    };
    (async () => {
      const { err, data: data2 } = await window._ipc.send("tcpSend", params);
      console.log("_write", err, data2);
      cb(err);
    })();
  }
  __write(data) {
    if (data.length && !this.destroyed) {
      if (!this.push(data)) {
        const params = {
          clientId: this.clientId
        };
        this._flowing = false;
        window._ipc.send("tcpReadStop", params);
      }
    } else {
      if (!this.allowHalfOpen) {
        this.destroySoon();
      }
      this.push(null);
      this.read(0);
    }
  }
  _read(cb) {
    if (this._flowing)
      return cb();
    this._flowing = true;
    const params = {
      clientId: this.clientId
    };
    (async () => {
      const { err } = await window._ipc.send("tcpReadStart", params);
      if (err) {
        this._destroy();
      } else {
        cb();
      }
    })();
  }
  pause() {
    Duplex.prototype.pause.call(this);
    if (this._flowing) {
      this._flowing = false;
      window._ipc.send("tcpReadStop", { clientId: this.clientId });
    }
    return this;
  }
  resume() {
    Duplex.prototype.resume.call(this);
    if (!this._flowing) {
      this._flowing = true;
      window._ipc.send("tcpReadStart", { clientId: this.clientId });
    }
    return this;
  }
  connect(...args) {
    const [options, cb] = normalizeArgs(args);
    (async () => {
      const params = {
        port: options.port,
        address: options.host
      };
      this.clientId = rand64();
      const { err, data } = await window._ipc.send("tcpConnect", params);
      if (err) {
        if (cb)
          cb(err);
        else
          this.emit("error", err);
        return;
      }
      this.remotePort = data.port;
      this.remoteAddress = data.address;
      window._ipc.streams[this.clientId] = this;
      if (cb)
        cb(null, this);
    })();
    return this;
  }
  unref() {
    return this;
  }
};
var connect = (...args) => {
  const [options, callback] = normalizeArgs(args);
  const socket = new Socket(options);
  socket.connect(options, callback);
  return socket;
};
var createServer = (...args) => {
  return new Server(...args);
};
var getNetworkInterfaces = (o) => window._ipc.send("getNetworkInterfaces", o);
var v4Seg = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
var v4Str = `(${v4Seg}[.]){3}${v4Seg}`;
var IPv4Reg = new RegExp(`^${v4Str}$`);
var isIPv4 = (s) => {
  return IPv4Reg.test(s);
};
var net_default = net_exports;

// dns.js
var lookup = async (hostname, opts, cb) => {
  const params = {
    hostname
  };
  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  const { err, data } = await window._ipc.send("dnsLookup", params);
  if (err && cb)
    return cb(err);
  if (cb)
    return cb(null, data);
  return { err, data };
};
var dns_default = {
  lookup
};

// util.js
var import_buffer = __toESM(require_buffer(), 1);
var TypedArray = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor;
function isTypedArray2(object) {
  return object instanceof TypedArray;
}
function isBufferLike(object) {
  return isTypedArray2(object) || import_buffer.Buffer.isBuffer(object);
}
function isFunction(value) {
  return typeof value === "function" && !/class/.test(value.toString());
}
function toProperCase(string) {
  return string[0].toUpperCase() + string.slice(1);
}
var tmp = new BigUint64Array(1);
function rand642() {
  return globalThis.crypto.getRandomValues(tmp)[0];
}
function InvertedPromise() {
  const context = {};
  const promise = new Promise((resolve2, reject) => {
    Object.assign(context, {
      resolve(value) {
        promise.value = value;
        return resolve2(value);
      },
      reject(error) {
        promise.error = error;
        return reject(error);
      }
    });
  });
  return Object.assign(promise, context);
}

// dgram.js
var isArrayBufferView = (buf) => {
  return !import_buffer2.Buffer.isBuffer(buf) && ArrayBuffer.isView(buf);
};
var fixBufferList = (list) => {
  const newlist = new Array(list.length);
  for (let i = 0, l = list.length; i < l; i++) {
    const buf = list[i];
    if (typeof buf === "string") {
      newlist[i] = import_buffer2.Buffer.from(buf);
    } else if (!isArrayBufferView(buf)) {
      return null;
    } else {
      newlist[i] = import_buffer2.Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
    }
  }
  return newlist;
};
var Socket2 = class extends EventEmitter {
  constructor(options) {
    super();
    this.serverId = rand642();
    this.clientId = rand642();
    this.state = {
      recvBufferSize: options.recvBufferSize,
      sendBufferSize: options.sendBufferSize,
      connectState: 2,
      reuseAddr: options.reuseAddr,
      ipv6Only: options.ipv6Only
    };
    this.connect();
  }
  async _getSockData() {
    const { err, data } = await window._ipc.send("udpGetSockName", {
      id: this.clientId
    });
    if (err)
      return { err };
    return { data };
  }
  async _getPeerData() {
    const { err, data } = await window._ipc.send("udpGetPeerName", {
      id: this.clientId
    });
    if (err)
      return { err };
    return { data };
  }
  async bind(arg1, arg2, cb) {
    let options = {};
    if (typeof arg2 === "function") {
      cb = arg2;
      options.address = void 0;
    }
    if (typeof arg1 === "number") {
      options.port = arg1;
      options.address = arg2;
    } else if (typeof arg1 === "object") {
      options = { ...arg1 };
    } else {
      throw new Error("invalid arguments");
    }
    if (this.clientId) {
      const err = new Error("already bound");
      if (cb)
        return cb(err);
      return { err };
    }
    function removeListeners() {
      this.removeListener("close", removeListeners);
      this.removeListener("error", removeListeners);
    }
    function onListening() {
      Function.prototype.call(removeListeners, this);
      if (cb)
        Function.prototype.call(cb, this);
    }
    this.on("error", removeListeners);
    this.on("listening", onListening);
    if (!options.address) {
      if (this.type === "udp4") {
        options.address = "0.0.0.0";
      } else {
        options.address = "::";
      }
    } else if (!isIPv4(options.address)) {
      const {
        err: errLookup,
        data: dataLookup
      } = await dns_default.lookup(options.address);
      if (errLookup) {
        this.emit("error", errLookup);
        return { err: errLookup };
      }
      options.address = dataLookup.ip;
    }
    const { err: errBind, data } = await window._ipc.send("udpBind", {
      serverId: this.serverId,
      address: options.address,
      port: options.port || 0,
      reuseAddr: options.reuseAddr,
      ipv6Only: options.ipv6Only
    });
    if (errBind) {
      this.emit("error", errBind);
      return { err: errBind };
    }
    const { data: sockData } = await this._getSockData({
      connectionId: this.serverId
    });
    this._address = sockData.address;
    this._port = sockData.port;
    this._family = sockData.family;
    const listener = (e) => {
      if (e.detail.params.serverId === this.serverId) {
        this.emit("message", e.detail.data);
        if (e.detal.params.EOF)
          window.removeListener("data", listener);
      }
    };
    window.addEventListener("data", listener);
    const {
      err: errReadStart
    } = await window._ipc.send("updReadStart", { serverId: this.serverId });
    if (errReadStart) {
      if (cb)
        return cb(errReadStart);
      return { err: errReadStart };
    }
    if (cb)
      cb(null);
    return { data };
  }
  async connect(arg1, arg2, cb) {
    if (this.clientId) {
      const err = new Error("already connected");
      if (cb)
        return cb(err);
      return { err };
    }
    const port = arg1;
    let address = arg2;
    if (typeof arg2 === "function") {
      cb = arg2;
      address = void 0;
    }
    const {
      err: errBind
    } = await this.bind({ port: 0 }, null);
    if (errBind) {
      if (cb)
        return cb(errBind);
      return { err: errBind };
    }
    this.once("connect", cb);
    const {
      err: errLookup,
      data: dataLookup
    } = await dns_default.lookup(address);
    if (errLookup) {
      this.emit("error", errLookup);
      return { err: errLookup };
    }
    const {
      err: errConnect,
      dataConnect
    } = await window._ipc.send("udpConnect", {
      ip: dataLookup.ip,
      port: port || 0
    });
    if (errConnect) {
      this.emit("error", errConnect);
      return { err: errConnect };
    }
    this.state.connectState = 2;
    this.emit("connect");
    const {
      err: errGetPeerData,
      data: dataPeerData
    } = await this._getPeerData({ clientId: dataConnect.clientId });
    if (errGetPeerData) {
      this.emit("error", errGetPeerData);
      return { err: errGetPeerData };
    }
    this._remoteAddress = dataPeerData.address;
    this._remotePort = dataPeerData.port;
    this._remoteFamily = dataPeerData.family;
    if (cb)
      cb(null);
    return {};
  }
  async disconnect() {
    const { err: errConnect } = await window._ipc.send("udpDisconnect", {
      ip: this._remoteAddress,
      port: this._remotePort || 0
    });
    if (errConnect) {
      this.emit("error", errConnect);
      return { err: errConnect };
    }
    if (this.connectedState === 2) {
      this.emit("close");
    }
    return {};
  }
  async send(buffer2, ...args) {
    let offset, length, port, address, cb;
    const connected = this.state.connectState === 2;
    if (typeof buffer2 === "string") {
      buffer2 = import_buffer2.Buffer.from(buffer2);
    }
    const index = args.findIndex((arg) => typeof arg === "function");
    if (index > -1)
      cb = args[index];
    if (typeof args[2] === "number") {
      [offset, length, port, address] = args.slice(0, index);
      if (connected && (port || address)) {
        throw new Error("Already connected");
      }
      buffer2 = import_buffer2.Buffer.from(buffer2.buffer, buffer2.byteOffset + offset, length);
    } else {
      [port, address] = args.slice(0, index);
    }
    let list;
    if (!Array.isArray(buffer2)) {
      if (typeof buffer2 === "string") {
        list = [import_buffer2.Buffer.from(buffer2)];
      } else if (!isArrayBufferView(buffer2)) {
        list = import_buffer2.Buffer.from(buffer2);
      } else {
        list = [buffer2];
      }
    } else if (!(list = fixBufferList(buffer2))) {
      throw new Error("Invalid buffer");
    }
    const { err: errBind } = await this.bind({ port: 0 }, null);
    if (errBind) {
      if (cb)
        return cb(errBind);
      return { err: errBind };
    }
    if (list.length === 0) {
      list.push(import_buffer2.Buffer.alloc(0));
    }
    if (!connected) {
      const {
        err: errLookup,
        data: dataLookup
      } = await dns_default.lookup(address);
      if (errLookup) {
        if (cb)
          return cb(errLookup);
        return { err: errLookup };
      }
      address = dataLookup.ip;
    }
    const { err: errSend } = await window._ipc.send("udpSend", {
      state: this.state,
      address,
      port,
      list
    });
    if (errSend) {
      if (cb)
        return cb(errSend);
      return { err: errSend };
    }
    if (cb)
      cb(null);
    return {};
  }
  async close(cb) {
    if (typeof cb === "function") {
      this.on("close", cb);
    }
    const { err } = await window._ipc.send("udpClose", {
      id: this.clientId
    });
    if (err && cb)
      return cb(err);
    if (err)
      return { err };
    this.emit("close");
    return {};
  }
  address() {
    return {
      remoteAddress: this._address,
      remotePort: this._port,
      remoteFamily: this._family
    };
  }
  remoteAddress() {
    return {
      remoteAddress: this._remoteAddress,
      remotePort: this._remotePort,
      remoteFamily: this._remoteFamily
    };
  }
  setRecvBufferSize(size) {
    this.state.recvBufferSize = size;
  }
  setSendBufferSize(size) {
    this.state.sendBufferSize = size;
  }
  getRecvBufferSize() {
    return this.state.recvBufferSize;
  }
  getSendBufferSize() {
    return this.state.sendBufferSize;
  }
  setBroadcast() {
    throw new Error("not implemented");
  }
  setTTL() {
    throw new Error("not implemented");
  }
  setMulticastTTL() {
    throw new Error("not implemented");
  }
  setMulticastLoopback() {
    throw new Error("not implemented");
  }
  setMulticastMembership() {
    throw new Error("not implemented");
  }
  setMulticastInterface() {
    throw new Error("not implemented");
  }
  addMembership() {
    throw new Error("not implemented");
  }
  dropMembership() {
    throw new Error("not implemented");
  }
  addSourceSpecificMembership() {
    throw new Error("not implemented");
  }
  dropSourceSpecificMembership() {
    throw new Error("not implemented");
  }
  ref() {
    return this;
  }
  unref() {
    return this;
  }
};
var createSocket = (type2, listener) => {
  return new Socket2(type2, listener);
};
var dgram_default = {
  Socket: Socket2,
  createSocket
};

// fs/index.js
var fs_exports = {};
__export(fs_exports, {
  Dir: () => Dir,
  Dirent: () => Dirent,
  FileHandle: () => FileHandle,
  ReadStream: () => ReadStream,
  Stats: () => Stats,
  WriteStream: () => WriteStream,
  access: () => access2,
  appendFile: () => appendFile2,
  chmod: () => chmod2,
  chown: () => chown2,
  close: () => close,
  constants: () => constants_default,
  copyFile: () => copyFile2,
  createReadStream: () => createReadStream,
  createWriteStream: () => createWriteStream,
  default: () => fs_default,
  fstat: () => fstat,
  lchmod: () => lchmod2,
  lchown: () => lchown2,
  link: () => link2,
  lstat: () => lstat2,
  lutimes: () => lutimes2,
  mkdir: () => mkdir2,
  open: () => open2,
  opendir: () => opendir2,
  promises: () => promises_default,
  read: () => read,
  readFile: () => readFile2,
  readdir: () => readdir2,
  readlink: () => readlink2,
  realpath: () => realpath2,
  rename: () => rename2,
  rm: () => rm2,
  rmdir: () => rmdir2,
  stat: () => stat2,
  symlink: () => symlink2,
  truncate: () => truncate2,
  unlink: () => unlink2,
  utimes: () => utimes2,
  watch: () => watch2,
  write: () => write2,
  writeFile: () => writeFile2,
  writev: () => writev
});

// fs/stream.js
var import_buffer3 = __toESM(require_buffer(), 1);
var DEFAULT_HIGH_WATER_MARK = 16 * 1024;
var ReadStream = class extends Readable {
  constructor(options) {
    super(options);
    if (typeof options?.highWaterMark !== "number") {
      this._readableState.highWaterMark = this.constructor.highWaterMark;
    }
    this.end = typeof options?.end === "number" ? options.end : Infinity;
    this.start = typeof options?.start === "number" ? options.start : 0;
    this.handle = null;
    this.buffer = import_buffer3.Buffer.alloc(this._readableState.highWaterMark);
    this.bytesRead = 0;
    this.shouldEmitClose = options?.emitClose !== false;
    if (this.start < 0) {
      this.start = 0;
    }
    if (this.end < 0) {
      this.end = Infinity;
    }
    if (options?.handle) {
      this.setHandle(options.handle);
    }
  }
  setHandle(handle) {
    setHandle(this, handle);
  }
  get path() {
    return this.handle?.path || null;
  }
  get pending() {
    return this.handle?.opened !== true;
  }
  emit(event, ...args) {
    if (event === "close" && this.shouldEmitClose === false) {
      return false;
    }
    return super.emit(event, ...args);
  }
  async _open(callback) {
    if (!this.handle) {
      return callback(new Error("Handle not set in ReadStream"));
    }
    if (this.handle?.opened) {
      return callback(null);
    }
    this.once("ready", () => callback(null));
    if (!this.handle.opening) {
      try {
        await this.handle.open();
      } catch (err) {
        return callback(err);
      }
    }
  }
  async _read(callback) {
    const { buffer: buffer2, handle } = this;
    if (!handle || !handle.opened) {
      return callback(new Error("File handle not opened"));
    }
    buffer2.fill(0);
    const position = Math.max(0, this.start) + this.bytesRead;
    const length = Math.max(0, this.end) < Infinity ? Math.min(this.end - position, buffer2.length) : buffer2.length;
    try {
      const result = await handle.read(buffer2, 0, length, position);
      if (typeof result.bytesRead === "number" && result.bytesRead > 0) {
        this.bytesRead += result.bytesRead;
        this.push(buffer2.slice(0, result.bytesRead));
        if (this.bytesRead >= this.end) {
          this.push(null);
        }
      } else {
        this.push(null);
      }
    } catch (err) {
      return callback(err);
    }
    callback(null);
  }
};
var WriteStream = class extends Writable {
  constructor(options) {
    super(options);
    if (typeof options?.highWaterMark !== "number") {
      this._writableState.highWaterMark = this.constructor.highWaterMark;
    }
    this.start = typeof options?.start === "number" ? options.start : 0;
    this.handle = null;
    this.bytesWritten = 0;
    this.shouldEmitClose = options?.emitClose !== false;
    if (this.start < 0) {
      this.start = 0;
    }
    if (options?.handle) {
      this.setHandle(options.handle);
    }
  }
  setHandle(handle) {
    setHandle(this, handle);
  }
  get path() {
    return this.handle?.path || null;
  }
  get pending() {
    return this.handle?.opened !== true;
  }
  async _open(callback) {
    if (!this.handle) {
      return callback(new Error("Handle not set in WriteStream"));
    }
    if (this.handle?.opened) {
      return callback(null);
    }
    this.once("ready", () => callback(null));
    if (!this.handle.opening) {
      try {
        await this.handle.open();
      } catch (err) {
        return callback(err);
      }
    }
  }
  emit(event, ...args) {
    if (event === "close" && this.shouldEmitClose === false) {
      return false;
    }
    return super.emit(event, ...args);
  }
  async _write(buffer2, callback) {
    const { handle } = this;
    if (!handle || !handle.opened) {
      return callback(new Error("File handle not opened"));
    }
    try {
      const position = this.start + this.bytesWritten;
      const result = await handle.write(buffer2, 0, buffer2.length, position);
      if (typeof result.bytesWritten === "number" && result.bytesWritten > 0) {
        this.bytesWritten += result.bytesWritten;
        if (result.bytesWritten !== buffer2.length) {
          return await this._write(buffer2.slice(result.bytesWritten), callback);
        }
      }
    } catch (err) {
      return callback(err);
    }
    callback(null);
  }
};
function setHandle(stream, handle) {
  if (!handle)
    return;
  if (stream.handle) {
    throw new Error("Stream handle already set.");
  }
  stream.handle = handle;
  if (handle.opened) {
    queueMicrotask(() => stream.emit("ready"));
  } else {
    handle.once("open", (fd) => {
      if (stream.handle === handle) {
        stream.emit("open", fd);
        stream.emit("ready");
      }
    });
  }
  stream.once("ready", () => {
    handle.once("close", () => {
      stream.emit("close");
    });
  });
}
ReadStream.highWaterMark = DEFAULT_HIGH_WATER_MARK;
WriteStream.highWaterMark = DEFAULT_HIGH_WATER_MARK;

// ipc.js
var OK = 0;
var ERROR = 1;
async function ready() {
  return await new Promise((resolve2, reject) => {
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
  });
}
function sendSync(command, params) {
  if (typeof window === "undefined") {
    console.warn("Global window object is not defined");
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
  request2.open("GET", uri + query, false);
  request2.send(null);
  try {
    return JSON.parse(request2.response);
  } catch (err) {
    console.warn(err.message || err);
  }
  return request2.response;
}
async function emit2(...args) {
  await ready();
  return await window._ipc.emit(...args);
}
async function resolve(...args) {
  await ready();
  return await window._ipc.resolve(...args);
}
async function send(...args) {
  await ready();
  return await window._ipc.send(...args);
}
async function write(command, params, buffer2) {
  if (typeof window === "undefined") {
    console.warn("Global window object is not defined");
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
  request2.open("PUT", uri + query, true);
  request2.send(buffer2 || null);
  await new Promise((resolve2, reject) => {
    Object.assign(request2, {
      onreadystatechange() {
        if (request2.readyState === window.XMLHttpRequest.DONE) {
          resolve2();
        }
      },
      onerror() {
        reject(new Error(request2.responseText));
      }
    });
  });
  let response = request2.response;
  try {
    response = JSON.parse(request2.response);
  } catch (err) {
    console.warn(err.message || err);
  }
  if (response?.err) {
    throw new Error(response.err.message || response.err);
  }
  return response?.data || response;
}
async function request(command, data) {
  await ready();
  const params = { ...data };
  for (const key in params) {
    if (params[key] === void 0) {
      delete params[key];
    }
  }
  const parent = typeof window === "object" ? window : globalThis;
  const promise = parent._ipc.send(command, params);
  const { seq, index } = promise;
  const resolved = promise.then((result) => {
    if (result?.err) {
      throw Object.assign(new Error(result.err.message), result.err);
    }
    if (result && "data" in result) {
      if (result.data instanceof ArrayBuffer) {
        return new Uint8Array(result.data);
      }
      return result.data;
    }
    return result;
  });
  parent.addEventListener("data", ondata);
  return Object.assign(resolved, { seq, index });
  function ondata(event) {
    if (event.detail?.data) {
      const { data: data2, params: params2 } = event.detail;
      if (parseInt(params2.seq) === parseInt(seq)) {
        window.removeEventListener("data", ondata);
        resolve(seq, OK, data2);
      }
    }
  }
}
var ipc_default = {
  OK,
  ERROR,
  emit: emit2,
  ready,
  resolve,
  request,
  send,
  sendSync,
  write
};

// fs/constants.js
function getNativeConstants() {
  return ipc_default.sendSync("getFSConstants")?.data || {};
}
var constants = Object.assign(/* @__PURE__ */ Object.create(null), {
  COPYFILE_EXCL: 1,
  COPYFILE_FICLONE: 2,
  COPYFILE_FICLONE_FORCE: 4,
  ...getNativeConstants()
});
var constants_default = {
  constants
};

// os.js
var UNKNOWN = "unknown";
var cache = {
  arch: UNKNOWN,
  type: UNKNOWN,
  platform: UNKNOWN
};
function arch() {
  if (cache.arch !== UNKNOWN) {
    return cache.arch;
  }
  if (typeof window !== "object") {
    if (typeof process === "object" && typeof process.arch === "string") {
      return process.arch;
    }
    return UNKNOWN;
  }
  const value = window.process?.arch || ipc_default.sendSync("getPlatformArch")?.data || UNKNOWN;
  if (value === "arm64") {
    return value;
  }
  cache.arch = value.replace("x86_64", "x64").replace("x86", "ia32").replace(/arm.*/, "arm");
  return cache.arch;
}
function networkInterfaces() {
  const { ipv4, ipv6 } = ipc_default.sendSync("getNetworkInterfaces")?.data || {};
  const interfaces = {};
  for (const type2 in ipv4) {
    const address = ipv4[type2];
    const family = "IPv4";
    let internal = false;
    let netmask = "255.255.255.0";
    let cidr = `${address}/24`;
    let mac = null;
    if (address === "127.0.0.1" || address === "0.0.0.0") {
      internal = true;
      mac = "00:00:00:00:00:00";
      if (address === "127.0.0.1") {
        cidr = "127.0.0.1/8";
        netmask = "255.0.0.0";
      } else {
        cidr = "0.0.0.0/0";
        netmask = "0.0.0.0";
      }
    }
    interfaces[type2] = interfaces[type2] || [];
    interfaces[type2].push({
      address,
      netmask,
      internal,
      family,
      cidr,
      mac
    });
  }
  for (const type2 in ipv6) {
    const address = ipv6[type2];
    const family = "IPv6";
    let internal = false;
    let netmask = "ffff:ffff:ffff:ffff::";
    let cidr = `${address}/64`;
    let mac = null;
    if (address === "::1") {
      internal = true;
      netmask = "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff";
      cidr = "::1/128";
      mac = "00:00:00:00:00:00";
    }
    interfaces[type2] = interfaces[type2] || [];
    interfaces[type2].push({
      address,
      netmask,
      internal,
      family,
      cidr,
      mac
    });
  }
  return interfaces;
}
function platform() {
  if (cache.platform !== UNKNOWN) {
    return cache.platform;
  }
  if (typeof window !== "object") {
    if (typeof process === "object" && typeof process.platform === "string") {
      return process.platform;
    }
    return UNKNOWN;
  }
  cache.platform = window.process?.os || ipc_default.sendSync("getPlatformOS")?.data || window.process?.platform || UNKNOWN;
  return cache.platform;
}
function type() {
  if (cache.type !== UNKNOWN) {
    return cache.type;
  }
  if (typeof window !== "object") {
    switch (platform()) {
      case "linux":
        return "Linux";
      case "darnwin":
        return "Darwin";
      case "win32":
        return "Windows";
    }
    return UNKNOWN;
  }
  const value = window.process?.platform || ipc_default.sendSync("getPlatformType")?.data || UNKNOWN;
  cache.type = toProperCase(value);
  return cache.type;
}
var api = {
  arch,
  platform,
  networkInterfaces,
  type,
  get EOL() {
    if (/win/i.test(type())) {
      return "\r\n";
    }
    return "\n";
  }
};
var os_default = api;

// fs/stats.js
var isWindows = /win/i.test(os_default.type());
function checkMode(mode, property) {
  if (isWindows) {
    if (property == constants_default.S_IFIFO || property == constants_default.S_IFBLK || property == constants_default.S_IFSOCK) {
      return false;
    }
  }
  if (typeof mode === "bigint") {
    return (mode & BigInt(constants_default.S_IFMT)) === BigInt(property);
  }
  return (mode & constants_default.S_IFMT) === property;
}
var Stats = class {
  static from(stat3, fromBigInt) {
    if (fromBigInt) {
      return new this({
        dev: BigInt(stat3.st_dev),
        ino: BigInt(stat3.st_ino),
        mode: BigInt(stat3.st_mode),
        nlink: BigInt(stat3.st_nlink),
        uid: BigInt(stat3.st_uid),
        gid: BigInt(stat3.st_gid),
        rdev: BigInt(stat3.st_rdev),
        size: BigInt(stat3.st_size),
        blksize: BigInt(stat3.st_blksize),
        blocks: BigInt(stat3.st_blocks),
        atimeMs: BigInt(stat3.st_atim.tv_sec) * 1000n + BigInt(stat3.st_atim.tv_nsec) / 1000000n,
        mtimeMs: BigInt(stat3.st_mtim.tv_sec) * 1000n + BigInt(stat3.st_mtim.tv_nsec) / 1000000n,
        ctimeMs: BigInt(stat3.st_ctim.tv_sec) * 1000n + BigInt(stat3.st_ctim.tv_nsec) / 1000000n,
        birthtimeMs: BigInt(stat3.st_birthtim.tv_sec) * 1000n + BigInt(stat3.st_birthtim.tv_nsec) / 1000000n,
        atimNs: BigInt(stat3.st_atim.tv_sec) * 1000000000n + BigInt(stat3.st_atim.tv_nsec),
        mtimNs: BigInt(stat3.st_mtim.tv_sec) * 1000000000n + BigInt(stat3.st_mtim.tv_nsec),
        ctimNs: BigInt(stat3.st_ctim.tv_sec) * 1000000000n + BigInt(stat3.st_ctim.tv_nsec),
        birthtimNs: BigInt(stat3.st_birthtim.tv_sec) * 1000000000n + BigInt(stat3.st_birthtim.tv_nsec)
      });
    }
    return new this({
      dev: Number(stat3.st_dev),
      ino: Number(stat3.st_ino),
      mode: Number(stat3.st_mode),
      nlink: Number(stat3.st_nlink),
      uid: Number(stat3.st_uid),
      gid: Number(stat3.st_gid),
      rdev: Number(stat3.st_rdev),
      size: Number(stat3.st_size),
      blksize: Number(stat3.st_blksize),
      blocks: Number(stat3.st_blocks),
      atimeMs: Number(stat3.st_atim.tv_sec) * 1e3 + Number(stat3.st_atim.tv_nsec) / 1e6,
      mtimeMs: Number(stat3.st_mtim.tv_sec) * 1e3 + Number(stat3.st_mtim.tv_nsec) / 1e6,
      ctimeMs: Number(stat3.st_ctim.tv_sec) * 1e3 + Number(stat3.st_ctim.tv_nsec) / 1e6,
      birthtimeMs: Number(stat3.st_birthtim.tv_sec) * 1e3 + Number(stat3.st_birthtim.tv_nsec) / 1e6
    });
  }
  constructor(stat3) {
    this.dev = stat3.dev;
    this.ino = stat3.ino;
    this.mode = stat3.mode;
    this.nlink = stat3.nlink;
    this.uid = stat3.uid;
    this.gid = stat3.gid;
    this.rdev = stat3.rdev;
    this.size = stat3.size;
    this.blksize = stat3.blksize;
    this.blocks = stat3.blocks;
    this.atimeMs = stat3.atimeMs;
    this.mtimeMs = stat3.mtimeMs;
    this.ctimeMs = stat3.ctimeMs;
    this.birthtimeMs = stat3.birthtimeMs;
    this.atime = new Date(this.atimeMs);
    this.mtime = new Date(this.mtimeMs);
    this.ctime = new Date(this.ctimeMs);
    this.birthtime = new Date(this.birthtimeMs);
    Object.defineProperty(this, "handle", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: null
    });
  }
  isDirectory() {
    return checkMode(this.mode, constants_default.S_IFDIR);
  }
  isFile() {
    return checkMode(this.mode, constants_default.S_IFREG);
  }
  isBlockDevice() {
    return checkMode(this.mode, constants_default.S_IFBLK);
  }
  isCharacterDevice() {
    return checkMode(this.mode, constants_default.S_IFCHR);
  }
  isSymbolicLink() {
    return checkMode(this.mode, constants_default.S_IFLNK);
  }
  isFIFO() {
    return checkMode(this.mode, constants_default.S_IFIFO);
  }
  isSocket() {
    return checkMode(this.mode, constants_default.S_IFSOCK);
  }
};

// fs/dir.js
var Dir = class {
  constructor(options) {
    this.path = options?.path || null;
  }
  async close(callback) {
  }
  async read(callback) {
  }
  [Symbol.asyncIterator]() {
  }
};
var Dirent = class extends Stats {
  static from(stat3, fromBigInt) {
    const stats = super.from(stat3, fromBigInt);
    return new this({
      name: stat3.name,
      ...stats
    });
  }
  constructor(options) {
    super(options);
    this.name = options?.name || null;
  }
};

// fs/flags.js
function normalizeFlags(flags) {
  if (typeof flags === "number") {
    return flags;
  }
  if (flags !== void 0 && typeof flags !== "string") {
    throw new TypeError(`Expecting flags to be a string or number: Got ${typeof flags}`);
  }
  switch (flags) {
    case "r":
      return constants_default.O_RDONLY;
    case "rs":
    case "sr":
      return constants_default.O_RDONLY | constants_default.O_SYNC;
    case "r+":
      return constants_default.O_RDWR;
    case "rs+":
    case "sr+":
      return constants_default.O_RDWR | constants_default.O_SYNC;
    case "w":
      return constants_default.O_TRUNC | constants_default.O_CREAT | constants_default.O_WRONLY;
    case "wx":
    case "xw":
      return constants_default.O_TRUNC | constants_default.O_CREAT | constants_default.O_WRONLY | constants_default.O_EXCL;
    case "w+":
      return constants_default.O_TRUNC | constants_default.O_CREAT | constants_default.O_RDWR;
    case "wx+":
    case "xw+":
      return constants_default.O_TRUNC | constants_default.O_CREAT | constants_default.O_RDWR | constants_default.O_EXCL;
    case "a":
      return constants_default.O_APPEND | constants_default.O_CREAT | constants_default.O_WRONLY;
    case "ax":
    case "xa":
      return constants_default.O_APPEND | constants_default.O_CREAT | constants_default.O_WRONLY | constants_default.O_EXCL;
    case "as":
    case "sa":
      return constants_default.O_APPEND | constants_default.O_CREAT | constants_default.O_WRONLY | constants_default.O_SYNC;
    case "a+":
      return constants_default.O_APPEND | constants_default.O_CREAT | constants_default.O_RDWR;
    case "ax+":
    case "xa+":
      return constants_default.O_APPEND | constants_default.O_CREAT | constants_default.O_RDWR | constants_default.O_EXCL;
    case "as+":
    case "sa+":
      return constants_default.O_APPEND | constants_default.O_CREAT | constants_default.O_RDWR | constants_default.O_SYNC;
  }
  return constants_default.O_RDONLY;
}

// fs/handle.js
var import_buffer4 = __toESM(require_buffer(), 1);

// fs/fds.js
var fds = /* @__PURE__ */ new Map();
var ids = /* @__PURE__ */ new Map();
function get(id) {
  return fds.get(id);
}
function set(id, fd) {
  fds.set(id, fd);
  ids.set(fd, id);
}
function to(fd) {
  return ids.get(fd);
}
function release(id) {
  const fd = fds.get(id);
  fds.delete(id);
  ids.delete(fd);
}
var fds_default = {
  get,
  release,
  set,
  to
};

// fs/handle.js
var kFileHandleOpening = Symbol.for("fs.FileHandle.opening");
var kFileHandleClosing = Symbol.for("fs.FileHandle.closing");
var FileHandle = class extends EventEmitter {
  static get DEFAULT_ACCESS_MODE() {
    return constants_default.F_OK;
  }
  static get DEFAULT_OPEN_FLAGS() {
    return "r";
  }
  static get DEFAULT_OPEN_MODE() {
    return 438;
  }
  static from(id) {
    let fd = fds_default.get(id);
    if (!fd) {
      id = fds_default.to(id);
      fd = fds_default.get(id);
    }
    if (!fd || !id) {
      throw new Error("Invalid file descriptor.");
    }
    return new this({ fd, id });
  }
  static async access(path, mode) {
    if (mode === void 0) {
      mode = FileHandle.DEFAULT_ACCESS_MODE;
    }
    const request2 = await ipc_default.request("fsAccess", {
      mode,
      path
    });
    return request2.mode === mode;
  }
  static async open(path, flags, mode) {
    if (flags === void 0) {
      flags = FileHandle.DEFAULT_OPEN_FLAGS;
    }
    if (mode === void 0) {
      mode = FileHandle.DEFAULT_OPEN_MODE;
    }
    const handle = new this({ path, flags, mode });
    if (typeof handle.path !== "string") {
      throw new TypeError("Expecting path to be a string, Buffer, or URL.");
    }
    await handle.open();
    return handle;
  }
  constructor(options) {
    super();
    if (options?.path && typeof options.path.toString === "function") {
      options.path = options.path.toString();
    }
    this[kFileHandleOpening] = null;
    this[kFileHandleClosing] = null;
    this.flags = normalizeFlags(options?.flags);
    this.path = options?.path || null;
    this.mode = options?.mode || FileHandle.DEFAULT_ACCESS_MODE;
    this.id = options.id || String(rand642());
    this.fd = options.fd || null;
  }
  get opened() {
    return this.fd !== null && this.fd === fds_default.get(this.id);
  }
  get opening() {
    const opening = this[kFileHandleOpening];
    return opening?.value !== true;
  }
  get closing() {
    const closing = this[kFileHandleClosing];
    return closing?.value !== true;
  }
  async appendFile(data, options) {
  }
  async chmod(mode) {
  }
  async chown(uid, gid) {
  }
  async close() {
    if (this[kFileHandleOpening]) {
      await this[kFileHandleOpening];
    }
    if (this[kFileHandleClosing]) {
      return this[kFileHandleClosing];
    }
    if (!this.fd || !this.id) {
      throw new Error("FileHandle is not opened");
    }
    this[kFileHandleClosing] = new InvertedPromise();
    try {
      await ipc_default.request("fsClose", { id: this.id });
    } catch (err) {
      return this[kFileHandleClosing].reject(err);
    }
    fds_default.release(this.id);
    this.fd = null;
    this[kFileHandleClosing].resolve(true);
    this.emit("close");
    this[kFileHandleOpening] = null;
    this[kFileHandleClosing] = null;
    return true;
  }
  createReadStream(options) {
    const stream = new ReadStream({
      autoClose: options?.autoClose === true,
      ...options,
      handle: this
    });
    stream.once("end", async () => {
      if (options?.autoClose === true) {
        try {
          await this.close();
        } catch (err) {
          stream.emit("error", err);
        }
      }
    });
    return stream;
  }
  createWriteStream(options) {
    const stream = new WriteStream({
      autoClose: options?.autoClose === true,
      ...options,
      handle: this
    });
    stream.once("finish", async () => {
      if (options?.autoClose === true) {
        try {
          await this.close();
        } catch (err) {
          stream.emit("error", err);
        }
      }
    });
    return stream;
  }
  async datasync() {
  }
  async open() {
    if (this.opened) {
      return true;
    }
    if (this[kFileHandleOpening]) {
      return this[kFileHandleOpening];
    }
    const { flags, mode, path, id } = this;
    this[kFileHandleOpening] = new InvertedPromise();
    try {
      const request2 = await ipc_default.request("fsOpen", {
        id,
        flags,
        mode,
        path
      });
      this.fd = request2.fd;
    } catch (err) {
      return this[kFileHandleOpening].reject(err);
    }
    fds_default.set(this.id, this.fd);
    this[kFileHandleOpening].resolve(true);
    this.emit("open", this.fd);
    return true;
  }
  async read(buffer2, offset, length, position) {
    const { id } = this;
    let bytesRead = 0;
    if (typeof buffer2 === "object" && !isBufferLike(buffer2)) {
      offset = buffer2.offset;
      length = buffer2.length;
      position = buffer2.position;
      buffer2 = buffer2.buffer;
    }
    if (!isBufferLike(buffer2)) {
      throw new TypeError("Expecting buffer to be a Buffer or TypedArray.");
    }
    if (offset === void 0) {
      offset = 0;
    }
    if (length === void 0) {
      length = buffer2.byteLength - offset;
    }
    if (position === null) {
      position = -1;
    }
    if (typeof position !== "number") {
      position = 0;
    }
    if (typeof offset !== "number") {
      throw new TypeError(`Expecting offset to be a number. Got ${typeof offset}`);
    }
    if (typeof length !== "number") {
      throw new TypeError(`Expecting length to be a number. Got ${typeof length}`);
    }
    if (offset < 0) {
      throw new RangeError(`Expecting offset to be greater than or equal to 0: Got ${offset}`);
    }
    if (offset + length > buffer2.length) {
      throw new RangeError("Offset + length cannot be larger than buffer length.");
    }
    if (length < 0) {
      throw new RangeError(`Expecting length to be greater than or equal to 0: Got ${length}`);
    }
    if (isTypedArray2(buffer2)) {
      buffer2 = import_buffer4.Buffer.from(buffer2.buffer);
    }
    if (length > buffer2.byteLength - offset) {
      throw new RangeError(`Expecting length to be less than or equal to ${buffer2.byteLength - offset}: Got ${length}`);
    }
    const response = await ipc_default.request("fsRead", {
      id,
      size: length,
      offset: position
    });
    if (response instanceof ArrayBuffer) {
      bytesRead = response.byteLength;
      import_buffer4.Buffer.from(response).copy(buffer2, 0, offset);
    } else {
      throw new TypeError("Invalid response buffer from `fs.read`.");
    }
    return { bytesRead, buffer: buffer2 };
  }
  async readFile(options) {
    const stats = await this.stat();
    const buffer2 = import_buffer4.Buffer.alloc(stats.size);
    await this.read({ buffer: buffer2 });
    if (typeof options?.encoding === "string") {
      return buffer2.toString(options.encoding);
    }
    return buffer2;
  }
  async readv(buffers, position) {
  }
  async stat(options) {
    const response = await ipc_default.request("fsFStat", { id: this.id });
    const stats = Stats.from(response, Boolean(options?.bigint));
    stats.handle = this;
    return stats;
  }
  async sync() {
  }
  async truncate(length) {
  }
  async utimes(atime, mtime) {
  }
  async write(buffer2, offset, length, position) {
    if (typeof buffer2 === "object" && !isBufferLike(buffer2)) {
      offset = buffer2.offset;
      length = buffer2.length;
      position = buffer2.position;
      buffer2 = buffer2.buffer;
    }
    if (typeof buffer2 !== "string" && !isBufferLike(buffer2)) {
      throw new TypeError("Expecting buffer to be a string or Buffer.");
    }
    if (offset === void 0) {
      offset = 0;
    }
    if (length === void 0) {
      length = buffer2.length;
    }
    if (position === null) {
      position = -1;
    }
    if (typeof position !== "number") {
      position = 0;
    }
    if (length > buffer2.length) {
      throw new RangeError("Length cannot be larger than buffer length.");
    }
    if (offset > buffer2.length) {
      throw new RangeError("Offset cannot be larger than buffer length.");
    }
    if (offset + length > buffer2.length) {
      throw new RangeError("Offset + length cannot be larger than buffer length.");
    }
    const data = import_buffer4.Buffer.from(buffer2).slice(offset, offset + length);
    const params = { id: this.id, offset: position };
    const response = await ipc_default.write("fsWrite", params, data);
    return {
      buffer: data,
      bytesWritten: parseInt(response.result)
    };
  }
  async writeFile(data, options) {
  }
  async writev(buffers, position) {
  }
};

// fs/promises.js
async function access(path, mode) {
  return await FileHandle.access(path, mode);
}
async function appendFile(path, data, options) {
}
async function chmod(path, mode) {
}
async function chown(path, uid, gid) {
}
async function copyFile(src, dest, mode) {
}
async function lchmod(path, mode) {
}
async function lchown(path, uid, gid) {
}
async function lutimes(path, atime, mtime) {
}
async function link(existingPath, newPath) {
}
async function lstat(path, options) {
}
async function mkdir(path, options) {
}
async function open(path, flags, mode) {
  return await FileHandle.open(path, flags, mode);
}
async function opendir(path, options) {
}
async function readdir(path, options) {
}
async function readFile(path, options) {
}
async function readlink(path, options) {
}
async function realpath(path, options) {
}
async function rename(oldPath, newPath) {
}
async function rmdir(path, options) {
}
async function rm(path, options) {
}
async function stat(path, options) {
}
async function symlink(target, path, type2) {
}
async function truncate(path, length) {
}
async function unlink(path) {
}
async function utimes(path, atime, mtime) {
}
async function watch(path, options) {
}
async function writeFile(file, data, options) {
}
var promises_default = {
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  lutimes,
  link,
  lstat,
  mkdir,
  open,
  opendir,
  readdir,
  readFile,
  readlink,
  realpath,
  rename,
  rmdir,
  rm,
  stat,
  symlink,
  truncate,
  unlink,
  utimes,
  watch,
  writeFile
};

// fs/index.js
function defaultCallback(err) {
  if (err)
    throw err;
}
async function visit(path, flags, mode, callback) {
  if (typeof flags === "function") {
    callback = flags;
    flags = void 0;
    mode = void 0;
  }
  if (typeof mode === "function") {
    callback = mode;
    mode = void 0;
  }
  let handle = null;
  try {
    handle = await FileHandle.open(path, flags, mode);
  } catch (err) {
    return callback(err);
  }
  if (handle) {
    await callback(null, handle);
    try {
      await handle.close();
    } catch (err) {
      console.warn(err.message || err);
    }
  }
}
function access2(path, mode, callback) {
  if (typeof mode === "function") {
    callback = mode;
    mode = FileHandle.DEFAULT_ACCESS_MODE;
  }
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }
  try {
    FileHandle.access(path, mode).then((mode2) => callback(null, mode2)).catch((err) => callback(err));
  } catch (err) {
    callback(err);
  }
}
function appendFile2(path, data, options, callback) {
}
function chmod2(path, mode, callback) {
}
function chown2(path, uid, gid, callback) {
}
function close(fd, callback) {
  if (typeof callback !== "function") {
    callback = defaultCallback;
  }
  try {
    FileHandle.from(fd).close().then(() => callback(null)).catch((err) => callback(err));
  } catch (err) {
    callback(err);
  }
}
function copyFile2(src, dest, mode, callback) {
}
function createReadStream(path, options) {
  if (path?.fd) {
    options = path;
    path = options?.path || null;
  }
  let handle = null;
  const stream = new ReadStream({
    autoClose: typeof options?.fd !== "number",
    ...options
  });
  if (options?.fd) {
    handle = FileHandle.from(options.fd);
  } else {
    handle = new FileHandle({ flags: "r", path, ...options });
    handle.open().catch((err) => stream.emit("error", err));
  }
  stream.once("end", async () => {
    if (options?.autoClose !== false) {
      try {
        await handle.close();
      } catch (err) {
        stream.emit("error", err);
      }
    }
  });
  stream.setHandle(handle);
  return stream;
}
function createWriteStream(path, options) {
  if (path?.fd) {
    options = path;
    path = options?.path || null;
  }
  let handle = null;
  const stream = new WriteStream({
    autoClose: typeof options?.fd !== "number",
    ...options
  });
  if (typeof options?.fd === "number") {
    handle = FileHandle.from(options.fd);
  } else {
    handle = new FileHandle({ flags: "w", path, ...options });
    handle.open().catch((err) => stream.emit("error", err));
  }
  stream.once("finish", async () => {
    if (options?.autoClose !== false) {
      try {
        await handle.close();
      } catch (err) {
        stream.emit("error", err);
      }
    }
  });
  stream.setHandle(handle);
  return stream;
}
function fstat(fd, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }
  try {
    FileHandle.from(fd).stat(options).then(() => callback(null)).catch((err) => callback(err));
  } catch (err) {
    callback(err);
  }
}
function lchmod2(path, mode, callback) {
}
function lchown2(path, uid, gid, callback) {
}
function lutimes2(path, atime, mtime, callback) {
}
function link2(existingPath, newPath, callback) {
}
function lstat2(path, options, callback) {
}
function mkdir2(path, options, callback) {
}
function open2(path, flags, mode, callback) {
  if (typeof flags === "function") {
    callback = flags;
    flags = FileHandle.DEFAULT_OPEN_FLAGS;
    mode = FileHandle.DEFAULT_OPEN_MODE;
  }
  if (typeof mode === "function") {
    callback = mode;
    mode = FileHandle.DEFAULT_OPEN_MODE;
  }
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }
  try {
    FileHandle.open(path, flags, mode).then((handle) => callback(null, handle.fd)).catch((err) => callback(err));
  } catch (err) {
    callback(err);
  }
}
function opendir2(path, options, callback) {
}
function read(fd, buffer2, offset, length, position, callback) {
  if (typeof buffer2 === "object" && !isBufferLike(buffer2)) {
    offset = buffer2.offset;
    length = buffer2.length;
    position = buffer2.position;
    buffer2 = buffer2.buffer;
    callback = offset;
  }
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }
  try {
    FileHandle.from(fd).read({ buffer: buffer2, offset, length, position }).then(({ bytesRead, buffer: buffer3 }) => callback(null, bytesRead, buffer3)).catch((err) => callback(err));
  } catch (err) {
    callback(err);
  }
}
function readdir2(path, options, callback) {
}
function readFile2(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }
  visit(path, options?.flag, async (err, handle) => {
    let buffer2 = null;
    if (err) {
      callback(err);
      return;
    }
    try {
      buffer2 = await handle.readFile(options);
    } catch (err2) {
      callback(err2);
      return;
    }
    callback(null, buffer2);
  });
}
function readlink2(path, options, callback) {
}
function realpath2(path, options, callback) {
}
function rename2(oldPath, newPath, callback) {
}
function rmdir2(path, options, callback) {
}
function rm2(path, options, callback) {
}
function stat2(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }
  visit(path, async (err, handle) => {
    let stats = null;
    if (err) {
      callback(err);
      return;
    }
    try {
      stats = await handle.stat(options);
    } catch (err2) {
      callback(err2);
      return;
    }
    callback(null, stats);
  });
}
function symlink2(target, path, type2, callback) {
}
function truncate2(path, length, callback) {
}
function unlink2(path, callback) {
}
function utimes2(path, atime, mtime, callback) {
}
function watch2(path, options, callback) {
}
function write2(fd, buffer2, offset, length, position, callback) {
}
function writeFile2(file, data, options, callback) {
}
function writev(fd, buffers, position, callback) {
}
var fs_default = fs_exports;
for (const key in fs_exports) {
  const value = fs_exports[key];
  if (key in promises_default && isFunction(value) && isFunction(promises_default[key])) {
    value[Symbol.for("nodejs.util.promisify.custom")] = promises_default[key];
  }
}

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

// node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
var i;
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var stringify_default = stringify;

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default = v4;

// bluetooth.js
var Bluetooth = class extends EventEmitter {
  constructor(opts = {}) {
    this.keys = {};
    this.serviceId = v4_default();
    window.external.invoke(`ipc://bluetooth-start?uuid=${this.serviceId}`);
    window.addEventListener("bluetooth", (e) => {
      const { err, data } = e.detail.params;
      if (err) {
        return this.emit("error", err);
      }
      this.emit(data.event, data);
    });
    window.addEventListener("data", (e) => {
      if (e.detail.params.serviceId !== this.serviceId)
        return;
      this.emit(this.keys[e.detail.params.characteristicId], e.detail.data);
    });
  }
  subscribe(key) {
    return this.set(key);
  }
  publish(key, value = "") {
    const id = v4_default();
    this.keys[id] = key;
    const params = {
      characteristicId: id,
      serviceId: this.serviceId
    };
    if (value.constructor.name !== "Object") {
      value = JSON.stringify(value);
    }
    if (typeof value === "string") {
      const enc = new TextEncoder().encode(value);
      value = enc.data;
      params.length = enc.length;
    }
    return ipc_default.write("bluetooth-set", params, value);
  }
};
__publicField(Bluetooth, "isInitalized", false);
var bluetooth_default = {
  Bluetooth
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
