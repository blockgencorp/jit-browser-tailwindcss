var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@alloc/quick-lru/index.js
var require_quick_lru = __commonJS({
  "node_modules/@alloc/quick-lru/index.js"(exports, module) {
    "use strict";
    var QuickLRU = class {
      constructor(options = {}) {
        if (!(options.maxSize && options.maxSize > 0)) {
          throw new TypeError("`maxSize` must be a number greater than 0");
        }
        if (typeof options.maxAge === "number" && options.maxAge === 0) {
          throw new TypeError("`maxAge` must be a number greater than 0");
        }
        this.maxSize = options.maxSize;
        this.maxAge = options.maxAge || Infinity;
        this.onEviction = options.onEviction;
        this.cache = /* @__PURE__ */ new Map();
        this.oldCache = /* @__PURE__ */ new Map();
        this._size = 0;
      }
      _emitEvictions(cache2) {
        if (typeof this.onEviction !== "function") {
          return;
        }
        for (const [key, item] of cache2) {
          this.onEviction(key, item.value);
        }
      }
      _deleteIfExpired(key, item) {
        if (typeof item.expiry === "number" && item.expiry <= Date.now()) {
          if (typeof this.onEviction === "function") {
            this.onEviction(key, item.value);
          }
          return this.delete(key);
        }
        return false;
      }
      _getOrDeleteIfExpired(key, item) {
        const deleted = this._deleteIfExpired(key, item);
        if (deleted === false) {
          return item.value;
        }
      }
      _getItemValue(key, item) {
        return item.expiry ? this._getOrDeleteIfExpired(key, item) : item.value;
      }
      _peek(key, cache2) {
        const item = cache2.get(key);
        return this._getItemValue(key, item);
      }
      _set(key, value2) {
        this.cache.set(key, value2);
        this._size++;
        if (this._size >= this.maxSize) {
          this._size = 0;
          this._emitEvictions(this.oldCache);
          this.oldCache = this.cache;
          this.cache = /* @__PURE__ */ new Map();
        }
      }
      _moveToRecent(key, item) {
        this.oldCache.delete(key);
        this._set(key, item);
      }
      *_entriesAscending() {
        for (const item of this.oldCache) {
          const [key, value2] = item;
          if (!this.cache.has(key)) {
            const deleted = this._deleteIfExpired(key, value2);
            if (deleted === false) {
              yield item;
            }
          }
        }
        for (const item of this.cache) {
          const [key, value2] = item;
          const deleted = this._deleteIfExpired(key, value2);
          if (deleted === false) {
            yield item;
          }
        }
      }
      get(key) {
        if (this.cache.has(key)) {
          const item = this.cache.get(key);
          return this._getItemValue(key, item);
        }
        if (this.oldCache.has(key)) {
          const item = this.oldCache.get(key);
          if (this._deleteIfExpired(key, item) === false) {
            this._moveToRecent(key, item);
            return item.value;
          }
        }
      }
      set(key, value2, { maxAge = this.maxAge === Infinity ? void 0 : Date.now() + this.maxAge } = {}) {
        if (this.cache.has(key)) {
          this.cache.set(key, {
            value: value2,
            maxAge
          });
        } else {
          this._set(key, { value: value2, expiry: maxAge });
        }
      }
      has(key) {
        if (this.cache.has(key)) {
          return !this._deleteIfExpired(key, this.cache.get(key));
        }
        if (this.oldCache.has(key)) {
          return !this._deleteIfExpired(key, this.oldCache.get(key));
        }
        return false;
      }
      peek(key) {
        if (this.cache.has(key)) {
          return this._peek(key, this.cache);
        }
        if (this.oldCache.has(key)) {
          return this._peek(key, this.oldCache);
        }
      }
      delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
          this._size--;
        }
        return this.oldCache.delete(key) || deleted;
      }
      clear() {
        this.cache.clear();
        this.oldCache.clear();
        this._size = 0;
      }
      resize(newSize) {
        if (!(newSize && newSize > 0)) {
          throw new TypeError("`maxSize` must be a number greater than 0");
        }
        const items = [...this._entriesAscending()];
        const removeCount = items.length - newSize;
        if (removeCount < 0) {
          this.cache = new Map(items);
          this.oldCache = /* @__PURE__ */ new Map();
          this._size = items.length;
        } else {
          if (removeCount > 0) {
            this._emitEvictions(items.slice(0, removeCount));
          }
          this.oldCache = new Map(items.slice(removeCount));
          this.cache = /* @__PURE__ */ new Map();
          this._size = 0;
        }
        this.maxSize = newSize;
      }
      *keys() {
        for (const [key] of this) {
          yield key;
        }
      }
      *values() {
        for (const [, value2] of this) {
          yield value2;
        }
      }
      *[Symbol.iterator]() {
        for (const item of this.cache) {
          const [key, value2] = item;
          const deleted = this._deleteIfExpired(key, value2);
          if (deleted === false) {
            yield [key, value2.value];
          }
        }
        for (const item of this.oldCache) {
          const [key, value2] = item;
          if (!this.cache.has(key)) {
            const deleted = this._deleteIfExpired(key, value2);
            if (deleted === false) {
              yield [key, value2.value];
            }
          }
        }
      }
      *entriesDescending() {
        let items = [...this.cache];
        for (let i = items.length - 1; i >= 0; --i) {
          const item = items[i];
          const [key, value2] = item;
          const deleted = this._deleteIfExpired(key, value2);
          if (deleted === false) {
            yield [key, value2.value];
          }
        }
        items = [...this.oldCache];
        for (let i = items.length - 1; i >= 0; --i) {
          const item = items[i];
          const [key, value2] = item;
          if (!this.cache.has(key)) {
            const deleted = this._deleteIfExpired(key, value2);
            if (deleted === false) {
              yield [key, value2.value];
            }
          }
        }
      }
      *entriesAscending() {
        for (const [key, value2] of this._entriesAscending()) {
          yield [key, value2.value];
        }
      }
      get size() {
        if (!this._size) {
          return this.oldCache.size;
        }
        let oldCacheSize = 0;
        for (const key of this.oldCache.keys()) {
          if (!this.cache.has(key)) {
            oldCacheSize++;
          }
        }
        return Math.min(this._size + oldCacheSize, this.maxSize);
      }
    };
    module.exports = QuickLRU;
  }
});

// node_modules/tailwindcss/src/value-parser/parse.js
var require_parse = __commonJS({
  "node_modules/tailwindcss/src/value-parser/parse.js"(exports, module) {
    var openParentheses = "(".charCodeAt(0);
    var closeParentheses = ")".charCodeAt(0);
    var singleQuote = "'".charCodeAt(0);
    var doubleQuote = '"'.charCodeAt(0);
    var backslash = "\\".charCodeAt(0);
    var slash = "/".charCodeAt(0);
    var comma = ",".charCodeAt(0);
    var colon = ":".charCodeAt(0);
    var star = "*".charCodeAt(0);
    var uLower = "u".charCodeAt(0);
    var uUpper = "U".charCodeAt(0);
    var plus = "+".charCodeAt(0);
    var isUnicodeRange = /^[a-f0-9?-]+$/i;
    module.exports = function(input) {
      var tokens = [];
      var value2 = input;
      var next, quote, prev, token, escape2, escapePos, whitespacePos, parenthesesOpenPos;
      var pos = 0;
      var code = value2.charCodeAt(pos);
      var max2 = value2.length;
      var stack = [{ nodes: tokens }];
      var balanced = 0;
      var parent;
      var name = "";
      var before = "";
      var after = "";
      while (pos < max2) {
        if (code <= 32) {
          next = pos;
          do {
            next += 1;
            code = value2.charCodeAt(next);
          } while (code <= 32);
          token = value2.slice(pos, next);
          prev = tokens[tokens.length - 1];
          if (code === closeParentheses && balanced) {
            after = token;
          } else if (prev && prev.type === "div") {
            prev.after = token;
            prev.sourceEndIndex += token.length;
          } else if (code === comma || code === colon || code === slash && value2.charCodeAt(next + 1) !== star && (!parent || parent && parent.type === "function" && false)) {
            before = token;
          } else {
            tokens.push({
              type: "space",
              sourceIndex: pos,
              sourceEndIndex: next,
              value: token
            });
          }
          pos = next;
        } else if (code === singleQuote || code === doubleQuote) {
          next = pos;
          quote = code === singleQuote ? "'" : '"';
          token = {
            type: "string",
            sourceIndex: pos,
            quote
          };
          do {
            escape2 = false;
            next = value2.indexOf(quote, next + 1);
            if (~next) {
              escapePos = next;
              while (value2.charCodeAt(escapePos - 1) === backslash) {
                escapePos -= 1;
                escape2 = !escape2;
              }
            } else {
              value2 += quote;
              next = value2.length - 1;
              token.unclosed = true;
            }
          } while (escape2);
          token.value = value2.slice(pos + 1, next);
          token.sourceEndIndex = token.unclosed ? next : next + 1;
          tokens.push(token);
          pos = next + 1;
          code = value2.charCodeAt(pos);
        } else if (code === slash && value2.charCodeAt(pos + 1) === star) {
          next = value2.indexOf("*/", pos);
          token = {
            type: "comment",
            sourceIndex: pos,
            sourceEndIndex: next + 2
          };
          if (next === -1) {
            token.unclosed = true;
            next = value2.length;
            token.sourceEndIndex = next;
          }
          token.value = value2.slice(pos + 2, next);
          tokens.push(token);
          pos = next + 2;
          code = value2.charCodeAt(pos);
        } else if ((code === slash || code === star) && parent && parent.type === "function" && true) {
          token = value2[pos];
          tokens.push({
            type: "word",
            sourceIndex: pos - before.length,
            sourceEndIndex: pos + token.length,
            value: token
          });
          pos += 1;
          code = value2.charCodeAt(pos);
        } else if (code === slash || code === comma || code === colon) {
          token = value2[pos];
          tokens.push({
            type: "div",
            sourceIndex: pos - before.length,
            sourceEndIndex: pos + token.length,
            value: token,
            before,
            after: ""
          });
          before = "";
          pos += 1;
          code = value2.charCodeAt(pos);
        } else if (openParentheses === code) {
          next = pos;
          do {
            next += 1;
            code = value2.charCodeAt(next);
          } while (code <= 32);
          parenthesesOpenPos = pos;
          token = {
            type: "function",
            sourceIndex: pos - name.length,
            value: name,
            before: value2.slice(parenthesesOpenPos + 1, next)
          };
          pos = next;
          if (name === "url" && code !== singleQuote && code !== doubleQuote) {
            next -= 1;
            do {
              escape2 = false;
              next = value2.indexOf(")", next + 1);
              if (~next) {
                escapePos = next;
                while (value2.charCodeAt(escapePos - 1) === backslash) {
                  escapePos -= 1;
                  escape2 = !escape2;
                }
              } else {
                value2 += ")";
                next = value2.length - 1;
                token.unclosed = true;
              }
            } while (escape2);
            whitespacePos = next;
            do {
              whitespacePos -= 1;
              code = value2.charCodeAt(whitespacePos);
            } while (code <= 32);
            if (parenthesesOpenPos < whitespacePos) {
              if (pos !== whitespacePos + 1) {
                token.nodes = [
                  {
                    type: "word",
                    sourceIndex: pos,
                    sourceEndIndex: whitespacePos + 1,
                    value: value2.slice(pos, whitespacePos + 1)
                  }
                ];
              } else {
                token.nodes = [];
              }
              if (token.unclosed && whitespacePos + 1 !== next) {
                token.after = "";
                token.nodes.push({
                  type: "space",
                  sourceIndex: whitespacePos + 1,
                  sourceEndIndex: next,
                  value: value2.slice(whitespacePos + 1, next)
                });
              } else {
                token.after = value2.slice(whitespacePos + 1, next);
                token.sourceEndIndex = next;
              }
            } else {
              token.after = "";
              token.nodes = [];
            }
            pos = next + 1;
            token.sourceEndIndex = token.unclosed ? next : pos;
            code = value2.charCodeAt(pos);
            tokens.push(token);
          } else {
            balanced += 1;
            token.after = "";
            token.sourceEndIndex = pos + 1;
            tokens.push(token);
            stack.push(token);
            tokens = token.nodes = [];
            parent = token;
          }
          name = "";
        } else if (closeParentheses === code && balanced) {
          pos += 1;
          code = value2.charCodeAt(pos);
          parent.after = after;
          parent.sourceEndIndex += after.length;
          after = "";
          balanced -= 1;
          stack[stack.length - 1].sourceEndIndex = pos;
          stack.pop();
          parent = stack[balanced];
          tokens = parent.nodes;
        } else {
          next = pos;
          do {
            if (code === backslash) {
              next += 1;
            }
            next += 1;
            code = value2.charCodeAt(next);
          } while (next < max2 && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === star && parent && parent.type === "function" && true || code === slash && parent.type === "function" && true || code === closeParentheses && balanced));
          token = value2.slice(pos, next);
          if (openParentheses === code) {
            name = token;
          } else if ((uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) && plus === token.charCodeAt(1) && isUnicodeRange.test(token.slice(2))) {
            tokens.push({
              type: "unicode-range",
              sourceIndex: pos,
              sourceEndIndex: next,
              value: token
            });
          } else {
            tokens.push({
              type: "word",
              sourceIndex: pos,
              sourceEndIndex: next,
              value: token
            });
          }
          pos = next;
        }
      }
      for (pos = stack.length - 1; pos; pos -= 1) {
        stack[pos].unclosed = true;
        stack[pos].sourceEndIndex = value2.length;
      }
      return stack[0].nodes;
    };
  }
});

// node_modules/tailwindcss/src/value-parser/walk.js
var require_walk = __commonJS({
  "node_modules/tailwindcss/src/value-parser/walk.js"(exports, module) {
    module.exports = function walk(nodes, cb, bubble) {
      var i, max2, node, result;
      for (i = 0, max2 = nodes.length; i < max2; i += 1) {
        node = nodes[i];
        if (!bubble) {
          result = cb(node, i, nodes);
        }
        if (result !== false && node.type === "function" && Array.isArray(node.nodes)) {
          walk(node.nodes, cb, bubble);
        }
        if (bubble) {
          cb(node, i, nodes);
        }
      }
    };
  }
});

// node_modules/tailwindcss/src/value-parser/stringify.js
var require_stringify = __commonJS({
  "node_modules/tailwindcss/src/value-parser/stringify.js"(exports, module) {
    function stringifyNode(node, custom) {
      var type = node.type;
      var value2 = node.value;
      var buf;
      var customResult;
      if (custom && (customResult = custom(node)) !== void 0) {
        return customResult;
      } else if (type === "word" || type === "space") {
        return value2;
      } else if (type === "string") {
        buf = node.quote || "";
        return buf + value2 + (node.unclosed ? "" : buf);
      } else if (type === "comment") {
        return "/*" + value2 + (node.unclosed ? "" : "*/");
      } else if (type === "div") {
        return (node.before || "") + value2 + (node.after || "");
      } else if (Array.isArray(node.nodes)) {
        buf = stringify(node.nodes, custom);
        if (type !== "function") {
          return buf;
        }
        return value2 + "(" + (node.before || "") + buf + (node.after || "") + (node.unclosed ? "" : ")");
      }
      return value2;
    }
    function stringify(nodes, custom) {
      var result, i;
      if (Array.isArray(nodes)) {
        result = "";
        for (i = nodes.length - 1; ~i; i -= 1) {
          result = stringifyNode(nodes[i], custom) + result;
        }
        return result;
      }
      return stringifyNode(nodes, custom);
    }
    module.exports = stringify;
  }
});

// node_modules/tailwindcss/src/value-parser/unit.js
var require_unit = __commonJS({
  "node_modules/tailwindcss/src/value-parser/unit.js"(exports, module) {
    var minus = "-".charCodeAt(0);
    var plus = "+".charCodeAt(0);
    var dot = ".".charCodeAt(0);
    var exp = "e".charCodeAt(0);
    var EXP = "E".charCodeAt(0);
    function likeNumber(value2) {
      var code = value2.charCodeAt(0);
      var nextCode;
      if (code === plus || code === minus) {
        nextCode = value2.charCodeAt(1);
        if (nextCode >= 48 && nextCode <= 57) {
          return true;
        }
        var nextNextCode = value2.charCodeAt(2);
        if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
          return true;
        }
        return false;
      }
      if (code === dot) {
        nextCode = value2.charCodeAt(1);
        if (nextCode >= 48 && nextCode <= 57) {
          return true;
        }
        return false;
      }
      if (code >= 48 && code <= 57) {
        return true;
      }
      return false;
    }
    module.exports = function(value2) {
      var pos = 0;
      var length2 = value2.length;
      var code;
      var nextCode;
      var nextNextCode;
      if (length2 === 0 || !likeNumber(value2)) {
        return false;
      }
      code = value2.charCodeAt(pos);
      if (code === plus || code === minus) {
        pos++;
      }
      while (pos < length2) {
        code = value2.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
      code = value2.charCodeAt(pos);
      nextCode = value2.charCodeAt(pos + 1);
      if (code === dot && nextCode >= 48 && nextCode <= 57) {
        pos += 2;
        while (pos < length2) {
          code = value2.charCodeAt(pos);
          if (code < 48 || code > 57) {
            break;
          }
          pos += 1;
        }
      }
      code = value2.charCodeAt(pos);
      nextCode = value2.charCodeAt(pos + 1);
      nextNextCode = value2.charCodeAt(pos + 2);
      if ((code === exp || code === EXP) && (nextCode >= 48 && nextCode <= 57 || (nextCode === plus || nextCode === minus) && nextNextCode >= 48 && nextNextCode <= 57)) {
        pos += nextCode === plus || nextCode === minus ? 3 : 2;
        while (pos < length2) {
          code = value2.charCodeAt(pos);
          if (code < 48 || code > 57) {
            break;
          }
          pos += 1;
        }
      }
      return {
        number: value2.slice(0, pos),
        unit: value2.slice(pos)
      };
    };
  }
});

// node_modules/tailwindcss/src/value-parser/index.js
var require_value_parser = __commonJS({
  "node_modules/tailwindcss/src/value-parser/index.js"(exports, module) {
    var parse = require_parse();
    var walk = require_walk();
    var stringify = require_stringify();
    function ValueParser(value2) {
      if (this instanceof ValueParser) {
        this.nodes = parse(value2);
        return this;
      }
      return new ValueParser(value2);
    }
    ValueParser.prototype.toString = function() {
      return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
    };
    ValueParser.prototype.walk = function(cb, bubble) {
      walk(this.nodes, cb, bubble);
      return this;
    };
    ValueParser.unit = require_unit();
    ValueParser.walk = walk;
    ValueParser.stringify = stringify;
    module.exports = ValueParser;
  }
});

// node_modules/tailwindcss/stubs/config.full.js
var require_config_full = __commonJS({
  "node_modules/tailwindcss/stubs/config.full.js"(exports, module) {
    module.exports = {
      content: [],
      presets: [],
      darkMode: "media",
      theme: {
        accentColor: ({ theme }) => ({
          ...theme("colors"),
          auto: "auto"
        }),
        animation: {
          none: "none",
          spin: "spin 1s linear infinite",
          ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
          pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          bounce: "bounce 1s infinite"
        },
        aria: {
          busy: 'busy="true"',
          checked: 'checked="true"',
          disabled: 'disabled="true"',
          expanded: 'expanded="true"',
          hidden: 'hidden="true"',
          pressed: 'pressed="true"',
          readonly: 'readonly="true"',
          required: 'required="true"',
          selected: 'selected="true"'
        },
        aspectRatio: {
          auto: "auto",
          square: "1 / 1",
          video: "16 / 9"
        },
        backdropBlur: ({ theme }) => theme("blur"),
        backdropBrightness: ({ theme }) => theme("brightness"),
        backdropContrast: ({ theme }) => theme("contrast"),
        backdropGrayscale: ({ theme }) => theme("grayscale"),
        backdropHueRotate: ({ theme }) => theme("hueRotate"),
        backdropInvert: ({ theme }) => theme("invert"),
        backdropOpacity: ({ theme }) => theme("opacity"),
        backdropSaturate: ({ theme }) => theme("saturate"),
        backdropSepia: ({ theme }) => theme("sepia"),
        backgroundColor: ({ theme }) => theme("colors"),
        backgroundImage: {
          none: "none",
          "gradient-to-t": "linear-gradient(to top, var(--tw-gradient-stops))",
          "gradient-to-tr": "linear-gradient(to top right, var(--tw-gradient-stops))",
          "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
          "gradient-to-br": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
          "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))",
          "gradient-to-bl": "linear-gradient(to bottom left, var(--tw-gradient-stops))",
          "gradient-to-l": "linear-gradient(to left, var(--tw-gradient-stops))",
          "gradient-to-tl": "linear-gradient(to top left, var(--tw-gradient-stops))"
        },
        backgroundOpacity: ({ theme }) => theme("opacity"),
        backgroundPosition: {
          bottom: "bottom",
          center: "center",
          left: "left",
          "left-bottom": "left bottom",
          "left-top": "left top",
          right: "right",
          "right-bottom": "right bottom",
          "right-top": "right top",
          top: "top"
        },
        backgroundSize: {
          auto: "auto",
          cover: "cover",
          contain: "contain"
        },
        blur: {
          0: "0",
          none: "0",
          sm: "4px",
          DEFAULT: "8px",
          md: "12px",
          lg: "16px",
          xl: "24px",
          "2xl": "40px",
          "3xl": "64px"
        },
        borderColor: ({ theme }) => ({
          ...theme("colors"),
          DEFAULT: theme("colors.gray.200", "currentColor")
        }),
        borderOpacity: ({ theme }) => theme("opacity"),
        borderRadius: {
          none: "0px",
          sm: "0.125rem",
          DEFAULT: "0.25rem",
          md: "0.375rem",
          lg: "0.5rem",
          xl: "0.75rem",
          "2xl": "1rem",
          "3xl": "1.5rem",
          full: "9999px"
        },
        borderSpacing: ({ theme }) => ({
          ...theme("spacing")
        }),
        borderWidth: {
          DEFAULT: "1px",
          0: "0px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        boxShadow: {
          sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
          none: "none"
        },
        boxShadowColor: ({ theme }) => theme("colors"),
        brightness: {
          0: "0",
          50: ".5",
          75: ".75",
          90: ".9",
          95: ".95",
          100: "1",
          105: "1.05",
          110: "1.1",
          125: "1.25",
          150: "1.5",
          200: "2"
        },
        caretColor: ({ theme }) => theme("colors"),
        colors: ({ colors }) => ({
          inherit: colors.inherit,
          current: colors.current,
          transparent: colors.transparent,
          black: colors.black,
          white: colors.white,
          slate: colors.slate,
          gray: colors.gray,
          zinc: colors.zinc,
          neutral: colors.neutral,
          stone: colors.stone,
          red: colors.red,
          orange: colors.orange,
          amber: colors.amber,
          yellow: colors.yellow,
          lime: colors.lime,
          green: colors.green,
          emerald: colors.emerald,
          teal: colors.teal,
          cyan: colors.cyan,
          sky: colors.sky,
          blue: colors.blue,
          indigo: colors.indigo,
          violet: colors.violet,
          purple: colors.purple,
          fuchsia: colors.fuchsia,
          pink: colors.pink,
          rose: colors.rose
        }),
        columns: {
          auto: "auto",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          10: "10",
          11: "11",
          12: "12",
          "3xs": "16rem",
          "2xs": "18rem",
          xs: "20rem",
          sm: "24rem",
          md: "28rem",
          lg: "32rem",
          xl: "36rem",
          "2xl": "42rem",
          "3xl": "48rem",
          "4xl": "56rem",
          "5xl": "64rem",
          "6xl": "72rem",
          "7xl": "80rem"
        },
        container: {},
        content: {
          none: "none"
        },
        contrast: {
          0: "0",
          50: ".5",
          75: ".75",
          100: "1",
          125: "1.25",
          150: "1.5",
          200: "2"
        },
        cursor: {
          auto: "auto",
          default: "default",
          pointer: "pointer",
          wait: "wait",
          text: "text",
          move: "move",
          help: "help",
          "not-allowed": "not-allowed",
          none: "none",
          "context-menu": "context-menu",
          progress: "progress",
          cell: "cell",
          crosshair: "crosshair",
          "vertical-text": "vertical-text",
          alias: "alias",
          copy: "copy",
          "no-drop": "no-drop",
          grab: "grab",
          grabbing: "grabbing",
          "all-scroll": "all-scroll",
          "col-resize": "col-resize",
          "row-resize": "row-resize",
          "n-resize": "n-resize",
          "e-resize": "e-resize",
          "s-resize": "s-resize",
          "w-resize": "w-resize",
          "ne-resize": "ne-resize",
          "nw-resize": "nw-resize",
          "se-resize": "se-resize",
          "sw-resize": "sw-resize",
          "ew-resize": "ew-resize",
          "ns-resize": "ns-resize",
          "nesw-resize": "nesw-resize",
          "nwse-resize": "nwse-resize",
          "zoom-in": "zoom-in",
          "zoom-out": "zoom-out"
        },
        divideColor: ({ theme }) => theme("borderColor"),
        divideOpacity: ({ theme }) => theme("borderOpacity"),
        divideWidth: ({ theme }) => theme("borderWidth"),
        dropShadow: {
          sm: "0 1px 1px rgb(0 0 0 / 0.05)",
          DEFAULT: ["0 1px 2px rgb(0 0 0 / 0.1)", "0 1px 1px rgb(0 0 0 / 0.06)"],
          md: ["0 4px 3px rgb(0 0 0 / 0.07)", "0 2px 2px rgb(0 0 0 / 0.06)"],
          lg: ["0 10px 8px rgb(0 0 0 / 0.04)", "0 4px 3px rgb(0 0 0 / 0.1)"],
          xl: ["0 20px 13px rgb(0 0 0 / 0.03)", "0 8px 5px rgb(0 0 0 / 0.08)"],
          "2xl": "0 25px 25px rgb(0 0 0 / 0.15)",
          none: "0 0 #0000"
        },
        fill: ({ theme }) => ({
          none: "none",
          ...theme("colors")
        }),
        flex: {
          1: "1 1 0%",
          auto: "1 1 auto",
          initial: "0 1 auto",
          none: "none"
        },
        flexBasis: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing"),
          "1/2": "50%",
          "1/3": "33.333333%",
          "2/3": "66.666667%",
          "1/4": "25%",
          "2/4": "50%",
          "3/4": "75%",
          "1/5": "20%",
          "2/5": "40%",
          "3/5": "60%",
          "4/5": "80%",
          "1/6": "16.666667%",
          "2/6": "33.333333%",
          "3/6": "50%",
          "4/6": "66.666667%",
          "5/6": "83.333333%",
          "1/12": "8.333333%",
          "2/12": "16.666667%",
          "3/12": "25%",
          "4/12": "33.333333%",
          "5/12": "41.666667%",
          "6/12": "50%",
          "7/12": "58.333333%",
          "8/12": "66.666667%",
          "9/12": "75%",
          "10/12": "83.333333%",
          "11/12": "91.666667%",
          full: "100%"
        }),
        flexGrow: {
          0: "0",
          DEFAULT: "1"
        },
        flexShrink: {
          0: "0",
          DEFAULT: "1"
        },
        fontFamily: {
          sans: [
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
            '"Noto Color Emoji"'
          ],
          serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
          mono: [
            "ui-monospace",
            "SFMono-Regular",
            "Menlo",
            "Monaco",
            "Consolas",
            '"Liberation Mono"',
            '"Courier New"',
            "monospace"
          ]
        },
        fontSize: {
          xs: ["0.75rem", { lineHeight: "1rem" }],
          sm: ["0.875rem", { lineHeight: "1.25rem" }],
          base: ["1rem", { lineHeight: "1.5rem" }],
          lg: ["1.125rem", { lineHeight: "1.75rem" }],
          xl: ["1.25rem", { lineHeight: "1.75rem" }],
          "2xl": ["1.5rem", { lineHeight: "2rem" }],
          "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
          "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
          "5xl": ["3rem", { lineHeight: "1" }],
          "6xl": ["3.75rem", { lineHeight: "1" }],
          "7xl": ["4.5rem", { lineHeight: "1" }],
          "8xl": ["6rem", { lineHeight: "1" }],
          "9xl": ["8rem", { lineHeight: "1" }]
        },
        fontWeight: {
          thin: "100",
          extralight: "200",
          light: "300",
          normal: "400",
          medium: "500",
          semibold: "600",
          bold: "700",
          extrabold: "800",
          black: "900"
        },
        gap: ({ theme }) => theme("spacing"),
        gradientColorStops: ({ theme }) => theme("colors"),
        gradientColorStopPositions: {
          "0%": "0%",
          "5%": "5%",
          "10%": "10%",
          "15%": "15%",
          "20%": "20%",
          "25%": "25%",
          "30%": "30%",
          "35%": "35%",
          "40%": "40%",
          "45%": "45%",
          "50%": "50%",
          "55%": "55%",
          "60%": "60%",
          "65%": "65%",
          "70%": "70%",
          "75%": "75%",
          "80%": "80%",
          "85%": "85%",
          "90%": "90%",
          "95%": "95%",
          "100%": "100%"
        },
        grayscale: {
          0: "0",
          DEFAULT: "100%"
        },
        gridAutoColumns: {
          auto: "auto",
          min: "min-content",
          max: "max-content",
          fr: "minmax(0, 1fr)"
        },
        gridAutoRows: {
          auto: "auto",
          min: "min-content",
          max: "max-content",
          fr: "minmax(0, 1fr)"
        },
        gridColumn: {
          auto: "auto",
          "span-1": "span 1 / span 1",
          "span-2": "span 2 / span 2",
          "span-3": "span 3 / span 3",
          "span-4": "span 4 / span 4",
          "span-5": "span 5 / span 5",
          "span-6": "span 6 / span 6",
          "span-7": "span 7 / span 7",
          "span-8": "span 8 / span 8",
          "span-9": "span 9 / span 9",
          "span-10": "span 10 / span 10",
          "span-11": "span 11 / span 11",
          "span-12": "span 12 / span 12",
          "span-full": "1 / -1"
        },
        gridColumnEnd: {
          auto: "auto",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          10: "10",
          11: "11",
          12: "12",
          13: "13"
        },
        gridColumnStart: {
          auto: "auto",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          10: "10",
          11: "11",
          12: "12",
          13: "13"
        },
        gridRow: {
          auto: "auto",
          "span-1": "span 1 / span 1",
          "span-2": "span 2 / span 2",
          "span-3": "span 3 / span 3",
          "span-4": "span 4 / span 4",
          "span-5": "span 5 / span 5",
          "span-6": "span 6 / span 6",
          "span-7": "span 7 / span 7",
          "span-8": "span 8 / span 8",
          "span-9": "span 9 / span 9",
          "span-10": "span 10 / span 10",
          "span-11": "span 11 / span 11",
          "span-12": "span 12 / span 12",
          "span-full": "1 / -1"
        },
        gridRowEnd: {
          auto: "auto",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          10: "10",
          11: "11",
          12: "12",
          13: "13"
        },
        gridRowStart: {
          auto: "auto",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          10: "10",
          11: "11",
          12: "12",
          13: "13"
        },
        gridTemplateColumns: {
          none: "none",
          subgrid: "subgrid",
          1: "repeat(1, minmax(0, 1fr))",
          2: "repeat(2, minmax(0, 1fr))",
          3: "repeat(3, minmax(0, 1fr))",
          4: "repeat(4, minmax(0, 1fr))",
          5: "repeat(5, minmax(0, 1fr))",
          6: "repeat(6, minmax(0, 1fr))",
          7: "repeat(7, minmax(0, 1fr))",
          8: "repeat(8, minmax(0, 1fr))",
          9: "repeat(9, minmax(0, 1fr))",
          10: "repeat(10, minmax(0, 1fr))",
          11: "repeat(11, minmax(0, 1fr))",
          12: "repeat(12, minmax(0, 1fr))"
        },
        gridTemplateRows: {
          none: "none",
          subgrid: "subgrid",
          1: "repeat(1, minmax(0, 1fr))",
          2: "repeat(2, minmax(0, 1fr))",
          3: "repeat(3, minmax(0, 1fr))",
          4: "repeat(4, minmax(0, 1fr))",
          5: "repeat(5, minmax(0, 1fr))",
          6: "repeat(6, minmax(0, 1fr))",
          7: "repeat(7, minmax(0, 1fr))",
          8: "repeat(8, minmax(0, 1fr))",
          9: "repeat(9, minmax(0, 1fr))",
          10: "repeat(10, minmax(0, 1fr))",
          11: "repeat(11, minmax(0, 1fr))",
          12: "repeat(12, minmax(0, 1fr))"
        },
        height: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing"),
          "1/2": "50%",
          "1/3": "33.333333%",
          "2/3": "66.666667%",
          "1/4": "25%",
          "2/4": "50%",
          "3/4": "75%",
          "1/5": "20%",
          "2/5": "40%",
          "3/5": "60%",
          "4/5": "80%",
          "1/6": "16.666667%",
          "2/6": "33.333333%",
          "3/6": "50%",
          "4/6": "66.666667%",
          "5/6": "83.333333%",
          full: "100%",
          screen: "100vh",
          svh: "100svh",
          lvh: "100lvh",
          dvh: "100dvh",
          min: "min-content",
          max: "max-content",
          fit: "fit-content"
        }),
        hueRotate: {
          0: "0deg",
          15: "15deg",
          30: "30deg",
          60: "60deg",
          90: "90deg",
          180: "180deg"
        },
        inset: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing"),
          "1/2": "50%",
          "1/3": "33.333333%",
          "2/3": "66.666667%",
          "1/4": "25%",
          "2/4": "50%",
          "3/4": "75%",
          full: "100%"
        }),
        invert: {
          0: "0",
          DEFAULT: "100%"
        },
        keyframes: {
          spin: {
            to: {
              transform: "rotate(360deg)"
            }
          },
          ping: {
            "75%, 100%": {
              transform: "scale(2)",
              opacity: "0"
            }
          },
          pulse: {
            "50%": {
              opacity: ".5"
            }
          },
          bounce: {
            "0%, 100%": {
              transform: "translateY(-25%)",
              animationTimingFunction: "cubic-bezier(0.8,0,1,1)"
            },
            "50%": {
              transform: "none",
              animationTimingFunction: "cubic-bezier(0,0,0.2,1)"
            }
          }
        },
        letterSpacing: {
          tighter: "-0.05em",
          tight: "-0.025em",
          normal: "0em",
          wide: "0.025em",
          wider: "0.05em",
          widest: "0.1em"
        },
        lineHeight: {
          none: "1",
          tight: "1.25",
          snug: "1.375",
          normal: "1.5",
          relaxed: "1.625",
          loose: "2",
          3: ".75rem",
          4: "1rem",
          5: "1.25rem",
          6: "1.5rem",
          7: "1.75rem",
          8: "2rem",
          9: "2.25rem",
          10: "2.5rem"
        },
        listStyleType: {
          none: "none",
          disc: "disc",
          decimal: "decimal"
        },
        listStyleImage: {
          none: "none"
        },
        margin: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing")
        }),
        lineClamp: {
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6"
        },
        maxHeight: ({ theme }) => ({
          ...theme("spacing"),
          none: "none",
          full: "100%",
          screen: "100vh",
          svh: "100svh",
          lvh: "100lvh",
          dvh: "100dvh",
          min: "min-content",
          max: "max-content",
          fit: "fit-content"
        }),
        maxWidth: ({ theme, breakpoints }) => ({
          ...theme("spacing"),
          none: "none",
          xs: "20rem",
          sm: "24rem",
          md: "28rem",
          lg: "32rem",
          xl: "36rem",
          "2xl": "42rem",
          "3xl": "48rem",
          "4xl": "56rem",
          "5xl": "64rem",
          "6xl": "72rem",
          "7xl": "80rem",
          full: "100%",
          min: "min-content",
          max: "max-content",
          fit: "fit-content",
          prose: "65ch",
          ...breakpoints(theme("screens"))
        }),
        minHeight: ({ theme }) => ({
          ...theme("spacing"),
          full: "100%",
          screen: "100vh",
          svh: "100svh",
          lvh: "100lvh",
          dvh: "100dvh",
          min: "min-content",
          max: "max-content",
          fit: "fit-content"
        }),
        minWidth: ({ theme }) => ({
          ...theme("spacing"),
          full: "100%",
          min: "min-content",
          max: "max-content",
          fit: "fit-content"
        }),
        objectPosition: {
          bottom: "bottom",
          center: "center",
          left: "left",
          "left-bottom": "left bottom",
          "left-top": "left top",
          right: "right",
          "right-bottom": "right bottom",
          "right-top": "right top",
          top: "top"
        },
        opacity: {
          0: "0",
          5: "0.05",
          10: "0.1",
          15: "0.15",
          20: "0.2",
          25: "0.25",
          30: "0.3",
          35: "0.35",
          40: "0.4",
          45: "0.45",
          50: "0.5",
          55: "0.55",
          60: "0.6",
          65: "0.65",
          70: "0.7",
          75: "0.75",
          80: "0.8",
          85: "0.85",
          90: "0.9",
          95: "0.95",
          100: "1"
        },
        order: {
          first: "-9999",
          last: "9999",
          none: "0",
          1: "1",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9",
          10: "10",
          11: "11",
          12: "12"
        },
        outlineColor: ({ theme }) => theme("colors"),
        outlineOffset: {
          0: "0px",
          1: "1px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        outlineWidth: {
          0: "0px",
          1: "1px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        padding: ({ theme }) => theme("spacing"),
        placeholderColor: ({ theme }) => theme("colors"),
        placeholderOpacity: ({ theme }) => theme("opacity"),
        ringColor: ({ theme }) => ({
          DEFAULT: theme("colors.blue.500", "#3b82f6"),
          ...theme("colors")
        }),
        ringOffsetColor: ({ theme }) => theme("colors"),
        ringOffsetWidth: {
          0: "0px",
          1: "1px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        ringOpacity: ({ theme }) => ({
          DEFAULT: "0.5",
          ...theme("opacity")
        }),
        ringWidth: {
          DEFAULT: "3px",
          0: "0px",
          1: "1px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        rotate: {
          0: "0deg",
          1: "1deg",
          2: "2deg",
          3: "3deg",
          6: "6deg",
          12: "12deg",
          45: "45deg",
          90: "90deg",
          180: "180deg"
        },
        saturate: {
          0: "0",
          50: ".5",
          100: "1",
          150: "1.5",
          200: "2"
        },
        scale: {
          0: "0",
          50: ".5",
          75: ".75",
          90: ".9",
          95: ".95",
          100: "1",
          105: "1.05",
          110: "1.1",
          125: "1.25",
          150: "1.5"
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px"
        },
        scrollMargin: ({ theme }) => ({
          ...theme("spacing")
        }),
        scrollPadding: ({ theme }) => theme("spacing"),
        sepia: {
          0: "0",
          DEFAULT: "100%"
        },
        skew: {
          0: "0deg",
          1: "1deg",
          2: "2deg",
          3: "3deg",
          6: "6deg",
          12: "12deg"
        },
        space: ({ theme }) => ({
          ...theme("spacing")
        }),
        spacing: {
          px: "1px",
          0: "0px",
          0.5: "0.125rem",
          1: "0.25rem",
          1.5: "0.375rem",
          2: "0.5rem",
          2.5: "0.625rem",
          3: "0.75rem",
          3.5: "0.875rem",
          4: "1rem",
          5: "1.25rem",
          6: "1.5rem",
          7: "1.75rem",
          8: "2rem",
          9: "2.25rem",
          10: "2.5rem",
          11: "2.75rem",
          12: "3rem",
          14: "3.5rem",
          16: "4rem",
          20: "5rem",
          24: "6rem",
          28: "7rem",
          32: "8rem",
          36: "9rem",
          40: "10rem",
          44: "11rem",
          48: "12rem",
          52: "13rem",
          56: "14rem",
          60: "15rem",
          64: "16rem",
          72: "18rem",
          80: "20rem",
          96: "24rem"
        },
        stroke: ({ theme }) => ({
          none: "none",
          ...theme("colors")
        }),
        strokeWidth: {
          0: "0",
          1: "1",
          2: "2"
        },
        supports: {},
        data: {},
        textColor: ({ theme }) => theme("colors"),
        textDecorationColor: ({ theme }) => theme("colors"),
        textDecorationThickness: {
          auto: "auto",
          "from-font": "from-font",
          0: "0px",
          1: "1px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        textIndent: ({ theme }) => ({
          ...theme("spacing")
        }),
        textOpacity: ({ theme }) => theme("opacity"),
        textUnderlineOffset: {
          auto: "auto",
          0: "0px",
          1: "1px",
          2: "2px",
          4: "4px",
          8: "8px"
        },
        transformOrigin: {
          center: "center",
          top: "top",
          "top-right": "top right",
          right: "right",
          "bottom-right": "bottom right",
          bottom: "bottom",
          "bottom-left": "bottom left",
          left: "left",
          "top-left": "top left"
        },
        transitionDelay: {
          0: "0s",
          75: "75ms",
          100: "100ms",
          150: "150ms",
          200: "200ms",
          300: "300ms",
          500: "500ms",
          700: "700ms",
          1e3: "1000ms"
        },
        transitionDuration: {
          DEFAULT: "150ms",
          0: "0s",
          75: "75ms",
          100: "100ms",
          150: "150ms",
          200: "200ms",
          300: "300ms",
          500: "500ms",
          700: "700ms",
          1e3: "1000ms"
        },
        transitionProperty: {
          none: "none",
          all: "all",
          DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
          colors: "color, background-color, border-color, text-decoration-color, fill, stroke",
          opacity: "opacity",
          shadow: "box-shadow",
          transform: "transform"
        },
        transitionTimingFunction: {
          DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
          linear: "linear",
          in: "cubic-bezier(0.4, 0, 1, 1)",
          out: "cubic-bezier(0, 0, 0.2, 1)",
          "in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
        },
        translate: ({ theme }) => ({
          ...theme("spacing"),
          "1/2": "50%",
          "1/3": "33.333333%",
          "2/3": "66.666667%",
          "1/4": "25%",
          "2/4": "50%",
          "3/4": "75%",
          full: "100%"
        }),
        size: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing"),
          "1/2": "50%",
          "1/3": "33.333333%",
          "2/3": "66.666667%",
          "1/4": "25%",
          "2/4": "50%",
          "3/4": "75%",
          "1/5": "20%",
          "2/5": "40%",
          "3/5": "60%",
          "4/5": "80%",
          "1/6": "16.666667%",
          "2/6": "33.333333%",
          "3/6": "50%",
          "4/6": "66.666667%",
          "5/6": "83.333333%",
          "1/12": "8.333333%",
          "2/12": "16.666667%",
          "3/12": "25%",
          "4/12": "33.333333%",
          "5/12": "41.666667%",
          "6/12": "50%",
          "7/12": "58.333333%",
          "8/12": "66.666667%",
          "9/12": "75%",
          "10/12": "83.333333%",
          "11/12": "91.666667%",
          full: "100%",
          min: "min-content",
          max: "max-content",
          fit: "fit-content"
        }),
        width: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing"),
          "1/2": "50%",
          "1/3": "33.333333%",
          "2/3": "66.666667%",
          "1/4": "25%",
          "2/4": "50%",
          "3/4": "75%",
          "1/5": "20%",
          "2/5": "40%",
          "3/5": "60%",
          "4/5": "80%",
          "1/6": "16.666667%",
          "2/6": "33.333333%",
          "3/6": "50%",
          "4/6": "66.666667%",
          "5/6": "83.333333%",
          "1/12": "8.333333%",
          "2/12": "16.666667%",
          "3/12": "25%",
          "4/12": "33.333333%",
          "5/12": "41.666667%",
          "6/12": "50%",
          "7/12": "58.333333%",
          "8/12": "66.666667%",
          "9/12": "75%",
          "10/12": "83.333333%",
          "11/12": "91.666667%",
          full: "100%",
          screen: "100vw",
          svw: "100svw",
          lvw: "100lvw",
          dvw: "100dvw",
          min: "min-content",
          max: "max-content",
          fit: "fit-content"
        }),
        willChange: {
          auto: "auto",
          scroll: "scroll-position",
          contents: "contents",
          transform: "transform"
        },
        zIndex: {
          auto: "auto",
          0: "0",
          10: "10",
          20: "20",
          30: "30",
          40: "40",
          50: "50"
        }
      },
      plugins: []
    };
  }
});

