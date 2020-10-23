/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/worker.js":
/*!***********************!*\
  !*** ./src/worker.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from ./node_modules/babel-loader/lib/index.js):\\nSyntaxError: C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\src\\\\worker.js: Unexpected token (298:3)\\n\\n\\u001b[0m \\u001b[90m 296 | \\u001b[39m \\trotate\\u001b[33m:\\u001b[39m rotat\\u001b[33m,\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 297 | \\u001b[39m    union\\u001b[33m:\\u001b[39munon\\u001b[0m\\n\\u001b[0m\\u001b[31m\\u001b[1m>\\u001b[22m\\u001b[39m\\u001b[90m 298 | \\u001b[39m})\\u001b[33m;\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m     | \\u001b[39m   \\u001b[31m\\u001b[1m^\\u001b[22m\\u001b[39m\\u001b[0m\\n    at Parser._raise (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:766:17)\\n    at Parser.raiseWithData (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:759:17)\\n    at Parser.raise (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:753:17)\\n    at Parser.unexpected (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:8966:16)\\n    at Parser.parseExprAtom (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10282:20)\\n    at Parser.parseExprSubscripts (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9844:23)\\n    at Parser.parseUpdate (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9824:21)\\n    at Parser.parseMaybeUnary (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9813:17)\\n    at Parser.parseExprOps (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9683:23)\\n    at Parser.parseMaybeConditional (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9657:23)\\n    at Parser.parseMaybeAssign (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9620:21)\\n    at Parser.parseExpressionBase (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9564:23)\\n    at C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9558:39\\n    at Parser.allowInAnd (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11297:16)\\n    at Parser.parseExpression (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9558:17)\\n    at Parser.parseStatementContent (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11562:23)\\n    at Parser.parseStatement (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11431:17)\\n    at Parser.parseBlockOrModuleBlockBody (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12013:25)\\n    at Parser.parseBlockBody (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11999:10)\\n    at Parser.parseBlock (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11983:10)\\n    at Parser.parseFunctionBody (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10963:24)\\n    at Parser.parseFunctionBodyAndFinish (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10946:10)\\n    at C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12153:12\\n    at Parser.withTopicForbiddingContext (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11272:14)\\n    at Parser.parseFunction (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12152:10)\\n    at Parser.parseFunctionStatement (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11779:17)\\n    at Parser.parseStatementContent (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11469:21)\\n    at Parser.parseStatement (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11431:17)\\n    at Parser.parseBlockOrModuleBlockBody (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12013:25)\\n    at Parser.parseBlockBody (C:\\\\Users\\\\Bar\\\\Documents\\\\GitHub\\\\JSCAD-worker\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11999:10)\");\n\n//# sourceURL=webpack:///./src/worker.js?");

/***/ })

/******/ });