// src/index.ts
import postcss8 from "postcss";

// src/stubs/tailwindcss/utils/log.ts
function log() {
}
function dim(input) {
  return input;
}
var log_default = {
  info: log,
  warn: log,
  risk: log
};

// node_modules/tailwindcss/src/lib/normalizeTailwindDirectives.js
function normalizeTailwindDirectives(root) {
  let tailwindDirectives = /* @__PURE__ */ new Set();
  let layerDirectives = /* @__PURE__ */ new Set();
  let applyDirectives = /* @__PURE__ */ new Set();
  root.walkAtRules((atRule) => {
    if (atRule.name === "apply") {
      applyDirectives.add(atRule);
    }
    if (atRule.name === "import") {
      if (atRule.params === '"tailwindcss/base"' || atRule.params === "'tailwindcss/base'") {
        atRule.name = "tailwind";
        atRule.params = "base";
      } else if (atRule.params === '"tailwindcss/components"' || atRule.params === "'tailwindcss/components'") {
        atRule.name = "tailwind";
        atRule.params = "components";
      } else if (atRule.params === '"tailwindcss/utilities"' || atRule.params === "'tailwindcss/utilities'") {
        atRule.name = "tailwind";
        atRule.params = "utilities";
      } else if (atRule.params === '"tailwindcss/screens"' || atRule.params === "'tailwindcss/screens'" || atRule.params === '"tailwindcss/variants"' || atRule.params === "'tailwindcss/variants'") {
        atRule.name = "tailwind";
        atRule.params = "variants";
      }
    }
    if (atRule.name === "tailwind") {
      if (atRule.params === "screens") {
        atRule.params = "variants";
      }
      tailwindDirectives.add(atRule.params);
    }
    if (["layer", "responsive", "variants"].includes(atRule.name)) {
      if (["responsive", "variants"].includes(atRule.name)) {
        log_default.warn(`${atRule.name}-at-rule-deprecated`, [
          `The \`@${atRule.name}\` directive has been deprecated in Tailwind CSS v3.0.`,
          `Use \`@layer utilities\` or \`@layer components\` instead.`,
          "https://tailwindcss.com/docs/upgrade-guide#replace-variants-with-layer"
        ]);
      }
      layerDirectives.add(atRule);
    }
  });
  if (!tailwindDirectives.has("base") || !tailwindDirectives.has("components") || !tailwindDirectives.has("utilities")) {
    for (let rule of layerDirectives) {
      if (rule.name === "layer" && ["base", "components", "utilities"].includes(rule.params)) {
        if (!tailwindDirectives.has(rule.params)) {
          throw rule.error(
            `\`@layer ${rule.params}\` is used but no matching \`@tailwind ${rule.params}\` directive is present.`
          );
        }
      } else if (rule.name === "responsive") {
        if (!tailwindDirectives.has("utilities")) {
          throw rule.error("`@responsive` is used but `@tailwind utilities` is missing.");
        }
      } else if (rule.name === "variants") {
        if (!tailwindDirectives.has("utilities")) {
          throw rule.error("`@variants` is used but `@tailwind utilities` is missing.");
        }
      }
    }
  }
  return { tailwindDirectives, applyDirectives };
}

// node_modules/tailwindcss/src/css/preflight.css
var preflight_default = '*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:theme("borderColor.DEFAULT",currentColor)}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:theme("fontFamily.sans",ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:theme("fontFamily.sans[1].fontFeatureSettings",normal);font-variation-settings:theme("fontFamily.sans[1].fontVariationSettings",normal);-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:theme("fontFamily.mono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:theme("fontFamily.mono[1].fontFeatureSettings",normal);font-variation-settings:theme("fontFamily.mono[1].fontVariationSettings",normal);font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:theme("colors.gray.400",#9ca3af)}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}\n';

// src/stubs/fs.ts
var fs_default = {
  readFileSync: () => preflight_default
};

// node_modules/tailwindcss/src/lib/expandTailwindAtRules.js
var import_quick_lru = __toESM(require_quick_lru());

// node_modules/tailwindcss/package.json
var version = "3.4.1";
var package_default = {
  name: "tailwindcss",
  version,
  description: "A utility-first CSS framework for rapidly building custom user interfaces.",
  license: "MIT",
  main: "lib/index.js",
  types: "types/index.d.ts",
  repository: "https://github.com/tailwindlabs/tailwindcss.git",
  bugs: "https://github.com/tailwindlabs/tailwindcss/issues",
  homepage: "https://tailwindcss.com",
  bin: {
    tailwind: "lib/cli.js",
    tailwindcss: "lib/cli.js"
  },
  tailwindcss: {
    engine: "stable"
  },
  scripts: {
    prebuild: "npm run generate && rimraf lib",
    build: `swc src --out-dir lib --copy-files --config jsc.transform.optimizer.globals.vars.__OXIDE__='"false"'`,
    postbuild: "esbuild lib/cli-peer-dependencies.js --bundle --platform=node --outfile=peers/index.js --define:process.env.CSS_TRANSFORMER_WASM=false",
    "rebuild-fixtures": "npm run build && node -r @swc/register scripts/rebuildFixtures.js",
    style: "eslint .",
    pretest: "npm run generate",
    test: "jest",
    "test:integrations": "npm run test --prefix ./integrations",
    "install:integrations": "node scripts/install-integrations.js",
    "generate:plugin-list": "node -r @swc/register scripts/create-plugin-list.js",
    "generate:types": "node -r @swc/register scripts/generate-types.js",
    generate: "npm run generate:plugin-list && npm run generate:types",
    "release-channel": "node ./scripts/release-channel.js",
    "release-notes": "node ./scripts/release-notes.js",
    prepublishOnly: "npm install --force && npm run build"
  },
  files: [
    "src/*",
    "cli/*",
    "lib/*",
    "peers/*",
    "scripts/*.js",
    "stubs/*",
    "nesting/*",
    "types/**/*",
    "*.d.ts",
    "*.css",
    "*.js"
  ],
  devDependencies: {
    "@swc/cli": "^0.1.62",
    "@swc/core": "^1.3.55",
    "@swc/jest": "^0.2.26",
    "@swc/register": "^0.1.10",
    autoprefixer: "^10.4.14",
    browserslist: "^4.21.5",
    concurrently: "^8.0.1",
    cssnano: "^6.0.0",
    esbuild: "^0.17.18",
    eslint: "^8.39.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1",
    jest: "^29.6.0",
    "jest-diff": "^29.6.0",
    lightningcss: "1.18.0",
    prettier: "^2.8.8",
    rimraf: "^5.0.0",
    "source-map-js": "^1.0.2",
    turbo: "^1.9.3"
  },
  dependencies: {
    "@alloc/quick-lru": "^5.2.0",
    arg: "^5.0.2",
    chokidar: "^3.5.3",
    didyoumean: "^1.2.2",
    dlv: "^1.1.3",
    "fast-glob": "^3.3.0",
    "glob-parent": "^6.0.2",
    "is-glob": "^4.0.3",
    jiti: "^1.19.1",
    lilconfig: "^2.1.0",
    micromatch: "^4.0.5",
    "normalize-path": "^3.0.0",
    "object-hash": "^3.0.0",
    picocolors: "^1.0.0",
    postcss: "^8.4.23",
    "postcss-import": "^15.1.0",
    "postcss-js": "^4.0.1",
    "postcss-load-config": "^4.0.1",
    "postcss-nested": "^6.0.1",
    "postcss-selector-parser": "^6.0.11",
    resolve: "^1.22.2",
    sucrase: "^3.32.0"
  },
  browserslist: [
    "> 1%",
    "not edge <= 18",
    "not ie 11",
    "not op_mini all"
  ],
  jest: {
    testTimeout: 3e4,
    setupFilesAfterEnv: [
      "<rootDir>/jest/customMatchers.js"
    ],
    testPathIgnorePatterns: [
      "/node_modules/",
      "/integrations/",
      "/standalone-cli/",
      "\\.test\\.skip\\.js$"
    ],
    transformIgnorePatterns: [
      "node_modules/(?!lightningcss)"
    ],
    transform: {
      "\\.js$": "@swc/jest",
      "\\.ts$": "@swc/jest"
    }
  },
  engines: {
    node: ">=14.0.0"
  }
};

// node_modules/tailwindcss/src/lib/sharedState.js
var env = typeof process !== "undefined" ? {
  NODE_ENV: "development",
  DEBUG: resolveDebug(void 0),
  ENGINE: package_default.tailwindcss.engine
} : {
  NODE_ENV: "production",
  DEBUG: false,
  ENGINE: package_default.tailwindcss.engine
};
var contextSourcesMap = /* @__PURE__ */ new Map();
var NOT_ON_DEMAND = new String("*");
var NONE = Symbol("__NONE__");
function resolveDebug(debug) {
  if (debug === void 0) {
    return false;
  }
  if (debug === "true" || debug === "1") {
    return true;
  }
  if (debug === "false" || debug === "0") {
    return false;
  }
  if (debug === "*") {
    return true;
  }
  let debuggers = debug.split(",").map((d) => d.split(":")[0]);
  if (debuggers.includes("-tailwindcss")) {
    return false;
  }
  if (debuggers.includes("tailwindcss")) {
    return true;
  }
  return false;
}

// node_modules/tailwindcss/src/lib/generateRules.js
import postcss5 from "postcss";
import selectorParser3 from "postcss-selector-parser";

// node_modules/tailwindcss/src/util/parseObjectStyles.js
import postcss from "postcss";
import postcssNested from "postcss-nested";
import postcssJs from "postcss-js";
function parseObjectStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseObjectStyles([styles]);
  }
  return styles.flatMap((style) => {
    return postcss([
      postcssNested({
        bubble: ["screen"]
      })
    ]).process(style, {
      parser: postcssJs
    }).root.nodes;
  });
}

// node_modules/tailwindcss/src/util/isPlainObject.js
function isPlainObject(value2) {
  if (Object.prototype.toString.call(value2) !== "[object Object]") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}

// node_modules/tailwindcss/src/util/prefixSelector.js
import parser from "postcss-selector-parser";
function prefixSelector_default(prefix3, selector, prependNegative = false) {
  if (prefix3 === "") {
    return selector;
  }
  let ast = typeof selector === "string" ? parser().astSync(selector) : selector;
  ast.walkClasses((classSelector) => {
    let baseClass = classSelector.value;
    let shouldPlaceNegativeBeforePrefix = prependNegative && baseClass.startsWith("-");
    classSelector.value = shouldPlaceNegativeBeforePrefix ? `-${prefix3}${baseClass.slice(1)}` : `${prefix3}${baseClass}`;
  });
  return typeof selector === "string" ? ast.toString() : ast;
}

// node_modules/tailwindcss/src/util/escapeCommas.js
function escapeCommas(className) {
  return className.replace(/\\,/g, "\\2c ");
}

// node_modules/tailwindcss/src/util/colorNames.js
var colorNames_default = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  grey: [128, 128, 128],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  rebeccapurple: [102, 51, 153],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};

// node_modules/tailwindcss/src/util/color.js
var HEX = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
var SHORT_HEX = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
var VALUE = /(?:\d+|\d*\.\d+)%?/;
var SEP = /(?:\s*,\s*|\s+)/;
var ALPHA_SEP = /\s*[,/]\s*/;
var CUSTOM_PROPERTY = /var\(--(?:[^ )]*?)(?:,(?:[^ )]*?|var\(--[^ )]*?\)))?\)/;
var RGB = new RegExp(
  `^(rgba?)\\(\\s*(${VALUE.source}|${CUSTOM_PROPERTY.source})(?:${SEP.source}(${VALUE.source}|${CUSTOM_PROPERTY.source}))?(?:${SEP.source}(${VALUE.source}|${CUSTOM_PROPERTY.source}))?(?:${ALPHA_SEP.source}(${VALUE.source}|${CUSTOM_PROPERTY.source}))?\\s*\\)$`
);
var HSL = new RegExp(
  `^(hsla?)\\(\\s*((?:${VALUE.source})(?:deg|rad|grad|turn)?|${CUSTOM_PROPERTY.source})(?:${SEP.source}(${VALUE.source}|${CUSTOM_PROPERTY.source}))?(?:${SEP.source}(${VALUE.source}|${CUSTOM_PROPERTY.source}))?(?:${ALPHA_SEP.source}(${VALUE.source}|${CUSTOM_PROPERTY.source}))?\\s*\\)$`
);
function parseColor(value2, { loose = false } = {}) {
  if (typeof value2 !== "string") {
    return null;
  }
  value2 = value2.trim();
  if (value2 === "transparent") {
    return { mode: "rgb", color: ["0", "0", "0"], alpha: "0" };
  }
  if (value2 in colorNames_default) {
    return { mode: "rgb", color: colorNames_default[value2].map((v) => v.toString()) };
  }
  let hex = value2.replace(SHORT_HEX, (_, r, g, b, a) => ["#", r, r, g, g, b, b, a ? a + a : ""].join("")).match(HEX);
  if (hex !== null) {
    return {
      mode: "rgb",
      color: [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)].map(
        (v) => v.toString()
      ),
      alpha: hex[4] ? (parseInt(hex[4], 16) / 255).toString() : void 0
    };
  }
  let match = value2.match(RGB) ?? value2.match(HSL);
  if (match === null) {
    return null;
  }
  let color2 = [match[2], match[3], match[4]].filter(Boolean).map((v) => v.toString());
  if (color2.length === 2 && color2[0].startsWith("var(")) {
    return {
      mode: match[1],
      color: [color2[0]],
      alpha: color2[1]
    };
  }
  if (!loose && color2.length !== 3) {
    return null;
  }
  if (color2.length < 3 && !color2.some((part) => /^var\(.*?\)$/.test(part))) {
    return null;
  }
  return {
    mode: match[1],
    color: color2,
    alpha: match[5]?.toString?.()
  };
}
function formatColor({ mode, color: color2, alpha }) {
  let hasAlpha = alpha !== void 0;
  if (mode === "rgba" || mode === "hsla") {
    return `${mode}(${color2.join(", ")}${hasAlpha ? `, ${alpha}` : ""})`;
  }
  return `${mode}(${color2.join(" ")}${hasAlpha ? ` / ${alpha}` : ""})`;
}

// node_modules/tailwindcss/src/util/withAlphaVariable.js
function withAlphaValue(color2, alphaValue, defaultValue) {
  if (typeof color2 === "function") {
    return color2({ opacityValue: alphaValue });
  }
  let parsed = parseColor(color2, { loose: true });
  if (parsed === null) {
    return defaultValue;
  }
  return formatColor({ ...parsed, alpha: alphaValue });
}
function withAlphaVariable({ color: color2, property, variable }) {
  let properties = [].concat(property);
  if (typeof color2 === "function") {
    return {
      [variable]: "1",
      ...Object.fromEntries(
        properties.map((p) => {
          return [p, color2({ opacityVariable: variable, opacityValue: `var(${variable})` })];
        })
      )
    };
  }
  const parsed = parseColor(color2);
  if (parsed === null) {
    return Object.fromEntries(properties.map((p) => [p, color2]));
  }
  if (parsed.alpha !== void 0) {
    return Object.fromEntries(properties.map((p) => [p, color2]));
  }
  return {
    [variable]: "1",
    ...Object.fromEntries(
      properties.map((p) => {
        return [p, formatColor({ ...parsed, alpha: `var(${variable})` })];
      })
    )
  };
}

// node_modules/tailwindcss/src/util/splitAtTopLevelOnly.js
function splitAtTopLevelOnly(input, separator) {
  let stack = [];
  let parts = [];
  let lastPos = 0;
  let isEscaped = false;
  for (let idx = 0; idx < input.length; idx++) {
    let char = input[idx];
    if (stack.length === 0 && char === separator[0] && !isEscaped) {
      if (separator.length === 1 || input.slice(idx, idx + separator.length) === separator) {
        parts.push(input.slice(lastPos, idx));
        lastPos = idx + separator.length;
      }
    }
    if (isEscaped) {
      isEscaped = false;
    } else if (char === "\\") {
      isEscaped = true;
    }
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
    } else if (char === ")" && stack[stack.length - 1] === "(" || char === "]" && stack[stack.length - 1] === "[" || char === "}" && stack[stack.length - 1] === "{") {
      stack.pop();
    }
  }
  parts.push(input.slice(lastPos));
  return parts;
}

// node_modules/tailwindcss/src/util/parseBoxShadowValue.js
var KEYWORDS = /* @__PURE__ */ new Set(["inset", "inherit", "initial", "revert", "unset"]);
var SPACE = /\ +(?![^(]*\))/g;
var LENGTH = /^-?(\d+|\.\d+)(.*?)$/g;
function parseBoxShadowValue(input) {
  let shadows = splitAtTopLevelOnly(input, ",");
  return shadows.map((shadow2) => {
    let value2 = shadow2.trim();
    let result = { raw: value2 };
    let parts = value2.split(SPACE);
    let seen = /* @__PURE__ */ new Set();
    for (let part of parts) {
      LENGTH.lastIndex = 0;
      if (!seen.has("KEYWORD") && KEYWORDS.has(part)) {
        result.keyword = part;
        seen.add("KEYWORD");
      } else if (LENGTH.test(part)) {
        if (!seen.has("X")) {
          result.x = part;
          seen.add("X");
        } else if (!seen.has("Y")) {
          result.y = part;
          seen.add("Y");
        } else if (!seen.has("BLUR")) {
          result.blur = part;
          seen.add("BLUR");
        } else if (!seen.has("SPREAD")) {
          result.spread = part;
          seen.add("SPREAD");
        }
      } else {
        if (!result.color) {
          result.color = part;
        } else {
          if (!result.unknown)
            result.unknown = [];
          result.unknown.push(part);
        }
      }
    }
    result.valid = result.x !== void 0 && result.y !== void 0;
    return result;
  });
}
function formatBoxShadowValue(shadows) {
  return shadows.map((shadow2) => {
    if (!shadow2.valid) {
      return shadow2.raw;
    }
    return [shadow2.keyword, shadow2.x, shadow2.y, shadow2.blur, shadow2.spread, shadow2.color].filter(Boolean).join(" ");
  }).join(", ");
}

// node_modules/tailwindcss/src/util/dataTypes.js
var cssFunctions = ["min", "max", "clamp", "calc"];
function isCSSFunction(value2) {
  return cssFunctions.some((fn) => new RegExp(`^${fn}\\(.*\\)`).test(value2));
}
var AUTO_VAR_INJECTION_EXCEPTIONS = /* @__PURE__ */ new Set([
  "scroll-timeline-name",
  "timeline-scope",
  "view-timeline-name",
  "font-palette",
  "scroll-timeline",
  "animation-timeline",
  "view-timeline"
]);
function normalize(value2, context = null, isRoot2 = true) {
  let isVarException = context && AUTO_VAR_INJECTION_EXCEPTIONS.has(context.property);
  if (value2.startsWith("--") && !isVarException) {
    return `var(${value2})`;
  }
  if (value2.includes("url(")) {
    return value2.split(/(url\(.*?\))/g).filter(Boolean).map((part) => {
      if (/^url\(.*?\)$/.test(part)) {
        return part;
      }
      return normalize(part, context, false);
    }).join("");
  }
  value2 = value2.replace(
    /([^\\])_+/g,
    (fullMatch, characterBefore) => characterBefore + " ".repeat(fullMatch.length - 1)
  ).replace(/^_/g, " ").replace(/\\_/g, "_");
  if (isRoot2) {
    value2 = value2.trim();
  }
  value2 = normalizeMathOperatorSpacing(value2);
  return value2;
}
function normalizeMathOperatorSpacing(value2) {
  let preventFormattingInFunctions = ["theme"];
  let preventFormattingKeywords = [
    "min-content",
    "max-content",
    "fit-content",
    "safe-area-inset-top",
    "safe-area-inset-right",
    "safe-area-inset-bottom",
    "safe-area-inset-left",
    "titlebar-area-x",
    "titlebar-area-y",
    "titlebar-area-width",
    "titlebar-area-height",
    "keyboard-inset-top",
    "keyboard-inset-right",
    "keyboard-inset-bottom",
    "keyboard-inset-left",
    "keyboard-inset-width",
    "keyboard-inset-height",
    "radial-gradient",
    "linear-gradient",
    "conic-gradient",
    "repeating-radial-gradient",
    "repeating-linear-gradient",
    "repeating-conic-gradient"
  ];
  return value2.replace(/(calc|min|max|clamp)\(.+\)/g, (match) => {
    let result = "";
    function lastChar() {
      let char = result.trimEnd();
      return char[char.length - 1];
    }
    for (let i = 0; i < match.length; i++) {
      let peek = function(word) {
        return word.split("").every((char2, j) => match[i + j] === char2);
      }, consumeUntil = function(chars) {
        let minIndex = Infinity;
        for (let char2 of chars) {
          let index = match.indexOf(char2, i);
          if (index !== -1 && index < minIndex) {
            minIndex = index;
          }
        }
        let result2 = match.slice(i, minIndex);
        i += result2.length - 1;
        return result2;
      };
      let char = match[i];
      if (peek("var")) {
        result += consumeUntil([")", ","]);
      } else if (preventFormattingKeywords.some((keyword) => peek(keyword))) {
        let keyword = preventFormattingKeywords.find((keyword2) => peek(keyword2));
        result += keyword;
        i += keyword.length - 1;
      } else if (preventFormattingInFunctions.some((fn) => peek(fn))) {
        result += consumeUntil([")"]);
      } else if (peek("[")) {
        result += consumeUntil(["]"]);
      } else if (["+", "-", "*", "/"].includes(char) && !["(", "+", "-", "*", "/", ","].includes(lastChar())) {
        result += ` ${char} `;
      } else {
        result += char;
      }
    }
    return result.replace(/\s+/g, " ");
  });
}
function url(value2) {
  return value2.startsWith("url(");
}
function number(value2) {
  return !isNaN(Number(value2)) || isCSSFunction(value2);
}
function percentage(value2) {
  return value2.endsWith("%") && number(value2.slice(0, -1)) || isCSSFunction(value2);
}
var lengthUnits = [
  "cm",
  "mm",
  "Q",
  "in",
  "pc",
  "pt",
  "px",
  "em",
  "ex",
  "ch",
  "rem",
  "lh",
  "rlh",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "vb",
  "vi",
  "svw",
  "svh",
  "lvw",
  "lvh",
  "dvw",
  "dvh",
  "cqw",
  "cqh",
  "cqi",
  "cqb",
  "cqmin",
  "cqmax"
];
var lengthUnitsPattern = `(?:${lengthUnits.join("|")})`;
function length(value2) {
  return value2 === "0" || new RegExp(`^[+-]?[0-9]*.?[0-9]+(?:[eE][+-]?[0-9]+)?${lengthUnitsPattern}$`).test(value2) || isCSSFunction(value2);
}
var lineWidths = /* @__PURE__ */ new Set(["thin", "medium", "thick"]);
function lineWidth(value2) {
  return lineWidths.has(value2);
}
function shadow(value2) {
  let parsedShadows = parseBoxShadowValue(normalize(value2));
  for (let parsedShadow of parsedShadows) {
    if (!parsedShadow.valid) {
      return false;
    }
  }
  return true;
}
function color(value2) {
  let colors = 0;
  let result = splitAtTopLevelOnly(value2, "_").every((part) => {
    part = normalize(part);
    if (part.startsWith("var("))
      return true;
    if (parseColor(part, { loose: true }) !== null)
      return colors++, true;
    return false;
  });
  if (!result)
    return false;
  return colors > 0;
}
function image(value2) {
  let images = 0;
  let result = splitAtTopLevelOnly(value2, ",").every((part) => {
    part = normalize(part);
    if (part.startsWith("var("))
      return true;
    if (url(part) || gradient(part) || ["element(", "image(", "cross-fade(", "image-set("].some((fn) => part.startsWith(fn))) {
      images++;
      return true;
    }
    return false;
  });
  if (!result)
    return false;
  return images > 0;
}
var gradientTypes = /* @__PURE__ */ new Set([
  "conic-gradient",
  "linear-gradient",
  "radial-gradient",
  "repeating-conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient"
]);
function gradient(value2) {
  value2 = normalize(value2);
  for (let type of gradientTypes) {
    if (value2.startsWith(`${type}(`)) {
      return true;
    }
  }
  return false;
}
var validPositions = /* @__PURE__ */ new Set(["center", "top", "right", "bottom", "left"]);
function position(value2) {
  let positions = 0;
  let result = splitAtTopLevelOnly(value2, "_").every((part) => {
    part = normalize(part);
    if (part.startsWith("var("))
      return true;
    if (validPositions.has(part) || length(part) || percentage(part)) {
      positions++;
      return true;
    }
    return false;
  });
  if (!result)
    return false;
  return positions > 0;
}
function familyName(value2) {
  let fonts = 0;
  let result = splitAtTopLevelOnly(value2, ",").every((part) => {
    part = normalize(part);
    if (part.startsWith("var("))
      return true;
    if (part.includes(" ")) {
      if (!/(['"])([^"']+)\1/g.test(part)) {
        return false;
      }
    }
    if (/^\d/g.test(part)) {
      return false;
    }
    fonts++;
    return true;
  });
  if (!result)
    return false;
  return fonts > 0;
}
var genericNames = /* @__PURE__ */ new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong"
]);
function genericName(value2) {
  return genericNames.has(value2);
}
var absoluteSizes = /* @__PURE__ */ new Set([
  "xx-small",
  "x-small",
  "small",
  "medium",
  "large",
  "x-large",
  "x-large",
  "xxx-large"
]);
function absoluteSize(value2) {
  return absoluteSizes.has(value2);
}
var relativeSizes = /* @__PURE__ */ new Set(["larger", "smaller"]);
function relativeSize(value2) {
  return relativeSizes.has(value2);
}

// node_modules/tailwindcss/src/util/negateValue.js
function negateValue(value2) {
  value2 = `${value2}`;
  if (value2 === "0") {
    return "0";
  }
  if (/^[+-]?(\d+|\d*\.\d+)(e[+-]?\d+)?(%|\w+)?$/.test(value2)) {
    return value2.replace(/^[+-]?/, (sign) => sign === "-" ? "" : "-");
  }
  let numericFunctions = ["var", "calc", "min", "max", "clamp"];
  for (const fn of numericFunctions) {
    if (value2.includes(`${fn}(`)) {
      return `calc(${value2} * -1)`;
    }
  }
}

// node_modules/tailwindcss/src/util/validateFormalSyntax.js
function backgroundSize(value2) {
  let keywordValues = ["cover", "contain"];
  return splitAtTopLevelOnly(value2, ",").every((part) => {
    let sizes = splitAtTopLevelOnly(part, "_").filter(Boolean);
    if (sizes.length === 1 && keywordValues.includes(sizes[0]))
      return true;
    if (sizes.length !== 1 && sizes.length !== 2)
      return false;
    return sizes.every((size) => length(size) || percentage(size) || size === "auto");
  });
}

// src/stubs/picocolors.ts
var picocolors_default = {
  yellow: (input) => input
};

// node_modules/tailwindcss/src/featureFlags.js
var defaults = {
  optimizeUniversalDefaults: false,
  generalizedModifiers: true,
  get disableColorOpacityUtilitiesByDefault() {
    return false;
  },
  get relativeContentPathsByDefault() {
    return false;
  }
};
var featureFlags = {
  future: [
    "hoverOnlyWhenSupported",
    "respectDefaultRingColorOpacity",
    "disableColorOpacityUtilitiesByDefault",
    "relativeContentPathsByDefault"
  ],
  experimental: ["optimizeUniversalDefaults", "generalizedModifiers"]
};
function flagEnabled(config, flag) {
  if (featureFlags.future.includes(flag)) {
    return config.future === "all" || (config?.future?.[flag] ?? defaults[flag] ?? false);
  }
  if (featureFlags.experimental.includes(flag)) {
    return config.experimental === "all" || (config?.experimental?.[flag] ?? defaults[flag] ?? false);
  }
  return false;
}
function experimentalFlagsEnabled(config) {
  if (config.experimental === "all") {
    return featureFlags.experimental;
  }
  return Object.keys(config?.experimental ?? {}).filter(
    (flag) => featureFlags.experimental.includes(flag) && config.experimental[flag]
  );
}
function issueFlagNotices(config) {
  if (1 !== void 0) {
    return;
  }
  if (experimentalFlagsEnabled(config).length > 0) {
    let changes = experimentalFlagsEnabled(config).map((s) => picocolors_default.yellow(s)).join(", ");
    log_default.warn("experimental-flags-enabled", [
      `You have enabled experimental features: ${changes}`,
      "Experimental features in Tailwind CSS are not covered by semver, may introduce breaking changes, and can change at any time."
    ]);
  }
}

// node_modules/tailwindcss/src/util/pluginUtils.js
function updateAllClasses(selectors, updateClass) {
  selectors.walkClasses((sel) => {
    sel.value = updateClass(sel.value);
    if (sel.raws && sel.raws.value) {
      sel.raws.value = escapeCommas(sel.raws.value);
    }
  });
}
function resolveArbitraryValue(modifier, validate) {
  if (!isArbitraryValue(modifier)) {
    return void 0;
  }
  let value2 = modifier.slice(1, -1);
  if (!validate(value2)) {
    return void 0;
  }
  return normalize(value2);
}
function asNegativeValue(modifier, lookup = {}, validate) {
  let positiveValue = lookup[modifier];
  if (positiveValue !== void 0) {
    return negateValue(positiveValue);
  }
  if (isArbitraryValue(modifier)) {
    let resolved = resolveArbitraryValue(modifier, validate);
    if (resolved === void 0) {
      return void 0;
    }
    return negateValue(resolved);
  }
}
function asValue(modifier, options = {}, { validate = () => true } = {}) {
  let value2 = options.values?.[modifier];
  if (value2 !== void 0) {
    return value2;
  }
  if (options.supportsNegativeValues && modifier.startsWith("-")) {
    return asNegativeValue(modifier.slice(1), options.values, validate);
  }
  return resolveArbitraryValue(modifier, validate);
}
function isArbitraryValue(input) {
  return input.startsWith("[") && input.endsWith("]");
}
function splitUtilityModifier(modifier) {
  let slashIdx = modifier.lastIndexOf("/");
  let arbitraryStartIdx = modifier.lastIndexOf("[", slashIdx);
  let arbitraryEndIdx = modifier.indexOf("]", slashIdx);
  let isNextToArbitrary = modifier[slashIdx - 1] === "]" || modifier[slashIdx + 1] === "[";
  if (!isNextToArbitrary) {
    if (arbitraryStartIdx !== -1 && arbitraryEndIdx !== -1) {
      if (arbitraryStartIdx < slashIdx && slashIdx < arbitraryEndIdx) {
        slashIdx = modifier.lastIndexOf("/", arbitraryStartIdx);
      }
    }
  }
  if (slashIdx === -1 || slashIdx === modifier.length - 1) {
    return [modifier, void 0];
  }
  let arbitrary = isArbitraryValue(modifier);
  if (arbitrary && !modifier.includes("]/[")) {
    return [modifier, void 0];
  }
  return [modifier.slice(0, slashIdx), modifier.slice(slashIdx + 1)];
}
function parseColorFormat(value2) {
  if (typeof value2 === "string" && value2.includes("<alpha-value>")) {
    let oldValue = value2;
    return ({ opacityValue = 1 }) => oldValue.replace("<alpha-value>", opacityValue);
  }
  return value2;
}
function unwrapArbitraryModifier(modifier) {
  return normalize(modifier.slice(1, -1));
}
function asColor(modifier, options = {}, { tailwindConfig = {} } = {}) {
  if (options.values?.[modifier] !== void 0) {
    return parseColorFormat(options.values?.[modifier]);
  }
  let [color2, alpha] = splitUtilityModifier(modifier);
  if (alpha !== void 0) {
    let normalizedColor = options.values?.[color2] ?? (isArbitraryValue(color2) ? color2.slice(1, -1) : void 0);
    if (normalizedColor === void 0) {
      return void 0;
    }
    normalizedColor = parseColorFormat(normalizedColor);
    if (isArbitraryValue(alpha)) {
      return withAlphaValue(normalizedColor, unwrapArbitraryModifier(alpha));
    }
    if (tailwindConfig.theme?.opacity?.[alpha] === void 0) {
      return void 0;
    }
    return withAlphaValue(normalizedColor, tailwindConfig.theme.opacity[alpha]);
  }
  return asValue(modifier, options, { validate: color });
}
function asLookupValue(modifier, options = {}) {
  return options.values?.[modifier];
}
function guess(validate) {
  return (modifier, options) => {
    return asValue(modifier, options, { validate });
  };
}
var typeMap = {
  any: asValue,
  color: asColor,
  url: guess(url),
  image: guess(image),
  length: guess(length),
  percentage: guess(percentage),
  position: guess(position),
  lookup: asLookupValue,
  "generic-name": guess(genericName),
  "family-name": guess(familyName),
  number: guess(number),
  "line-width": guess(lineWidth),
  "absolute-size": guess(absoluteSize),
  "relative-size": guess(relativeSize),
  shadow: guess(shadow),
  size: guess(backgroundSize)
};
var supportedTypes = Object.keys(typeMap);
function splitAtFirst(input, delim) {
  let idx = input.indexOf(delim);
  if (idx === -1)
    return [void 0, input];
  return [input.slice(0, idx), input.slice(idx + 1)];
}
function coerceValue(types2, modifier, options, tailwindConfig) {
  if (options.values && modifier in options.values) {
    for (let { type } of types2 ?? []) {
      let result = typeMap[type](modifier, options, {
        tailwindConfig
      });
      if (result === void 0) {
        continue;
      }
      return [result, type, null];
    }
  }
  if (isArbitraryValue(modifier)) {
    let arbitraryValue = modifier.slice(1, -1);
    let [explicitType, value2] = splitAtFirst(arbitraryValue, ":");
    if (!/^[\w-_]+$/g.test(explicitType)) {
      value2 = arbitraryValue;
    } else if (explicitType !== void 0 && !supportedTypes.includes(explicitType)) {
      return [];
    }
    if (value2.length > 0 && supportedTypes.includes(explicitType)) {
      return [asValue(`[${value2}]`, options), explicitType, null];
    }
  }
  let matches = getMatchingTypes(types2, modifier, options, tailwindConfig);
  for (let match of matches) {
    return match;
  }
  return [];
}
function* getMatchingTypes(types2, rawModifier, options, tailwindConfig) {
  let modifiersEnabled = flagEnabled(tailwindConfig, "generalizedModifiers");
  let [modifier, utilityModifier] = splitUtilityModifier(rawModifier);
  let canUseUtilityModifier = modifiersEnabled && options.modifiers != null && (options.modifiers === "any" || typeof options.modifiers === "object" && (utilityModifier && isArbitraryValue(utilityModifier) || utilityModifier in options.modifiers));
  if (!canUseUtilityModifier) {
    modifier = rawModifier;
    utilityModifier = void 0;
  }
  if (utilityModifier !== void 0 && modifier === "") {
    modifier = "DEFAULT";
  }
  if (utilityModifier !== void 0) {
    if (typeof options.modifiers === "object") {
      let configValue = options.modifiers?.[utilityModifier] ?? null;
      if (configValue !== null) {
        utilityModifier = configValue;
      } else if (isArbitraryValue(utilityModifier)) {
        utilityModifier = unwrapArbitraryModifier(utilityModifier);
      }
    }
  }
  for (let { type } of types2 ?? []) {
    let result = typeMap[type](modifier, options, {
      tailwindConfig
    });
    if (result === void 0) {
      continue;
    }
    yield [result, type, utilityModifier ?? null];
  }
}

// node_modules/tailwindcss/src/util/formatVariantSelector.js
import selectorParser from "postcss-selector-parser";
import unescape from "postcss-selector-parser/dist/util/unesc.js";

// node_modules/tailwindcss/src/util/escapeClassName.js
import parser2 from "postcss-selector-parser";
function escapeClassName(className) {
  let node = parser2.className();
  node.value = className;
  return escapeCommas(node?.raws?.value ?? node.value);
}

// node_modules/tailwindcss/src/util/pseudoElements.js
var elementProperties = {
  "::after": ["terminal", "jumpable"],
  "::backdrop": ["terminal", "jumpable"],
  "::before": ["terminal", "jumpable"],
  "::cue": ["terminal"],
  "::cue-region": ["terminal"],
  "::first-letter": ["terminal", "jumpable"],
  "::first-line": ["terminal", "jumpable"],
  "::grammar-error": ["terminal"],
  "::marker": ["terminal", "jumpable"],
  "::part": ["terminal", "actionable"],
  "::placeholder": ["terminal", "jumpable"],
  "::selection": ["terminal", "jumpable"],
  "::slotted": ["terminal"],
  "::spelling-error": ["terminal"],
  "::target-text": ["terminal"],
  "::file-selector-button": ["terminal", "actionable"],
  "::deep": ["actionable"],
  "::v-deep": ["actionable"],
  "::ng-deep": ["actionable"],
  ":after": ["terminal", "jumpable"],
  ":before": ["terminal", "jumpable"],
  ":first-letter": ["terminal", "jumpable"],
  ":first-line": ["terminal", "jumpable"],
  ":where": [],
  ":is": [],
  ":has": [],
  __default__: ["terminal", "actionable"]
};
function movePseudos(sel) {
  let [pseudos] = movablePseudos(sel);
  pseudos.forEach(([sel2, pseudo]) => sel2.removeChild(pseudo));
  sel.nodes.push(...pseudos.map(([, pseudo]) => pseudo));
  return sel;
}
function movablePseudos(sel) {
  let buffer = [];
  let lastSeenElement = null;
  for (let node of sel.nodes) {
    if (node.type === "combinator") {
      buffer = buffer.filter(([, node2]) => propertiesForPseudo(node2).includes("jumpable"));
      lastSeenElement = null;
    } else if (node.type === "pseudo") {
      if (isMovablePseudoElement(node)) {
        lastSeenElement = node;
        buffer.push([sel, node, null]);
      } else if (lastSeenElement && isAttachablePseudoClass(node, lastSeenElement)) {
        buffer.push([sel, node, lastSeenElement]);
      } else {
        lastSeenElement = null;
      }
      for (let sub of node.nodes ?? []) {
        let [movable, lastSeenElementInSub] = movablePseudos(sub);
        lastSeenElement = lastSeenElementInSub || lastSeenElement;
        buffer.push(...movable);
      }
    }
  }
  return [buffer, lastSeenElement];
}
function isPseudoElement(node) {
  return node.value.startsWith("::") || elementProperties[node.value] !== void 0;
}
function isMovablePseudoElement(node) {
  return isPseudoElement(node) && propertiesForPseudo(node).includes("terminal");
}
function isAttachablePseudoClass(node, pseudo) {
  if (node.type !== "pseudo")
    return false;
  if (isPseudoElement(node))
    return false;
  return propertiesForPseudo(pseudo).includes("actionable");
}
function propertiesForPseudo(pseudo) {
  return elementProperties[pseudo.value] ?? elementProperties.__default__;
}

// node_modules/tailwindcss/src/util/formatVariantSelector.js
var MERGE = ":merge";
function formatVariantSelector(formats, { context, candidate }) {
  let prefix3 = context?.tailwindConfig.prefix ?? "";
  let parsedFormats = formats.map((format) => {
    let ast = selectorParser().astSync(format.format);
    return {
      ...format,
      ast: format.respectPrefix ? prefixSelector_default(prefix3, ast) : ast
    };
  });
  let formatAst = selectorParser.root({
    nodes: [
      selectorParser.selector({
        nodes: [selectorParser.className({ value: escapeClassName(candidate) })]
      })
    ]
  });
  for (let { ast } of parsedFormats) {
    ;
    [formatAst, ast] = handleMergePseudo(formatAst, ast);
    ast.walkNesting((nesting) => nesting.replaceWith(...formatAst.nodes[0].nodes));
    formatAst = ast;
  }
  return formatAst;
}
function simpleSelectorForNode(node) {
  let nodes = [];
  while (node.prev() && node.prev().type !== "combinator") {
    node = node.prev();
  }
  while (node && node.type !== "combinator") {
    nodes.push(node);
    node = node.next();
  }
  return nodes;
}
function resortSelector(sel) {
  sel.sort((a, b) => {
    if (a.type === "tag" && b.type === "class") {
      return -1;
    } else if (a.type === "class" && b.type === "tag") {
      return 1;
    } else if (a.type === "class" && b.type === "pseudo" && b.value.startsWith("::")) {
      return -1;
    } else if (a.type === "pseudo" && a.value.startsWith("::") && b.type === "class") {
      return 1;
    }
    return sel.index(a) - sel.index(b);
  });
  return sel;
}
function eliminateIrrelevantSelectors(sel, base) {
  let hasClassesMatchingCandidate = false;
  sel.walk((child) => {
    if (child.type === "class" && child.value === base) {
      hasClassesMatchingCandidate = true;
      return false;
    }
  });
  if (!hasClassesMatchingCandidate) {
    sel.remove();
  }
}
function finalizeSelector(current, formats, { context, candidate, base }) {
  let separator = context?.tailwindConfig?.separator ?? ":";
  base = base ?? splitAtTopLevelOnly(candidate, separator).pop();
  let selector = selectorParser().astSync(current);
  selector.walkClasses((node) => {
    if (node.raws && node.value.includes(base)) {
      node.raws.value = escapeClassName(unescape(node.raws.value));
    }
  });
  selector.each((sel) => eliminateIrrelevantSelectors(sel, base));
  if (selector.length === 0) {
    return null;
  }
  let formatAst = Array.isArray(formats) ? formatVariantSelector(formats, { context, candidate }) : formats;
  if (formatAst === null) {
    return selector.toString();
  }
  let simpleStart = selectorParser.comment({ value: "/*__simple__*/" });
  let simpleEnd = selectorParser.comment({ value: "/*__simple__*/" });
  selector.walkClasses((node) => {
    if (node.value !== base) {
      return;
    }
    let parent = node.parent;
    let formatNodes = formatAst.nodes[0].nodes;
    if (parent.nodes.length === 1) {
      node.replaceWith(...formatNodes);
      return;
    }
    let simpleSelector = simpleSelectorForNode(node);
    parent.insertBefore(simpleSelector[0], simpleStart);
    parent.insertAfter(simpleSelector[simpleSelector.length - 1], simpleEnd);
    for (let child of formatNodes) {
      parent.insertBefore(simpleSelector[0], child.clone());
    }
    node.remove();
    simpleSelector = simpleSelectorForNode(simpleStart);
    let firstNode = parent.index(simpleStart);
    parent.nodes.splice(
      firstNode,
      simpleSelector.length,
      ...resortSelector(selectorParser.selector({ nodes: simpleSelector })).nodes
    );
    simpleStart.remove();
    simpleEnd.remove();
  });
  selector.walkPseudos((p) => {
    if (p.value === MERGE) {
      p.replaceWith(p.nodes);
    }
  });
  selector.each((sel) => movePseudos(sel));
  return selector.toString();
}
function handleMergePseudo(selector, format) {
  let merges = [];
  selector.walkPseudos((pseudo) => {
    if (pseudo.value === MERGE) {
      merges.push({
        pseudo,
        value: pseudo.nodes[0].toString()
      });
    }
  });
  format.walkPseudos((pseudo) => {
    if (pseudo.value !== MERGE) {
      return;
    }
    let value2 = pseudo.nodes[0].toString();
    let existing = merges.find((merge) => merge.value === value2);
    if (!existing) {
      return;
    }
    let attachments = [];
    let next = pseudo.next();
    while (next && next.type !== "combinator") {
      attachments.push(next);
      next = next.next();
    }
    let combinator = next;
    existing.pseudo.parent.insertAfter(
      existing.pseudo,
      selectorParser.selector({ nodes: attachments.map((node) => node.clone()) })
    );
    pseudo.remove();
    attachments.forEach((node) => node.remove());
    if (combinator && combinator.type === "combinator") {
      combinator.remove();
    }
  });
  return [selector, format];
}

// node_modules/tailwindcss/src/util/nameClass.js
function asClass(name) {
  return escapeCommas(`.${escapeClassName(name)}`);
}
function nameClass(classPrefix, key) {
  return asClass(formatClass(classPrefix, key));
}
function formatClass(classPrefix, key) {
  if (key === "DEFAULT") {
    return classPrefix;
  }
  if (key === "-" || key === "-DEFAULT") {
    return `-${classPrefix}`;
  }
  if (key.startsWith("-")) {
    return `-${classPrefix}${key}`;
  }
  if (key.startsWith("/")) {
    return `${classPrefix}${key}`;
  }
  return `${classPrefix}-${key}`;
}

// node_modules/tailwindcss/src/lib/setupContextUtils.js
import postcss4 from "postcss";
import dlv from "dlv";
import selectorParser2 from "postcss-selector-parser";

// node_modules/tailwindcss/src/util/transformThemeValue.js
import postcss2 from "postcss";
function transformThemeValue(themeSection) {
  if (["fontSize", "outline"].includes(themeSection)) {
    return (value2) => {
      if (typeof value2 === "function")
        value2 = value2({});
      if (Array.isArray(value2))
        value2 = value2[0];
      return value2;
    };
  }
  if (themeSection === "fontFamily") {
    return (value2) => {
      if (typeof value2 === "function")
        value2 = value2({});
      let families = Array.isArray(value2) && isPlainObject(value2[1]) ? value2[0] : value2;
      return Array.isArray(families) ? families.join(", ") : families;
    };
  }
  if ([
    "boxShadow",
    "transitionProperty",
    "transitionDuration",
    "transitionDelay",
    "transitionTimingFunction",
    "backgroundImage",
    "backgroundSize",
    "backgroundColor",
    "cursor",
    "animation"
  ].includes(themeSection)) {
    return (value2) => {
      if (typeof value2 === "function")
        value2 = value2({});
      if (Array.isArray(value2))
        value2 = value2.join(", ");
      return value2;
    };
  }
  if (["gridTemplateColumns", "gridTemplateRows", "objectPosition"].includes(themeSection)) {
    return (value2) => {
      if (typeof value2 === "function")
        value2 = value2({});
      if (typeof value2 === "string")
        value2 = postcss2.list.comma(value2).join(" ");
      return value2;
    };
  }
  return (value2, opts = {}) => {
    if (typeof value2 === "function") {
      value2 = value2(opts);
    }
    return value2;
  };
}

// src/stubs/path.ts
var join = () => "";

// node_modules/tailwindcss/src/corePlugins.js
import postcss3 from "postcss";

// node_modules/tailwindcss/src/util/createUtilityPlugin.js
function createUtilityPlugin(themeKey, utilityVariations = [[themeKey, [themeKey]]], { filterDefault = false, ...options } = {}) {
  let transformValue = transformThemeValue(themeKey);
  return function({ matchUtilities, theme }) {
    for (let utilityVariation of utilityVariations) {
      let group = Array.isArray(utilityVariation[0]) ? utilityVariation : [utilityVariation];
      matchUtilities(
        group.reduce((obj, [classPrefix, properties]) => {
          return Object.assign(obj, {
            [classPrefix]: (value2) => {
              return properties.reduce((obj2, name) => {
                if (Array.isArray(name)) {
                  return Object.assign(obj2, { [name[0]]: name[1] });
                }
                return Object.assign(obj2, { [name]: transformValue(value2) });
              }, {});
            }
          });
        }, {}),
        {
          ...options,
          values: filterDefault ? Object.fromEntries(
            Object.entries(theme(themeKey) ?? {}).filter(([modifier]) => modifier !== "DEFAULT")
          ) : theme(themeKey)
        }
      );
    }
  };
}

// node_modules/tailwindcss/src/util/buildMediaQuery.js
function buildMediaQuery(screens) {
  screens = Array.isArray(screens) ? screens : [screens];
  return screens.map((screen) => {
    let values = screen.values.map((screen2) => {
      if (screen2.raw !== void 0) {
        return screen2.raw;
      }
      return [
        screen2.min && `(min-width: ${screen2.min})`,
        screen2.max && `(max-width: ${screen2.max})`
      ].filter(Boolean).join(" and ");
    });
    return screen.not ? `not all and ${values}` : values;
  }).join(", ");
}

// node_modules/tailwindcss/src/util/parseAnimationValue.js
var DIRECTIONS = /* @__PURE__ */ new Set(["normal", "reverse", "alternate", "alternate-reverse"]);
var PLAY_STATES = /* @__PURE__ */ new Set(["running", "paused"]);
var FILL_MODES = /* @__PURE__ */ new Set(["none", "forwards", "backwards", "both"]);
var ITERATION_COUNTS = /* @__PURE__ */ new Set(["infinite"]);
var TIMINGS = /* @__PURE__ */ new Set([
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end"
]);
var TIMING_FNS = ["cubic-bezier", "steps"];
var COMMA = /\,(?![^(]*\))/g;
var SPACE2 = /\ +(?![^(]*\))/g;
var TIME = /^(-?[\d.]+m?s)$/;
var DIGIT = /^(\d+)$/;
function parseAnimationValue(input) {
  let animations = input.split(COMMA);
  return animations.map((animation) => {
    let value2 = animation.trim();
    let result = { value: value2 };
    let parts = value2.split(SPACE2);
    let seen = /* @__PURE__ */ new Set();
    for (let part of parts) {
      if (!seen.has("DIRECTIONS") && DIRECTIONS.has(part)) {
        result.direction = part;
        seen.add("DIRECTIONS");
      } else if (!seen.has("PLAY_STATES") && PLAY_STATES.has(part)) {
        result.playState = part;
        seen.add("PLAY_STATES");
      } else if (!seen.has("FILL_MODES") && FILL_MODES.has(part)) {
        result.fillMode = part;
        seen.add("FILL_MODES");
      } else if (!seen.has("ITERATION_COUNTS") && (ITERATION_COUNTS.has(part) || DIGIT.test(part))) {
        result.iterationCount = part;
        seen.add("ITERATION_COUNTS");
      } else if (!seen.has("TIMING_FUNCTION") && TIMINGS.has(part)) {
        result.timingFunction = part;
        seen.add("TIMING_FUNCTION");
      } else if (!seen.has("TIMING_FUNCTION") && TIMING_FNS.some((f) => part.startsWith(`${f}(`))) {
        result.timingFunction = part;
        seen.add("TIMING_FUNCTION");
      } else if (!seen.has("DURATION") && TIME.test(part)) {
        result.duration = part;
        seen.add("DURATION");
      } else if (!seen.has("DELAY") && TIME.test(part)) {
        result.delay = part;
        seen.add("DELAY");
      } else if (!seen.has("NAME")) {
        result.name = part;
        seen.add("NAME");
      } else {
        if (!result.unknown)
          result.unknown = [];
        result.unknown.push(part);
      }
    }
    return result;
  });
}

// node_modules/tailwindcss/src/util/flattenColorPalette.js
var flattenColorPalette = (colors) => Object.assign(
  {},
  ...Object.entries(colors ?? {}).flatMap(
    ([color2, values]) => typeof values == "object" ? Object.entries(flattenColorPalette(values)).map(([number2, hex]) => ({
      [color2 + (number2 === "DEFAULT" ? "" : `-${number2}`)]: hex
    })) : [{ [`${color2}`]: values }]
  )
);
var flattenColorPalette_default = flattenColorPalette;

// node_modules/tailwindcss/src/util/toColorValue.js
function toColorValue(maybeFunction) {
  return typeof maybeFunction === "function" ? maybeFunction({}) : maybeFunction;
}

// node_modules/tailwindcss/src/util/normalizeScreens.js
function normalizeScreens(screens, root = true) {
  if (Array.isArray(screens)) {
    return screens.map((screen) => {
      if (root && Array.isArray(screen)) {
        throw new Error("The tuple syntax is not supported for `screens`.");
      }
      if (typeof screen === "string") {
        return { name: screen.toString(), not: false, values: [{ min: screen, max: void 0 }] };
      }
      let [name, options] = screen;
      name = name.toString();
      if (typeof options === "string") {
        return { name, not: false, values: [{ min: options, max: void 0 }] };
      }
      if (Array.isArray(options)) {
        return { name, not: false, values: options.map((option) => resolveValue(option)) };
      }
      return { name, not: false, values: [resolveValue(options)] };
    });
  }
  return normalizeScreens(Object.entries(screens ?? {}), false);
}
function isScreenSortable(screen) {
  if (screen.values.length !== 1) {
    return { result: false, reason: "multiple-values" };
  } else if (screen.values[0].raw !== void 0) {
    return { result: false, reason: "raw-values" };
  } else if (screen.values[0].min !== void 0 && screen.values[0].max !== void 0) {
    return { result: false, reason: "min-and-max" };
  }
  return { result: true, reason: null };
}
function compareScreens(type, a, z) {
  let aScreen = toScreen(a, type);
  let zScreen = toScreen(z, type);
  let aSorting = isScreenSortable(aScreen);
  let bSorting = isScreenSortable(zScreen);
  if (aSorting.reason === "multiple-values" || bSorting.reason === "multiple-values") {
    throw new Error(
      "Attempted to sort a screen with multiple values. This should never happen. Please open a bug report."
    );
  } else if (aSorting.reason === "raw-values" || bSorting.reason === "raw-values") {
    throw new Error(
      "Attempted to sort a screen with raw values. This should never happen. Please open a bug report."
    );
  } else if (aSorting.reason === "min-and-max" || bSorting.reason === "min-and-max") {
    throw new Error(
      "Attempted to sort a screen with both min and max values. This should never happen. Please open a bug report."
    );
  }
  let { min: aMin, max: aMax } = aScreen.values[0];
  let { min: zMin, max: zMax } = zScreen.values[0];
  if (a.not)
    [aMin, aMax] = [aMax, aMin];
  if (z.not)
    [zMin, zMax] = [zMax, zMin];
  aMin = aMin === void 0 ? aMin : parseFloat(aMin);
  aMax = aMax === void 0 ? aMax : parseFloat(aMax);
  zMin = zMin === void 0 ? zMin : parseFloat(zMin);
  zMax = zMax === void 0 ? zMax : parseFloat(zMax);
  let [aValue, zValue] = type === "min" ? [aMin, zMin] : [zMax, aMax];
  return aValue - zValue;
}
function toScreen(value2, type) {
  if (typeof value2 === "object") {
    return value2;
  }
  return {
    name: "arbitrary-screen",
    values: [{ [type]: value2 }]
  };
}
function resolveValue({ "min-width": _minWidth, min = _minWidth, max: max2, raw } = {}) {
  return { min, max: max2, raw };
}

// node_modules/tailwindcss/src/util/removeAlphaVariables.js
function removeAlphaVariables(container, toRemove) {
  container.walkDecls((decl) => {
    if (toRemove.includes(decl.prop)) {
      decl.remove();
      return;
    }
    for (let varName of toRemove) {
      if (decl.value.includes(`/ var(${varName})`)) {
        decl.value = decl.value.replace(`/ var(${varName})`, "");
      }
    }
  });
}

// node_modules/tailwindcss/src/corePlugins.js
var variantPlugins = {
  childVariant: ({ addVariant }) => {
    addVariant("*", "& > *");
  },
  pseudoElementVariants: ({ addVariant }) => {
    addVariant("first-letter", "&::first-letter");
    addVariant("first-line", "&::first-line");
    addVariant("marker", [
      ({ container }) => {
        removeAlphaVariables(container, ["--tw-text-opacity"]);
        return "& *::marker";
      },
      ({ container }) => {
        removeAlphaVariables(container, ["--tw-text-opacity"]);
        return "&::marker";
      }
    ]);
    addVariant("selection", ["& *::selection", "&::selection"]);
    addVariant("file", "&::file-selector-button");
    addVariant("placeholder", "&::placeholder");
    addVariant("backdrop", "&::backdrop");
    addVariant("before", ({ container }) => {
      container.walkRules((rule) => {
        let foundContent = false;
        rule.walkDecls("content", () => {
          foundContent = true;
        });
        if (!foundContent) {
          rule.prepend(postcss3.decl({ prop: "content", value: "var(--tw-content)" }));
        }
      });
      return "&::before";
    });
    addVariant("after", ({ container }) => {
      container.walkRules((rule) => {
        let foundContent = false;
        rule.walkDecls("content", () => {
          foundContent = true;
        });
        if (!foundContent) {
          rule.prepend(postcss3.decl({ prop: "content", value: "var(--tw-content)" }));
        }
      });
      return "&::after";
    });
  },
  pseudoClassVariants: ({ addVariant, matchVariant, config, prefix: prefix3 }) => {
    let pseudoVariants = [
      ["first", "&:first-child"],
      ["last", "&:last-child"],
      ["only", "&:only-child"],
      ["odd", "&:nth-child(odd)"],
      ["even", "&:nth-child(even)"],
      "first-of-type",
      "last-of-type",
      "only-of-type",
      [
        "visited",
        ({ container }) => {
          removeAlphaVariables(container, [
            "--tw-text-opacity",
            "--tw-border-opacity",
            "--tw-bg-opacity"
          ]);
          return "&:visited";
        }
      ],
      "target",
      ["open", "&[open]"],
      "default",
      "checked",
      "indeterminate",
      "placeholder-shown",
      "autofill",
      "optional",
      "required",
      "valid",
      "invalid",
      "in-range",
      "out-of-range",
      "read-only",
      "empty",
      "focus-within",
      [
        "hover",
        !flagEnabled(config(), "hoverOnlyWhenSupported") ? "&:hover" : "@media (hover: hover) and (pointer: fine) { &:hover }"
      ],
      "focus",
      "focus-visible",
      "active",
      "enabled",
      "disabled"
    ].map((variant) => Array.isArray(variant) ? variant : [variant, `&:${variant}`]);
    for (let [variantName, state] of pseudoVariants) {
      addVariant(variantName, (ctx) => {
        let result = typeof state === "function" ? state(ctx) : state;
        return result;
      });
    }
    let variants = {
      group: (_, { modifier }) => modifier ? [`:merge(${prefix3(".group")}\\/${escapeClassName(modifier)})`, " &"] : [`:merge(${prefix3(".group")})`, " &"],
      peer: (_, { modifier }) => modifier ? [`:merge(${prefix3(".peer")}\\/${escapeClassName(modifier)})`, " ~ &"] : [`:merge(${prefix3(".peer")})`, " ~ &"]
    };
    for (let [name, fn] of Object.entries(variants)) {
      matchVariant(
        name,
        (value2 = "", extra) => {
          let result = normalize(typeof value2 === "function" ? value2(extra) : value2);
          if (!result.includes("&"))
            result = "&" + result;
          let [a, b] = fn("", extra);
          let start = null;
          let end = null;
          let quotes2 = 0;
          for (let i = 0; i < result.length; ++i) {
            let c = result[i];
            if (c === "&") {
              start = i;
            } else if (c === "'" || c === '"') {
              quotes2 += 1;
            } else if (start !== null && c === " " && !quotes2) {
              end = i;
            }
          }
          if (start !== null && end === null) {
            end = result.length;
          }
          return result.slice(0, start) + a + result.slice(start + 1, end) + b + result.slice(end);
        },
        {
          values: Object.fromEntries(pseudoVariants),
          [INTERNAL_FEATURES]: {
            respectPrefix: false
          }
        }
      );
    }
  },
  directionVariants: ({ addVariant }) => {
    addVariant("ltr", '&:where([dir="ltr"], [dir="ltr"] *)');
    addVariant("rtl", '&:where([dir="rtl"], [dir="rtl"] *)');
  },
  reducedMotionVariants: ({ addVariant }) => {
    addVariant("motion-safe", "@media (prefers-reduced-motion: no-preference)");
    addVariant("motion-reduce", "@media (prefers-reduced-motion: reduce)");
  },
  darkVariants: ({ config, addVariant }) => {
    let [mode, selector = ".dark"] = [].concat(config("darkMode", "media"));
    if (mode === false) {
      mode = "media";
      log_default.warn("darkmode-false", [
        "The `darkMode` option in your Tailwind CSS configuration is set to `false`, which now behaves the same as `media`.",
        "Change `darkMode` to `media` or remove it entirely.",
        "https://tailwindcss.com/docs/upgrade-guide#remove-dark-mode-configuration"
      ]);
    }
    if (mode === "variant") {
      let formats;
      if (Array.isArray(selector)) {
        formats = selector;
      } else if (typeof selector === "function") {
        formats = selector;
      } else if (typeof selector === "string") {
        formats = [selector];
      }
      if (Array.isArray(formats)) {
        for (let format of formats) {
          if (format === ".dark") {
            mode = false;
            log_default.warn("darkmode-variant-without-selector", [
              "When using `variant` for `darkMode`, you must provide a selector.",
              'Example: `darkMode: ["variant", ".your-selector &"]`'
            ]);
          } else if (!format.includes("&")) {
            mode = false;
            log_default.warn("darkmode-variant-without-ampersand", [
              "When using `variant` for `darkMode`, your selector must contain `&`.",
              'Example `darkMode: ["variant", ".your-selector &"]`'
            ]);
          }
        }
      }
      selector = formats;
    }
    if (mode === "selector") {
      addVariant("dark", `&:where(${selector}, ${selector} *)`);
    } else if (mode === "media") {
      addVariant("dark", "@media (prefers-color-scheme: dark)");
    } else if (mode === "variant") {
      addVariant("dark", selector);
    } else if (mode === "class") {
      addVariant("dark", `:is(${selector} &)`);
    }
  },
  printVariant: ({ addVariant }) => {
    addVariant("print", "@media print");
  },
  screenVariants: ({ theme, addVariant, matchVariant }) => {
    let rawScreens = theme("screens") ?? {};
    let areSimpleScreens = Object.values(rawScreens).every((v) => typeof v === "string");
    let screens = normalizeScreens(theme("screens"));
    let unitCache = /* @__PURE__ */ new Set([]);
    function units(value2) {
      return value2.match(/(\D+)$/)?.[1] ?? "(none)";
    }
    function recordUnits(value2) {
      if (value2 !== void 0) {
        unitCache.add(units(value2));
      }
    }
    function canUseUnits(value2) {
      recordUnits(value2);
      return unitCache.size === 1;
    }
    for (const screen of screens) {
      for (const value2 of screen.values) {
        recordUnits(value2.min);
        recordUnits(value2.max);
      }
    }
    let screensUseConsistentUnits = unitCache.size <= 1;
    function buildScreenValues(type) {
      return Object.fromEntries(
        screens.filter((screen) => isScreenSortable(screen).result).map((screen) => {
          let { min, max: max2 } = screen.values[0];
          if (type === "min" && min !== void 0) {
            return screen;
          } else if (type === "min" && max2 !== void 0) {
            return { ...screen, not: !screen.not };
          } else if (type === "max" && max2 !== void 0) {
            return screen;
          } else if (type === "max" && min !== void 0) {
            return { ...screen, not: !screen.not };
          }
        }).map((screen) => [screen.name, screen])
      );
    }
    function buildSort(type) {
      return (a, z) => compareScreens(type, a.value, z.value);
    }
    let maxSort = buildSort("max");
    let minSort = buildSort("min");
    function buildScreenVariant(type) {
      return (value2) => {
        if (!areSimpleScreens) {
          log_default.warn("complex-screen-config", [
            "The `min-*` and `max-*` variants are not supported with a `screens` configuration containing objects."
          ]);
          return [];
        } else if (!screensUseConsistentUnits) {
          log_default.warn("mixed-screen-units", [
            "The `min-*` and `max-*` variants are not supported with a `screens` configuration containing mixed units."
          ]);
          return [];
        } else if (typeof value2 === "string" && !canUseUnits(value2)) {
          log_default.warn("minmax-have-mixed-units", [
            "The `min-*` and `max-*` variants are not supported with a `screens` configuration containing mixed units."
          ]);
          return [];
        }
        return [`@media ${buildMediaQuery(toScreen(value2, type))}`];
      };
    }
    matchVariant("max", buildScreenVariant("max"), {
      sort: maxSort,
      values: areSimpleScreens ? buildScreenValues("max") : {}
    });
    let id = "min-screens";
    for (let screen of screens) {
      addVariant(screen.name, `@media ${buildMediaQuery(screen)}`, {
        id,
        sort: areSimpleScreens && screensUseConsistentUnits ? minSort : void 0,
        value: screen
      });
    }
    matchVariant("min", buildScreenVariant("min"), {
      id,
      sort: minSort
    });
  },
  supportsVariants: ({ matchVariant, theme }) => {
    matchVariant(
      "supports",
      (value2 = "") => {
        let check = normalize(value2);
        let isRaw = /^\w*\s*\(/.test(check);
        check = isRaw ? check.replace(/\b(and|or|not)\b/g, " $1 ") : check;
        if (isRaw) {
          return `@supports ${check}`;
        }
        if (!check.includes(":")) {
          check = `${check}: var(--tw)`;
        }
        if (!(check.startsWith("(") && check.endsWith(")"))) {
          check = `(${check})`;
        }
        return `@supports ${check}`;
      },
      { values: theme("supports") ?? {} }
    );
  },
  hasVariants: ({ matchVariant }) => {
    matchVariant("has", (value2) => `&:has(${normalize(value2)})`, { values: {} });
    matchVariant(
      "group-has",
      (value2, { modifier }) => modifier ? `:merge(.group\\/${modifier}):has(${normalize(value2)}) &` : `:merge(.group):has(${normalize(value2)}) &`,
      { values: {} }
    );
    matchVariant(
      "peer-has",
      (value2, { modifier }) => modifier ? `:merge(.peer\\/${modifier}):has(${normalize(value2)}) ~ &` : `:merge(.peer):has(${normalize(value2)}) ~ &`,
      { values: {} }
    );
  },
  ariaVariants: ({ matchVariant, theme }) => {
    matchVariant("aria", (value2) => `&[aria-${normalize(value2)}]`, { values: theme("aria") ?? {} });
    matchVariant(
      "group-aria",
      (value2, { modifier }) => modifier ? `:merge(.group\\/${modifier})[aria-${normalize(value2)}] &` : `:merge(.group)[aria-${normalize(value2)}] &`,
      { values: theme("aria") ?? {} }
    );
    matchVariant(
      "peer-aria",
      (value2, { modifier }) => modifier ? `:merge(.peer\\/${modifier})[aria-${normalize(value2)}] ~ &` : `:merge(.peer)[aria-${normalize(value2)}] ~ &`,
      { values: theme("aria") ?? {} }
    );
  },
  dataVariants: ({ matchVariant, theme }) => {
    matchVariant("data", (value2) => `&[data-${normalize(value2)}]`, { values: theme("data") ?? {} });
    matchVariant(
      "group-data",
      (value2, { modifier }) => modifier ? `:merge(.group\\/${modifier})[data-${normalize(value2)}] &` : `:merge(.group)[data-${normalize(value2)}] &`,
      { values: theme("data") ?? {} }
    );
    matchVariant(
      "peer-data",
      (value2, { modifier }) => modifier ? `:merge(.peer\\/${modifier})[data-${normalize(value2)}] ~ &` : `:merge(.peer)[data-${normalize(value2)}] ~ &`,
      { values: theme("data") ?? {} }
    );
  },
  orientationVariants: ({ addVariant }) => {
    addVariant("portrait", "@media (orientation: portrait)");
    addVariant("landscape", "@media (orientation: landscape)");
  },
  prefersContrastVariants: ({ addVariant }) => {
    addVariant("contrast-more", "@media (prefers-contrast: more)");
    addVariant("contrast-less", "@media (prefers-contrast: less)");
  },
  forcedColorsVariants: ({ addVariant }) => {
    addVariant("forced-colors", "@media (forced-colors: active)");
  }
};
var cssTransformValue = [
  "translate(var(--tw-translate-x), var(--tw-translate-y))",
  "rotate(var(--tw-rotate))",
  "skewX(var(--tw-skew-x))",
  "skewY(var(--tw-skew-y))",
  "scaleX(var(--tw-scale-x))",
  "scaleY(var(--tw-scale-y))"
].join(" ");
var cssFilterValue = [
  "var(--tw-blur)",
  "var(--tw-brightness)",
  "var(--tw-contrast)",
  "var(--tw-grayscale)",
  "var(--tw-hue-rotate)",
  "var(--tw-invert)",
  "var(--tw-saturate)",
  "var(--tw-sepia)",
  "var(--tw-drop-shadow)"
].join(" ");
var cssBackdropFilterValue = [
  "var(--tw-backdrop-blur)",
  "var(--tw-backdrop-brightness)",
  "var(--tw-backdrop-contrast)",
  "var(--tw-backdrop-grayscale)",
  "var(--tw-backdrop-hue-rotate)",
  "var(--tw-backdrop-invert)",
  "var(--tw-backdrop-opacity)",
  "var(--tw-backdrop-saturate)",
  "var(--tw-backdrop-sepia)"
].join(" ");
var corePlugins = {
  preflight: ({ addBase }) => {
    let preflightStyles = postcss3.parse(
      fs_default.readFileSync(join("/", "./css/preflight.css"), "utf8")
    );
    addBase([
      postcss3.comment({
        text: `! tailwindcss v${version} | MIT License | https://tailwindcss.com`
      }),
      ...preflightStyles.nodes
    ]);
  },
  container: (() => {
    function extractMinWidths(breakpoints = []) {
      return breakpoints.flatMap((breakpoint) => breakpoint.values.map((breakpoint2) => breakpoint2.min)).filter((v) => v !== void 0);
    }
    function mapMinWidthsToPadding(minWidths, screens, paddings) {
      if (typeof paddings === "undefined") {
        return [];
      }
      if (!(typeof paddings === "object" && paddings !== null)) {
        return [
          {
            screen: "DEFAULT",
            minWidth: 0,
            padding: paddings
          }
        ];
      }
      let mapping = [];
      if (paddings.DEFAULT) {
        mapping.push({
          screen: "DEFAULT",
          minWidth: 0,
          padding: paddings.DEFAULT
        });
      }
      for (let minWidth of minWidths) {
        for (let screen of screens) {
          for (let { min } of screen.values) {
            if (min === minWidth) {
              mapping.push({ minWidth, padding: paddings[screen.name] });
            }
          }
        }
      }
      return mapping;
    }
    return function({ addComponents, theme }) {
      let screens = normalizeScreens(theme("container.screens", theme("screens")));
      let minWidths = extractMinWidths(screens);
      let paddings = mapMinWidthsToPadding(minWidths, screens, theme("container.padding"));
      let generatePaddingFor = (minWidth) => {
        let paddingConfig = paddings.find((padding) => padding.minWidth === minWidth);
        if (!paddingConfig) {
          return {};
        }
        return {
          paddingRight: paddingConfig.padding,
          paddingLeft: paddingConfig.padding
        };
      };
      let atRules = Array.from(
        new Set(minWidths.slice().sort((a, z) => parseInt(a) - parseInt(z)))
      ).map((minWidth) => ({
        [`@media (min-width: ${minWidth})`]: {
          ".container": {
            "max-width": minWidth,
            ...generatePaddingFor(minWidth)
          }
        }
      }));
      addComponents([
        {
          ".container": Object.assign(
            { width: "100%" },
            theme("container.center", false) ? { marginRight: "auto", marginLeft: "auto" } : {},
            generatePaddingFor(0)
          )
        },
        ...atRules
      ]);
    };
  })(),
  accessibility: ({ addUtilities }) => {
    addUtilities({
      ".sr-only": {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: "0"
      },
      ".not-sr-only": {
        position: "static",
        width: "auto",
        height: "auto",
        padding: "0",
        margin: "0",
        overflow: "visible",
        clip: "auto",
        whiteSpace: "normal"
      }
    });
  },
  pointerEvents: ({ addUtilities }) => {
    addUtilities({
      ".pointer-events-none": { "pointer-events": "none" },
      ".pointer-events-auto": { "pointer-events": "auto" }
    });
  },
  visibility: ({ addUtilities }) => {
    addUtilities({
      ".visible": { visibility: "visible" },
      ".invisible": { visibility: "hidden" },
      ".collapse": { visibility: "collapse" }
    });
  },
  position: ({ addUtilities }) => {
    addUtilities({
      ".static": { position: "static" },
      ".fixed": { position: "fixed" },
      ".absolute": { position: "absolute" },
      ".relative": { position: "relative" },
      ".sticky": { position: "sticky" }
    });
  },
  inset: createUtilityPlugin(
    "inset",
    [
      ["inset", ["inset"]],
      [
        ["inset-x", ["left", "right"]],
        ["inset-y", ["top", "bottom"]]
      ],
      [
        ["start", ["inset-inline-start"]],
        ["end", ["inset-inline-end"]],
        ["top", ["top"]],
        ["right", ["right"]],
        ["bottom", ["bottom"]],
        ["left", ["left"]]
      ]
    ],
    { supportsNegativeValues: true }
  ),
  isolation: ({ addUtilities }) => {
    addUtilities({
      ".isolate": { isolation: "isolate" },
      ".isolation-auto": { isolation: "auto" }
    });
  },
  zIndex: createUtilityPlugin("zIndex", [["z", ["zIndex"]]], { supportsNegativeValues: true }),
  order: createUtilityPlugin("order", void 0, { supportsNegativeValues: true }),
  gridColumn: createUtilityPlugin("gridColumn", [["col", ["gridColumn"]]]),
  gridColumnStart: createUtilityPlugin("gridColumnStart", [["col-start", ["gridColumnStart"]]]),
  gridColumnEnd: createUtilityPlugin("gridColumnEnd", [["col-end", ["gridColumnEnd"]]]),
  gridRow: createUtilityPlugin("gridRow", [["row", ["gridRow"]]]),
  gridRowStart: createUtilityPlugin("gridRowStart", [["row-start", ["gridRowStart"]]]),
  gridRowEnd: createUtilityPlugin("gridRowEnd", [["row-end", ["gridRowEnd"]]]),
  float: ({ addUtilities }) => {
    addUtilities({
      ".float-start": { float: "inline-start" },
      ".float-end": { float: "inline-end" },
      ".float-right": { float: "right" },
      ".float-left": { float: "left" },
      ".float-none": { float: "none" }
    });
  },
  clear: ({ addUtilities }) => {
    addUtilities({
      ".clear-start": { clear: "inline-start" },
      ".clear-end": { clear: "inline-end" },
      ".clear-left": { clear: "left" },
      ".clear-right": { clear: "right" },
      ".clear-both": { clear: "both" },
      ".clear-none": { clear: "none" }
    });
  },
  margin: createUtilityPlugin(
    "margin",
    [
      ["m", ["margin"]],
      [
        ["mx", ["margin-left", "margin-right"]],
        ["my", ["margin-top", "margin-bottom"]]
      ],
      [
        ["ms", ["margin-inline-start"]],
        ["me", ["margin-inline-end"]],
        ["mt", ["margin-top"]],
        ["mr", ["margin-right"]],
        ["mb", ["margin-bottom"]],
        ["ml", ["margin-left"]]
      ]
    ],
    { supportsNegativeValues: true }
  ),
  boxSizing: ({ addUtilities }) => {
    addUtilities({
      ".box-border": { "box-sizing": "border-box" },
      ".box-content": { "box-sizing": "content-box" }
    });
  },
  lineClamp: ({ matchUtilities, addUtilities, theme }) => {
    matchUtilities(
      {
        "line-clamp": (value2) => ({
          overflow: "hidden",
          display: "-webkit-box",
          "-webkit-box-orient": "vertical",
          "-webkit-line-clamp": `${value2}`
        })
      },
      { values: theme("lineClamp") }
    );
    addUtilities({
      ".line-clamp-none": {
        overflow: "visible",
        display: "block",
        "-webkit-box-orient": "horizontal",
        "-webkit-line-clamp": "none"
      }
    });
  },
  display: ({ addUtilities }) => {
    addUtilities({
      ".block": { display: "block" },
      ".inline-block": { display: "inline-block" },
      ".inline": { display: "inline" },
      ".flex": { display: "flex" },
      ".inline-flex": { display: "inline-flex" },
      ".table": { display: "table" },
      ".inline-table": { display: "inline-table" },
      ".table-caption": { display: "table-caption" },
      ".table-cell": { display: "table-cell" },
      ".table-column": { display: "table-column" },
      ".table-column-group": { display: "table-column-group" },
      ".table-footer-group": { display: "table-footer-group" },
      ".table-header-group": { display: "table-header-group" },
      ".table-row-group": { display: "table-row-group" },
      ".table-row": { display: "table-row" },
      ".flow-root": { display: "flow-root" },
      ".grid": { display: "grid" },
      ".inline-grid": { display: "inline-grid" },
      ".contents": { display: "contents" },
      ".list-item": { display: "list-item" },
      ".hidden": { display: "none" }
    });
  },
  aspectRatio: createUtilityPlugin("aspectRatio", [["aspect", ["aspect-ratio"]]]),
  size: createUtilityPlugin("size", [["size", ["width", "height"]]]),
  height: createUtilityPlugin("height", [["h", ["height"]]]),
  maxHeight: createUtilityPlugin("maxHeight", [["max-h", ["maxHeight"]]]),
  minHeight: createUtilityPlugin("minHeight", [["min-h", ["minHeight"]]]),
  width: createUtilityPlugin("width", [["w", ["width"]]]),
  minWidth: createUtilityPlugin("minWidth", [["min-w", ["minWidth"]]]),
  maxWidth: createUtilityPlugin("maxWidth", [["max-w", ["maxWidth"]]]),
  flex: createUtilityPlugin("flex"),
  flexShrink: createUtilityPlugin("flexShrink", [
    ["flex-shrink", ["flex-shrink"]],
    ["shrink", ["flex-shrink"]]
  ]),
  flexGrow: createUtilityPlugin("flexGrow", [
    ["flex-grow", ["flex-grow"]],
    ["grow", ["flex-grow"]]
  ]),
  flexBasis: createUtilityPlugin("flexBasis", [["basis", ["flex-basis"]]]),
  tableLayout: ({ addUtilities }) => {
    addUtilities({
      ".table-auto": { "table-layout": "auto" },
      ".table-fixed": { "table-layout": "fixed" }
    });
  },
  captionSide: ({ addUtilities }) => {
    addUtilities({
      ".caption-top": { "caption-side": "top" },
      ".caption-bottom": { "caption-side": "bottom" }
    });
  },
  borderCollapse: ({ addUtilities }) => {
    addUtilities({
      ".border-collapse": { "border-collapse": "collapse" },
      ".border-separate": { "border-collapse": "separate" }
    });
  },
  borderSpacing: ({ addDefaults, matchUtilities, theme }) => {
    addDefaults("border-spacing", {
      "--tw-border-spacing-x": 0,
      "--tw-border-spacing-y": 0
    });
    matchUtilities(
      {
        "border-spacing": (value2) => {
          return {
            "--tw-border-spacing-x": value2,
            "--tw-border-spacing-y": value2,
            "@defaults border-spacing": {},
            "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)"
          };
        },
        "border-spacing-x": (value2) => {
          return {
            "--tw-border-spacing-x": value2,
            "@defaults border-spacing": {},
            "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)"
          };
        },
        "border-spacing-y": (value2) => {
          return {
            "--tw-border-spacing-y": value2,
            "@defaults border-spacing": {},
            "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)"
          };
        }
      },
      { values: theme("borderSpacing") }
    );
  },
  transformOrigin: createUtilityPlugin("transformOrigin", [["origin", ["transformOrigin"]]]),
  translate: createUtilityPlugin(
    "translate",
    [
      [
        [
          "translate-x",
          [["@defaults transform", {}], "--tw-translate-x", ["transform", cssTransformValue]]
        ],
        [
          "translate-y",
          [["@defaults transform", {}], "--tw-translate-y", ["transform", cssTransformValue]]
        ]
      ]
    ],
    { supportsNegativeValues: true }
  ),
  rotate: createUtilityPlugin(
    "rotate",
    [["rotate", [["@defaults transform", {}], "--tw-rotate", ["transform", cssTransformValue]]]],
    { supportsNegativeValues: true }
  ),
  skew: createUtilityPlugin(
    "skew",
    [
      [
        ["skew-x", [["@defaults transform", {}], "--tw-skew-x", ["transform", cssTransformValue]]],
        ["skew-y", [["@defaults transform", {}], "--tw-skew-y", ["transform", cssTransformValue]]]
      ]
    ],
    { supportsNegativeValues: true }
  ),
  scale: createUtilityPlugin(
    "scale",
    [
      [
        "scale",
        [
          ["@defaults transform", {}],
          "--tw-scale-x",
          "--tw-scale-y",
          ["transform", cssTransformValue]
        ]
      ],
      [
        [
          "scale-x",
          [["@defaults transform", {}], "--tw-scale-x", ["transform", cssTransformValue]]
        ],
        [
          "scale-y",
          [["@defaults transform", {}], "--tw-scale-y", ["transform", cssTransformValue]]
        ]
      ]
    ],
    { supportsNegativeValues: true }
  ),
  transform: ({ addDefaults, addUtilities }) => {
    addDefaults("transform", {
      "--tw-translate-x": "0",
      "--tw-translate-y": "0",
      "--tw-rotate": "0",
      "--tw-skew-x": "0",
      "--tw-skew-y": "0",
      "--tw-scale-x": "1",
      "--tw-scale-y": "1"
    });
    addUtilities({
      ".transform": { "@defaults transform": {}, transform: cssTransformValue },
      ".transform-cpu": {
        transform: cssTransformValue
      },
      ".transform-gpu": {
        transform: cssTransformValue.replace(
          "translate(var(--tw-translate-x), var(--tw-translate-y))",
          "translate3d(var(--tw-translate-x), var(--tw-translate-y), 0)"
        )
      },
      ".transform-none": { transform: "none" }
    });
  },
  animation: ({ matchUtilities, theme, config }) => {
    let prefixName = (name) => escapeClassName(config("prefix") + name);
    let keyframes = Object.fromEntries(
      Object.entries(theme("keyframes") ?? {}).map(([key, value2]) => {
        return [key, { [`@keyframes ${prefixName(key)}`]: value2 }];
      })
    );
    matchUtilities(
      {
        animate: (value2) => {
          let animations = parseAnimationValue(value2);
          return [
            ...animations.flatMap((animation) => keyframes[animation.name]),
            {
              animation: animations.map(({ name, value: value3 }) => {
                if (name === void 0 || keyframes[name] === void 0) {
                  return value3;
                }
                return value3.replace(name, prefixName(name));
              }).join(", ")
            }
          ];
        }
      },
      { values: theme("animation") }
    );
  },
  cursor: createUtilityPlugin("cursor"),
  touchAction: ({ addDefaults, addUtilities }) => {
    addDefaults("touch-action", {
      "--tw-pan-x": " ",
      "--tw-pan-y": " ",
      "--tw-pinch-zoom": " "
    });
    let cssTouchActionValue = "var(--tw-pan-x) var(--tw-pan-y) var(--tw-pinch-zoom)";
    addUtilities({
      ".touch-auto": { "touch-action": "auto" },
      ".touch-none": { "touch-action": "none" },
      ".touch-pan-x": {
        "@defaults touch-action": {},
        "--tw-pan-x": "pan-x",
        "touch-action": cssTouchActionValue
      },
      ".touch-pan-left": {
        "@defaults touch-action": {},
        "--tw-pan-x": "pan-left",
        "touch-action": cssTouchActionValue
      },
      ".touch-pan-right": {
        "@defaults touch-action": {},
        "--tw-pan-x": "pan-right",
        "touch-action": cssTouchActionValue
      },
      ".touch-pan-y": {
        "@defaults touch-action": {},
        "--tw-pan-y": "pan-y",
        "touch-action": cssTouchActionValue
      },
      ".touch-pan-up": {
        "@defaults touch-action": {},
        "--tw-pan-y": "pan-up",
        "touch-action": cssTouchActionValue
      },
      ".touch-pan-down": {
        "@defaults touch-action": {},
        "--tw-pan-y": "pan-down",
        "touch-action": cssTouchActionValue
      },
      ".touch-pinch-zoom": {
        "@defaults touch-action": {},
        "--tw-pinch-zoom": "pinch-zoom",
        "touch-action": cssTouchActionValue
      },
      ".touch-manipulation": { "touch-action": "manipulation" }
    });
  },
  userSelect: ({ addUtilities }) => {
    addUtilities({
      ".select-none": { "user-select": "none" },
      ".select-text": { "user-select": "text" },
      ".select-all": { "user-select": "all" },
      ".select-auto": { "user-select": "auto" }
    });
  },
  resize: ({ addUtilities }) => {
    addUtilities({
      ".resize-none": { resize: "none" },
      ".resize-y": { resize: "vertical" },
      ".resize-x": { resize: "horizontal" },
      ".resize": { resize: "both" }
    });
  },
  scrollSnapType: ({ addDefaults, addUtilities }) => {
    addDefaults("scroll-snap-type", {
      "--tw-scroll-snap-strictness": "proximity"
    });
    addUtilities({
      ".snap-none": { "scroll-snap-type": "none" },
      ".snap-x": {
        "@defaults scroll-snap-type": {},
        "scroll-snap-type": "x var(--tw-scroll-snap-strictness)"
      },
      ".snap-y": {
        "@defaults scroll-snap-type": {},
        "scroll-snap-type": "y var(--tw-scroll-snap-strictness)"
      },
      ".snap-both": {
        "@defaults scroll-snap-type": {},
        "scroll-snap-type": "both var(--tw-scroll-snap-strictness)"
      },
      ".snap-mandatory": { "--tw-scroll-snap-strictness": "mandatory" },
      ".snap-proximity": { "--tw-scroll-snap-strictness": "proximity" }
    });
  },
  scrollSnapAlign: ({ addUtilities }) => {
    addUtilities({
      ".snap-start": { "scroll-snap-align": "start" },
      ".snap-end": { "scroll-snap-align": "end" },
      ".snap-center": { "scroll-snap-align": "center" },
      ".snap-align-none": { "scroll-snap-align": "none" }
    });
  },
  scrollSnapStop: ({ addUtilities }) => {
    addUtilities({
      ".snap-normal": { "scroll-snap-stop": "normal" },
      ".snap-always": { "scroll-snap-stop": "always" }
    });
  },
  scrollMargin: createUtilityPlugin(
    "scrollMargin",
    [
      ["scroll-m", ["scroll-margin"]],
      [
        ["scroll-mx", ["scroll-margin-left", "scroll-margin-right"]],
        ["scroll-my", ["scroll-margin-top", "scroll-margin-bottom"]]
      ],
      [
        ["scroll-ms", ["scroll-margin-inline-start"]],
        ["scroll-me", ["scroll-margin-inline-end"]],
        ["scroll-mt", ["scroll-margin-top"]],
        ["scroll-mr", ["scroll-margin-right"]],
        ["scroll-mb", ["scroll-margin-bottom"]],
        ["scroll-ml", ["scroll-margin-left"]]
      ]
    ],
    { supportsNegativeValues: true }
  ),
  scrollPadding: createUtilityPlugin("scrollPadding", [
    ["scroll-p", ["scroll-padding"]],
    [
      ["scroll-px", ["scroll-padding-left", "scroll-padding-right"]],
      ["scroll-py", ["scroll-padding-top", "scroll-padding-bottom"]]
    ],
    [
      ["scroll-ps", ["scroll-padding-inline-start"]],
      ["scroll-pe", ["scroll-padding-inline-end"]],
      ["scroll-pt", ["scroll-padding-top"]],
      ["scroll-pr", ["scroll-padding-right"]],
      ["scroll-pb", ["scroll-padding-bottom"]],
      ["scroll-pl", ["scroll-padding-left"]]
    ]
  ]),
  listStylePosition: ({ addUtilities }) => {
    addUtilities({
      ".list-inside": { "list-style-position": "inside" },
      ".list-outside": { "list-style-position": "outside" }
    });
  },
  listStyleType: createUtilityPlugin("listStyleType", [["list", ["listStyleType"]]]),
  listStyleImage: createUtilityPlugin("listStyleImage", [["list-image", ["listStyleImage"]]]),
  appearance: ({ addUtilities }) => {
    addUtilities({
      ".appearance-none": { appearance: "none" },
      ".appearance-auto": { appearance: "auto" }
    });
  },
  columns: createUtilityPlugin("columns", [["columns", ["columns"]]]),
  breakBefore: ({ addUtilities }) => {
    addUtilities({
      ".break-before-auto": { "break-before": "auto" },
      ".break-before-avoid": { "break-before": "avoid" },
      ".break-before-all": { "break-before": "all" },
      ".break-before-avoid-page": { "break-before": "avoid-page" },
      ".break-before-page": { "break-before": "page" },
      ".break-before-left": { "break-before": "left" },
      ".break-before-right": { "break-before": "right" },
      ".break-before-column": { "break-before": "column" }
    });
  },
  breakInside: ({ addUtilities }) => {
    addUtilities({
      ".break-inside-auto": { "break-inside": "auto" },
      ".break-inside-avoid": { "break-inside": "avoid" },
      ".break-inside-avoid-page": { "break-inside": "avoid-page" },
      ".break-inside-avoid-column": { "break-inside": "avoid-column" }
    });
  },
  breakAfter: ({ addUtilities }) => {
    addUtilities({
      ".break-after-auto": { "break-after": "auto" },
      ".break-after-avoid": { "break-after": "avoid" },
      ".break-after-all": { "break-after": "all" },
      ".break-after-avoid-page": { "break-after": "avoid-page" },
      ".break-after-page": { "break-after": "page" },
      ".break-after-left": { "break-after": "left" },
      ".break-after-right": { "break-after": "right" },
      ".break-after-column": { "break-after": "column" }
    });
  },
  gridAutoColumns: createUtilityPlugin("gridAutoColumns", [["auto-cols", ["gridAutoColumns"]]]),
  gridAutoFlow: ({ addUtilities }) => {
    addUtilities({
      ".grid-flow-row": { gridAutoFlow: "row" },
      ".grid-flow-col": { gridAutoFlow: "column" },
      ".grid-flow-dense": { gridAutoFlow: "dense" },
      ".grid-flow-row-dense": { gridAutoFlow: "row dense" },
      ".grid-flow-col-dense": { gridAutoFlow: "column dense" }
    });
  },
  gridAutoRows: createUtilityPlugin("gridAutoRows", [["auto-rows", ["gridAutoRows"]]]),
  gridTemplateColumns: createUtilityPlugin("gridTemplateColumns", [
    ["grid-cols", ["gridTemplateColumns"]]
  ]),
  gridTemplateRows: createUtilityPlugin("gridTemplateRows", [["grid-rows", ["gridTemplateRows"]]]),
  flexDirection: ({ addUtilities }) => {
    addUtilities({
      ".flex-row": { "flex-direction": "row" },
      ".flex-row-reverse": { "flex-direction": "row-reverse" },
      ".flex-col": { "flex-direction": "column" },
      ".flex-col-reverse": { "flex-direction": "column-reverse" }
    });
  },
  flexWrap: ({ addUtilities }) => {
    addUtilities({
      ".flex-wrap": { "flex-wrap": "wrap" },
      ".flex-wrap-reverse": { "flex-wrap": "wrap-reverse" },
      ".flex-nowrap": { "flex-wrap": "nowrap" }
    });
  },
  placeContent: ({ addUtilities }) => {
    addUtilities({
      ".place-content-center": { "place-content": "center" },
      ".place-content-start": { "place-content": "start" },
      ".place-content-end": { "place-content": "end" },
      ".place-content-between": { "place-content": "space-between" },
      ".place-content-around": { "place-content": "space-around" },
      ".place-content-evenly": { "place-content": "space-evenly" },
      ".place-content-baseline": { "place-content": "baseline" },
      ".place-content-stretch": { "place-content": "stretch" }
    });
  },
  placeItems: ({ addUtilities }) => {
    addUtilities({
      ".place-items-start": { "place-items": "start" },
      ".place-items-end": { "place-items": "end" },
      ".place-items-center": { "place-items": "center" },
      ".place-items-baseline": { "place-items": "baseline" },
      ".place-items-stretch": { "place-items": "stretch" }
    });
  },
  alignContent: ({ addUtilities }) => {
    addUtilities({
      ".content-normal": { "align-content": "normal" },
      ".content-center": { "align-content": "center" },
      ".content-start": { "align-content": "flex-start" },
      ".content-end": { "align-content": "flex-end" },
      ".content-between": { "align-content": "space-between" },
      ".content-around": { "align-content": "space-around" },
      ".content-evenly": { "align-content": "space-evenly" },
      ".content-baseline": { "align-content": "baseline" },
      ".content-stretch": { "align-content": "stretch" }
    });
  },
  alignItems: ({ addUtilities }) => {
    addUtilities({
      ".items-start": { "align-items": "flex-start" },
      ".items-end": { "align-items": "flex-end" },
      ".items-center": { "align-items": "center" },
      ".items-baseline": { "align-items": "baseline" },
      ".items-stretch": { "align-items": "stretch" }
    });
  },
  justifyContent: ({ addUtilities }) => {
    addUtilities({
      ".justify-normal": { "justify-content": "normal" },
      ".justify-start": { "justify-content": "flex-start" },
      ".justify-end": { "justify-content": "flex-end" },
      ".justify-center": { "justify-content": "center" },
      ".justify-between": { "justify-content": "space-between" },
      ".justify-around": { "justify-content": "space-around" },
      ".justify-evenly": { "justify-content": "space-evenly" },
      ".justify-stretch": { "justify-content": "stretch" }
    });
  },
  justifyItems: ({ addUtilities }) => {
    addUtilities({
      ".justify-items-start": { "justify-items": "start" },
      ".justify-items-end": { "justify-items": "end" },
      ".justify-items-center": { "justify-items": "center" },
      ".justify-items-stretch": { "justify-items": "stretch" }
    });
  },
  gap: createUtilityPlugin("gap", [
    ["gap", ["gap"]],
    [
      ["gap-x", ["columnGap"]],
      ["gap-y", ["rowGap"]]
    ]
  ]),
  space: ({ matchUtilities, addUtilities, theme }) => {
    matchUtilities(
      {
        "space-x": (value2) => {
          value2 = value2 === "0" ? "0px" : value2;
          if (false) {
            return {
              "& > :not([hidden]) ~ :not([hidden])": {
                "--tw-space-x-reverse": "0",
                "margin-inline-end": `calc(${value2} * var(--tw-space-x-reverse))`,
                "margin-inline-start": `calc(${value2} * calc(1 - var(--tw-space-x-reverse)))`
              }
            };
          }
          return {
            "& > :not([hidden]) ~ :not([hidden])": {
              "--tw-space-x-reverse": "0",
              "margin-right": `calc(${value2} * var(--tw-space-x-reverse))`,
              "margin-left": `calc(${value2} * calc(1 - var(--tw-space-x-reverse)))`
            }
          };
        },
        "space-y": (value2) => {
          value2 = value2 === "0" ? "0px" : value2;
          return {
            "& > :not([hidden]) ~ :not([hidden])": {
              "--tw-space-y-reverse": "0",
              "margin-top": `calc(${value2} * calc(1 - var(--tw-space-y-reverse)))`,
              "margin-bottom": `calc(${value2} * var(--tw-space-y-reverse))`
            }
          };
        }
      },
      { values: theme("space"), supportsNegativeValues: true }
    );
    addUtilities({
      ".space-y-reverse > :not([hidden]) ~ :not([hidden])": { "--tw-space-y-reverse": "1" },
      ".space-x-reverse > :not([hidden]) ~ :not([hidden])": { "--tw-space-x-reverse": "1" }
    });
  },
  divideWidth: ({ matchUtilities, addUtilities, theme }) => {
    matchUtilities(
      {
        "divide-x": (value2) => {
          value2 = value2 === "0" ? "0px" : value2;
          if (false) {
            return {
              "& > :not([hidden]) ~ :not([hidden])": {
                "@defaults border-width": {},
                "--tw-divide-x-reverse": "0",
                "border-inline-end-width": `calc(${value2} * var(--tw-divide-x-reverse))`,
                "border-inline-start-width": `calc(${value2} * calc(1 - var(--tw-divide-x-reverse)))`
              }
            };
          }
          return {
            "& > :not([hidden]) ~ :not([hidden])": {
              "@defaults border-width": {},
              "--tw-divide-x-reverse": "0",
              "border-right-width": `calc(${value2} * var(--tw-divide-x-reverse))`,
              "border-left-width": `calc(${value2} * calc(1 - var(--tw-divide-x-reverse)))`
            }
          };
        },
        "divide-y": (value2) => {
          value2 = value2 === "0" ? "0px" : value2;
          return {
            "& > :not([hidden]) ~ :not([hidden])": {
              "@defaults border-width": {},
              "--tw-divide-y-reverse": "0",
              "border-top-width": `calc(${value2} * calc(1 - var(--tw-divide-y-reverse)))`,
              "border-bottom-width": `calc(${value2} * var(--tw-divide-y-reverse))`
            }
          };
        }
      },
      { values: theme("divideWidth"), type: ["line-width", "length", "any"] }
    );
    addUtilities({
      ".divide-y-reverse > :not([hidden]) ~ :not([hidden])": {
        "@defaults border-width": {},
        "--tw-divide-y-reverse": "1"
      },
      ".divide-x-reverse > :not([hidden]) ~ :not([hidden])": {
        "@defaults border-width": {},
        "--tw-divide-x-reverse": "1"
      }
    });
  },
  divideStyle: ({ addUtilities }) => {
    addUtilities({
      ".divide-solid > :not([hidden]) ~ :not([hidden])": { "border-style": "solid" },
      ".divide-dashed > :not([hidden]) ~ :not([hidden])": { "border-style": "dashed" },
      ".divide-dotted > :not([hidden]) ~ :not([hidden])": { "border-style": "dotted" },
      ".divide-double > :not([hidden]) ~ :not([hidden])": { "border-style": "double" },
      ".divide-none > :not([hidden]) ~ :not([hidden])": { "border-style": "none" }
    });
  },
  divideColor: ({ matchUtilities, theme, corePlugins: corePlugins2 }) => {
    matchUtilities(
      {
        divide: (value2) => {
          if (!corePlugins2("divideOpacity")) {
            return {
              ["& > :not([hidden]) ~ :not([hidden])"]: {
                "border-color": toColorValue(value2)
              }
            };
          }
          return {
            ["& > :not([hidden]) ~ :not([hidden])"]: withAlphaVariable({
              color: value2,
              property: "border-color",
              variable: "--tw-divide-opacity"
            })
          };
        }
      },
      {
        values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette_default(theme("divideColor"))),
        type: ["color", "any"]
      }
    );
  },
  divideOpacity: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "divide-opacity": (value2) => {
          return { [`& > :not([hidden]) ~ :not([hidden])`]: { "--tw-divide-opacity": value2 } };
        }
      },
      { values: theme("divideOpacity") }
    );
  },
  placeSelf: ({ addUtilities }) => {
    addUtilities({
      ".place-self-auto": { "place-self": "auto" },
      ".place-self-start": { "place-self": "start" },
      ".place-self-end": { "place-self": "end" },
      ".place-self-center": { "place-self": "center" },
      ".place-self-stretch": { "place-self": "stretch" }
    });
  },
  alignSelf: ({ addUtilities }) => {
    addUtilities({
      ".self-auto": { "align-self": "auto" },
      ".self-start": { "align-self": "flex-start" },
      ".self-end": { "align-self": "flex-end" },
      ".self-center": { "align-self": "center" },
      ".self-stretch": { "align-self": "stretch" },
      ".self-baseline": { "align-self": "baseline" }
    });
  },
  justifySelf: ({ addUtilities }) => {
    addUtilities({
      ".justify-self-auto": { "justify-self": "auto" },
      ".justify-self-start": { "justify-self": "start" },
      ".justify-self-end": { "justify-self": "end" },
      ".justify-self-center": { "justify-self": "center" },
      ".justify-self-stretch": { "justify-self": "stretch" }
    });
  },
  overflow: ({ addUtilities }) => {
    addUtilities({
      ".overflow-auto": { overflow: "auto" },
      ".overflow-hidden": { overflow: "hidden" },
      ".overflow-clip": { overflow: "clip" },
      ".overflow-visible": { overflow: "visible" },
      ".overflow-scroll": { overflow: "scroll" },
      ".overflow-x-auto": { "overflow-x": "auto" },
      ".overflow-y-auto": { "overflow-y": "auto" },
      ".overflow-x-hidden": { "overflow-x": "hidden" },
      ".overflow-y-hidden": { "overflow-y": "hidden" },
      ".overflow-x-clip": { "overflow-x": "clip" },
      ".overflow-y-clip": { "overflow-y": "clip" },
      ".overflow-x-visible": { "overflow-x": "visible" },
      ".overflow-y-visible": { "overflow-y": "visible" },
      ".overflow-x-scroll": { "overflow-x": "scroll" },
      ".overflow-y-scroll": { "overflow-y": "scroll" }
    });
  },
  overscrollBehavior: ({ addUtilities }) => {
    addUtilities({
      ".overscroll-auto": { "overscroll-behavior": "auto" },
      ".overscroll-contain": { "overscroll-behavior": "contain" },
      ".overscroll-none": { "overscroll-behavior": "none" },
      ".overscroll-y-auto": { "overscroll-behavior-y": "auto" },
      ".overscroll-y-contain": { "overscroll-behavior-y": "contain" },
      ".overscroll-y-none": { "overscroll-behavior-y": "none" },
      ".overscroll-x-auto": { "overscroll-behavior-x": "auto" },
      ".overscroll-x-contain": { "overscroll-behavior-x": "contain" },
      ".overscroll-x-none": { "overscroll-behavior-x": "none" }
    });
  },
  scrollBehavior: ({ addUtilities }) => {
    addUtilities({
      ".scroll-auto": { "scroll-behavior": "auto" },
      ".scroll-smooth": { "scroll-behavior": "smooth" }
    });
  },
  textOverflow: ({ addUtilities }) => {
    addUtilities({
      ".truncate": { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" },
      ".overflow-ellipsis": { "text-overflow": "ellipsis" },
      ".text-ellipsis": { "text-overflow": "ellipsis" },
      ".text-clip": { "text-overflow": "clip" }
    });
  },
  hyphens: ({ addUtilities }) => {
    addUtilities({
      ".hyphens-none": { hyphens: "none" },
      ".hyphens-manual": { hyphens: "manual" },
      ".hyphens-auto": { hyphens: "auto" }
    });
  },
  whitespace: ({ addUtilities }) => {
    addUtilities({
      ".whitespace-normal": { "white-space": "normal" },
      ".whitespace-nowrap": { "white-space": "nowrap" },
      ".whitespace-pre": { "white-space": "pre" },
      ".whitespace-pre-line": { "white-space": "pre-line" },
      ".whitespace-pre-wrap": { "white-space": "pre-wrap" },
      ".whitespace-break-spaces": { "white-space": "break-spaces" }
    });
  },
  textWrap: ({ addUtilities }) => {
    addUtilities({
      ".text-wrap": { "text-wrap": "wrap" },
      ".text-nowrap": { "text-wrap": "nowrap" },
      ".text-balance": { "text-wrap": "balance" },
      ".text-pretty": { "text-wrap": "pretty" }
    });
  },
  wordBreak: ({ addUtilities }) => {
    addUtilities({
      ".break-normal": { "overflow-wrap": "normal", "word-break": "normal" },
      ".break-words": { "overflow-wrap": "break-word" },
      ".break-all": { "word-break": "break-all" },
      ".break-keep": { "word-break": "keep-all" }
    });
  },
  borderRadius: createUtilityPlugin("borderRadius", [
    ["rounded", ["border-radius"]],
    [
      ["rounded-s", ["border-start-start-radius", "border-end-start-radius"]],
      ["rounded-e", ["border-start-end-radius", "border-end-end-radius"]],
      ["rounded-t", ["border-top-left-radius", "border-top-right-radius"]],
      ["rounded-r", ["border-top-right-radius", "border-bottom-right-radius"]],
      ["rounded-b", ["border-bottom-right-radius", "border-bottom-left-radius"]],
      ["rounded-l", ["border-top-left-radius", "border-bottom-left-radius"]]
    ],
    [
      ["rounded-ss", ["border-start-start-radius"]],
      ["rounded-se", ["border-start-end-radius"]],
      ["rounded-ee", ["border-end-end-radius"]],
      ["rounded-es", ["border-end-start-radius"]],
      ["rounded-tl", ["border-top-left-radius"]],
      ["rounded-tr", ["border-top-right-radius"]],
      ["rounded-br", ["border-bottom-right-radius"]],
      ["rounded-bl", ["border-bottom-left-radius"]]
    ]
  ]),
  borderWidth: createUtilityPlugin(
    "borderWidth",
    [
      ["border", [["@defaults border-width", {}], "border-width"]],
      [
        ["border-x", [["@defaults border-width", {}], "border-left-width", "border-right-width"]],
        ["border-y", [["@defaults border-width", {}], "border-top-width", "border-bottom-width"]]
      ],
      [
        ["border-s", [["@defaults border-width", {}], "border-inline-start-width"]],
        ["border-e", [["@defaults border-width", {}], "border-inline-end-width"]],
        ["border-t", [["@defaults border-width", {}], "border-top-width"]],
        ["border-r", [["@defaults border-width", {}], "border-right-width"]],
        ["border-b", [["@defaults border-width", {}], "border-bottom-width"]],
        ["border-l", [["@defaults border-width", {}], "border-left-width"]]
      ]
    ],
    { type: ["line-width", "length"] }
  ),
  borderStyle: ({ addUtilities }) => {
    addUtilities({
      ".border-solid": { "border-style": "solid" },
      ".border-dashed": { "border-style": "dashed" },
      ".border-dotted": { "border-style": "dotted" },
      ".border-double": { "border-style": "double" },
      ".border-hidden": { "border-style": "hidden" },
      ".border-none": { "border-style": "none" }
    });
  },
  borderColor: ({ matchUtilities, theme, corePlugins: corePlugins2 }) => {
    matchUtilities(
      {
        border: (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-color",
            variable: "--tw-border-opacity"
          });
        }
      },
      {
        values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette_default(theme("borderColor"))),
        type: ["color", "any"]
      }
    );
    matchUtilities(
      {
        "border-x": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-left-color": toColorValue(value2),
              "border-right-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: ["border-left-color", "border-right-color"],
            variable: "--tw-border-opacity"
          });
        },
        "border-y": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-top-color": toColorValue(value2),
              "border-bottom-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: ["border-top-color", "border-bottom-color"],
            variable: "--tw-border-opacity"
          });
        }
      },
      {
        values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette_default(theme("borderColor"))),
        type: ["color", "any"]
      }
    );
    matchUtilities(
      {
        "border-s": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-inline-start-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-inline-start-color",
            variable: "--tw-border-opacity"
          });
        },
        "border-e": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-inline-end-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-inline-end-color",
            variable: "--tw-border-opacity"
          });
        },
        "border-t": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-top-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-top-color",
            variable: "--tw-border-opacity"
          });
        },
        "border-r": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-right-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-right-color",
            variable: "--tw-border-opacity"
          });
        },
        "border-b": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-bottom-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-bottom-color",
            variable: "--tw-border-opacity"
          });
        },
        "border-l": (value2) => {
          if (!corePlugins2("borderOpacity")) {
            return {
              "border-left-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "border-left-color",
            variable: "--tw-border-opacity"
          });
        }
      },
      {
        values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette_default(theme("borderColor"))),
        type: ["color", "any"]
      }
    );
  },
  borderOpacity: createUtilityPlugin("borderOpacity", [
    ["border-opacity", ["--tw-border-opacity"]]
  ]),
  backgroundColor: ({ matchUtilities, theme, corePlugins: corePlugins2 }) => {
    matchUtilities(
      {
        bg: (value2) => {
          if (!corePlugins2("backgroundOpacity")) {
            return {
              "background-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "background-color",
            variable: "--tw-bg-opacity"
          });
        }
      },
      { values: flattenColorPalette_default(theme("backgroundColor")), type: ["color", "any"] }
    );
  },
  backgroundOpacity: createUtilityPlugin("backgroundOpacity", [
    ["bg-opacity", ["--tw-bg-opacity"]]
  ]),
  backgroundImage: createUtilityPlugin("backgroundImage", [["bg", ["background-image"]]], {
    type: ["lookup", "image", "url"]
  }),
  gradientColorStops: (() => {
    function transparentTo(value2) {
      return withAlphaValue(value2, 0, "rgb(255 255 255 / 0)");
    }
    return function({ matchUtilities, theme, addDefaults }) {
      addDefaults("gradient-color-stops", {
        "--tw-gradient-from-position": " ",
        "--tw-gradient-via-position": " ",
        "--tw-gradient-to-position": " "
      });
      let options = {
        values: flattenColorPalette_default(theme("gradientColorStops")),
        type: ["color", "any"]
      };
      let positionOptions = {
        values: theme("gradientColorStopPositions"),
        type: ["length", "percentage"]
      };
      matchUtilities(
        {
          from: (value2) => {
            let transparentToValue = transparentTo(value2);
            return {
              "@defaults gradient-color-stops": {},
              "--tw-gradient-from": `${toColorValue(value2)} var(--tw-gradient-from-position)`,
              "--tw-gradient-to": `${transparentToValue} var(--tw-gradient-to-position)`,
              "--tw-gradient-stops": `var(--tw-gradient-from), var(--tw-gradient-to)`
            };
          }
        },
        options
      );
      matchUtilities(
        {
          from: (value2) => {
            return {
              "--tw-gradient-from-position": value2
            };
          }
        },
        positionOptions
      );
      matchUtilities(
        {
          via: (value2) => {
            let transparentToValue = transparentTo(value2);
            return {
              "@defaults gradient-color-stops": {},
              "--tw-gradient-to": `${transparentToValue}  var(--tw-gradient-to-position)`,
              "--tw-gradient-stops": `var(--tw-gradient-from), ${toColorValue(
                value2
              )} var(--tw-gradient-via-position), var(--tw-gradient-to)`
            };
          }
        },
        options
      );
      matchUtilities(
        {
          via: (value2) => {
            return {
              "--tw-gradient-via-position": value2
            };
          }
        },
        positionOptions
      );
      matchUtilities(
        {
          to: (value2) => ({
            "@defaults gradient-color-stops": {},
            "--tw-gradient-to": `${toColorValue(value2)} var(--tw-gradient-to-position)`
          })
        },
        options
      );
      matchUtilities(
        {
          to: (value2) => {
            return {
              "--tw-gradient-to-position": value2
            };
          }
        },
        positionOptions
      );
    };
  })(),
  boxDecorationBreak: ({ addUtilities }) => {
    addUtilities({
      ".decoration-slice": { "box-decoration-break": "slice" },
      ".decoration-clone": { "box-decoration-break": "clone" },
      ".box-decoration-slice": { "box-decoration-break": "slice" },
      ".box-decoration-clone": { "box-decoration-break": "clone" }
    });
  },
  backgroundSize: createUtilityPlugin("backgroundSize", [["bg", ["background-size"]]], {
    type: ["lookup", "length", "percentage", "size"]
  }),
  backgroundAttachment: ({ addUtilities }) => {
    addUtilities({
      ".bg-fixed": { "background-attachment": "fixed" },
      ".bg-local": { "background-attachment": "local" },
      ".bg-scroll": { "background-attachment": "scroll" }
    });
  },
  backgroundClip: ({ addUtilities }) => {
    addUtilities({
      ".bg-clip-border": { "background-clip": "border-box" },
      ".bg-clip-padding": { "background-clip": "padding-box" },
      ".bg-clip-content": { "background-clip": "content-box" },
      ".bg-clip-text": { "background-clip": "text" }
    });
  },
  backgroundPosition: createUtilityPlugin("backgroundPosition", [["bg", ["background-position"]]], {
    type: ["lookup", ["position", { preferOnConflict: true }]]
  }),
  backgroundRepeat: ({ addUtilities }) => {
    addUtilities({
      ".bg-repeat": { "background-repeat": "repeat" },
      ".bg-no-repeat": { "background-repeat": "no-repeat" },
      ".bg-repeat-x": { "background-repeat": "repeat-x" },
      ".bg-repeat-y": { "background-repeat": "repeat-y" },
      ".bg-repeat-round": { "background-repeat": "round" },
      ".bg-repeat-space": { "background-repeat": "space" }
    });
  },
  backgroundOrigin: ({ addUtilities }) => {
    addUtilities({
      ".bg-origin-border": { "background-origin": "border-box" },
      ".bg-origin-padding": { "background-origin": "padding-box" },
      ".bg-origin-content": { "background-origin": "content-box" }
    });
  },
  fill: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        fill: (value2) => {
          return { fill: toColorValue(value2) };
        }
      },
      { values: flattenColorPalette_default(theme("fill")), type: ["color", "any"] }
    );
  },
  stroke: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        stroke: (value2) => {
          return { stroke: toColorValue(value2) };
        }
      },
      { values: flattenColorPalette_default(theme("stroke")), type: ["color", "url", "any"] }
    );
  },
  strokeWidth: createUtilityPlugin("strokeWidth", [["stroke", ["stroke-width"]]], {
    type: ["length", "number", "percentage"]
  }),
  objectFit: ({ addUtilities }) => {
    addUtilities({
      ".object-contain": { "object-fit": "contain" },
      ".object-cover": { "object-fit": "cover" },
      ".object-fill": { "object-fit": "fill" },
      ".object-none": { "object-fit": "none" },
      ".object-scale-down": { "object-fit": "scale-down" }
    });
  },
  objectPosition: createUtilityPlugin("objectPosition", [["object", ["object-position"]]]),
  padding: createUtilityPlugin("padding", [
    ["p", ["padding"]],
    [
      ["px", ["padding-left", "padding-right"]],
      ["py", ["padding-top", "padding-bottom"]]
    ],
    [
      ["ps", ["padding-inline-start"]],
      ["pe", ["padding-inline-end"]],
      ["pt", ["padding-top"]],
      ["pr", ["padding-right"]],
      ["pb", ["padding-bottom"]],
      ["pl", ["padding-left"]]
    ]
  ]),
  textAlign: ({ addUtilities }) => {
    addUtilities({
      ".text-left": { "text-align": "left" },
      ".text-center": { "text-align": "center" },
      ".text-right": { "text-align": "right" },
      ".text-justify": { "text-align": "justify" },
      ".text-start": { "text-align": "start" },
      ".text-end": { "text-align": "end" }
    });
  },
  textIndent: createUtilityPlugin("textIndent", [["indent", ["text-indent"]]], {
    supportsNegativeValues: true
  }),
  verticalAlign: ({ addUtilities, matchUtilities }) => {
    addUtilities({
      ".align-baseline": { "vertical-align": "baseline" },
      ".align-top": { "vertical-align": "top" },
      ".align-middle": { "vertical-align": "middle" },
      ".align-bottom": { "vertical-align": "bottom" },
      ".align-text-top": { "vertical-align": "text-top" },
      ".align-text-bottom": { "vertical-align": "text-bottom" },
      ".align-sub": { "vertical-align": "sub" },
      ".align-super": { "vertical-align": "super" }
    });
    matchUtilities({ align: (value2) => ({ "vertical-align": value2 }) });
  },
  fontFamily: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        font: (value2) => {
          let [families, options = {}] = Array.isArray(value2) && isPlainObject(value2[1]) ? value2 : [value2];
          let { fontFeatureSettings, fontVariationSettings } = options;
          return {
            "font-family": Array.isArray(families) ? families.join(", ") : families,
            ...fontFeatureSettings === void 0 ? {} : { "font-feature-settings": fontFeatureSettings },
            ...fontVariationSettings === void 0 ? {} : { "font-variation-settings": fontVariationSettings }
          };
        }
      },
      {
        values: theme("fontFamily"),
        type: ["lookup", "generic-name", "family-name"]
      }
    );
  },
  fontSize: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        text: (value2, { modifier }) => {
          let [fontSize, options] = Array.isArray(value2) ? value2 : [value2];
          if (modifier) {
            return {
              "font-size": fontSize,
              "line-height": modifier
            };
          }
          let { lineHeight, letterSpacing, fontWeight } = isPlainObject(options) ? options : { lineHeight: options };
          return {
            "font-size": fontSize,
            ...lineHeight === void 0 ? {} : { "line-height": lineHeight },
            ...letterSpacing === void 0 ? {} : { "letter-spacing": letterSpacing },
            ...fontWeight === void 0 ? {} : { "font-weight": fontWeight }
          };
        }
      },
      {
        values: theme("fontSize"),
        modifiers: theme("lineHeight"),
        type: ["absolute-size", "relative-size", "length", "percentage"]
      }
    );
  },
  fontWeight: createUtilityPlugin("fontWeight", [["font", ["fontWeight"]]], {
    type: ["lookup", "number", "any"]
  }),
  textTransform: ({ addUtilities }) => {
    addUtilities({
      ".uppercase": { "text-transform": "uppercase" },
      ".lowercase": { "text-transform": "lowercase" },
      ".capitalize": { "text-transform": "capitalize" },
      ".normal-case": { "text-transform": "none" }
    });
  },
  fontStyle: ({ addUtilities }) => {
    addUtilities({
      ".italic": { "font-style": "italic" },
      ".not-italic": { "font-style": "normal" }
    });
  },
  fontVariantNumeric: ({ addDefaults, addUtilities }) => {
    let cssFontVariantNumericValue = "var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)";
    addDefaults("font-variant-numeric", {
      "--tw-ordinal": " ",
      "--tw-slashed-zero": " ",
      "--tw-numeric-figure": " ",
      "--tw-numeric-spacing": " ",
      "--tw-numeric-fraction": " "
    });
    addUtilities({
      ".normal-nums": { "font-variant-numeric": "normal" },
      ".ordinal": {
        "@defaults font-variant-numeric": {},
        "--tw-ordinal": "ordinal",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".slashed-zero": {
        "@defaults font-variant-numeric": {},
        "--tw-slashed-zero": "slashed-zero",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".lining-nums": {
        "@defaults font-variant-numeric": {},
        "--tw-numeric-figure": "lining-nums",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".oldstyle-nums": {
        "@defaults font-variant-numeric": {},
        "--tw-numeric-figure": "oldstyle-nums",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".proportional-nums": {
        "@defaults font-variant-numeric": {},
        "--tw-numeric-spacing": "proportional-nums",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".tabular-nums": {
        "@defaults font-variant-numeric": {},
        "--tw-numeric-spacing": "tabular-nums",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".diagonal-fractions": {
        "@defaults font-variant-numeric": {},
        "--tw-numeric-fraction": "diagonal-fractions",
        "font-variant-numeric": cssFontVariantNumericValue
      },
      ".stacked-fractions": {
        "@defaults font-variant-numeric": {},
        "--tw-numeric-fraction": "stacked-fractions",
        "font-variant-numeric": cssFontVariantNumericValue
      }
    });
  },
  lineHeight: createUtilityPlugin("lineHeight", [["leading", ["lineHeight"]]]),
  letterSpacing: createUtilityPlugin("letterSpacing", [["tracking", ["letterSpacing"]]], {
    supportsNegativeValues: true
  }),
  textColor: ({ matchUtilities, theme, corePlugins: corePlugins2 }) => {
    matchUtilities(
      {
        text: (value2) => {
          if (!corePlugins2("textOpacity")) {
            return { color: toColorValue(value2) };
          }
          return withAlphaVariable({
            color: value2,
            property: "color",
            variable: "--tw-text-opacity"
          });
        }
      },
      { values: flattenColorPalette_default(theme("textColor")), type: ["color", "any"] }
    );
  },
  textOpacity: createUtilityPlugin("textOpacity", [["text-opacity", ["--tw-text-opacity"]]]),
  textDecoration: ({ addUtilities }) => {
    addUtilities({
      ".underline": { "text-decoration-line": "underline" },
      ".overline": { "text-decoration-line": "overline" },
      ".line-through": { "text-decoration-line": "line-through" },
      ".no-underline": { "text-decoration-line": "none" }
    });
  },
  textDecorationColor: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        decoration: (value2) => {
          return { "text-decoration-color": toColorValue(value2) };
        }
      },
      { values: flattenColorPalette_default(theme("textDecorationColor")), type: ["color", "any"] }
    );
  },
  textDecorationStyle: ({ addUtilities }) => {
    addUtilities({
      ".decoration-solid": { "text-decoration-style": "solid" },
      ".decoration-double": { "text-decoration-style": "double" },
      ".decoration-dotted": { "text-decoration-style": "dotted" },
      ".decoration-dashed": { "text-decoration-style": "dashed" },
      ".decoration-wavy": { "text-decoration-style": "wavy" }
    });
  },
  textDecorationThickness: createUtilityPlugin(
    "textDecorationThickness",
    [["decoration", ["text-decoration-thickness"]]],
    { type: ["length", "percentage"] }
  ),
  textUnderlineOffset: createUtilityPlugin(
    "textUnderlineOffset",
    [["underline-offset", ["text-underline-offset"]]],
    { type: ["length", "percentage", "any"] }
  ),
  fontSmoothing: ({ addUtilities }) => {
    addUtilities({
      ".antialiased": {
        "-webkit-font-smoothing": "antialiased",
        "-moz-osx-font-smoothing": "grayscale"
      },
      ".subpixel-antialiased": {
        "-webkit-font-smoothing": "auto",
        "-moz-osx-font-smoothing": "auto"
      }
    });
  },
  placeholderColor: ({ matchUtilities, theme, corePlugins: corePlugins2 }) => {
    matchUtilities(
      {
        placeholder: (value2) => {
          if (!corePlugins2("placeholderOpacity")) {
            return {
              "&::placeholder": {
                color: toColorValue(value2)
              }
            };
          }
          return {
            "&::placeholder": withAlphaVariable({
              color: value2,
              property: "color",
              variable: "--tw-placeholder-opacity"
            })
          };
        }
      },
      { values: flattenColorPalette_default(theme("placeholderColor")), type: ["color", "any"] }
    );
  },
  placeholderOpacity: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "placeholder-opacity": (value2) => {
          return { ["&::placeholder"]: { "--tw-placeholder-opacity": value2 } };
        }
      },
      { values: theme("placeholderOpacity") }
    );
  },
  caretColor: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        caret: (value2) => {
          return { "caret-color": toColorValue(value2) };
        }
      },
      { values: flattenColorPalette_default(theme("caretColor")), type: ["color", "any"] }
    );
  },
  accentColor: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        accent: (value2) => {
          return { "accent-color": toColorValue(value2) };
        }
      },
      { values: flattenColorPalette_default(theme("accentColor")), type: ["color", "any"] }
    );
  },
  opacity: createUtilityPlugin("opacity", [["opacity", ["opacity"]]]),
  backgroundBlendMode: ({ addUtilities }) => {
    addUtilities({
      ".bg-blend-normal": { "background-blend-mode": "normal" },
      ".bg-blend-multiply": { "background-blend-mode": "multiply" },
      ".bg-blend-screen": { "background-blend-mode": "screen" },
      ".bg-blend-overlay": { "background-blend-mode": "overlay" },
      ".bg-blend-darken": { "background-blend-mode": "darken" },
      ".bg-blend-lighten": { "background-blend-mode": "lighten" },
      ".bg-blend-color-dodge": { "background-blend-mode": "color-dodge" },
      ".bg-blend-color-burn": { "background-blend-mode": "color-burn" },
      ".bg-blend-hard-light": { "background-blend-mode": "hard-light" },
      ".bg-blend-soft-light": { "background-blend-mode": "soft-light" },
      ".bg-blend-difference": { "background-blend-mode": "difference" },
      ".bg-blend-exclusion": { "background-blend-mode": "exclusion" },
      ".bg-blend-hue": { "background-blend-mode": "hue" },
      ".bg-blend-saturation": { "background-blend-mode": "saturation" },
      ".bg-blend-color": { "background-blend-mode": "color" },
      ".bg-blend-luminosity": { "background-blend-mode": "luminosity" }
    });
  },
  mixBlendMode: ({ addUtilities }) => {
    addUtilities({
      ".mix-blend-normal": { "mix-blend-mode": "normal" },
      ".mix-blend-multiply": { "mix-blend-mode": "multiply" },
      ".mix-blend-screen": { "mix-blend-mode": "screen" },
      ".mix-blend-overlay": { "mix-blend-mode": "overlay" },
      ".mix-blend-darken": { "mix-blend-mode": "darken" },
      ".mix-blend-lighten": { "mix-blend-mode": "lighten" },
      ".mix-blend-color-dodge": { "mix-blend-mode": "color-dodge" },
      ".mix-blend-color-burn": { "mix-blend-mode": "color-burn" },
      ".mix-blend-hard-light": { "mix-blend-mode": "hard-light" },
      ".mix-blend-soft-light": { "mix-blend-mode": "soft-light" },
      ".mix-blend-difference": { "mix-blend-mode": "difference" },
      ".mix-blend-exclusion": { "mix-blend-mode": "exclusion" },
      ".mix-blend-hue": { "mix-blend-mode": "hue" },
      ".mix-blend-saturation": { "mix-blend-mode": "saturation" },
      ".mix-blend-color": { "mix-blend-mode": "color" },
      ".mix-blend-luminosity": { "mix-blend-mode": "luminosity" },
      ".mix-blend-plus-lighter": { "mix-blend-mode": "plus-lighter" }
    });
  },
  boxShadow: (() => {
    let transformValue = transformThemeValue("boxShadow");
    let defaultBoxShadow = [
      `var(--tw-ring-offset-shadow, 0 0 #0000)`,
      `var(--tw-ring-shadow, 0 0 #0000)`,
      `var(--tw-shadow)`
    ].join(", ");
    return function({ matchUtilities, addDefaults, theme }) {
      addDefaults(" box-shadow", {
        "--tw-ring-offset-shadow": "0 0 #0000",
        "--tw-ring-shadow": "0 0 #0000",
        "--tw-shadow": "0 0 #0000",
        "--tw-shadow-colored": "0 0 #0000"
      });
      matchUtilities(
        {
          shadow: (value2) => {
            value2 = transformValue(value2);
            let ast = parseBoxShadowValue(value2);
            for (let shadow2 of ast) {
              if (!shadow2.valid) {
                continue;
              }
              shadow2.color = "var(--tw-shadow-color)";
            }
            return {
              "@defaults box-shadow": {},
              "--tw-shadow": value2 === "none" ? "0 0 #0000" : value2,
              "--tw-shadow-colored": value2 === "none" ? "0 0 #0000" : formatBoxShadowValue(ast),
              "box-shadow": defaultBoxShadow
            };
          }
        },
        { values: theme("boxShadow"), type: ["shadow"] }
      );
    };
  })(),
  boxShadowColor: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        shadow: (value2) => {
          return {
            "--tw-shadow-color": toColorValue(value2),
            "--tw-shadow": "var(--tw-shadow-colored)"
          };
        }
      },
      { values: flattenColorPalette_default(theme("boxShadowColor")), type: ["color", "any"] }
    );
  },
  outlineStyle: ({ addUtilities }) => {
    addUtilities({
      ".outline-none": {
        outline: "2px solid transparent",
        "outline-offset": "2px"
      },
      ".outline": { "outline-style": "solid" },
      ".outline-dashed": { "outline-style": "dashed" },
      ".outline-dotted": { "outline-style": "dotted" },
      ".outline-double": { "outline-style": "double" }
    });
  },
  outlineWidth: createUtilityPlugin("outlineWidth", [["outline", ["outline-width"]]], {
    type: ["length", "number", "percentage"]
  }),
  outlineOffset: createUtilityPlugin("outlineOffset", [["outline-offset", ["outline-offset"]]], {
    type: ["length", "number", "percentage", "any"],
    supportsNegativeValues: true
  }),
  outlineColor: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        outline: (value2) => {
          return { "outline-color": toColorValue(value2) };
        }
      },
      { values: flattenColorPalette_default(theme("outlineColor")), type: ["color", "any"] }
    );
  },
  ringWidth: ({ matchUtilities, addDefaults, addUtilities, theme, config }) => {
    let ringColorDefault = (() => {
      if (flagEnabled(config(), "respectDefaultRingColorOpacity")) {
        return theme("ringColor.DEFAULT");
      }
      let ringOpacityDefault = theme("ringOpacity.DEFAULT", "0.5");
      if (!theme("ringColor")?.DEFAULT) {
        return `rgb(147 197 253 / ${ringOpacityDefault})`;
      }
      return withAlphaValue(
        theme("ringColor")?.DEFAULT,
        ringOpacityDefault,
        `rgb(147 197 253 / ${ringOpacityDefault})`
      );
    })();
    addDefaults("ring-width", {
      "--tw-ring-inset": " ",
      "--tw-ring-offset-width": theme("ringOffsetWidth.DEFAULT", "0px"),
      "--tw-ring-offset-color": theme("ringOffsetColor.DEFAULT", "#fff"),
      "--tw-ring-color": ringColorDefault,
      "--tw-ring-offset-shadow": "0 0 #0000",
      "--tw-ring-shadow": "0 0 #0000",
      "--tw-shadow": "0 0 #0000",
      "--tw-shadow-colored": "0 0 #0000"
    });
    matchUtilities(
      {
        ring: (value2) => {
          return {
            "@defaults ring-width": {},
            "--tw-ring-offset-shadow": `var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)`,
            "--tw-ring-shadow": `var(--tw-ring-inset) 0 0 0 calc(${value2} + var(--tw-ring-offset-width)) var(--tw-ring-color)`,
            "box-shadow": [
              `var(--tw-ring-offset-shadow)`,
              `var(--tw-ring-shadow)`,
              `var(--tw-shadow, 0 0 #0000)`
            ].join(", ")
          };
        }
      },
      { values: theme("ringWidth"), type: "length" }
    );
    addUtilities({
      ".ring-inset": { "@defaults ring-width": {}, "--tw-ring-inset": "inset" }
    });
  },
  ringColor: ({ matchUtilities, theme, corePlugins: corePlugins2 }) => {
    matchUtilities(
      {
        ring: (value2) => {
          if (!corePlugins2("ringOpacity")) {
            return {
              "--tw-ring-color": toColorValue(value2)
            };
          }
          return withAlphaVariable({
            color: value2,
            property: "--tw-ring-color",
            variable: "--tw-ring-opacity"
          });
        }
      },
      {
        values: Object.fromEntries(
          Object.entries(flattenColorPalette_default(theme("ringColor"))).filter(
            ([modifier]) => modifier !== "DEFAULT"
          )
        ),
        type: ["color", "any"]
      }
    );
  },
  ringOpacity: (helpers) => {
    let { config } = helpers;
    return createUtilityPlugin("ringOpacity", [["ring-opacity", ["--tw-ring-opacity"]]], {
      filterDefault: !flagEnabled(config(), "respectDefaultRingColorOpacity")
    })(helpers);
  },
  ringOffsetWidth: createUtilityPlugin(
    "ringOffsetWidth",
    [["ring-offset", ["--tw-ring-offset-width"]]],
    { type: "length" }
  ),
  ringOffsetColor: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "ring-offset": (value2) => {
          return {
            "--tw-ring-offset-color": toColorValue(value2)
          };
        }
      },
      { values: flattenColorPalette_default(theme("ringOffsetColor")), type: ["color", "any"] }
    );
  },
  blur: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        blur: (value2) => {
          return {
            "--tw-blur": `blur(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("blur") }
    );
  },
  brightness: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        brightness: (value2) => {
          return {
            "--tw-brightness": `brightness(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("brightness") }
    );
  },
  contrast: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        contrast: (value2) => {
          return {
            "--tw-contrast": `contrast(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("contrast") }
    );
  },
  dropShadow: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "drop-shadow": (value2) => {
          return {
            "--tw-drop-shadow": Array.isArray(value2) ? value2.map((v) => `drop-shadow(${v})`).join(" ") : `drop-shadow(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("dropShadow") }
    );
  },
  grayscale: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        grayscale: (value2) => {
          return {
            "--tw-grayscale": `grayscale(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("grayscale") }
    );
  },
  hueRotate: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "hue-rotate": (value2) => {
          return {
            "--tw-hue-rotate": `hue-rotate(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("hueRotate"), supportsNegativeValues: true }
    );
  },
  invert: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        invert: (value2) => {
          return {
            "--tw-invert": `invert(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("invert") }
    );
  },
  saturate: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        saturate: (value2) => {
          return {
            "--tw-saturate": `saturate(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("saturate") }
    );
  },
  sepia: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        sepia: (value2) => {
          return {
            "--tw-sepia": `sepia(${value2})`,
            "@defaults filter": {},
            filter: cssFilterValue
          };
        }
      },
      { values: theme("sepia") }
    );
  },
  filter: ({ addDefaults, addUtilities }) => {
    addDefaults("filter", {
      "--tw-blur": " ",
      "--tw-brightness": " ",
      "--tw-contrast": " ",
      "--tw-grayscale": " ",
      "--tw-hue-rotate": " ",
      "--tw-invert": " ",
      "--tw-saturate": " ",
      "--tw-sepia": " ",
      "--tw-drop-shadow": " "
    });
    addUtilities({
      ".filter": { "@defaults filter": {}, filter: cssFilterValue },
      ".filter-none": { filter: "none" }
    });
  },
  backdropBlur: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-blur": (value2) => {
          return {
            "--tw-backdrop-blur": `blur(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropBlur") }
    );
  },
  backdropBrightness: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-brightness": (value2) => {
          return {
            "--tw-backdrop-brightness": `brightness(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropBrightness") }
    );
  },
  backdropContrast: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-contrast": (value2) => {
          return {
            "--tw-backdrop-contrast": `contrast(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropContrast") }
    );
  },
  backdropGrayscale: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-grayscale": (value2) => {
          return {
            "--tw-backdrop-grayscale": `grayscale(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropGrayscale") }
    );
  },
  backdropHueRotate: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-hue-rotate": (value2) => {
          return {
            "--tw-backdrop-hue-rotate": `hue-rotate(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropHueRotate"), supportsNegativeValues: true }
    );
  },
  backdropInvert: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-invert": (value2) => {
          return {
            "--tw-backdrop-invert": `invert(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropInvert") }
    );
  },
  backdropOpacity: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-opacity": (value2) => {
          return {
            "--tw-backdrop-opacity": `opacity(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropOpacity") }
    );
  },
  backdropSaturate: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-saturate": (value2) => {
          return {
            "--tw-backdrop-saturate": `saturate(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropSaturate") }
    );
  },
  backdropSepia: ({ matchUtilities, theme }) => {
    matchUtilities(
      {
        "backdrop-sepia": (value2) => {
          return {
            "--tw-backdrop-sepia": `sepia(${value2})`,
            "@defaults backdrop-filter": {},
            "backdrop-filter": cssBackdropFilterValue
          };
        }
      },
      { values: theme("backdropSepia") }
    );
  },
  backdropFilter: ({ addDefaults, addUtilities }) => {
    addDefaults("backdrop-filter", {
      "--tw-backdrop-blur": " ",
      "--tw-backdrop-brightness": " ",
      "--tw-backdrop-contrast": " ",
      "--tw-backdrop-grayscale": " ",
      "--tw-backdrop-hue-rotate": " ",
      "--tw-backdrop-invert": " ",
      "--tw-backdrop-opacity": " ",
      "--tw-backdrop-saturate": " ",
      "--tw-backdrop-sepia": " "
    });
    addUtilities({
      ".backdrop-filter": {
        "@defaults backdrop-filter": {},
        "backdrop-filter": cssBackdropFilterValue
      },
      ".backdrop-filter-none": { "backdrop-filter": "none" }
    });
  },
  transitionProperty: ({ matchUtilities, theme }) => {
    let defaultTimingFunction = theme("transitionTimingFunction.DEFAULT");
    let defaultDuration = theme("transitionDuration.DEFAULT");
    matchUtilities(
      {
        transition: (value2) => {
          return {
            "transition-property": value2,
            ...value2 === "none" ? {} : {
              "transition-timing-function": defaultTimingFunction,
              "transition-duration": defaultDuration
            }
          };
        }
      },
      { values: theme("transitionProperty") }
    );
  },
  transitionDelay: createUtilityPlugin("transitionDelay", [["delay", ["transitionDelay"]]]),
  transitionDuration: createUtilityPlugin(
    "transitionDuration",
    [["duration", ["transitionDuration"]]],
    { filterDefault: true }
  ),
  transitionTimingFunction: createUtilityPlugin(
    "transitionTimingFunction",
    [["ease", ["transitionTimingFunction"]]],
    { filterDefault: true }
  ),
  willChange: createUtilityPlugin("willChange", [["will-change", ["will-change"]]]),
  content: createUtilityPlugin("content", [
    ["content", ["--tw-content", ["content", "var(--tw-content)"]]]
  ]),
  forcedColorAdjust: ({ addUtilities }) => {
    addUtilities({
      ".forced-color-adjust-auto": { "forced-color-adjust": "auto" },
      ".forced-color-adjust-none": { "forced-color-adjust": "none" }
    });
  }
};

// node_modules/tailwindcss/src/util/toPath.js
function toPath(path) {
  if (Array.isArray(path))
    return path;
  let openBrackets = path.split("[").length - 1;
  let closedBrackets = path.split("]").length - 1;
  if (openBrackets !== closedBrackets) {
    throw new Error(`Path is invalid. Has unbalanced brackets: ${path}`);
  }
  return path.split(/\.(?![^\[]*\])|[\[\]]/g).filter(Boolean);
}

// node_modules/tailwindcss/src/util/isSyntacticallyValidPropertyValue.js
var matchingBrackets = /* @__PURE__ */ new Map([
  ["{", "}"],
  ["[", "]"],
  ["(", ")"]
]);
var inverseMatchingBrackets = new Map(
  Array.from(matchingBrackets.entries()).map(([k, v]) => [v, k])
);
var quotes = /* @__PURE__ */ new Set(['"', "'", "`"]);
function isSyntacticallyValidPropertyValue(value2) {
  let stack = [];
  let inQuotes = false;
  for (let i = 0; i < value2.length; i++) {
    let char = value2[i];
    if (char === ":" && !inQuotes && stack.length === 0) {
      return false;
    }
    if (quotes.has(char) && value2[i - 1] !== "\\") {
      inQuotes = !inQuotes;
    }
    if (inQuotes)
      continue;
    if (value2[i - 1] === "\\")
      continue;
    if (matchingBrackets.has(char)) {
      stack.push(char);
    } else if (inverseMatchingBrackets.has(char)) {
      let inverse = inverseMatchingBrackets.get(char);
      if (stack.length <= 0) {
        return false;
      }
      if (stack.pop() !== inverse) {
        return false;
      }
    }
  }
  if (stack.length > 0) {
    return false;
  }
  return true;
}

// node_modules/tailwindcss/src/util/bigSign.js
function bigSign(bigIntValue) {
  return (bigIntValue > 0n) - (bigIntValue < 0n);
}

// node_modules/tailwindcss/src/lib/remap-bitfield.js
function remapBitfield(num, mapping) {
  let oldMask = 0n;
  let newMask = 0n;
  for (let [oldBit, newBit] of mapping) {
    if (num & oldBit) {
      oldMask = oldMask | oldBit;
      newMask = newMask | newBit;
    }
  }
  return num & ~oldMask | newMask;
}

// node_modules/tailwindcss/src/lib/offsets.js
var Offsets = class {
  constructor() {
    this.offsets = {
      defaults: 0n,
      base: 0n,
      components: 0n,
      utilities: 0n,
      variants: 0n,
      user: 0n
    };
    this.layerPositions = {
      defaults: 0n,
      base: 1n,
      components: 2n,
      utilities: 3n,
      user: 4n,
      variants: 5n
    };
    this.reservedVariantBits = 0n;
    this.variantOffsets = /* @__PURE__ */ new Map();
  }
  create(layer) {
    return {
      layer,
      parentLayer: layer,
      arbitrary: 0n,
      variants: 0n,
      parallelIndex: 0n,
      index: this.offsets[layer]++,
      options: []
    };
  }
  arbitraryProperty() {
    return {
      ...this.create("utilities"),
      arbitrary: 1n
    };
  }
  forVariant(variant, index = 0) {
    let offset = this.variantOffsets.get(variant);
    if (offset === void 0) {
      throw new Error(`Cannot find offset for unknown variant ${variant}`);
    }
    return {
      ...this.create("variants"),
      variants: offset << BigInt(index)
    };
  }
  applyVariantOffset(rule, variant, options) {
    options.variant = variant.variants;
    return {
      ...rule,
      layer: "variants",
      parentLayer: rule.layer === "variants" ? rule.parentLayer : rule.layer,
      variants: rule.variants | variant.variants,
      options: options.sort ? [].concat(options, rule.options) : rule.options,
      parallelIndex: max([rule.parallelIndex, variant.parallelIndex])
    };
  }
  applyParallelOffset(offset, parallelIndex) {
    return {
      ...offset,
      parallelIndex: BigInt(parallelIndex)
    };
  }
  recordVariants(variants, getLength) {
    for (let variant of variants) {
      this.recordVariant(variant, getLength(variant));
    }
  }
  recordVariant(variant, fnCount = 1) {
    this.variantOffsets.set(variant, 1n << this.reservedVariantBits);
    this.reservedVariantBits += BigInt(fnCount);
    return {
      ...this.create("variants"),
      variants: this.variantOffsets.get(variant)
    };
  }
  compare(a, b) {
    if (a.layer !== b.layer) {
      return this.layerPositions[a.layer] - this.layerPositions[b.layer];
    }
    if (a.parentLayer !== b.parentLayer) {
      return this.layerPositions[a.parentLayer] - this.layerPositions[b.parentLayer];
    }
    for (let aOptions of a.options) {
      for (let bOptions of b.options) {
        if (aOptions.id !== bOptions.id)
          continue;
        if (!aOptions.sort || !bOptions.sort)
          continue;
        let maxFnVariant = max([aOptions.variant, bOptions.variant]) ?? 0n;
        let mask = ~(maxFnVariant | maxFnVariant - 1n);
        let aVariantsAfterFn = a.variants & mask;
        let bVariantsAfterFn = b.variants & mask;
        if (aVariantsAfterFn !== bVariantsAfterFn) {
          continue;
        }
        let result = aOptions.sort(
          {
            value: aOptions.value,
            modifier: aOptions.modifier
          },
          {
            value: bOptions.value,
            modifier: bOptions.modifier
          }
        );
        if (result !== 0)
          return result;
      }
    }
    if (a.variants !== b.variants) {
      return a.variants - b.variants;
    }
    if (a.parallelIndex !== b.parallelIndex) {
      return a.parallelIndex - b.parallelIndex;
    }
    if (a.arbitrary !== b.arbitrary) {
      return a.arbitrary - b.arbitrary;
    }
    return a.index - b.index;
  }
  recalculateVariantOffsets() {
    let variants = Array.from(this.variantOffsets.entries()).filter(([v]) => v.startsWith("[")).sort(([a], [z]) => fastCompare(a, z));
    let newOffsets = variants.map(([, offset]) => offset).sort((a, z) => bigSign(a - z));
    let mapping = variants.map(([, oldOffset], i) => [oldOffset, newOffsets[i]]);
    return mapping.filter(([a, z]) => a !== z);
  }
  remapArbitraryVariantOffsets(list2) {
    let mapping = this.recalculateVariantOffsets();
    if (mapping.length === 0) {
      return list2;
    }
    return list2.map((item) => {
      let [offset, rule] = item;
      offset = {
        ...offset,
        variants: remapBitfield(offset.variants, mapping)
      };
      return [offset, rule];
    });
  }
  sort(list2) {
    list2 = this.remapArbitraryVariantOffsets(list2);
    return list2.sort(([a], [b]) => bigSign(this.compare(a, b)));
  }
};
function max(nums) {
  let max2 = null;
  for (const num of nums) {
    max2 = max2 ?? num;
    max2 = max2 > num ? max2 : num;
  }
  return max2;
}
function fastCompare(a, b) {
  let aLen = a.length;
  let bLen = b.length;
  let minLen = aLen < bLen ? aLen : bLen;
  for (let i = 0; i < minLen; i++) {
    let cmp = a.charCodeAt(i) - b.charCodeAt(i);
    if (cmp !== 0)
      return cmp;
  }
  return aLen - bLen;
}

// node_modules/tailwindcss/src/lib/setupContextUtils.js
var INTERNAL_FEATURES = Symbol();
var VARIANT_TYPES = {
  AddVariant: Symbol.for("ADD_VARIANT"),
  MatchVariant: Symbol.for("MATCH_VARIANT")
};
var VARIANT_INFO = {
  Base: 1 << 0,
  Dynamic: 1 << 1
};
function prefix(context, selector) {
  let prefix3 = context.tailwindConfig.prefix;
  return typeof prefix3 === "function" ? prefix3(selector) : prefix3 + selector;
}
function normalizeOptionTypes({ type = "any", ...options }) {
  let types2 = [].concat(type);
  return {
    ...options,
    types: types2.map((type2) => {
      if (Array.isArray(type2)) {
        return { type: type2[0], ...type2[1] };
      }
      return { type: type2, preferOnConflict: false };
    })
  };
}
function parseVariantFormatString(input) {
  let parts = [];
  let current = "";
  let depth = 0;
  for (let idx = 0; idx < input.length; idx++) {
    let char = input[idx];
    if (char === "\\") {
      current += "\\" + input[++idx];
    } else if (char === "{") {
      ++depth;
      parts.push(current.trim());
      current = "";
    } else if (char === "}") {
      if (--depth < 0) {
        throw new Error(`Your { and } are unbalanced.`);
      }
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.length > 0) {
    parts.push(current.trim());
  }
  parts = parts.filter((part) => part !== "");
  return parts;
}
function insertInto(list2, value2, { before = [] } = {}) {
  before = [].concat(before);
  if (before.length <= 0) {
    list2.push(value2);
    return;
  }
  let idx = list2.length - 1;
  for (let other of before) {
    let iidx = list2.indexOf(other);
    if (iidx === -1)
      continue;
    idx = Math.min(idx, iidx);
  }
  list2.splice(idx, 0, value2);
}
function parseStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseStyles([styles]);
  }
  return styles.flatMap((style) => {
    let isNode = !Array.isArray(style) && !isPlainObject(style);
    return isNode ? style : parseObjectStyles(style);
  });
}
function getClasses(selector, mutate) {
  let parser5 = selectorParser2((selectors) => {
    let allClasses = [];
    if (mutate) {
      mutate(selectors);
    }
    selectors.walkClasses((classNode) => {
      allClasses.push(classNode.value);
    });
    return allClasses;
  });
  return parser5.transformSync(selector);
}
function ignoreNot(selectors) {
  selectors.walkPseudos((pseudo) => {
    if (pseudo.value === ":not") {
      pseudo.remove();
    }
  });
}
function extractCandidates(node, state = { containsNonOnDemandable: false }, depth = 0) {
  let classes = [];
  let selectors = [];
  if (node.type === "rule") {
    selectors.push(...node.selectors);
  } else if (node.type === "atrule") {
    node.walkRules((rule) => selectors.push(...rule.selectors));
  }
  for (let selector of selectors) {
    let classCandidates = getClasses(selector, ignoreNot);
    if (classCandidates.length === 0) {
      state.containsNonOnDemandable = true;
    }
    for (let classCandidate of classCandidates) {
      classes.push(classCandidate);
    }
  }
  if (depth === 0) {
    return [state.containsNonOnDemandable || classes.length === 0, classes];
  }
  return classes;
}
function withIdentifiers(styles) {
  return parseStyles(styles).flatMap((node) => {
    let nodeMap = /* @__PURE__ */ new Map();
    let [containsNonOnDemandableSelectors, candidates] = extractCandidates(node);
    if (containsNonOnDemandableSelectors) {
      candidates.unshift(NOT_ON_DEMAND);
    }
    return candidates.map((c) => {
      if (!nodeMap.has(node)) {
        nodeMap.set(node, node);
      }
      return [c, nodeMap.get(node)];
    });
  });
}
function isValidVariantFormatString(format) {
  return format.startsWith("@") || format.includes("&");
}
function parseVariant(variant) {
  variant = variant.replace(/\n+/g, "").replace(/\s{1,}/g, " ").trim();
  let fns = parseVariantFormatString(variant).map((str) => {
    if (!str.startsWith("@")) {
      return ({ format }) => format(str);
    }
    let [, name, params] = /@(\S*)( .+|[({].*)?/g.exec(str);
    return ({ wrap }) => wrap(postcss4.atRule({ name, params: params?.trim() ?? "" }));
  }).reverse();
  return (api) => {
    for (let fn of fns) {
      fn(api);
    }
  };
}
function buildPluginApi(tailwindConfig, context, { variantList, variantMap, offsets, classList }) {
  function getConfigValue(path, defaultValue) {
    return path ? dlv(tailwindConfig, path, defaultValue) : tailwindConfig;
  }
  function applyConfiguredPrefix(selector) {
    return prefixSelector_default(tailwindConfig.prefix, selector);
  }
  function prefixIdentifier(identifier, options) {
    if (identifier === NOT_ON_DEMAND) {
      return NOT_ON_DEMAND;
    }
    if (!options.respectPrefix) {
      return identifier;
    }
    return context.tailwindConfig.prefix + identifier;
  }
  function resolveThemeValue(path, defaultValue, opts = {}) {
    let parts = toPath(path);
    let value2 = getConfigValue(["theme", ...parts], defaultValue);
    return transformThemeValue(parts[0])(value2, opts);
  }
  let variantIdentifier = 0;
  let api = {
    postcss: postcss4,
    prefix: applyConfiguredPrefix,
    e: escapeClassName,
    config: getConfigValue,
    theme: resolveThemeValue,
    corePlugins: (path) => {
      if (Array.isArray(tailwindConfig.corePlugins)) {
        return tailwindConfig.corePlugins.includes(path);
      }
      return getConfigValue(["corePlugins", path], true);
    },
    variants: () => {
      return [];
    },
    addBase(base) {
      for (let [identifier, rule] of withIdentifiers(base)) {
        let prefixedIdentifier = prefixIdentifier(identifier, {});
        let offset = offsets.create("base");
        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, []);
        }
        context.candidateRuleMap.get(prefixedIdentifier).push([{ sort: offset, layer: "base" }, rule]);
      }
    },
    addDefaults(group, declarations) {
      const groups = {
        [`@defaults ${group}`]: declarations
      };
      for (let [identifier, rule] of withIdentifiers(groups)) {
        let prefixedIdentifier = prefixIdentifier(identifier, {});
        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, []);
        }
        context.candidateRuleMap.get(prefixedIdentifier).push([{ sort: offsets.create("defaults"), layer: "defaults" }, rule]);
      }
    },
    addComponents(components, options) {
      let defaultOptions = {
        preserveSource: false,
        respectPrefix: true,
        respectImportant: false
      };
      options = Object.assign({}, defaultOptions, Array.isArray(options) ? {} : options);
      for (let [identifier, rule] of withIdentifiers(components)) {
        let prefixedIdentifier = prefixIdentifier(identifier, options);
        classList.add(prefixedIdentifier);
        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, []);
        }
        context.candidateRuleMap.get(prefixedIdentifier).push([{ sort: offsets.create("components"), layer: "components", options }, rule]);
      }
    },
    addUtilities(utilities, options) {
      let defaultOptions = {
        preserveSource: false,
        respectPrefix: true,
        respectImportant: true
      };
      options = Object.assign({}, defaultOptions, Array.isArray(options) ? {} : options);
      for (let [identifier, rule] of withIdentifiers(utilities)) {
        let prefixedIdentifier = prefixIdentifier(identifier, options);
        classList.add(prefixedIdentifier);
        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, []);
        }
        context.candidateRuleMap.get(prefixedIdentifier).push([{ sort: offsets.create("utilities"), layer: "utilities", options }, rule]);
      }
    },
    matchUtilities: function(utilities, options) {
      let defaultOptions = {
        respectPrefix: true,
        respectImportant: true,
        modifiers: false
      };
      options = normalizeOptionTypes({ ...defaultOptions, ...options });
      let offset = offsets.create("utilities");
      for (let identifier in utilities) {
        let wrapped = function(modifier, { isOnlyPlugin }) {
          let [value2, coercedType, utilityModifier] = coerceValue(
            options.types,
            modifier,
            options,
            tailwindConfig
          );
          if (value2 === void 0) {
            return [];
          }
          if (!options.types.some(({ type }) => type === coercedType)) {
            if (isOnlyPlugin) {
              log_default.warn([
                `Unnecessary typehint \`${coercedType}\` in \`${identifier}-${modifier}\`.`,
                `You can safely update it to \`${identifier}-${modifier.replace(
                  coercedType + ":",
                  ""
                )}\`.`
              ]);
            } else {
              return [];
            }
          }
          if (!isSyntacticallyValidPropertyValue(value2)) {
            return [];
          }
          let extras = {
            get modifier() {
              if (!options.modifiers) {
                log_default.warn(`modifier-used-without-options-for-${identifier}`, [
                  "Your plugin must set `modifiers: true` in its options to support modifiers."
                ]);
              }
              return utilityModifier;
            }
          };
          let modifiersEnabled = flagEnabled(tailwindConfig, "generalizedModifiers");
          let ruleSets = [].concat(modifiersEnabled ? rule(value2, extras) : rule(value2)).filter(Boolean).map((declaration) => ({
            [nameClass(identifier, modifier)]: declaration
          }));
          return ruleSets;
        };
        let prefixedIdentifier = prefixIdentifier(identifier, options);
        let rule = utilities[identifier];
        classList.add([prefixedIdentifier, options]);
        let withOffsets = [{ sort: offset, layer: "utilities", options }, wrapped];
        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, []);
        }
        context.candidateRuleMap.get(prefixedIdentifier).push(withOffsets);
      }
    },
    matchComponents: function(components, options) {
      let defaultOptions = {
        respectPrefix: true,
        respectImportant: false,
        modifiers: false
      };
      options = normalizeOptionTypes({ ...defaultOptions, ...options });
      let offset = offsets.create("components");
      for (let identifier in components) {
        let wrapped = function(modifier, { isOnlyPlugin }) {
          let [value2, coercedType, utilityModifier] = coerceValue(
            options.types,
            modifier,
            options,
            tailwindConfig
          );
          if (value2 === void 0) {
            return [];
          }
          if (!options.types.some(({ type }) => type === coercedType)) {
            if (isOnlyPlugin) {
              log_default.warn([
                `Unnecessary typehint \`${coercedType}\` in \`${identifier}-${modifier}\`.`,
                `You can safely update it to \`${identifier}-${modifier.replace(
                  coercedType + ":",
                  ""
                )}\`.`
              ]);
            } else {
              return [];
            }
          }
          if (!isSyntacticallyValidPropertyValue(value2)) {
            return [];
          }
          let extras = {
            get modifier() {
              if (!options.modifiers) {
                log_default.warn(`modifier-used-without-options-for-${identifier}`, [
                  "Your plugin must set `modifiers: true` in its options to support modifiers."
                ]);
              }
              return utilityModifier;
            }
          };
          let modifiersEnabled = flagEnabled(tailwindConfig, "generalizedModifiers");
          let ruleSets = [].concat(modifiersEnabled ? rule(value2, extras) : rule(value2)).filter(Boolean).map((declaration) => ({
            [nameClass(identifier, modifier)]: declaration
          }));
          return ruleSets;
        };
        let prefixedIdentifier = prefixIdentifier(identifier, options);
        let rule = components[identifier];
        classList.add([prefixedIdentifier, options]);
        let withOffsets = [{ sort: offset, layer: "components", options }, wrapped];
        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, []);
        }
        context.candidateRuleMap.get(prefixedIdentifier).push(withOffsets);
      }
    },
    addVariant(variantName, variantFunctions, options = {}) {
      variantFunctions = [].concat(variantFunctions).map((variantFunction) => {
        if (typeof variantFunction !== "string") {
          return (api2 = {}) => {
            let { args, modifySelectors, container, separator, wrap, format } = api2;
            let result = variantFunction(
              Object.assign(
                { modifySelectors, container, separator },
                options.type === VARIANT_TYPES.MatchVariant && { args, wrap, format }
              )
            );
            if (typeof result === "string" && !isValidVariantFormatString(result)) {
              throw new Error(
                `Your custom variant \`${variantName}\` has an invalid format string. Make sure it's an at-rule or contains a \`&\` placeholder.`
              );
            }
            if (Array.isArray(result)) {
              return result.filter((variant) => typeof variant === "string").map((variant) => parseVariant(variant));
            }
            return result && typeof result === "string" && parseVariant(result)(api2);
          };
        }
        if (!isValidVariantFormatString(variantFunction)) {
          throw new Error(
            `Your custom variant \`${variantName}\` has an invalid format string. Make sure it's an at-rule or contains a \`&\` placeholder.`
          );
        }
        return parseVariant(variantFunction);
      });
      insertInto(variantList, variantName, options);
      variantMap.set(variantName, variantFunctions);
      context.variantOptions.set(variantName, options);
    },
    matchVariant(variant, variantFn, options) {
      let id = options?.id ?? ++variantIdentifier;
      let isSpecial = variant === "@";
      let modifiersEnabled = flagEnabled(tailwindConfig, "generalizedModifiers");
      for (let [key, value2] of Object.entries(options?.values ?? {})) {
        if (key === "DEFAULT")
          continue;
        api.addVariant(
          isSpecial ? `${variant}${key}` : `${variant}-${key}`,
          ({ args, container }) => {
            return variantFn(
              value2,
              modifiersEnabled ? { modifier: args?.modifier, container } : { container }
            );
          },
          {
            ...options,
            value: value2,
            id,
            type: VARIANT_TYPES.MatchVariant,
            variantInfo: VARIANT_INFO.Base
          }
        );
      }
      let hasDefault = "DEFAULT" in (options?.values ?? {});
      api.addVariant(
        variant,
        ({ args, container }) => {
          if (args?.value === NONE && !hasDefault) {
            return null;
          }
          return variantFn(
            args?.value === NONE ? options.values.DEFAULT : args?.value ?? (typeof args === "string" ? args : ""),
            modifiersEnabled ? { modifier: args?.modifier, container } : { container }
          );
        },
        {
          ...options,
          id,
          type: VARIANT_TYPES.MatchVariant,
          variantInfo: VARIANT_INFO.Dynamic
        }
      );
    }
  };
  return api;
}
function extractVariantAtRules(node) {
  node.walkAtRules((atRule) => {
    if (["responsive", "variants"].includes(atRule.name)) {
      extractVariantAtRules(atRule);
      atRule.before(atRule.nodes);
      atRule.remove();
    }
  });
}
function collectLayerPlugins(root) {
  let layerPlugins = [];
  root.each((node) => {
    if (node.type === "atrule" && ["responsive", "variants"].includes(node.name)) {
      node.name = "layer";
      node.params = "utilities";
    }
  });
  root.walkAtRules("layer", (layerRule) => {
    extractVariantAtRules(layerRule);
    if (layerRule.params === "base") {
      for (let node of layerRule.nodes) {
        layerPlugins.push(function({ addBase }) {
          addBase(node, { respectPrefix: false });
        });
      }
      layerRule.remove();
    } else if (layerRule.params === "components") {
      for (let node of layerRule.nodes) {
        layerPlugins.push(function({ addComponents }) {
          addComponents(node, { respectPrefix: false, preserveSource: true });
        });
      }
      layerRule.remove();
    } else if (layerRule.params === "utilities") {
      for (let node of layerRule.nodes) {
        layerPlugins.push(function({ addUtilities }) {
          addUtilities(node, { respectPrefix: false, preserveSource: true });
        });
      }
      layerRule.remove();
    }
  });
  return layerPlugins;
}
function resolvePlugins(context, root) {
  let corePluginList = Object.entries({ ...variantPlugins, ...corePlugins }).map(([name, plugin]) => {
    if (!context.tailwindConfig.corePlugins.includes(name)) {
      return null;
    }
    return plugin;
  }).filter(Boolean);
  let userPlugins = context.tailwindConfig.plugins.map((plugin) => {
    if (plugin.__isOptionsFunction) {
      plugin = plugin();
    }
    return typeof plugin === "function" ? plugin : plugin.handler;
  });
  let layerPlugins = collectLayerPlugins(root);
  let beforeVariants = [
    variantPlugins["childVariant"],
    variantPlugins["pseudoElementVariants"],
    variantPlugins["pseudoClassVariants"],
    variantPlugins["hasVariants"],
    variantPlugins["ariaVariants"],
    variantPlugins["dataVariants"]
  ];
  let afterVariants = [
    variantPlugins["supportsVariants"],
    variantPlugins["reducedMotionVariants"],
    variantPlugins["prefersContrastVariants"],
    variantPlugins["screenVariants"],
    variantPlugins["orientationVariants"],
    variantPlugins["directionVariants"],
    variantPlugins["darkVariants"],
    variantPlugins["forcedColorsVariants"],
    variantPlugins["printVariant"]
  ];
  let isLegacyDarkMode = context.tailwindConfig.darkMode === "class" || Array.isArray(context.tailwindConfig.darkMode) && context.tailwindConfig.darkMode[0] === "class";
  if (isLegacyDarkMode) {
    afterVariants = [
      variantPlugins["supportsVariants"],
      variantPlugins["reducedMotionVariants"],
      variantPlugins["prefersContrastVariants"],
      variantPlugins["darkVariants"],
      variantPlugins["screenVariants"],
      variantPlugins["orientationVariants"],
      variantPlugins["directionVariants"],
      variantPlugins["forcedColorsVariants"],
      variantPlugins["printVariant"]
    ];
  }
  return [...corePluginList, ...beforeVariants, ...userPlugins, ...afterVariants, ...layerPlugins];
}
function registerPlugins(plugins, context) {
  let variantList = [];
  let variantMap = /* @__PURE__ */ new Map();
  context.variantMap = variantMap;
  let offsets = new Offsets();
  context.offsets = offsets;
  let classList = /* @__PURE__ */ new Set();
  let pluginApi = buildPluginApi(context.tailwindConfig, context, {
    variantList,
    variantMap,
    offsets,
    classList
  });
  for (let plugin of plugins) {
    if (Array.isArray(plugin)) {
      for (let pluginItem of plugin) {
        pluginItem(pluginApi);
      }
    } else {
      plugin?.(pluginApi);
    }
  }
  offsets.recordVariants(variantList, (variant) => variantMap.get(variant).length);
  for (let [variantName, variantFunctions] of variantMap.entries()) {
    context.variantMap.set(
      variantName,
      variantFunctions.map((variantFunction, idx) => [
        offsets.forVariant(variantName, idx),
        variantFunction
      ])
    );
  }
  let safelist = (context.tailwindConfig.safelist ?? []).filter(Boolean);
  if (safelist.length > 0) {
    let checks = [];
    for (let value2 of safelist) {
      if (typeof value2 === "string") {
        context.changedContent.push({ content: value2, extension: "html" });
        continue;
      }
      if (value2 instanceof RegExp) {
        log_default.warn("root-regex", [
          "Regular expressions in `safelist` work differently in Tailwind CSS v3.0.",
          "Update your `safelist` configuration to eliminate this warning.",
          "https://tailwindcss.com/docs/content-configuration#safelisting-classes"
        ]);
        continue;
      }
      checks.push(value2);
    }
    if (checks.length > 0) {
      let patternMatchingCount = /* @__PURE__ */ new Map();
      let prefixLength = context.tailwindConfig.prefix.length;
      let checkImportantUtils = checks.some((check) => check.pattern.source.includes("!"));
      for (let util of classList) {
        let utils = Array.isArray(util) ? (() => {
          let [utilName, options] = util;
          let values = Object.keys(options?.values ?? {});
          let classes = values.map((value2) => formatClass(utilName, value2));
          if (options?.supportsNegativeValues) {
            classes = [...classes, ...classes.map((cls) => "-" + cls)];
            classes = [
              ...classes,
              ...classes.map(
                (cls) => cls.slice(0, prefixLength) + "-" + cls.slice(prefixLength)
              )
            ];
          }
          if (options.types.some(({ type }) => type === "color")) {
            classes = [
              ...classes,
              ...classes.flatMap(
                (cls) => Object.keys(context.tailwindConfig.theme.opacity).map(
                  (opacity) => `${cls}/${opacity}`
                )
              )
            ];
          }
          if (checkImportantUtils && options?.respectImportant) {
            classes = [...classes, ...classes.map((cls) => "!" + cls)];
          }
          return classes;
        })() : [util];
        for (let util2 of utils) {
          for (let { pattern: pattern2, variants = [] } of checks) {
            pattern2.lastIndex = 0;
            if (!patternMatchingCount.has(pattern2)) {
              patternMatchingCount.set(pattern2, 0);
            }
            if (!pattern2.test(util2))
              continue;
            patternMatchingCount.set(pattern2, patternMatchingCount.get(pattern2) + 1);
            context.changedContent.push({ content: util2, extension: "html" });
            for (let variant of variants) {
              context.changedContent.push({
                content: variant + context.tailwindConfig.separator + util2,
                extension: "html"
              });
            }
          }
        }
      }
      for (let [regex, count] of patternMatchingCount.entries()) {
        if (count !== 0)
          continue;
        log_default.warn([
          `The safelist pattern \`${regex}\` doesn't match any Tailwind CSS classes.`,
          "Fix this pattern or remove it from your `safelist` configuration.",
          "https://tailwindcss.com/docs/content-configuration#safelisting-classes"
        ]);
      }
    }
  }
  let darkClassName = [].concat(context.tailwindConfig.darkMode ?? "media")[1] ?? "dark";
  let parasiteUtilities = [
    prefix(context, darkClassName),
    prefix(context, "group"),
    prefix(context, "peer")
  ];
  context.getClassOrder = function getClassOrder(classes) {
    let sorted = [...classes].sort((a, z) => {
      if (a === z)
        return 0;
      if (a < z)
        return -1;
      return 1;
    });
    let sortedClassNames = new Map(sorted.map((className) => [className, null]));
    let rules = generateRules(new Set(sorted), context, true);
    rules = context.offsets.sort(rules);
    let idx = BigInt(parasiteUtilities.length);
    for (const [, rule] of rules) {
      let candidate = rule.raws.tailwind.candidate;
      sortedClassNames.set(candidate, sortedClassNames.get(candidate) ?? idx++);
    }
    return classes.map((className) => {
      let order = sortedClassNames.get(className) ?? null;
      let parasiteIndex = parasiteUtilities.indexOf(className);
      if (order === null && parasiteIndex !== -1) {
        order = BigInt(parasiteIndex);
      }
      return [className, order];
    });
  };
  context.getClassList = function getClassList(options = {}) {
    let output = [];
    for (let util of classList) {
      if (Array.isArray(util)) {
        let [utilName, utilOptions] = util;
        let negativeClasses = [];
        let modifiers = Object.keys(utilOptions?.modifiers ?? {});
        if (utilOptions?.types?.some(({ type }) => type === "color")) {
          modifiers.push(...Object.keys(context.tailwindConfig.theme.opacity ?? {}));
        }
        let metadata = { modifiers };
        let includeMetadata = options.includeMetadata && modifiers.length > 0;
        for (let [key, value2] of Object.entries(utilOptions?.values ?? {})) {
          if (value2 == null) {
            continue;
          }
          let cls = formatClass(utilName, key);
          output.push(includeMetadata ? [cls, metadata] : cls);
          if (utilOptions?.supportsNegativeValues && negateValue(value2)) {
            let cls2 = formatClass(utilName, `-${key}`);
            negativeClasses.push(includeMetadata ? [cls2, metadata] : cls2);
          }
        }
        output.push(...negativeClasses);
      } else {
        output.push(util);
      }
    }
    return output;
  };
  context.getVariants = function getVariants() {
    let result = [];
    for (let [name, options] of context.variantOptions.entries()) {
      if (options.variantInfo === VARIANT_INFO.Base)
        continue;
      result.push({
        name,
        isArbitrary: options.type === Symbol.for("MATCH_VARIANT"),
        values: Object.keys(options.values ?? {}),
        hasDash: name !== "@",
        selectors({ modifier, value: value2 } = {}) {
          let candidate = "__TAILWIND_PLACEHOLDER__";
          let rule = postcss4.rule({ selector: `.${candidate}` });
          let container = postcss4.root({ nodes: [rule.clone()] });
          let before = container.toString();
          let fns = (context.variantMap.get(name) ?? []).flatMap(([_, fn]) => fn);
          let formatStrings = [];
          for (let fn of fns) {
            let localFormatStrings = [];
            let api = {
              args: { modifier, value: options.values?.[value2] ?? value2 },
              separator: context.tailwindConfig.separator,
              modifySelectors(modifierFunction) {
                container.each((rule2) => {
                  if (rule2.type !== "rule") {
                    return;
                  }
                  rule2.selectors = rule2.selectors.map((selector) => {
                    return modifierFunction({
                      get className() {
                        return getClassNameFromSelector(selector);
                      },
                      selector
                    });
                  });
                });
                return container;
              },
              format(str) {
                localFormatStrings.push(str);
              },
              wrap(wrapper) {
                localFormatStrings.push(`@${wrapper.name} ${wrapper.params} { & }`);
              },
              container
            };
            let ruleWithVariant = fn(api);
            if (localFormatStrings.length > 0) {
              formatStrings.push(localFormatStrings);
            }
            if (Array.isArray(ruleWithVariant)) {
              for (let variantFunction of ruleWithVariant) {
                localFormatStrings = [];
                variantFunction(api);
                formatStrings.push(localFormatStrings);
              }
            }
          }
          let manualFormatStrings = [];
          let after = container.toString();
          if (before !== after) {
            container.walkRules((rule2) => {
              let modified = rule2.selector;
              let rebuiltBase = selectorParser2((selectors) => {
                selectors.walkClasses((classNode) => {
                  classNode.value = `${name}${context.tailwindConfig.separator}${classNode.value}`;
                });
              }).processSync(modified);
              manualFormatStrings.push(modified.replace(rebuiltBase, "&").replace(candidate, "&"));
            });
            container.walkAtRules((atrule) => {
              manualFormatStrings.push(`@${atrule.name} (${atrule.params}) { & }`);
            });
          }
          let isArbitraryVariant = !(value2 in (options.values ?? {}));
          let internalFeatures = options[INTERNAL_FEATURES] ?? {};
          let respectPrefix = (() => {
            if (isArbitraryVariant)
              return false;
            if (internalFeatures.respectPrefix === false)
              return false;
            return true;
          })();
          formatStrings = formatStrings.map(
            (format) => format.map((str) => ({
              format: str,
              respectPrefix
            }))
          );
          manualFormatStrings = manualFormatStrings.map((format) => ({
            format,
            respectPrefix
          }));
          let opts = {
            candidate,
            context
          };
          let result2 = formatStrings.map(
            (formats) => finalizeSelector(`.${candidate}`, formatVariantSelector(formats, opts), opts).replace(`.${candidate}`, "&").replace("{ & }", "").trim()
          );
          if (manualFormatStrings.length > 0) {
            result2.push(
              formatVariantSelector(manualFormatStrings, opts).toString().replace(`.${candidate}`, "&")
            );
          }
          return result2;
        }
      });
    }
    return result;
  };
}
function markInvalidUtilityCandidate(context, candidate) {
  if (!context.classCache.has(candidate)) {
    return;
  }
  context.notClassCache.add(candidate);
  context.classCache.delete(candidate);
  context.applyClassCache.delete(candidate);
  context.candidateRuleMap.delete(candidate);
  context.candidateRuleCache.delete(candidate);
  context.stylesheetCache = null;
}
function markInvalidUtilityNode(context, node) {
  let candidate = node.raws.tailwind.candidate;
  if (!candidate) {
    return;
  }
  for (const entry of context.ruleCache) {
    if (entry[1].raws.tailwind.candidate === candidate) {
      context.ruleCache.delete(entry);
    }
  }
  markInvalidUtilityCandidate(context, candidate);
}
function createContext(tailwindConfig, changedContent = [], root = postcss4.root()) {
  let context = {
    disposables: [],
    ruleCache: /* @__PURE__ */ new Set(),
    candidateRuleCache: /* @__PURE__ */ new Map(),
    classCache: /* @__PURE__ */ new Map(),
    applyClassCache: /* @__PURE__ */ new Map(),
    notClassCache: new Set(tailwindConfig.blocklist ?? []),
    postCssNodeCache: /* @__PURE__ */ new Map(),
    candidateRuleMap: /* @__PURE__ */ new Map(),
    tailwindConfig,
    changedContent,
    variantMap: /* @__PURE__ */ new Map(),
    stylesheetCache: null,
    variantOptions: /* @__PURE__ */ new Map(),
    markInvalidUtilityCandidate: (candidate) => markInvalidUtilityCandidate(context, candidate),
    markInvalidUtilityNode: (node) => markInvalidUtilityNode(context, node)
  };
  let resolvedPlugins = resolvePlugins(context, root);
  registerPlugins(resolvedPlugins, context);
  return context;
}

// node_modules/tailwindcss/src/util/applyImportantSelector.js
import parser3 from "postcss-selector-parser";
function applyImportantSelector(selector, important) {
  let sel = parser3().astSync(selector);
  sel.each((sel2) => {
    let isWrapped = sel2.nodes[0].type === "pseudo" && sel2.nodes[0].value === ":is" && sel2.nodes.every((node) => node.type !== "combinator");
    if (!isWrapped) {
      sel2.nodes = [
        parser3.pseudo({
          value: ":is",
          nodes: [sel2.clone()]
        })
      ];
    }
    movePseudos(sel2);
  });
  return `${important} ${sel.toString()}`;
}

// node_modules/tailwindcss/src/lib/generateRules.js
var classNameParser = selectorParser3((selectors) => {
  return selectors.first.filter(({ type }) => type === "class").pop().value;
});
function getClassNameFromSelector(selector) {
  return classNameParser.transformSync(selector);
}
function* candidatePermutations(candidate) {
  let lastIndex = Infinity;
  while (lastIndex >= 0) {
    let dashIdx;
    let wasSlash = false;
    if (lastIndex === Infinity && candidate.endsWith("]")) {
      let bracketIdx = candidate.indexOf("[");
      if (candidate[bracketIdx - 1] === "-") {
        dashIdx = bracketIdx - 1;
      } else if (candidate[bracketIdx - 1] === "/") {
        dashIdx = bracketIdx - 1;
        wasSlash = true;
      } else {
        dashIdx = -1;
      }
    } else if (lastIndex === Infinity && candidate.includes("/")) {
      dashIdx = candidate.lastIndexOf("/");
      wasSlash = true;
    } else {
      dashIdx = candidate.lastIndexOf("-", lastIndex);
    }
    if (dashIdx < 0) {
      break;
    }
    let prefix3 = candidate.slice(0, dashIdx);
    let modifier = candidate.slice(wasSlash ? dashIdx : dashIdx + 1);
    lastIndex = dashIdx - 1;
    if (prefix3 === "" || modifier === "/") {
      continue;
    }
    yield [prefix3, modifier];
  }
}
function applyPrefix(matches, context) {
  if (matches.length === 0 || context.tailwindConfig.prefix === "") {
    return matches;
  }
  for (let match of matches) {
    let [meta] = match;
    if (meta.options.respectPrefix) {
      let container = postcss5.root({ nodes: [match[1].clone()] });
      let classCandidate = match[1].raws.tailwind.classCandidate;
      container.walkRules((r) => {
        let shouldPrependNegative = classCandidate.startsWith("-");
        r.selector = prefixSelector_default(
          context.tailwindConfig.prefix,
          r.selector,
          shouldPrependNegative
        );
      });
      match[1] = container.nodes[0];
    }
  }
  return matches;
}
function applyImportant(matches, classCandidate) {
  if (matches.length === 0) {
    return matches;
  }
  let result = [];
  function isInKeyframes(rule) {
    return rule.parent && rule.parent.type === "atrule" && rule.parent.name === "keyframes";
  }
  for (let [meta, rule] of matches) {
    let container = postcss5.root({ nodes: [rule.clone()] });
    container.walkRules((r) => {
      if (isInKeyframes(r)) {
        return;
      }
      let ast = selectorParser3().astSync(r.selector);
      ast.each((sel) => eliminateIrrelevantSelectors(sel, classCandidate));
      updateAllClasses(
        ast,
        (className) => className === classCandidate ? `!${className}` : className
      );
      r.selector = ast.toString();
      r.walkDecls((d) => d.important = true);
    });
    result.push([{ ...meta, important: true }, container.nodes[0]]);
  }
  return result;
}
function applyVariant(variant, matches, context) {
  if (matches.length === 0) {
    return matches;
  }
  let args = { modifier: null, value: NONE };
  {
    let [baseVariant, ...modifiers] = splitAtTopLevelOnly(variant, "/");
    if (modifiers.length > 1) {
      baseVariant = baseVariant + "/" + modifiers.slice(0, -1).join("/");
      modifiers = modifiers.slice(-1);
    }
    if (modifiers.length && !context.variantMap.has(variant)) {
      variant = baseVariant;
      args.modifier = modifiers[0];
      if (!flagEnabled(context.tailwindConfig, "generalizedModifiers")) {
        return [];
      }
    }
  }
  if (variant.endsWith("]") && !variant.startsWith("[")) {
    let match = /(.)(-?)\[(.*)\]/g.exec(variant);
    if (match) {
      let [, char, separator, value2] = match;
      if (char === "@" && separator === "-")
        return [];
      if (char !== "@" && separator === "")
        return [];
      variant = variant.replace(`${separator}[${value2}]`, "");
      args.value = value2;
    }
  }
  if (isArbitraryValue2(variant) && !context.variantMap.has(variant)) {
    let sort = context.offsets.recordVariant(variant);
    let selector = normalize(variant.slice(1, -1));
    let selectors = splitAtTopLevelOnly(selector, ",");
    if (selectors.length > 1) {
      return [];
    }
    if (!selectors.every(isValidVariantFormatString)) {
      return [];
    }
    let records = selectors.map((sel, idx) => [
      context.offsets.applyParallelOffset(sort, idx),
      parseVariant(sel.trim())
    ]);
    context.variantMap.set(variant, records);
  }
  if (context.variantMap.has(variant)) {
    let isArbitraryVariant = isArbitraryValue2(variant);
    let internalFeatures = context.variantOptions.get(variant)?.[INTERNAL_FEATURES] ?? {};
    let variantFunctionTuples = context.variantMap.get(variant).slice();
    let result = [];
    let respectPrefix = (() => {
      if (isArbitraryVariant)
        return false;
      if (internalFeatures.respectPrefix === false)
        return false;
      return true;
    })();
    for (let [meta, rule] of matches) {
      if (meta.layer === "user") {
        continue;
      }
      let container = postcss5.root({ nodes: [rule.clone()] });
      for (let [variantSort, variantFunction, containerFromArray] of variantFunctionTuples) {
        let prepareBackup = function() {
          if (clone.raws.neededBackup) {
            return;
          }
          clone.raws.neededBackup = true;
          clone.walkRules((rule2) => rule2.raws.originalSelector = rule2.selector);
        }, modifySelectors = function(modifierFunction) {
          prepareBackup();
          clone.each((rule2) => {
            if (rule2.type !== "rule") {
              return;
            }
            rule2.selectors = rule2.selectors.map((selector) => {
              return modifierFunction({
                get className() {
                  return getClassNameFromSelector(selector);
                },
                selector
              });
            });
          });
          return clone;
        };
        let clone = (containerFromArray ?? container).clone();
        let collectedFormats = [];
        let ruleWithVariant = variantFunction({
          get container() {
            prepareBackup();
            return clone;
          },
          separator: context.tailwindConfig.separator,
          modifySelectors,
          wrap(wrapper) {
            let nodes = clone.nodes;
            clone.removeAll();
            wrapper.append(nodes);
            clone.append(wrapper);
          },
          format(selectorFormat) {
            collectedFormats.push({
              format: selectorFormat,
              respectPrefix
            });
          },
          args
        });
        if (Array.isArray(ruleWithVariant)) {
          for (let [idx, variantFunction2] of ruleWithVariant.entries()) {
            variantFunctionTuples.push([
              context.offsets.applyParallelOffset(variantSort, idx),
              variantFunction2,
              clone.clone()
            ]);
          }
          continue;
        }
        if (typeof ruleWithVariant === "string") {
          collectedFormats.push({
            format: ruleWithVariant,
            respectPrefix
          });
        }
        if (ruleWithVariant === null) {
          continue;
        }
        if (clone.raws.neededBackup) {
          delete clone.raws.neededBackup;
          clone.walkRules((rule2) => {
            let before = rule2.raws.originalSelector;
            if (!before)
              return;
            delete rule2.raws.originalSelector;
            if (before === rule2.selector)
              return;
            let modified = rule2.selector;
            let rebuiltBase = selectorParser3((selectors) => {
              selectors.walkClasses((classNode) => {
                classNode.value = `${variant}${context.tailwindConfig.separator}${classNode.value}`;
              });
            }).processSync(before);
            collectedFormats.push({
              format: modified.replace(rebuiltBase, "&"),
              respectPrefix
            });
            rule2.selector = before;
          });
        }
        clone.nodes[0].raws.tailwind = { ...clone.nodes[0].raws.tailwind, parentLayer: meta.layer };
        let withOffset = [
          {
            ...meta,
            sort: context.offsets.applyVariantOffset(
              meta.sort,
              variantSort,
              Object.assign(args, context.variantOptions.get(variant))
            ),
            collectedFormats: (meta.collectedFormats ?? []).concat(collectedFormats)
          },
          clone.nodes[0]
        ];
        result.push(withOffset);
      }
    }
    return result;
  }
  return [];
}
function parseRules(rule, cache2, options = {}) {
  if (!isPlainObject(rule) && !Array.isArray(rule)) {
    return [[rule], options];
  }
  if (Array.isArray(rule)) {
    return parseRules(rule[0], cache2, rule[1]);
  }
  if (!cache2.has(rule)) {
    cache2.set(rule, parseObjectStyles(rule));
  }
  return [cache2.get(rule), options];
}
var IS_VALID_PROPERTY_NAME = /^[a-z_-]/;
function isValidPropName(name) {
  return IS_VALID_PROPERTY_NAME.test(name);
}
function looksLikeUri(declaration) {
  if (!declaration.includes("://")) {
    return false;
  }
  try {
    const url2 = new URL(declaration);
    return url2.scheme !== "" && url2.host !== "";
  } catch (err) {
    return false;
  }
}
function isParsableNode(node) {
  let isParsable = true;
  node.walkDecls((decl) => {
    if (!isParsableCssValue(decl.prop, decl.value)) {
      isParsable = false;
      return false;
    }
  });
  return isParsable;
}
function isParsableCssValue(property, value2) {
  if (looksLikeUri(`${property}:${value2}`)) {
    return false;
  }
  try {
    postcss5.parse(`a{${property}:${value2}}`).toResult();
    return true;
  } catch (err) {
    return false;
  }
}
function extractArbitraryProperty(classCandidate, context) {
  let [, property, value2] = classCandidate.match(/^\[([a-zA-Z0-9-_]+):(\S+)\]$/) ?? [];
  if (value2 === void 0) {
    return null;
  }
  if (!isValidPropName(property)) {
    return null;
  }
  if (!isSyntacticallyValidPropertyValue(value2)) {
    return null;
  }
  let normalized = normalize(value2, { property });
  if (!isParsableCssValue(property, normalized)) {
    return null;
  }
  let sort = context.offsets.arbitraryProperty();
  return [
    [
      { sort, layer: "utilities" },
      () => ({
        [asClass(classCandidate)]: {
          [property]: normalized
        }
      })
    ]
  ];
}
function* resolveMatchedPlugins(classCandidate, context) {
  if (context.candidateRuleMap.has(classCandidate)) {
    yield [context.candidateRuleMap.get(classCandidate), "DEFAULT"];
  }
  yield* function* (arbitraryPropertyRule) {
    if (arbitraryPropertyRule !== null) {
      yield [arbitraryPropertyRule, "DEFAULT"];
    }
  }(extractArbitraryProperty(classCandidate, context));
  let candidatePrefix = classCandidate;
  let negative = false;
  const twConfigPrefix = context.tailwindConfig.prefix;
  const twConfigPrefixLen = twConfigPrefix.length;
  const hasMatchingPrefix = candidatePrefix.startsWith(twConfigPrefix) || candidatePrefix.startsWith(`-${twConfigPrefix}`);
  if (candidatePrefix[twConfigPrefixLen] === "-" && hasMatchingPrefix) {
    negative = true;
    candidatePrefix = twConfigPrefix + candidatePrefix.slice(twConfigPrefixLen + 1);
  }
  if (negative && context.candidateRuleMap.has(candidatePrefix)) {
    yield [context.candidateRuleMap.get(candidatePrefix), "-DEFAULT"];
  }
  for (let [prefix3, modifier] of candidatePermutations(candidatePrefix)) {
    if (context.candidateRuleMap.has(prefix3)) {
      yield [context.candidateRuleMap.get(prefix3), negative ? `-${modifier}` : modifier];
    }
  }
}
function splitWithSeparator(input, separator) {
  if (input === NOT_ON_DEMAND) {
    return [NOT_ON_DEMAND];
  }
  return splitAtTopLevelOnly(input, separator);
}
function* recordCandidates(matches, classCandidate) {
  for (const match of matches) {
    match[1].raws.tailwind = {
      ...match[1].raws.tailwind,
      classCandidate,
      preserveSource: match[0].options?.preserveSource ?? false
    };
    yield match;
  }
}
function* resolveMatches(candidate, context) {
  let separator = context.tailwindConfig.separator;
  let [classCandidate, ...variants] = splitWithSeparator(candidate, separator).reverse();
  let important = false;
  if (classCandidate.startsWith("!")) {
    important = true;
    classCandidate = classCandidate.slice(1);
  }
  for (let matchedPlugins of resolveMatchedPlugins(classCandidate, context)) {
    let matches = [];
    let typesByMatches = /* @__PURE__ */ new Map();
    let [plugins, modifier] = matchedPlugins;
    let isOnlyPlugin = plugins.length === 1;
    for (let [sort, plugin] of plugins) {
      let matchesPerPlugin = [];
      if (typeof plugin === "function") {
        for (let ruleSet of [].concat(plugin(modifier, { isOnlyPlugin }))) {
          let [rules, options] = parseRules(ruleSet, context.postCssNodeCache);
          for (let rule of rules) {
            matchesPerPlugin.push([{ ...sort, options: { ...sort.options, ...options } }, rule]);
          }
        }
      } else if (modifier === "DEFAULT" || modifier === "-DEFAULT") {
        let ruleSet = plugin;
        let [rules, options] = parseRules(ruleSet, context.postCssNodeCache);
        for (let rule of rules) {
          matchesPerPlugin.push([{ ...sort, options: { ...sort.options, ...options } }, rule]);
        }
      }
      if (matchesPerPlugin.length > 0) {
        let matchingTypes = Array.from(
          getMatchingTypes(
            sort.options?.types ?? [],
            modifier,
            sort.options ?? {},
            context.tailwindConfig
          )
        ).map(([_, type]) => type);
        if (matchingTypes.length > 0) {
          typesByMatches.set(matchesPerPlugin, matchingTypes);
        }
        matches.push(matchesPerPlugin);
      }
    }
    if (isArbitraryValue2(modifier)) {
      if (matches.length > 1) {
        let findFallback = function(matches2) {
          if (matches2.length === 1) {
            return matches2[0];
          }
          return matches2.find((rules) => {
            let matchingTypes = typesByMatches.get(rules);
            return rules.some(([{ options }, rule]) => {
              if (!isParsableNode(rule)) {
                return false;
              }
              return options.types.some(
                ({ type, preferOnConflict }) => matchingTypes.includes(type) && preferOnConflict
              );
            });
          });
        };
        let [withAny, withoutAny] = matches.reduce(
          (group, plugin) => {
            let hasAnyType = plugin.some(
              ([{ options }]) => options.types.some(({ type }) => type === "any")
            );
            if (hasAnyType) {
              group[0].push(plugin);
            } else {
              group[1].push(plugin);
            }
            return group;
          },
          [[], []]
        );
        let fallback = findFallback(withoutAny) ?? findFallback(withAny);
        if (fallback) {
          matches = [fallback];
        } else {
          let typesPerPlugin = matches.map(
            (match) => /* @__PURE__ */ new Set([...typesByMatches.get(match) ?? []])
          );
          for (let pluginTypes of typesPerPlugin) {
            for (let type of pluginTypes) {
              let removeFromOwnGroup = false;
              for (let otherGroup of typesPerPlugin) {
                if (pluginTypes === otherGroup)
                  continue;
                if (otherGroup.has(type)) {
                  otherGroup.delete(type);
                  removeFromOwnGroup = true;
                }
              }
              if (removeFromOwnGroup)
                pluginTypes.delete(type);
            }
          }
          let messages = [];
          for (let [idx, group] of typesPerPlugin.entries()) {
            for (let type of group) {
              let rules = matches[idx].map(([, rule]) => rule).flat().map(
                (rule) => rule.toString().split("\n").slice(1, -1).map((line) => line.trim()).map((x) => `      ${x}`).join("\n")
              ).join("\n\n");
              messages.push(
                `  Use \`${candidate.replace("[", `[${type}:`)}\` for \`${rules.trim()}\``
              );
              break;
            }
          }
          log_default.warn([
            `The class \`${candidate}\` is ambiguous and matches multiple utilities.`,
            ...messages,
            `If this is content and not a class, replace it with \`${candidate.replace("[", "&lsqb;").replace("]", "&rsqb;")}\` to silence this warning.`
          ]);
          continue;
        }
      }
      matches = matches.map((list2) => list2.filter((match) => isParsableNode(match[1])));
    }
    matches = matches.flat();
    matches = Array.from(recordCandidates(matches, classCandidate));
    matches = applyPrefix(matches, context);
    if (important) {
      matches = applyImportant(matches, classCandidate);
    }
    for (let variant of variants) {
      matches = applyVariant(variant, matches, context);
    }
    for (let match of matches) {
      match[1].raws.tailwind = { ...match[1].raws.tailwind, candidate };
      match = applyFinalFormat(match, { context, candidate });
      if (match === null) {
        continue;
      }
      yield match;
    }
  }
}
function applyFinalFormat(match, { context, candidate }) {
  if (!match[0].collectedFormats) {
    return match;
  }
  let isValid = true;
  let finalFormat;
  try {
    finalFormat = formatVariantSelector(match[0].collectedFormats, {
      context,
      candidate
    });
  } catch {
    return null;
  }
  let container = postcss5.root({ nodes: [match[1].clone()] });
  container.walkRules((rule) => {
    if (inKeyframes(rule)) {
      return;
    }
    try {
      let selector = finalizeSelector(rule.selector, finalFormat, {
        candidate,
        context
      });
      if (selector === null) {
        rule.remove();
        return;
      }
      rule.selector = selector;
    } catch {
      isValid = false;
      return false;
    }
  });
  if (!isValid) {
    return null;
  }
  if (container.nodes.length === 0) {
    return null;
  }
  match[1] = container.nodes[0];
  return match;
}
function inKeyframes(rule) {
  return rule.parent && rule.parent.type === "atrule" && rule.parent.name === "keyframes";
}
function getImportantStrategy(important) {
  if (important === true) {
    return (rule) => {
      if (inKeyframes(rule)) {
        return;
      }
      rule.walkDecls((d) => {
        if (d.parent.type === "rule" && !inKeyframes(d.parent)) {
          d.important = true;
        }
      });
    };
  }
  if (typeof important === "string") {
    return (rule) => {
      if (inKeyframes(rule)) {
        return;
      }
      rule.selectors = rule.selectors.map((selector) => {
        return applyImportantSelector(selector, important);
      });
    };
  }
}
function generateRules(candidates, context, isSorting = false) {
  let allRules = [];
  let strategy = getImportantStrategy(context.tailwindConfig.important);
  for (let candidate of candidates) {
    if (context.notClassCache.has(candidate)) {
      continue;
    }
    if (context.candidateRuleCache.has(candidate)) {
      allRules = allRules.concat(Array.from(context.candidateRuleCache.get(candidate)));
      continue;
    }
    let matches = Array.from(resolveMatches(candidate, context));
    if (matches.length === 0) {
      context.notClassCache.add(candidate);
      continue;
    }
    context.classCache.set(candidate, matches);
    let rules = context.candidateRuleCache.get(candidate) ?? /* @__PURE__ */ new Set();
    context.candidateRuleCache.set(candidate, rules);
    for (const match of matches) {
      let [{ sort, options }, rule] = match;
      if (options.respectImportant && strategy) {
        let container = postcss5.root({ nodes: [rule.clone()] });
        container.walkRules(strategy);
        rule = container.nodes[0];
      }
      let newEntry = [sort, isSorting ? rule.clone() : rule];
      rules.add(newEntry);
      context.ruleCache.add(newEntry);
      allRules.push(newEntry);
    }
  }
  return allRules;
}
function isArbitraryValue2(input) {
  return input.startsWith("[") && input.endsWith("]");
}

// node_modules/tailwindcss/src/util/cloneNodes.js
function cloneNodes(nodes, source = void 0, raws = void 0) {
  return nodes.map((node) => {
    let cloned = node.clone();
    if (raws !== void 0) {
      cloned.raws.tailwind = {
        ...cloned.raws.tailwind,
        ...raws
      };
    }
    if (source !== void 0) {
      traverse(cloned, (node2) => {
        let shouldPreserveSource = node2.raws.tailwind?.preserveSource === true && node2.source;
        if (shouldPreserveSource) {
          return false;
        }
        node2.source = source;
      });
    }
    return cloned;
  });
}
function traverse(node, onNode) {
  if (onNode(node) !== false) {
    node.each?.((child) => traverse(child, onNode));
  }
}

// node_modules/tailwindcss/src/lib/regex.js
var REGEX_SPECIAL = /[\\^$.*+?()[\]{}|]/g;
var REGEX_HAS_SPECIAL = RegExp(REGEX_SPECIAL.source);
function toSource(source) {
  source = Array.isArray(source) ? source : [source];
  source = source.map((item) => item instanceof RegExp ? item.source : item);
  return source.join("");
}
function pattern(source) {
  return new RegExp(toSource(source), "g");
}
function any(sources) {
  return `(?:${sources.map(toSource).join("|")})`;
}
function optional(source) {
  return `(?:${toSource(source)})?`;
}
function escape(string) {
  return string && REGEX_HAS_SPECIAL.test(string) ? string.replace(REGEX_SPECIAL, "\\$&") : string || "";
}

// node_modules/tailwindcss/src/lib/defaultExtractor.js
function defaultExtractor(context) {
  let patterns = Array.from(buildRegExps(context));
  return (content) => {
    let results = [];
    for (let pattern2 of patterns) {
      for (let result of content.match(pattern2) ?? []) {
        results.push(clipAtBalancedParens(result));
      }
    }
    return results;
  };
}
function* buildRegExps(context) {
  let separator = context.tailwindConfig.separator;
  let prefix3 = context.tailwindConfig.prefix !== "" ? optional(pattern([/-?/, escape(context.tailwindConfig.prefix)])) : "";
  let utility = any([
    /\[[^\s:'"`]+:[^\s\[\]]+\]/,
    /\[[^\s:'"`\]]+:[^\s]+?\[[^\s]+\][^\s]+?\]/,
    pattern([
      any([
        /-?(?:\w+)/,
        /@(?:\w+)/
      ]),
      optional(
        any([
          pattern([
            any([
              /-(?:\w+-)*\['[^\s]+'\]/,
              /-(?:\w+-)*\["[^\s]+"\]/,
              /-(?:\w+-)*\[`[^\s]+`\]/,
              /-(?:\w+-)*\[(?:[^\s\[\]]+\[[^\s\[\]]+\])*[^\s:\[\]]+\]/
            ]),
            /(?![{([]])/,
            /(?:\/[^\s'"`\\><$]*)?/
          ]),
          pattern([
            any([
              /-(?:\w+-)*\['[^\s]+'\]/,
              /-(?:\w+-)*\["[^\s]+"\]/,
              /-(?:\w+-)*\[`[^\s]+`\]/,
              /-(?:\w+-)*\[(?:[^\s\[\]]+\[[^\s\[\]]+\])*[^\s\[\]]+\]/
            ]),
            /(?![{([]])/,
            /(?:\/[^\s'"`\\$]*)?/
          ]),
          /[-\/][^\s'"`\\$={><]*/
        ])
      )
    ])
  ]);
  let variantPatterns = [
    any([
      pattern([/@\[[^\s"'`]+\](\/[^\s"'`]+)?/, separator]),
      pattern([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]\/\w+/, separator]),
      pattern([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]/, separator]),
      pattern([/[^\s"'`\[\\]+/, separator])
    ]),
    any([
      pattern([/([^\s"'`\[\\]+-)?\[[^\s`]+\]\/\w+/, separator]),
      pattern([/([^\s"'`\[\\]+-)?\[[^\s`]+\]/, separator]),
      pattern([/[^\s`\[\\]+/, separator])
    ])
  ];
  for (const variantPattern of variantPatterns) {
    yield pattern([
      "((?=((",
      variantPattern,
      ")+))\\2)?",
      /!?/,
      prefix3,
      utility
    ]);
  }
  yield /[^<>"'`\s.(){}[\]#=%$]*[^<>"'`\s.(){}[\]#=%:$]/g;
}
var SPECIALS = /([\[\]'"`])([^\[\]'"`])?/g;
var ALLOWED_CLASS_CHARACTERS = /[^"'`\s<>\]]+/;
function clipAtBalancedParens(input) {
  if (!input.includes("-[")) {
    return input;
  }
  let depth = 0;
  let openStringTypes = [];
  let matches = input.matchAll(SPECIALS);
  matches = Array.from(matches).flatMap((match) => {
    const [, ...groups] = match;
    return groups.map(
      (group, idx) => Object.assign([], match, {
        index: match.index + idx,
        0: group
      })
    );
  });
  for (let match of matches) {
    let char = match[0];
    let inStringType = openStringTypes[openStringTypes.length - 1];
    if (char === inStringType) {
      openStringTypes.pop();
    } else if (char === "'" || char === '"' || char === "`") {
      openStringTypes.push(char);
    }
    if (inStringType) {
      continue;
    } else if (char === "[") {
      depth++;
      continue;
    } else if (char === "]") {
      depth--;
      continue;
    }
    if (depth < 0) {
      return input.substring(0, match.index - 1);
    }
    if (depth === 0 && !ALLOWED_CLASS_CHARACTERS.test(char)) {
      return input.substring(0, match.index);
    }
  }
  return input;
}

// node_modules/tailwindcss/src/lib/expandTailwindAtRules.js
var env2 = env;
var builtInExtractors = {
  DEFAULT: defaultExtractor
};
var builtInTransformers = {
  DEFAULT: (content) => content,
  svelte: (content) => content.replace(/(?:^|\s)class:/g, " ")
};
function getExtractor(context, fileExtension) {
  let extractors = context.tailwindConfig.content.extract;
  return extractors[fileExtension] || extractors.DEFAULT || builtInExtractors[fileExtension] || builtInExtractors.DEFAULT(context);
}
function getTransformer(tailwindConfig, fileExtension) {
  let transformers = tailwindConfig.content.transform;
  return transformers[fileExtension] || transformers.DEFAULT || builtInTransformers[fileExtension] || builtInTransformers.DEFAULT;
}
var extractorCache = /* @__PURE__ */ new WeakMap();
function getClassCandidates(content, extractor, candidates, seen) {
  if (!extractorCache.has(extractor)) {
    extractorCache.set(extractor, new import_quick_lru.default({ maxSize: 25e3 }));
  }
  for (let line of content.split("\n")) {
    line = line.trim();
    if (seen.has(line)) {
      continue;
    }
    seen.add(line);
    if (extractorCache.get(extractor).has(line)) {
      for (let match of extractorCache.get(extractor).get(line)) {
        candidates.add(match);
      }
    } else {
      let extractorMatches = extractor(line).filter((s) => s !== "!*");
      let lineMatchesSet = new Set(extractorMatches);
      for (let match of lineMatchesSet) {
        candidates.add(match);
      }
      extractorCache.get(extractor).set(line, lineMatchesSet);
    }
  }
}
function buildStylesheet(rules, context) {
  let sortedRules = context.offsets.sort(rules);
  let returnValue = {
    base: /* @__PURE__ */ new Set(),
    defaults: /* @__PURE__ */ new Set(),
    components: /* @__PURE__ */ new Set(),
    utilities: /* @__PURE__ */ new Set(),
    variants: /* @__PURE__ */ new Set()
  };
  for (let [sort, rule] of sortedRules) {
    returnValue[sort.layer].add(rule);
  }
  return returnValue;
}
function expandTailwindAtRules(context) {
  return async (root) => {
    let layerNodes = {
      base: null,
      components: null,
      utilities: null,
      variants: null
    };
    root.walkAtRules((rule) => {
      if (rule.name === "tailwind") {
        if (Object.keys(layerNodes).includes(rule.params)) {
          layerNodes[rule.params] = rule;
        }
      }
    });
    if (Object.values(layerNodes).every((n) => n === null)) {
      return root;
    }
    let candidates = /* @__PURE__ */ new Set([...context.candidates ?? [], NOT_ON_DEMAND]);
    let seen = /* @__PURE__ */ new Set();
    env2.DEBUG && console.time("Reading changed files");
    if (false) {
      for (let candidate of null.parseCandidateStringsFromFiles(
        context.changedContent
      )) {
        candidates.add(candidate);
      }
    } else {
      let regexParserContent = [];
      for (let item of context.changedContent) {
        let transformer = getTransformer(context.tailwindConfig, item.extension);
        let extractor = getExtractor(context, item.extension);
        regexParserContent.push([item, { transformer, extractor }]);
      }
      const BATCH_SIZE = 500;
      for (let i = 0; i < regexParserContent.length; i += BATCH_SIZE) {
        let batch = regexParserContent.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async ([{ file, content }, { transformer, extractor }]) => {
            content = file ? await fs_default.promises.readFile(file, "utf8") : content;
            getClassCandidates(transformer(content), extractor, candidates, seen);
          })
        );
      }
    }
    env2.DEBUG && console.timeEnd("Reading changed files");
    let classCacheCount = context.classCache.size;
    env2.DEBUG && console.time("Generate rules");
    env2.DEBUG && console.time("Sorting candidates");
    let sortedCandidates = false ? candidates : new Set(
      [...candidates].sort((a, z) => {
        if (a === z)
          return 0;
        if (a < z)
          return -1;
        return 1;
      })
    );
    env2.DEBUG && console.timeEnd("Sorting candidates");
    generateRules(sortedCandidates, context);
    env2.DEBUG && console.timeEnd("Generate rules");
    env2.DEBUG && console.time("Build stylesheet");
    if (context.stylesheetCache === null || context.classCache.size !== classCacheCount) {
      context.stylesheetCache = buildStylesheet([...context.ruleCache], context);
    }
    env2.DEBUG && console.timeEnd("Build stylesheet");
    let {
      defaults: defaultNodes,
      base: baseNodes,
      components: componentNodes,
      utilities: utilityNodes,
      variants: screenNodes
    } = context.stylesheetCache;
    if (layerNodes.base) {
      layerNodes.base.before(
        cloneNodes([...baseNodes, ...defaultNodes], layerNodes.base.source, {
          layer: "base"
        })
      );
      layerNodes.base.remove();
    }
    if (layerNodes.components) {
      layerNodes.components.before(
        cloneNodes([...componentNodes], layerNodes.components.source, {
          layer: "components"
        })
      );
      layerNodes.components.remove();
    }
    if (layerNodes.utilities) {
      layerNodes.utilities.before(
        cloneNodes([...utilityNodes], layerNodes.utilities.source, {
          layer: "utilities"
        })
      );
      layerNodes.utilities.remove();
    }
    const variantNodes = Array.from(screenNodes).filter((node) => {
      const parentLayer = node.raws.tailwind?.parentLayer;
      if (parentLayer === "components") {
        return layerNodes.components !== null;
      }
      if (parentLayer === "utilities") {
        return layerNodes.utilities !== null;
      }
      return true;
    });
    if (layerNodes.variants) {
      layerNodes.variants.before(
        cloneNodes(variantNodes, layerNodes.variants.source, {
          layer: "variants"
        })
      );
      layerNodes.variants.remove();
    } else if (variantNodes.length > 0) {
      root.append(
        cloneNodes(variantNodes, root.source, {
          layer: "variants"
        })
      );
    }
    root.source.end = root.source.end ?? root.source.start;
    const hasUtilityVariants = variantNodes.some(
      (node) => node.raws.tailwind?.parentLayer === "utilities"
    );
    if (layerNodes.utilities && utilityNodes.size === 0 && !hasUtilityVariants) {
      log_default.warn("content-problems", [
        "No utility classes were detected in your source files. If this is unexpected, double-check the `content` option in your Tailwind CSS configuration.",
        "https://tailwindcss.com/docs/content-configuration"
      ]);
    }
    if (env2.DEBUG) {
      console.log("Potential classes: ", candidates.size);
      console.log("Active contexts: ", contextSourcesMap.size);
    }
    context.changedContent = [];
    root.walkAtRules("layer", (rule) => {
      if (Object.keys(layerNodes).includes(rule.params)) {
        rule.remove();
      }
    });
  };
}

// node_modules/tailwindcss/src/lib/expandApplyAtRules.js
import postcss6 from "postcss";
import parser4 from "postcss-selector-parser";
function extractClasses(node) {
  let groups = /* @__PURE__ */ new Map();
  let container = postcss6.root({ nodes: [node.clone()] });
  container.walkRules((rule) => {
    parser4((selectors) => {
      selectors.walkClasses((classSelector) => {
        let parentSelector = classSelector.parent.toString();
        let classes2 = groups.get(parentSelector);
        if (!classes2) {
          groups.set(parentSelector, classes2 = /* @__PURE__ */ new Set());
        }
        classes2.add(classSelector.value);
      });
    }).processSync(rule.selector);
  });
  let normalizedGroups = Array.from(groups.values(), (classes2) => Array.from(classes2));
  let classes = normalizedGroups.flat();
  return Object.assign(classes, { groups: normalizedGroups });
}
var selectorExtractor = parser4();
function extractSelectors(ruleSelectors) {
  return selectorExtractor.astSync(ruleSelectors);
}
function extractBaseCandidates(candidates, separator) {
  let baseClasses = /* @__PURE__ */ new Set();
  for (let candidate of candidates) {
    baseClasses.add(candidate.split(separator).pop());
  }
  return Array.from(baseClasses);
}
function prefix2(context, selector) {
  let prefix3 = context.tailwindConfig.prefix;
  return typeof prefix3 === "function" ? prefix3(selector) : prefix3 + selector;
}
function* pathToRoot(node) {
  yield node;
  while (node.parent) {
    yield node.parent;
    node = node.parent;
  }
}
function shallowClone(node, overrides = {}) {
  let children = node.nodes;
  node.nodes = [];
  let tmp = node.clone(overrides);
  node.nodes = children;
  return tmp;
}
function nestedClone(node) {
  for (let parent of pathToRoot(node)) {
    if (node === parent) {
      continue;
    }
    if (parent.type === "root") {
      break;
    }
    node = shallowClone(parent, {
      nodes: [node]
    });
  }
  return node;
}
function buildLocalApplyCache(root, context) {
  let cache2 = /* @__PURE__ */ new Map();
  root.walkRules((rule) => {
    for (let node of pathToRoot(rule)) {
      if (node.raws.tailwind?.layer !== void 0) {
        return;
      }
    }
    let container = nestedClone(rule);
    let sort = context.offsets.create("user");
    for (let className of extractClasses(rule)) {
      let list2 = cache2.get(className) || [];
      cache2.set(className, list2);
      list2.push([
        {
          layer: "user",
          sort,
          important: false
        },
        container
      ]);
    }
  });
  return cache2;
}
function buildApplyCache(applyCandidates, context) {
  for (let candidate of applyCandidates) {
    if (context.notClassCache.has(candidate) || context.applyClassCache.has(candidate)) {
      continue;
    }
    if (context.classCache.has(candidate)) {
      context.applyClassCache.set(
        candidate,
        context.classCache.get(candidate).map(([meta, rule]) => [meta, rule.clone()])
      );
      continue;
    }
    let matches = Array.from(resolveMatches(candidate, context));
    if (matches.length === 0) {
      context.notClassCache.add(candidate);
      continue;
    }
    context.applyClassCache.set(candidate, matches);
  }
  return context.applyClassCache;
}
function lazyCache(buildCacheFn) {
  let cache2 = null;
  return {
    get: (name) => {
      cache2 = cache2 || buildCacheFn();
      return cache2.get(name);
    },
    has: (name) => {
      cache2 = cache2 || buildCacheFn();
      return cache2.has(name);
    }
  };
}
function combineCaches(caches) {
  return {
    get: (name) => caches.flatMap((cache2) => cache2.get(name) || []),
    has: (name) => caches.some((cache2) => cache2.has(name))
  };
}
function extractApplyCandidates(params) {
  let candidates = params.split(/[\s\t\n]+/g);
  if (candidates[candidates.length - 1] === "!important") {
    return [candidates.slice(0, -1), true];
  }
  return [candidates, false];
}
function processApply(root, context, localCache) {
  let applyCandidates = /* @__PURE__ */ new Set();
  let applies = [];
  root.walkAtRules("apply", (rule) => {
    let [candidates] = extractApplyCandidates(rule.params);
    for (let util of candidates) {
      applyCandidates.add(util);
    }
    applies.push(rule);
  });
  if (applies.length === 0) {
    return;
  }
  let applyClassCache = combineCaches([localCache, buildApplyCache(applyCandidates, context)]);
  function replaceSelector(selector, utilitySelectors, candidate) {
    let selectorList = extractSelectors(selector);
    let utilitySelectorsList = extractSelectors(utilitySelectors);
    let candidateList = extractSelectors(`.${escapeClassName(candidate)}`);
    let candidateClass = candidateList.nodes[0].nodes[0];
    selectorList.each((sel) => {
      let replaced = /* @__PURE__ */ new Set();
      utilitySelectorsList.each((utilitySelector) => {
        let hasReplaced = false;
        utilitySelector = utilitySelector.clone();
        utilitySelector.walkClasses((node) => {
          if (node.value !== candidateClass.value) {
            return;
          }
          if (hasReplaced) {
            return;
          }
          node.replaceWith(...sel.nodes.map((node2) => node2.clone()));
          replaced.add(utilitySelector);
          hasReplaced = true;
        });
      });
      for (let sel2 of replaced) {
        let groups = [[]];
        for (let node of sel2.nodes) {
          if (node.type === "combinator") {
            groups.push(node);
            groups.push([]);
          } else {
            let last = groups[groups.length - 1];
            last.push(node);
          }
        }
        sel2.nodes = [];
        for (let group of groups) {
          if (Array.isArray(group)) {
            group.sort((a, b) => {
              if (a.type === "tag" && b.type === "class") {
                return -1;
              } else if (a.type === "class" && b.type === "tag") {
                return 1;
              } else if (a.type === "class" && b.type === "pseudo" && b.value.startsWith("::")) {
                return -1;
              } else if (a.type === "pseudo" && a.value.startsWith("::") && b.type === "class") {
                return 1;
              }
              return 0;
            });
          }
          sel2.nodes = sel2.nodes.concat(group);
        }
      }
      sel.replaceWith(...replaced);
    });
    return selectorList.toString();
  }
  let perParentApplies = /* @__PURE__ */ new Map();
  for (let apply of applies) {
    let [candidates] = perParentApplies.get(apply.parent) || [[], apply.source];
    perParentApplies.set(apply.parent, [candidates, apply.source]);
    let [applyCandidates2, important] = extractApplyCandidates(apply.params);
    if (apply.parent.type === "atrule") {
      if (apply.parent.name === "screen") {
        let screenType = apply.parent.params;
        throw apply.error(
          `@apply is not supported within nested at-rules like @screen. We suggest you write this as @apply ${applyCandidates2.map((c) => `${screenType}:${c}`).join(" ")} instead.`
        );
      }
      throw apply.error(
        `@apply is not supported within nested at-rules like @${apply.parent.name}. You can fix this by un-nesting @${apply.parent.name}.`
      );
    }
    for (let applyCandidate of applyCandidates2) {
      if ([prefix2(context, "group"), prefix2(context, "peer")].includes(applyCandidate)) {
        throw apply.error(`@apply should not be used with the '${applyCandidate}' utility`);
      }
      if (!applyClassCache.has(applyCandidate)) {
        throw apply.error(
          `The \`${applyCandidate}\` class does not exist. If \`${applyCandidate}\` is a custom class, make sure it is defined within a \`@layer\` directive.`
        );
      }
      let rules = applyClassCache.get(applyCandidate);
      candidates.push([applyCandidate, important, rules]);
    }
  }
  for (let [parent, [candidates, atApplySource]] of perParentApplies) {
    let siblings = [];
    for (let [applyCandidate, important, rules] of candidates) {
      let potentialApplyCandidates = [
        applyCandidate,
        ...extractBaseCandidates([applyCandidate], context.tailwindConfig.separator)
      ];
      for (let [meta, node] of rules) {
        let parentClasses = extractClasses(parent);
        let nodeClasses = extractClasses(node);
        nodeClasses = nodeClasses.groups.filter(
          (classList) => classList.some((className) => potentialApplyCandidates.includes(className))
        ).flat();
        nodeClasses = nodeClasses.concat(
          extractBaseCandidates(nodeClasses, context.tailwindConfig.separator)
        );
        let intersects = parentClasses.some((selector) => nodeClasses.includes(selector));
        if (intersects) {
          throw node.error(
            `You cannot \`@apply\` the \`${applyCandidate}\` utility here because it creates a circular dependency.`
          );
        }
        let root2 = postcss6.root({ nodes: [node.clone()] });
        root2.walk((node2) => {
          node2.source = atApplySource;
        });
        let canRewriteSelector = node.type !== "atrule" || node.type === "atrule" && node.name !== "keyframes";
        if (canRewriteSelector) {
          root2.walkRules((rule) => {
            if (!extractClasses(rule).some((candidate) => candidate === applyCandidate)) {
              rule.remove();
              return;
            }
            let importantSelector = typeof context.tailwindConfig.important === "string" ? context.tailwindConfig.important : null;
            let isGenerated = parent.raws.tailwind !== void 0;
            let parentSelector = isGenerated && importantSelector && parent.selector.indexOf(importantSelector) === 0 ? parent.selector.slice(importantSelector.length) : parent.selector;
            if (parentSelector === "") {
              parentSelector = parent.selector;
            }
            rule.selector = replaceSelector(parentSelector, rule.selector, applyCandidate);
            if (importantSelector && parentSelector !== parent.selector) {
              rule.selector = applyImportantSelector(rule.selector, importantSelector);
            }
            rule.walkDecls((d) => {
              d.important = meta.important || important;
            });
            let selector = parser4().astSync(rule.selector);
            selector.each((sel) => movePseudos(sel));
            rule.selector = selector.toString();
          });
        }
        if (!root2.nodes[0]) {
          continue;
        }
        siblings.push([meta.sort, root2.nodes[0]]);
      }
    }
    let nodes = context.offsets.sort(siblings).map((s) => s[1]);
    parent.after(nodes);
  }
  for (let apply of applies) {
    if (apply.parent.nodes.length > 1) {
      apply.remove();
    } else {
      apply.parent.remove();
    }
  }
  processApply(root, context, localCache);
}
function expandApplyAtRules(context) {
  return (root) => {
    let localCache = lazyCache(() => buildLocalApplyCache(root, context));
    processApply(root, context, localCache);
  };
}

// node_modules/tailwindcss/src/lib/evaluateTailwindFunctions.js
import dlv2 from "dlv";
import didYouMean from "didyoumean";
var import_value_parser = __toESM(require_value_parser());
function isObject(input) {
  return typeof input === "object" && input !== null;
}
function findClosestExistingPath(theme, path) {
  let parts = toPath(path);
  do {
    parts.pop();
    if (dlv2(theme, parts) !== void 0)
      break;
  } while (parts.length);
  return parts.length ? parts : void 0;
}
function pathToString(path) {
  if (typeof path === "string")
    return path;
  return path.reduce((acc, cur, i) => {
    if (cur.includes("."))
      return `${acc}[${cur}]`;
    return i === 0 ? cur : `${acc}.${cur}`;
  }, "");
}
function list(items) {
  return items.map((key) => `'${key}'`).join(", ");
}
function listKeys(obj) {
  return list(Object.keys(obj));
}
function validatePath(config, path, defaultValue, themeOpts = {}) {
  const pathString = Array.isArray(path) ? pathToString(path) : path.replace(/^['"]+|['"]+$/g, "");
  const pathSegments = Array.isArray(path) ? path : toPath(pathString);
  const value2 = dlv2(config.theme, pathSegments, defaultValue);
  if (value2 === void 0) {
    let error = `'${pathString}' does not exist in your theme config.`;
    const parentSegments = pathSegments.slice(0, -1);
    const parentValue = dlv2(config.theme, parentSegments);
    if (isObject(parentValue)) {
      const validKeys = Object.keys(parentValue).filter(
        (key) => validatePath(config, [...parentSegments, key]).isValid
      );
      const suggestion = didYouMean(pathSegments[pathSegments.length - 1], validKeys);
      if (suggestion) {
        error += ` Did you mean '${pathToString([...parentSegments, suggestion])}'?`;
      } else if (validKeys.length > 0) {
        error += ` '${pathToString(parentSegments)}' has the following valid keys: ${list(
          validKeys
        )}`;
      }
    } else {
      const closestPath = findClosestExistingPath(config.theme, pathString);
      if (closestPath) {
        const closestValue = dlv2(config.theme, closestPath);
        if (isObject(closestValue)) {
          error += ` '${pathToString(closestPath)}' has the following keys: ${listKeys(
            closestValue
          )}`;
        } else {
          error += ` '${pathToString(closestPath)}' is not an object.`;
        }
      } else {
        error += ` Your theme has the following top-level keys: ${listKeys(config.theme)}`;
      }
    }
    return {
      isValid: false,
      error
    };
  }
  if (!(typeof value2 === "string" || typeof value2 === "number" || typeof value2 === "function" || value2 instanceof String || value2 instanceof Number || Array.isArray(value2))) {
    let error = `'${pathString}' was found but does not resolve to a string.`;
    if (isObject(value2)) {
      let validKeys = Object.keys(value2).filter(
        (key) => validatePath(config, [...pathSegments, key]).isValid
      );
      if (validKeys.length) {
        error += ` Did you mean something like '${pathToString([...pathSegments, validKeys[0]])}'?`;
      }
    }
    return {
      isValid: false,
      error
    };
  }
  const [themeSection] = pathSegments;
  return {
    isValid: true,
    value: transformThemeValue(themeSection)(value2, themeOpts)
  };
}
function extractArgs(node, vNodes, functions) {
  vNodes = vNodes.map((vNode) => resolveVNode(node, vNode, functions));
  let args = [""];
  for (let vNode of vNodes) {
    if (vNode.type === "div" && vNode.value === ",") {
      args.push("");
    } else {
      args[args.length - 1] += import_value_parser.default.stringify(vNode);
    }
  }
  return args;
}
function resolveVNode(node, vNode, functions) {
  if (vNode.type === "function" && functions[vNode.value] !== void 0) {
    let args = extractArgs(node, vNode.nodes, functions);
    vNode.type = "word";
    vNode.value = functions[vNode.value](node, ...args);
  }
  return vNode;
}
function resolveFunctions(node, input, functions) {
  let hasAnyFn = Object.keys(functions).some((fn) => input.includes(`${fn}(`));
  if (!hasAnyFn)
    return input;
  return (0, import_value_parser.default)(input).walk((vNode) => {
    resolveVNode(node, vNode, functions);
  }).toString();
}
var nodeTypePropertyMap = {
  atrule: "params",
  decl: "value"
};
function* toPaths(path) {
  path = path.replace(/^['"]+|['"]+$/g, "");
  let matches = path.match(/^([^\s]+)(?![^\[]*\])(?:\s*\/\s*([^\/\s]+))$/);
  let alpha = void 0;
  yield [path, void 0];
  if (matches) {
    path = matches[1];
    alpha = matches[2];
    yield [path, alpha];
  }
}
function resolvePath(config, path, defaultValue) {
  const results = Array.from(toPaths(path)).map(([path2, alpha]) => {
    return Object.assign(validatePath(config, path2, defaultValue, { opacityValue: alpha }), {
      resolvedPath: path2,
      alpha
    });
  });
  return results.find((result) => result.isValid) ?? results[0];
}
function evaluateTailwindFunctions_default(context) {
  let config = context.tailwindConfig;
  let functions = {
    theme: (node, path, ...defaultValue) => {
      let { isValid, value: value2, error, alpha } = resolvePath(
        config,
        path,
        defaultValue.length ? defaultValue : void 0
      );
      if (!isValid) {
        let parentNode = node.parent;
        let candidate = parentNode?.raws.tailwind?.candidate;
        if (parentNode && candidate !== void 0) {
          context.markInvalidUtilityNode(parentNode);
          parentNode.remove();
          log_default.warn("invalid-theme-key-in-class", [
            `The utility \`${candidate}\` contains an invalid theme value and was not generated.`
          ]);
          return;
        }
        throw node.error(error);
      }
      let maybeColor = parseColorFormat(value2);
      let isColorFunction = maybeColor !== void 0 && typeof maybeColor === "function";
      if (alpha !== void 0 || isColorFunction) {
        if (alpha === void 0) {
          alpha = 1;
        }
        value2 = withAlphaValue(maybeColor, alpha, maybeColor);
      }
      return value2;
    },
    screen: (node, screen) => {
      screen = screen.replace(/^['"]+/g, "").replace(/['"]+$/g, "");
      let screens = normalizeScreens(config.theme.screens);
      let screenDefinition = screens.find(({ name }) => name === screen);
      if (!screenDefinition) {
        throw node.error(`The '${screen}' screen does not exist in your theme.`);
      }
      return buildMediaQuery(screenDefinition);
    }
  };
  return (root) => {
    root.walk((node) => {
      let property = nodeTypePropertyMap[node.type];
      if (property === void 0) {
        return;
      }
      node[property] = resolveFunctions(node, node[property], functions);
    });
  };
}

// node_modules/tailwindcss/src/lib/substituteScreenAtRules.js
function substituteScreenAtRules_default({ tailwindConfig: { theme } }) {
  return function(css) {
    css.walkAtRules("screen", (atRule) => {
      let screen = atRule.params;
      let screens = normalizeScreens(theme.screens);
      let screenDefinition = screens.find(({ name }) => name === screen);
      if (!screenDefinition) {
        throw atRule.error(`No \`${screen}\` screen found.`);
      }
      atRule.name = "media";
      atRule.params = buildMediaQuery(screenDefinition);
    });
  };
}

// node_modules/tailwindcss/src/lib/resolveDefaultsAtRules.js
import postcss7 from "postcss";
import selectorParser4 from "postcss-selector-parser";
var getNode = {
  id(node) {
    return selectorParser4.attribute({
      attribute: "id",
      operator: "=",
      value: node.value,
      quoteMark: '"'
    });
  }
};
function minimumImpactSelector(nodes) {
  let rest = nodes.filter((node2) => {
    if (node2.type !== "pseudo")
      return true;
    if (node2.nodes.length > 0)
      return true;
    return node2.value.startsWith("::") || [":before", ":after", ":first-line", ":first-letter"].includes(node2.value);
  }).reverse();
  let searchFor = /* @__PURE__ */ new Set(["tag", "class", "id", "attribute"]);
  let splitPointIdx = rest.findIndex((n) => searchFor.has(n.type));
  if (splitPointIdx === -1)
    return rest.reverse().join("").trim();
  let node = rest[splitPointIdx];
  let bestNode = getNode[node.type] ? getNode[node.type](node) : node;
  rest = rest.slice(0, splitPointIdx);
  let combinatorIdx = rest.findIndex((n) => n.type === "combinator" && n.value === ">");
  if (combinatorIdx !== -1) {
    rest.splice(0, combinatorIdx);
    rest.unshift(selectorParser4.universal());
  }
  return [bestNode, ...rest.reverse()].join("").trim();
}
var elementSelectorParser = selectorParser4((selectors) => {
  return selectors.map((s) => {
    let nodes = s.split((n) => n.type === "combinator" && n.value === " ").pop();
    return minimumImpactSelector(nodes);
  });
});
var cache = /* @__PURE__ */ new Map();
function extractElementSelector(selector) {
  if (!cache.has(selector)) {
    cache.set(selector, elementSelectorParser.transformSync(selector));
  }
  return cache.get(selector);
}
function resolveDefaultsAtRules({ tailwindConfig }) {
  return (root) => {
    let variableNodeMap = /* @__PURE__ */ new Map();
    let universals = /* @__PURE__ */ new Set();
    root.walkAtRules("defaults", (rule) => {
      if (rule.nodes && rule.nodes.length > 0) {
        universals.add(rule);
        return;
      }
      let variable = rule.params;
      if (!variableNodeMap.has(variable)) {
        variableNodeMap.set(variable, /* @__PURE__ */ new Set());
      }
      variableNodeMap.get(variable).add(rule.parent);
      rule.remove();
    });
    if (flagEnabled(tailwindConfig, "optimizeUniversalDefaults")) {
      for (let universal of universals) {
        let selectorGroups = /* @__PURE__ */ new Map();
        let rules = variableNodeMap.get(universal.params) ?? [];
        for (let rule of rules) {
          for (let selector of extractElementSelector(rule.selector)) {
            let selectorGroupName = selector.includes(":-") || selector.includes("::-") ? selector : "__DEFAULT__";
            let selectors = selectorGroups.get(selectorGroupName) ?? /* @__PURE__ */ new Set();
            selectorGroups.set(selectorGroupName, selectors);
            selectors.add(selector);
          }
        }
        if (flagEnabled(tailwindConfig, "optimizeUniversalDefaults")) {
          if (selectorGroups.size === 0) {
            universal.remove();
            continue;
          }
          for (let [, selectors] of selectorGroups) {
            let universalRule = postcss7.rule({
              source: universal.source
            });
            universalRule.selectors = [...selectors];
            universalRule.append(universal.nodes.map((node) => node.clone()));
            universal.before(universalRule);
          }
        }
        universal.remove();
      }
    } else if (universals.size) {
      let universalRule = postcss7.rule({
        selectors: ["*", "::before", "::after"]
      });
      for (let universal of universals) {
        universalRule.append(universal.nodes);
        if (!universalRule.parent) {
          universal.before(universalRule);
        }
        if (!universalRule.source) {
          universalRule.source = universal.source;
        }
        universal.remove();
      }
      let backdropRule = universalRule.clone({
        selectors: ["::backdrop"]
      });
      universalRule.after(backdropRule);
    }
  };
}

// node_modules/tailwindcss/src/lib/collapseAdjacentRules.js
var comparisonMap = {
  atrule: ["name", "params"],
  rule: ["selector"]
};
var types = new Set(Object.keys(comparisonMap));
function collapseAdjacentRules() {
  function collapseRulesIn(root) {
    let currentRule = null;
    root.each((node) => {
      if (!types.has(node.type)) {
        currentRule = null;
        return;
      }
      if (currentRule === null) {
        currentRule = node;
        return;
      }
      let properties = comparisonMap[node.type];
      if (node.type === "atrule" && node.name === "font-face") {
        currentRule = node;
      } else if (properties.every(
        (property) => (node[property] ?? "").replace(/\s+/g, " ") === (currentRule[property] ?? "").replace(/\s+/g, " ")
      )) {
        if (node.nodes) {
          currentRule.append(node.nodes);
        }
        node.remove();
      } else {
        currentRule = node;
      }
    });
    root.each((node) => {
      if (node.type === "atrule") {
        collapseRulesIn(node);
      }
    });
  }
  return (root) => {
    collapseRulesIn(root);
  };
}

// node_modules/tailwindcss/src/lib/collapseDuplicateDeclarations.js
function collapseDuplicateDeclarations() {
  return (root) => {
    root.walkRules((node) => {
      let seen = /* @__PURE__ */ new Map();
      let droppable = /* @__PURE__ */ new Set([]);
      let byProperty = /* @__PURE__ */ new Map();
      node.walkDecls((decl) => {
        if (decl.parent !== node) {
          return;
        }
        if (seen.has(decl.prop)) {
          if (seen.get(decl.prop).value === decl.value) {
            droppable.add(seen.get(decl.prop));
            seen.set(decl.prop, decl);
            return;
          }
          if (!byProperty.has(decl.prop)) {
            byProperty.set(decl.prop, /* @__PURE__ */ new Set());
          }
          byProperty.get(decl.prop).add(seen.get(decl.prop));
          byProperty.get(decl.prop).add(decl);
        }
        seen.set(decl.prop, decl);
      });
      for (let decl of droppable) {
        decl.remove();
      }
      for (let declarations of byProperty.values()) {
        let byUnit = /* @__PURE__ */ new Map();
        for (let decl of declarations) {
          let unit = resolveUnit(decl.value);
          if (unit === null) {
            continue;
          }
          if (!byUnit.has(unit)) {
            byUnit.set(unit, /* @__PURE__ */ new Set());
          }
          byUnit.get(unit).add(decl);
        }
        for (let declarations2 of byUnit.values()) {
          let removableDeclarations = Array.from(declarations2).slice(0, -1);
          for (let decl of removableDeclarations) {
            decl.remove();
          }
        }
      }
    });
  };
}
var UNITLESS_NUMBER = Symbol("unitless-number");
function resolveUnit(input) {
  let result = /^-?\d*.?\d+([\w%]+)?$/g.exec(input);
  if (result) {
    return result[1] ?? UNITLESS_NUMBER;
  }
  return null;
}

// node_modules/tailwindcss/src/lib/partitionApplyAtRules.js
function partitionRules(root) {
  if (!root.walkAtRules)
    return;
  let applyParents = /* @__PURE__ */ new Set();
  root.walkAtRules("apply", (rule) => {
    applyParents.add(rule.parent);
  });
  if (applyParents.size === 0) {
    return;
  }
  for (let rule of applyParents) {
    let nodeGroups = [];
    let lastGroup = [];
    for (let node of rule.nodes) {
      if (node.type === "atrule" && node.name === "apply") {
        if (lastGroup.length > 0) {
          nodeGroups.push(lastGroup);
          lastGroup = [];
        }
        nodeGroups.push([node]);
      } else {
        lastGroup.push(node);
      }
    }
    if (lastGroup.length > 0) {
      nodeGroups.push(lastGroup);
    }
    if (nodeGroups.length === 1) {
      continue;
    }
    for (let group of [...nodeGroups].reverse()) {
      let clone = rule.clone({ nodes: [] });
      clone.append(group);
      rule.after(clone);
    }
    rule.remove();
  }
}
function expandApplyAtRules2() {
  return (root) => {
    partitionRules(root);
  };
}

// node_modules/tailwindcss/src/lib/detectNesting.js
function isRoot(node) {
  return node.type === "root";
}
function isAtLayer(node) {
  return node.type === "atrule" && node.name === "layer";
}
function detectNesting_default(_context) {
  return (root, result) => {
    let found = false;
    root.walkAtRules("tailwind", (node) => {
      if (found)
        return false;
      if (node.parent && !(isRoot(node.parent) || isAtLayer(node.parent))) {
        found = true;
        node.warn(
          result,
          [
            "Nested @tailwind rules were detected, but are not supported.",
            "Consider using a prefix to scope Tailwind's classes: https://tailwindcss.com/docs/configuration#prefix",
            "Alternatively, use the important selector strategy: https://tailwindcss.com/docs/configuration#selector-strategy"
          ].join("\n")
        );
        return false;
      }
    });
    root.walkRules((rule) => {
      if (found)
        return false;
      rule.walkRules((nestedRule) => {
        found = true;
        nestedRule.warn(
          result,
          [
            "Nested CSS was detected, but CSS nesting has not been configured correctly.",
            "Please enable a CSS nesting plugin *before* Tailwind in your configuration.",
            "See how here: https://tailwindcss.com/docs/using-with-preprocessors#nesting"
          ].join("\n")
        );
        return false;
      });
    });
  };
}

// node_modules/tailwindcss/src/processTailwindFeatures.js
function processTailwindFeatures(setupContext) {
  return async function(root, result) {
    let { tailwindDirectives, applyDirectives } = normalizeTailwindDirectives(root);
    detectNesting_default()(root, result);
    expandApplyAtRules2()(root, result);
    let context = setupContext({
      tailwindDirectives,
      applyDirectives,
      registerDependency(dependency) {
        result.messages.push({
          plugin: "tailwindcss",
          parent: result.opts.from,
          ...dependency
        });
      },
      createContext(tailwindConfig, changedContent) {
        return createContext(tailwindConfig, changedContent, root);
      }
    })(root, result);
    if (context.tailwindConfig.separator === "-") {
      throw new Error(
        "The '-' character cannot be used as a custom separator in JIT mode due to parsing ambiguity. Please use another character like '_' instead."
      );
    }
    issueFlagNotices(context.tailwindConfig);
    await expandTailwindAtRules(context)(root, result);
    expandApplyAtRules2()(root, result);
    expandApplyAtRules(context)(root, result);
    evaluateTailwindFunctions_default(context)(root, result);
    substituteScreenAtRules_default(context)(root, result);
    resolveDefaultsAtRules(context)(root, result);
    collapseAdjacentRules(context)(root, result);
    collapseDuplicateDeclarations(context)(root, result);
  };
}

// node_modules/tailwindcss/src/corePluginList.js
var corePluginList_default = ["preflight", "container", "accessibility", "pointerEvents", "visibility", "position", "inset", "isolation", "zIndex", "order", "gridColumn", "gridColumnStart", "gridColumnEnd", "gridRow", "gridRowStart", "gridRowEnd", "float", "clear", "margin", "boxSizing", "lineClamp", "display", "aspectRatio", "size", "height", "maxHeight", "minHeight", "width", "minWidth", "maxWidth", "flex", "flexShrink", "flexGrow", "flexBasis", "tableLayout", "captionSide", "borderCollapse", "borderSpacing", "transformOrigin", "translate", "rotate", "skew", "scale", "transform", "animation", "cursor", "touchAction", "userSelect", "resize", "scrollSnapType", "scrollSnapAlign", "scrollSnapStop", "scrollMargin", "scrollPadding", "listStylePosition", "listStyleType", "listStyleImage", "appearance", "columns", "breakBefore", "breakInside", "breakAfter", "gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateColumns", "gridTemplateRows", "flexDirection", "flexWrap", "placeContent", "placeItems", "alignContent", "alignItems", "justifyContent", "justifyItems", "gap", "space", "divideWidth", "divideStyle", "divideColor", "divideOpacity", "placeSelf", "alignSelf", "justifySelf", "overflow", "overscrollBehavior", "scrollBehavior", "textOverflow", "hyphens", "whitespace", "textWrap", "wordBreak", "borderRadius", "borderWidth", "borderStyle", "borderColor", "borderOpacity", "backgroundColor", "backgroundOpacity", "backgroundImage", "gradientColorStops", "boxDecorationBreak", "backgroundSize", "backgroundAttachment", "backgroundClip", "backgroundPosition", "backgroundRepeat", "backgroundOrigin", "fill", "stroke", "strokeWidth", "objectFit", "objectPosition", "padding", "textAlign", "textIndent", "verticalAlign", "fontFamily", "fontSize", "fontWeight", "textTransform", "fontStyle", "fontVariantNumeric", "lineHeight", "letterSpacing", "textColor", "textOpacity", "textDecoration", "textDecorationColor", "textDecorationStyle", "textDecorationThickness", "textUnderlineOffset", "fontSmoothing", "placeholderColor", "placeholderOpacity", "caretColor", "accentColor", "opacity", "backgroundBlendMode", "mixBlendMode", "boxShadow", "boxShadowColor", "outlineStyle", "outlineWidth", "outlineOffset", "outlineColor", "ringWidth", "ringColor", "ringOpacity", "ringOffsetWidth", "ringOffsetColor", "blur", "brightness", "contrast", "dropShadow", "grayscale", "hueRotate", "invert", "saturate", "sepia", "filter", "backdropBlur", "backdropBrightness", "backdropContrast", "backdropGrayscale", "backdropHueRotate", "backdropInvert", "backdropOpacity", "backdropSaturate", "backdropSepia", "backdropFilter", "transitionProperty", "transitionDelay", "transitionDuration", "transitionTimingFunction", "willChange", "content", "forcedColorAdjust"];

// node_modules/tailwindcss/src/util/configurePlugins.js
function configurePlugins_default(pluginConfig, plugins) {
  if (pluginConfig === void 0) {
    return plugins;
  }
  const pluginNames = Array.isArray(pluginConfig) ? pluginConfig : [
    ...new Set(
      plugins.filter((pluginName) => {
        return pluginConfig !== false && pluginConfig[pluginName] !== false;
      }).concat(
        Object.keys(pluginConfig).filter((pluginName) => {
          return pluginConfig[pluginName] !== false;
        })
      )
    )
  ];
  return pluginNames;
}

// node_modules/tailwindcss/src/public/colors.js
function warn({ version: version2, from, to }) {
  log_default.warn(`${from}-color-renamed`, [
    `As of Tailwind CSS ${version2}, \`${from}\` has been renamed to \`${to}\`.`,
    "Update your configuration file to silence this warning."
  ]);
}
var colors_default = {
  inherit: "inherit",
  current: "currentColor",
  transparent: "transparent",
  black: "#000",
  white: "#fff",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617"
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712"
  },
  zinc: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b"
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a"
  },
  stone: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09"
  },
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a"
  },
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407"
  },
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03"
  },
  yellow: {
    50: "#fefce8",
    100: "#fef9c3",
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12",
    950: "#422006"
  },
  lime: {
    50: "#f7fee7",
    100: "#ecfccb",
    200: "#d9f99d",
    300: "#bef264",
    400: "#a3e635",
    500: "#84cc16",
    600: "#65a30d",
    700: "#4d7c0f",
    800: "#3f6212",
    900: "#365314",
    950: "#1a2e05"
  },
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16"
  },
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22"
  },
  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
    950: "#042f2e"
  },
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
    950: "#083344"
  },
  sky: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49"
  },
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554"
  },
  indigo: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b"
  },
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065"
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
    950: "#3b0764"
  },
  fuchsia: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
    950: "#4a044e"
  },
  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
    950: "#500724"
  },
  rose: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
    950: "#4c0519"
  },
  get lightBlue() {
    warn({ version: "v2.2", from: "lightBlue", to: "sky" });
    return this.sky;
  },
  get warmGray() {
    warn({ version: "v3.0", from: "warmGray", to: "stone" });
    return this.stone;
  },
  get trueGray() {
    warn({ version: "v3.0", from: "trueGray", to: "neutral" });
    return this.neutral;
  },
  get coolGray() {
    warn({ version: "v3.0", from: "coolGray", to: "gray" });
    return this.gray;
  },
  get blueGray() {
    warn({ version: "v3.0", from: "blueGray", to: "slate" });
    return this.slate;
  }
};

// node_modules/tailwindcss/src/util/defaults.js
function defaults2(target, ...sources) {
  for (let source of sources) {
    for (let k in source) {
      if (!target?.hasOwnProperty?.(k)) {
        target[k] = source[k];
      }
    }
    for (let k of Object.getOwnPropertySymbols(source)) {
      if (!target?.hasOwnProperty?.(k)) {
        target[k] = source[k];
      }
    }
  }
  return target;
}

// node_modules/tailwindcss/src/util/normalizeConfig.js
function normalizeConfig(config) {
  let valid = (() => {
    if (config.purge) {
      return false;
    }
    if (!config.content) {
      return false;
    }
    if (!Array.isArray(config.content) && !(typeof config.content === "object" && config.content !== null)) {
      return false;
    }
    if (Array.isArray(config.content)) {
      return config.content.every((path) => {
        if (typeof path === "string")
          return true;
        if (typeof path?.raw !== "string")
          return false;
        if (path?.extension && typeof path?.extension !== "string") {
          return false;
        }
        return true;
      });
    }
    if (typeof config.content === "object" && config.content !== null) {
      if (Object.keys(config.content).some(
        (key) => !["files", "relative", "extract", "transform"].includes(key)
      )) {
        return false;
      }
      if (Array.isArray(config.content.files)) {
        if (!config.content.files.every((path) => {
          if (typeof path === "string")
            return true;
          if (typeof path?.raw !== "string")
            return false;
          if (path?.extension && typeof path?.extension !== "string") {
            return false;
          }
          return true;
        })) {
          return false;
        }
        if (typeof config.content.extract === "object") {
          for (let value2 of Object.values(config.content.extract)) {
            if (typeof value2 !== "function") {
              return false;
            }
          }
        } else if (!(config.content.extract === void 0 || typeof config.content.extract === "function")) {
          return false;
        }
        if (typeof config.content.transform === "object") {
          for (let value2 of Object.values(config.content.transform)) {
            if (typeof value2 !== "function") {
              return false;
            }
          }
        } else if (!(config.content.transform === void 0 || typeof config.content.transform === "function")) {
          return false;
        }
        if (typeof config.content.relative !== "boolean" && typeof config.content.relative !== "undefined") {
          return false;
        }
      }
      return true;
    }
    return false;
  })();
  if (!valid) {
    log_default.warn("purge-deprecation", [
      "The `purge`/`content` options have changed in Tailwind CSS v3.0.",
      "Update your configuration file to eliminate this warning.",
      "https://tailwindcss.com/docs/upgrade-guide#configure-content-sources"
    ]);
  }
  config.safelist = (() => {
    let { content, purge, safelist } = config;
    if (Array.isArray(safelist))
      return safelist;
    if (Array.isArray(content?.safelist))
      return content.safelist;
    if (Array.isArray(purge?.safelist))
      return purge.safelist;
    if (Array.isArray(purge?.options?.safelist))
      return purge.options.safelist;
    return [];
  })();
  config.blocklist = (() => {
    let { blocklist } = config;
    if (Array.isArray(blocklist)) {
      if (blocklist.every((item) => typeof item === "string")) {
        return blocklist;
      }
      log_default.warn("blocklist-invalid", [
        "The `blocklist` option must be an array of strings.",
        "https://tailwindcss.com/docs/content-configuration#discarding-classes"
      ]);
    }
    return [];
  })();
  if (typeof config.prefix === "function") {
    log_default.warn("prefix-function", [
      "As of Tailwind CSS v3.0, `prefix` cannot be a function.",
      "Update `prefix` in your configuration to be a string to eliminate this warning.",
      "https://tailwindcss.com/docs/upgrade-guide#prefix-cannot-be-a-function"
    ]);
    config.prefix = "";
  } else {
    config.prefix = config.prefix ?? "";
  }
  config.content = {
    relative: (() => {
      let { content } = config;
      if (content?.relative) {
        return content.relative;
      }
      return flagEnabled(config, "relativeContentPathsByDefault");
    })(),
    files: (() => {
      let { content, purge } = config;
      if (Array.isArray(purge))
        return purge;
      if (Array.isArray(purge?.content))
        return purge.content;
      if (Array.isArray(content))
        return content;
      if (Array.isArray(content?.content))
        return content.content;
      if (Array.isArray(content?.files))
        return content.files;
      return [];
    })(),
    extract: (() => {
      let extract = (() => {
        if (config.purge?.extract)
          return config.purge.extract;
        if (config.content?.extract)
          return config.content.extract;
        if (config.purge?.extract?.DEFAULT)
          return config.purge.extract.DEFAULT;
        if (config.content?.extract?.DEFAULT)
          return config.content.extract.DEFAULT;
        if (config.purge?.options?.extractors)
          return config.purge.options.extractors;
        if (config.content?.options?.extractors)
          return config.content.options.extractors;
        return {};
      })();
      let extractors = {};
      let defaultExtractor2 = (() => {
        if (config.purge?.options?.defaultExtractor) {
          return config.purge.options.defaultExtractor;
        }
        if (config.content?.options?.defaultExtractor) {
          return config.content.options.defaultExtractor;
        }
        return void 0;
      })();
      if (defaultExtractor2 !== void 0) {
        extractors.DEFAULT = defaultExtractor2;
      }
      if (typeof extract === "function") {
        extractors.DEFAULT = extract;
      } else if (Array.isArray(extract)) {
        for (let { extensions, extractor } of extract ?? []) {
          for (let extension of extensions) {
            extractors[extension] = extractor;
          }
        }
      } else if (typeof extract === "object" && extract !== null) {
        Object.assign(extractors, extract);
      }
      return extractors;
    })(),
    transform: (() => {
      let transform = (() => {
        if (config.purge?.transform)
          return config.purge.transform;
        if (config.content?.transform)
          return config.content.transform;
        if (config.purge?.transform?.DEFAULT)
          return config.purge.transform.DEFAULT;
        if (config.content?.transform?.DEFAULT)
          return config.content.transform.DEFAULT;
        return {};
      })();
      let transformers = {};
      if (typeof transform === "function") {
        transformers.DEFAULT = transform;
      }
      if (typeof transform === "object" && transform !== null) {
        Object.assign(transformers, transform);
      }
      return transformers;
    })()
  };
  for (let file of config.content.files) {
    if (typeof file === "string" && /{([^,]*?)}/g.test(file)) {
      log_default.warn("invalid-glob-braces", [
        `The glob pattern ${dim(file)} in your Tailwind CSS configuration is invalid.`,
        `Update it to ${dim(file.replace(/{([^,]*?)}/g, "$1"))} to silence this warning.`
      ]);
      break;
    }
  }
  return config;
}

// node_modules/tailwindcss/src/util/cloneDeep.js
function cloneDeep(value2) {
  if (Array.isArray(value2)) {
    return value2.map((child) => cloneDeep(child));
  }
  if (typeof value2 === "object" && value2 !== null) {
    return Object.fromEntries(Object.entries(value2).map(([k, v]) => [k, cloneDeep(v)]));
  }
  return value2;
}

// node_modules/tailwindcss/src/util/resolveConfig.js
function isFunction(input) {
  return typeof input === "function";
}
function mergeWith(target, ...sources) {
  let customizer = sources.pop();
  for (let source of sources) {
    for (let k in source) {
      let merged = customizer(target[k], source[k]);
      if (merged === void 0) {
        if (isPlainObject(target[k]) && isPlainObject(source[k])) {
          target[k] = mergeWith({}, target[k], source[k], customizer);
        } else {
          target[k] = source[k];
        }
      } else {
        target[k] = merged;
      }
    }
  }
  return target;
}
var configUtils = {
  colors: colors_default,
  negative(scale) {
    return Object.keys(scale).filter((key) => scale[key] !== "0").reduce((negativeScale, key) => {
      let negativeValue = negateValue(scale[key]);
      if (negativeValue !== void 0) {
        negativeScale[`-${key}`] = negativeValue;
      }
      return negativeScale;
    }, {});
  },
  breakpoints(screens) {
    return Object.keys(screens).filter((key) => typeof screens[key] === "string").reduce(
      (breakpoints, key) => ({
        ...breakpoints,
        [`screen-${key}`]: screens[key]
      }),
      {}
    );
  }
};
function value(valueToResolve, ...args) {
  return isFunction(valueToResolve) ? valueToResolve(...args) : valueToResolve;
}
function collectExtends(items) {
  return items.reduce((merged, { extend }) => {
    return mergeWith(merged, extend, (mergedValue, extendValue) => {
      if (mergedValue === void 0) {
        return [extendValue];
      }
      if (Array.isArray(mergedValue)) {
        return [extendValue, ...mergedValue];
      }
      return [extendValue, mergedValue];
    });
  }, {});
}
function mergeThemes(themes) {
  return {
    ...themes.reduce((merged, theme) => defaults2(merged, theme), {}),
    extend: collectExtends(themes)
  };
}
function mergeExtensionCustomizer(merged, value2) {
  if (Array.isArray(merged) && isPlainObject(merged[0])) {
    return merged.concat(value2);
  }
  if (Array.isArray(value2) && isPlainObject(value2[0]) && isPlainObject(merged)) {
    return [merged, ...value2];
  }
  if (Array.isArray(value2)) {
    return value2;
  }
  return void 0;
}
function mergeExtensions({ extend, ...theme }) {
  return mergeWith(theme, extend, (themeValue, extensions) => {
    if (!isFunction(themeValue) && !extensions.some(isFunction)) {
      return mergeWith({}, themeValue, ...extensions, mergeExtensionCustomizer);
    }
    return (resolveThemePath, utils) => mergeWith(
      {},
      ...[themeValue, ...extensions].map((e) => value(e, resolveThemePath, utils)),
      mergeExtensionCustomizer
    );
  });
}
function* toPaths2(key) {
  let path = toPath(key);
  if (path.length === 0) {
    return;
  }
  yield path;
  if (Array.isArray(key)) {
    return;
  }
  let pattern2 = /^(.*?)\s*\/\s*([^/]+)$/;
  let matches = key.match(pattern2);
  if (matches !== null) {
    let [, prefix3, alpha] = matches;
    let newPath = toPath(prefix3);
    newPath.alpha = alpha;
    yield newPath;
  }
}
function resolveFunctionKeys(object) {
  const resolvePath2 = (key, defaultValue) => {
    for (const path of toPaths2(key)) {
      let index = 0;
      let val = object;
      while (val !== void 0 && val !== null && index < path.length) {
        val = val[path[index++]];
        let shouldResolveAsFn = isFunction(val) && (path.alpha === void 0 || index <= path.length - 1);
        val = shouldResolveAsFn ? val(resolvePath2, configUtils) : val;
      }
      if (val !== void 0) {
        if (path.alpha !== void 0) {
          let normalized = parseColorFormat(val);
          return withAlphaValue(normalized, path.alpha, toColorValue(normalized));
        }
        if (isPlainObject(val)) {
          return cloneDeep(val);
        }
        return val;
      }
    }
    return defaultValue;
  };
  Object.assign(resolvePath2, {
    theme: resolvePath2,
    ...configUtils
  });
  return Object.keys(object).reduce((resolved, key) => {
    resolved[key] = isFunction(object[key]) ? object[key](resolvePath2, configUtils) : object[key];
    return resolved;
  }, {});
}
function extractPluginConfigs(configs) {
  let allConfigs = [];
  configs.forEach((config) => {
    allConfigs = [...allConfigs, config];
    const plugins = config?.plugins ?? [];
    if (plugins.length === 0) {
      return;
    }
    plugins.forEach((plugin) => {
      if (plugin.__isOptionsFunction) {
        plugin = plugin();
      }
      allConfigs = [...allConfigs, ...extractPluginConfigs([plugin?.config ?? {}])];
    });
  });
  return allConfigs;
}
function resolveCorePlugins(corePluginConfigs) {
  const result = [...corePluginConfigs].reduceRight((resolved, corePluginConfig) => {
    if (isFunction(corePluginConfig)) {
      return corePluginConfig({ corePlugins: resolved });
    }
    return configurePlugins_default(corePluginConfig, resolved);
  }, corePluginList_default);
  return result;
}
function resolvePluginLists(pluginLists) {
  const result = [...pluginLists].reduceRight((resolved, pluginList) => {
    return [...resolved, ...pluginList];
  }, []);
  return result;
}
function resolveConfig(configs) {
  let allConfigs = [
    ...extractPluginConfigs(configs),
    {
      prefix: "",
      important: false,
      separator: ":"
    }
  ];
  return normalizeConfig(
    defaults2(
      {
        theme: resolveFunctionKeys(
          mergeExtensions(mergeThemes(allConfigs.map((t) => t?.theme ?? {})))
        ),
        corePlugins: resolveCorePlugins(allConfigs.map((c) => c.corePlugins)),
        plugins: resolvePluginLists(configs.map((c) => c?.plugins ?? []))
      },
      ...allConfigs
    )
  );
}

// node_modules/tailwindcss/src/util/getAllConfigs.js
var import_config_full = __toESM(require_config_full());
function getAllConfigs(config) {
  const configs = (config?.presets ?? [import_config_full.default]).slice().reverse().flatMap((preset) => getAllConfigs(preset instanceof Function ? preset() : preset));
  const features = {
    respectDefaultRingColorOpacity: {
      theme: {
        ringColor: ({ theme }) => ({
          DEFAULT: "#3b82f67f",
          ...theme("colors")
        })
      }
    },
    disableColorOpacityUtilitiesByDefault: {
      corePlugins: {
        backgroundOpacity: false,
        borderOpacity: false,
        divideOpacity: false,
        placeholderOpacity: false,
        ringOpacity: false,
        textOpacity: false
      }
    }
  };
  const experimentals = Object.keys(features).filter((feature) => flagEnabled(config, feature)).map((feature) => features[feature]);
  return [config, ...experimentals, ...configs];
}

// node_modules/tailwindcss/src/public/resolve-config.js
function resolveConfig2(...configs) {
  let [, ...defaultConfigs] = getAllConfigs(configs[0]);
  return resolveConfig([...configs, ...defaultConfigs]);
}

// src/index.ts
var createTailwindcss = ({ tailwindConfig } = {}) => {
  let currentTailwindConfig = tailwindConfig;
  return {
    setTailwindConfig(newTailwindConfig) {
      currentTailwindConfig = newTailwindConfig;
    },
    async generateStylesFromContent(css, content) {
      const tailwindcssPlugin = createTailwindcssPlugin({ tailwindConfig: currentTailwindConfig, content });
      const processor = postcss8([tailwindcssPlugin]);
      const result = await processor.process(css, { from: void 0 });
      return result.css;
    }
  };
};
var createTailwindcssPlugin = ({ tailwindConfig, content: contentCollection }) => {
  const config = resolveConfig2(tailwindConfig ?? {});
  const tailwindcssPlugin = processTailwindFeatures(
    (processOptions) => () => processOptions.createContext(
      config,
      contentCollection.map((content) => typeof content === "string" ? { content } : content)
    )
  );
  return tailwindcssPlugin;
};
var jitBrowserTailwindcss = (tailwindMainCss, jitContent, userTailwindConfig = {}) => {
  const tailwindcss = createTailwindcss({ tailwindConfig: userTailwindConfig });
  return tailwindcss.generateStylesFromContent(tailwindMainCss, [jitContent]);
};
var src_default = jitBrowserTailwindcss;
export {
  createTailwindcss,
  createTailwindcssPlugin,
  src_default as default,
  jitBrowserTailwindcss
};
//# sourceMappingURL=module.esm.js.map
