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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/flowDraw.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/flowDraw.js":
/*!*************************!*\
  !*** ./src/flowDraw.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _menu = __webpack_require__(/*! ./js/menu */ "./src/js/menu.js");

var _menu2 = _interopRequireDefault(_menu);

var _globalvariables = __webpack_require__(/*! ./js/globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

var _molecule = __webpack_require__(/*! ./js/molecules/molecule.js */ "./src/js/molecules/molecule.js");

var _molecule2 = _interopRequireDefault(_molecule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_globalvariables2.default.canvas = document.querySelector('canvas');
_globalvariables2.default.c = _globalvariables2.default.canvas.getContext('2d');

_globalvariables2.default.canvas.width = innerWidth;
_globalvariables2.default.canvas.height = innerHeight / 2;

var lowerHalfOfScreen = document.querySelector('.flex-parent');
lowerHalfOfScreen.setAttribute("style", "height:" + innerHeight / 2.1 + "px");

// Event Listeners
var flowCanvas = document.getElementById('flow-canvas');
flowCanvas.addEventListener('contextmenu', _menu2.default.showmenu); //redirect right clicks to show the menu

flowCanvas.addEventListener('mousemove', function (event) {
    _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.clickMove(event.clientX, event.clientY);
    });
});

window.addEventListener('resize', function (event) {

    console.log("resize");

    var bounds = _globalvariables2.default.canvas.getBoundingClientRect();
    _globalvariables2.default.canvas.width = bounds.width;
    _globalvariables2.default.canvas.height = bounds.height;
});

flowCanvas.addEventListener('mousedown', function (event) {
    //every time the mouse button goes down

    var clickHandledByMolecule = false;

    _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        if (molecule.clickDown(event.clientX, event.clientY) == true) {
            clickHandledByMolecule = true;
        }
    });

    if (!clickHandledByMolecule) {
        _globalvariables2.default.currentMolecule.backgroundClick();
    }

    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        hidemenu();
    }
});

flowCanvas.addEventListener('dblclick', function (event) {
    //every time the mouse button goes down

    var clickHandledByMolecule = false;

    _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        if (molecule.doubleClick(event.clientX, event.clientY) == true) {
            clickHandledByMolecule = true;
        }
    });

    if (clickHandledByMolecule == false) {
        showmenu(event);
    }
});

flowCanvas.addEventListener('mouseup', function (event) {
    //every time the mouse button goes up
    _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.clickUp(event.clientX, event.clientY);
    });
});

window.addEventListener('keydown', function (event) {
    //every time the mouse button goes up

    _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.keyPress(event.key);
    });
});

// Implementation

function init() {
    _globalvariables2.default.currentMolecule = new _molecule2.default({
        x: 0,
        y: 0,
        topLevel: true,
        name: "Maslow Create",
        atomType: "Molecule",
        uniqueID: generateUniqueID()
    });
}

function generateUniqueID() {
    return Math.floor(Math.random() * 900000) + 100000;
}

function distBetweenPoints(x1, x2, y1, y2) {
    var a2 = Math.pow(x1 - x2, 2);
    var b2 = Math.pow(y1 - y2, 2);
    var dist = Math.sqrt(a2 + b2);

    return dist;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    _globalvariables2.default.c.clearRect(0, 0, _globalvariables2.default.canvas.width, _globalvariables2.default.canvas.height);

    _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.update();
    });
}

init();
animate();

/***/ }),

/***/ "./src/js/globalvariables.js":
/*!***********************************!*\
  !*** ./src/js/globalvariables.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _circle = __webpack_require__(/*! ./molecules/circle.js */ "./src/js/molecules/circle.js");

var _circle2 = _interopRequireDefault(_circle);

var _rectangle = __webpack_require__(/*! ./molecules/rectangle.js */ "./src/js/molecules/rectangle.js");

var _rectangle2 = _interopRequireDefault(_rectangle);

var _shrinkwrap = __webpack_require__(/*! ./molecules/shrinkwrap.js */ "./src/js/molecules/shrinkwrap.js");

var _shrinkwrap2 = _interopRequireDefault(_shrinkwrap);

var _translate = __webpack_require__(/*! ./molecules/translate.js */ "./src/js/molecules/translate.js");

var _translate2 = _interopRequireDefault(_translate);

var _regularpolygon = __webpack_require__(/*! ./molecules/regularpolygon.js */ "./src/js/molecules/regularpolygon.js");

var _regularpolygon2 = _interopRequireDefault(_regularpolygon);

var _extrude = __webpack_require__(/*! ./molecules/extrude.js */ "./src/js/molecules/extrude.js");

var _extrude2 = _interopRequireDefault(_extrude);

var _scale = __webpack_require__(/*! ./molecules/scale.js */ "./src/js/molecules/scale.js");

var _scale2 = _interopRequireDefault(_scale);

var _union = __webpack_require__(/*! ./molecules/union.js */ "./src/js/molecules/union.js");

var _union2 = _interopRequireDefault(_union);

var _intersection = __webpack_require__(/*! ./molecules/intersection.js */ "./src/js/molecules/intersection.js");

var _intersection2 = _interopRequireDefault(_intersection);

var _difference = __webpack_require__(/*! ./molecules/difference.js */ "./src/js/molecules/difference.js");

var _difference2 = _interopRequireDefault(_difference);

var _constant = __webpack_require__(/*! ./molecules/constant.js */ "./src/js/molecules/constant.js");

var _constant2 = _interopRequireDefault(_constant);

var _equation = __webpack_require__(/*! ./molecules/equation.js */ "./src/js/molecules/equation.js");

var _equation2 = _interopRequireDefault(_equation);

var _molecule = __webpack_require__(/*! ./molecules/molecule.js */ "./src/js/molecules/molecule.js");

var _molecule2 = _interopRequireDefault(_molecule);

var _input = __webpack_require__(/*! ./molecules/input.js */ "./src/js/molecules/input.js");

var _input2 = _interopRequireDefault(_input);

var _readme = __webpack_require__(/*! ./molecules/readme.js */ "./src/js/molecules/readme.js");

var _readme2 = _interopRequireDefault(_readme);

var _rotate = __webpack_require__(/*! ./molecules/rotate.js */ "./src/js/molecules/rotate.js");

var _rotate2 = _interopRequireDefault(_rotate);

var _mirror = __webpack_require__(/*! ./molecules/mirror.js */ "./src/js/molecules/mirror.js");

var _mirror2 = _interopRequireDefault(_mirror);

var _githubmolecule = __webpack_require__(/*! ./molecules/githubmolecule.js */ "./src/js/molecules/githubmolecule.js");

var _githubmolecule2 = _interopRequireDefault(_githubmolecule);

var _output = __webpack_require__(/*! ./molecules/output.js */ "./src/js/molecules/output.js");

var _output2 = _interopRequireDefault(_output);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlobalVariables = function GlobalVariables() {
    _classCallCheck(this, GlobalVariables);

    this.canvas = null;
    this.c = null;

    this.availableTypes = {
        circle: { creator: _circle2.default, atomType: "Circle" },
        rectangle: { creator: _rectangle2.default, atomType: "Rectangle" },
        shirinkwrap: { creator: _shrinkwrap2.default, atomType: "ShrinkWrap" },
        translate: { creator: _translate2.default, atomType: "Translate" },
        regularPolygon: { creator: _regularpolygon2.default, atomType: "RegularPolygon" },
        extrude: { creator: _extrude2.default, atomType: "Extrude" },
        scale: { creator: _scale2.default, atomType: "Scale" },
        intersection: { creator: _intersection2.default, atomType: "Intersection" },
        difference: { creator: _difference2.default, atomType: "Difference" },
        costant: { creator: _constant2.default, atomType: "Constant" },
        equation: { creator: _equation2.default, atomType: "Equation" },
        molecule: { creator: _molecule2.default, atomType: "Molecule" },
        input: { creator: _input2.default, atomType: "Input" },
        readme: { creator: _readme2.default, atomType: "Readme" },
        rotate: { creator: _rotate2.default, atomType: "Rotate" },
        mirror: { creator: _mirror2.default, atomType: "Mirror" },
        githubmolecule: { creator: _githubmolecule2.default, atomType: "GitHubMolecule" },
        union: { creator: _union2.default, atomType: "Union" }
    };

    this.secretTypes = {
        output: { creator: _output2.default, atomType: "Output" }
    };

    this.currentMolecule;
    this.topLevelMolecule;

    this.sideBar = document.querySelector('.sideBar');
};

exports.default = GlobalVariables;

/***/ }),

/***/ "./src/js/menu.js":
/*!************************!*\
  !*** ./src/js/menu.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _globalvariables = __webpack_require__(/*! ./globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Menu = function () {
    function Menu() {
        _classCallCheck(this, Menu);

        this.menu = document.querySelector('.menu');
        this.menu.classList.add('off');
        this.menuList = document.getElementById("menuList");

        //Add the search bar to the list item

        for (var key in _globalvariables2.default.availableTypes) {
            var newElement = document.createElement("LI");
            var instance = _globalvariables2.default.availableTypes[key];
            var text = document.createTextNode(instance.atomType);
            newElement.setAttribute("class", "menu-item");
            newElement.setAttribute("id", instance.atomType);
            newElement.appendChild(text);
            menuList.appendChild(newElement);

            document.getElementById(instance.atomType).addEventListener('click', placeNewNode);
        }
    }

    _createClass(Menu, [{
        key: 'placeNewNode',
        value: function placeNewNode(ev) {
            hidemenu();
            var clr = ev.target.id;

            currentMolecule.placeAtom({
                x: menu.x,
                y: menu.y,
                parent: currentMolecule,
                atomType: clr,
                uniqueID: generateUniqueID()
            }, null, availableTypes); //null indicates that there is nothing to load from the molecule list for this one
        }
    }, {
        key: 'placeGitHubMolecule',
        value: function placeGitHubMolecule(ev) {
            hidemenu();
            var clr = ev.target.id;

            currentMolecule.placeAtom({
                x: menu.x,
                y: menu.y,
                parent: currentMolecule,
                atomType: "GitHubMolecule",
                projectID: clr,
                uniqueID: generateUniqueID()
            }, null, availableTypes); //null indicates that there is nothing to load from the molecule list for this one
        }
    }, {
        key: 'showmenu',
        value: function showmenu(ev) {
            //Open the default tab
            document.getElementById("localTab").click();

            //stop the real right click menu
            ev.preventDefault();

            //make sure all elements are unhidden
            ul = document.getElementById("menuList");
            li = ul.getElementsByTagName('li');
            for (i = 0; i < li.length; i++) {
                li[i].style.display = "none"; //set each item to not display
            }

            //show the menu
            menu.style.top = ev.clientY - 20 + 'px';
            menu.style.left = ev.clientX - 20 + 'px';
            menu.x = ev.clientX;
            menu.y = ev.clientY;
            menu.classList.remove('off');

            document.getElementById('menuInput').focus();
        }
    }, {
        key: 'hidemenu',
        value: function hidemenu(ev) {
            menu.classList.add('off');
            menu.style.top = '-200%';
            menu.style.left = '-200%';
        }
    }, {
        key: 'searchMenu',
        value: function searchMenu(evt) {

            if (document.getElementsByClassName("tablinks active")[0].id == "localTab") {
                //We are searching the local tab
                // Declare variables
                var input, filter, ul, li, a, i, txtValue;
                input = document.getElementById('menuInput');
                filter = input.value.toUpperCase();
                ul = document.getElementById("menuList");
                li = ul.getElementsByTagName('li');

                // Loop through all list items, and hide those who don't match the search query
                for (i = 0; i < li.length; i++) {
                    a = li[i]; //this is the link part of the list item
                    txtValue = a.textContent || a.innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        //if the entered string matches
                        li[i].style.display = "";
                    } else {
                        li[i].style.display = "none";
                    }

                    //If enter was just pressed "click" the first element that is being displayed
                    if (evt.code == "Enter" && li[i].style.display != "none") {
                        li[i].click();
                        return;
                    }
                }
            } else {
                //We are searching on github
                if (evt.code == "Enter") {
                    input = document.getElementById('menuInput').value;

                    githubList = document.getElementById("githubList");

                    oldResults = document.getElementsByClassName("menu-item");
                    for (i = 0; i < oldResults.length; i++) {
                        oldResults[i].style.display = "none";
                    }

                    octokit.search.repos({
                        q: input,
                        sort: "stars",
                        per_page: 100,
                        topic: "maslowcreate-molecule",
                        page: 1,
                        headers: {
                            accept: 'application/vnd.github.mercy-preview+json'
                        }
                    }).then(function (result) {
                        result.data.items.forEach(function (item) {
                            if (item.topics.includes("maslowcreate-molecule")) {

                                var newElement = document.createElement("LI");
                                var text = document.createTextNode(item.name);
                                newElement.setAttribute("class", "menu-item");
                                newElement.setAttribute("id", item.id);
                                newElement.appendChild(text);
                                githubList.appendChild(newElement);

                                document.getElementById(item.id).addEventListener('click', placeGitHubMolecule);
                            }
                        });
                    });
                }
            }
        }
    }, {
        key: 'openTab',
        value: function openTab(evt, tabName) {
            // Declare all variables
            var i, tabcontent, tablinks;

            // Get all elements with class="tabcontent" and hide them
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }

            // Get all elements with class="tablinks" and remove the class "active"
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }

            // Show the current tab, and add an "active" class to the button that opened the tab
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }
    }]);

    return Menu;
}();

exports.default = Menu;

/***/ }),

/***/ "./src/js/molecules/circle.js":
/*!************************************!*\
  !*** ./src/js/molecules/circle.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = function (_Atom) {
    _inherits(Circle, _Atom);

    function Circle(values) {
        _classCallCheck(this, Circle);

        var _this = _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, values));

        _this.name = "Circle";
        _this.atomType = "Circle";
        _this.defaultCodeBlock = "circle({r: ~radius~, center: true, fn: 25})";
        _this.codeBlock = "";

        _this.addIO("input", "radius", _this, "number", 10);
        _this.addIO("input", "max segment size", _this, "number", 4);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.setValues(values);

        //generate the correct codeblock for this atom on creation
        _this.updateCodeBlock();
        return _this;
    }

    _createClass(Circle, [{
        key: "updateCodeBlock",
        value: function updateCodeBlock() {
            //Overwrite the normal update code block to update the number of segments also

            var maximumSegmentSize = this.findIOValue("max segment size");
            var circumference = 3.14 * 2 * this.findIOValue("radius");

            var numberOfSegments = parseInt(circumference / maximumSegmentSize);

            var regex = /fn: (\d+)\}/gi;
            this.defaultCodeBlock = this.defaultCodeBlock.replace(regex, "fn: " + numberOfSegments + "}");

            _get(Circle.prototype.__proto__ || Object.getPrototypeOf(Circle.prototype), "updateCodeBlock", this).call(this);
        }
    }]);

    return Circle;
}(_atom2.default);

exports.default = Circle;

/***/ }),

/***/ "./src/js/molecules/constant.js":
/*!**************************************!*\
  !*** ./src/js/molecules/constant.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Constant = function (_Atom) {
    _inherits(Constant, _Atom);

    function Constant(values) {
        _classCallCheck(this, Constant);

        var _this = _possibleConstructorReturn(this, (Constant.__proto__ || Object.getPrototypeOf(Constant)).call(this, values));

        _this.codeBlock = "";
        _this.type = "constant";
        _this.name = "Constant";
        _this.atomType = "Constant";
        _this.height = 16;
        _this.radius = 15;

        _this.setValues(values);

        _this.addIO("output", "number", _this, "number", 10);

        if (typeof _this.ioValues !== 'undefined') {
            _this.ioValues.forEach(function (ioValue) {
                //for each saved value
                _this.children.forEach(function (io) {
                    //Find the matching IO and set it to be the saved value
                    if (ioValue.name == io.name) {
                        io.setValue(ioValue.ioValue);
                    }
                });
            });
        }
        return _this;
    }

    _createClass(Constant, [{
        key: "updateSidebar",
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            var valueList = _get(Constant.prototype.__proto__ || Object.getPrototypeOf(Constant.prototype), "updateSidebar", this).call(this); //call the super function

            var output = this.children[0];

            this.createEditableValueListItem(valueList, output, "value", "Value", true);
            this.createEditableValueListItem(valueList, this, "name", "Name", false);
        }
    }, {
        key: "setValue",
        value: function setValue(newName) {
            //Called by the sidebar to set the name
            this.name = newName;
        }
    }, {
        key: "serialize",
        value: function serialize(values) {
            //Save the IO value to the serial stream
            var valuesObj = _get(Constant.prototype.__proto__ || Object.getPrototypeOf(Constant.prototype), "serialize", this).call(this, values);

            valuesObj.ioValues = [{
                name: "number",
                ioValue: this.children[0].getValue()
            }];

            return valuesObj;
        }
    }, {
        key: "draw",
        value: function draw() {

            this.children.forEach(function (child) {
                child.draw();
            });

            c.beginPath();
            c.fillStyle = this.color;
            c.rect(this.x - this.radius, this.y - this.height / 2, 2 * this.radius, this.height);
            c.textAlign = "start";
            c.fillText(this.name, this.x + this.radius, this.y - this.radius);
            c.fill();
            c.closePath();
        }
    }]);

    return Constant;
}(_atom2.default);

exports.default = Constant;

/***/ }),

/***/ "./src/js/molecules/difference.js":
/*!****************************************!*\
  !*** ./src/js/molecules/difference.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Difference = function (_Atom) {
    _inherits(Difference, _Atom);

    function Difference(values) {
        _classCallCheck(this, Difference);

        var _this = _possibleConstructorReturn(this, (Difference.__proto__ || Object.getPrototypeOf(Difference)).call(this, values));

        _this.addIO("input", "geometry1", _this, "geometry", "");
        _this.addIO("input", "geometry2", _this, "geometry", "");
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Difference";
        _this.atomType = "Difference";
        _this.defaultCodeBlock = "difference(~geometry1~,~geometry2~)";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Difference;
}(_atom2.default);

exports.default = Difference;

/***/ }),

/***/ "./src/js/molecules/equation.js":
/*!**************************************!*\
  !*** ./src/js/molecules/equation.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Equation = function (_Atom) {
    _inherits(Equation, _Atom);

    function Equation(values) {
        _classCallCheck(this, Equation);

        var _this = _possibleConstructorReturn(this, (Equation.__proto__ || Object.getPrototypeOf(Equation)).call(this, values));

        _this.addIO("input", "x", _this, "number", 0);
        _this.addIO("input", "y", _this, "number", 0);
        _this.addIO("output", "z", _this, "number", 0);

        _this.name = "Equation";
        _this.atomType = "Equation";
        _this.defaultCodeBlock = "";
        _this.codeBlock = "";
        _this.equationOptions = ["x+y", "x-y", "x*y", "x/y", "cos(x)", "sin(x)", "x^y"];
        _this.currentEquation = 0;

        _this.setValues(values);

        return _this;
    }

    _createClass(Equation, [{
        key: "serialize",
        value: function serialize(savedObject) {
            var superSerialObject = _get(Equation.prototype.__proto__ || Object.getPrototypeOf(Equation.prototype), "serialize", this).call(this, null);

            //Write the current equation to the serialized object
            superSerialObject.currentEquation = this.currentEquation;

            return superSerialObject;
        }
    }, {
        key: "updateCodeBlock",
        value: function updateCodeBlock() {
            //A super classed version of the update codeblock default function which computes the equation values
            var x = this.findIOValue("x");
            var y = this.findIOValue("y");

            var z;
            switch (this.currentEquation) {
                case 0:
                    z = x + y;
                    break;
                case 1:
                    z = x - y;
                    break;
                case 2:
                    z = x * y;
                    break;
                case 3:
                    z = x / y;
                    break;
                case 4:
                    z = Math.cos(x);
                    break;
                case 5:
                    z = Math.sin(x);
                    break;
                case 6:
                    z = Math.pow(x, y);
                    break;
                default:
                    console.log("no options found");
                    console.log(this.currentEquation);
            }

            //Set the output to be the generated value
            this.children.forEach(function (child) {
                if (child.type == 'output') {
                    child.setValue(z);
                }
            });
        }
    }, {
        key: "changeEquation",
        value: function changeEquation(newValue) {
            this.currentEquation = parseInt(newValue);
            this.updateCodeBlock();
        }
    }, {
        key: "updateSidebar",
        value: function updateSidebar() {
            //Update the side bar to make it possible to change the molecule name

            var valueList = _get(Equation.prototype.__proto__ || Object.getPrototypeOf(Equation.prototype), "updateSidebar", this).call(this);

            this.createDropDown(valueList, this, this.equationOptions, this.currentEquation, "z = ");
        }
    }]);

    return Equation;
}(_atom2.default);

exports.default = Equation;

/***/ }),

/***/ "./src/js/molecules/extrude.js":
/*!*************************************!*\
  !*** ./src/js/molecules/extrude.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Extrude = function (_Atom) {
    _inherits(Extrude, _Atom);

    function Extrude(values) {
        _classCallCheck(this, Extrude);

        var _this = _possibleConstructorReturn(this, (Extrude.__proto__ || Object.getPrototypeOf(Extrude)).call(this, values));

        _this.name = "Extrude";
        _this.atomType = "Extrude";
        _this.defaultCodeBlock = "linear_extrude({ height: ~height~ }, ~geometry~)";
        _this.codeBlock = "";

        _this.addIO("input", "geometry", _this, "geometry", "");
        _this.addIO("input", "height", _this, "number", 10);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.setValues(values);
        return _this;
    }

    return Extrude;
}(_atom2.default);

exports.default = Extrude;

/***/ }),

/***/ "./src/js/molecules/githubmolecule.js":
/*!********************************************!*\
  !*** ./src/js/molecules/githubmolecule.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _molecule = __webpack_require__(/*! ../molecules/molecule */ "./src/js/molecules/molecule.js");

var _molecule2 = _interopRequireDefault(_molecule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GitHubMolecule = function (_Molecule) {
    _inherits(GitHubMolecule, _Molecule);

    function GitHubMolecule(values) {
        _classCallCheck(this, GitHubMolecule);

        var _this = _possibleConstructorReturn(this, (GitHubMolecule.__proto__ || Object.getPrototypeOf(GitHubMolecule)).call(this, values));

        _this.name = "Github Molecule";
        _this.atomType = "GitHubMolecule";
        _this.topLevel = false; //a flag to signal if this node is the top level node
        _this.centerColor = "black";
        _this.projectID = 174292302;

        _this.setValues(values);

        _this.loadProjectByID(_this.projectID);

        return _this;
    }

    _createClass(GitHubMolecule, [{
        key: "doubleClick",
        value: function doubleClick(x, y) {
            //Prevent you from being able to double click into a github molecule

            var clickProcessed = false;

            var distFromClick = distBetweenPoints(x, this.x, y, this.y);

            if (distFromClick < this.radius) {
                clickProcessed = true;
            }

            return clickProcessed;
        }
    }, {
        key: "loadProjectByID",
        value: function loadProjectByID(id) {
            var _this2 = this;

            //Get the repo by ID
            octokit.request('GET /repositories/:id', { id: id }).then(function (result) {

                //Find out the owners info;

                var user = result.data.owner.login;
                var repoName = result.data.name;

                //Get the file contents

                octokit.repos.getContents({
                    owner: user,
                    repo: repoName,
                    path: 'project.maslowcreate'
                }).then(function (result) {

                    //content will be base64 encoded
                    var rawFile = atob(result.data.content);
                    var moleculesList = JSON.parse(rawFile).molecules;

                    _this2.deserialize(moleculesList, moleculesList.filter(function (molecule) {
                        return molecule.topLevel == true;
                    })[0].uniqueID);

                    _this2.topLevel = false;

                    //Try to re-establish the connectors in the parent molecule to get the ones that were missed before when this molecule had not yet been fully loaded
                    _this2.parent.savedConnectors.forEach(function (connector) {
                        _this2.parent.placeConnector(JSON.parse(connector));
                    });
                });
            });
        }
    }, {
        key: "serialize",
        value: function serialize(savedObject) {

            //Return a placeholder for this molecule
            var object = {
                atomType: this.atomType,
                name: this.name,
                x: this.x,
                y: this.y,
                uniqueID: this.uniqueID,
                projectID: this.projectID
            };

            return object;
        }
    }, {
        key: "updateSidebar",
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            //remove everything in the sideBar now
            while (sideBar.firstChild) {
                sideBar.removeChild(sideBar.firstChild);
            }

            //add the name as a title
            var name = document.createElement('h1');
            name.textContent = this.name;
            name.setAttribute("style", "text-align:center;");
            sideBar.appendChild(name);
        }
    }]);

    return GitHubMolecule;
}(_molecule2.default);

exports.default = GitHubMolecule;

/***/ }),

/***/ "./src/js/molecules/input.js":
/*!***********************************!*\
  !*** ./src/js/molecules/input.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Input = function (_Atom) {
    _inherits(Input, _Atom);

    function Input(values) {
        _classCallCheck(this, Input);

        var _this = _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).call(this, values));

        _this.name = "Input" + generateUniqueID();
        _this.codeBlock = "";
        _this.type = "input";
        _this.atomType = "Input";
        _this.height = 16;
        _this.radius = 15;

        _this.setValues(values);

        _this.addIO("output", "number or geometry", _this, "geometry", "");

        //Add a new input to the current molecule
        if (typeof _this.parent !== 'undefined') {
            _this.parent.addIO("input", _this.name, _this.parent, "geometry", "");
        }
        return _this;
    }

    _createClass(Input, [{
        key: "updateSidebar",
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            var valueList = _get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "updateSidebar", this).call(this); //call the super function

            this.createEditableValueListItem(valueList, this, "name", "Name", false);
        }
    }, {
        key: "draw",
        value: function draw() {

            this.children.forEach(function (child) {
                child.draw();
            });

            c.fillStyle = this.color;

            c.textAlign = "start";
            c.fillText(this.name, this.x + this.radius, this.y - this.radius);

            c.beginPath();
            c.moveTo(this.x - this.radius, this.y - this.height / 2);
            c.lineTo(this.x - this.radius + 10, this.y);
            c.lineTo(this.x - this.radius, this.y + this.height / 2);
            c.lineTo(this.x + this.radius, this.y + this.height / 2);
            c.lineTo(this.x + this.radius, this.y - this.height / 2);
            c.fill();
            c.closePath();
        }
    }, {
        key: "deleteNode",
        value: function deleteNode() {

            //Remove this input from the parent molecule
            if (typeof this.parent !== 'undefined') {
                this.parent.removeIO("input", this.name, this.parent);
            }

            _get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "deleteNode", this).call(this);
        }
    }, {
        key: "setValue",
        value: function setValue(theNewName) {
            var _this2 = this;

            //Called by the sidebar to set the name

            //Run through the parent molecule and find the input with the same name
            this.parent.children.forEach(function (child) {
                if (child.name == _this2.name) {
                    _this2.name = theNewName;
                    child.name = theNewName;
                }
            });
        }
    }, {
        key: "setOutput",
        value: function setOutput(newOutput) {
            //Set the input's output

            this.codeBlock = newOutput; //Set the code block so that clicking on the input previews what it is 

            //Set the output nodes with type 'geometry' to be the new value
            this.children.forEach(function (child) {
                if (child.valueType == 'geometry' && child.type == 'output') {
                    child.setValue(newOutput);
                }
            });
        }
    }, {
        key: "updateCodeBlock",
        value: function updateCodeBlock() {
            //This empty function handles any calls to the normal update code block function which breaks things here
        }
    }]);

    return Input;
}(_atom2.default);

exports.default = Input;

/***/ }),

/***/ "./src/js/molecules/intersection.js":
/*!******************************************!*\
  !*** ./src/js/molecules/intersection.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Intersection = function (_Atom) {
    _inherits(Intersection, _Atom);

    function Intersection(values) {
        _classCallCheck(this, Intersection);

        var _this = _possibleConstructorReturn(this, (Intersection.__proto__ || Object.getPrototypeOf(Intersection)).call(this, values));

        _this.addIO("input", "geometry1", _this, "geometry", "");
        _this.addIO("input", "geometry2", _this, "geometry", "");
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Intersection";
        _this.atomType = "Intersection";
        _this.defaultCodeBlock = "intersection(~geometry1~,~geometry2~)";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Intersection;
}(_atom2.default);

exports.default = Intersection;

/***/ }),

/***/ "./src/js/molecules/mirror.js":
/*!************************************!*\
  !*** ./src/js/molecules/mirror.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mirror = function (_Atom) {
    _inherits(Mirror, _Atom);

    function Mirror(values) {
        _classCallCheck(this, Mirror);

        var _this = _possibleConstructorReturn(this, (Mirror.__proto__ || Object.getPrototypeOf(Mirror)).call(this, values));

        _this.addIO("input", "geometry", _this, "geometry", "");
        _this.addIO("input", "x", _this, "number", 1);
        _this.addIO("input", "y", _this, "number", 1);
        _this.addIO("input", "z", _this, "number", 0);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Mirror";
        _this.atomType = "Mirror";
        _this.defaultCodeBlock = "mirror([~x~,~y~,~z~], ~geometry~)";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Mirror;
}(_atom2.default);

exports.default = Mirror;

/***/ }),

/***/ "./src/js/molecules/molecule.js":
/*!**************************************!*\
  !*** ./src/js/molecules/molecule.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Molecule = function (_Atom) {
    _inherits(Molecule, _Atom);

    function Molecule(values) {
        _classCallCheck(this, Molecule);

        var _this = _possibleConstructorReturn(this, (Molecule.__proto__ || Object.getPrototypeOf(Molecule)).call(this, values));

        _this.nodesOnTheScreen = [];
        _this.children = [];
        _this.name = "Molecule";
        _this.atomType = "Molecule";
        _this.centerColor = "#949294";
        _this.topLevel = false; //a flag to signal if this node is the top level node

        _this.setValues(values);

        //Add the molecule's output
        _this.placeAtom({
            parentMolecule: _this,
            x: _globalvariables2.default.canvas.width - 50,
            y: _globalvariables2.default.canvas.height / 2,
            parent: _this,
            name: "Output",
            atomType: "Output"
        }, null, _globalvariables2.default.secretTypes);

        _this.updateCodeBlock();
        return _this;
    }

    _createClass(Molecule, [{
        key: 'draw',
        value: function draw() {
            _get(Molecule.prototype.__proto__ || Object.getPrototypeOf(Molecule.prototype), 'draw', this).call(this); //Super call to draw the rest

            //draw the circle in the middle
            c.beginPath();
            c.fillStyle = this.centerColor;
            c.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2, false);
            c.closePath();
            c.fill();
        }
    }, {
        key: 'doubleClick',
        value: function doubleClick(x, y) {
            //returns true if something was done with the click


            var clickProcessed = false;

            var distFromClick = distBetweenPoints(x, this.x, y, this.y);

            if (distFromClick < this.radius) {
                _globalvariables2.default.currentMolecule = this; //set this to be the currently displayed molecule
                clickProcessed = true;
            }

            return clickProcessed;
        }
    }, {
        key: 'backgroundClick',
        value: function backgroundClick() {

            this.updateSidebar();

            //var toRender = "function main () {\n    return molecule" + this.uniqueID + ".code()\n}\n\n" + this.serialize()

            //window.loadDesign(toRender,"MaslowCreate");
        }
    }, {
        key: 'updateCodeBlock',
        value: function updateCodeBlock() {
            var _this2 = this;

            //Grab the code from the output object

            //Grab values from the inputs and push them out to the input objects
            this.children.forEach(function (child) {
                if (child.valueType == 'geometry' && child.type == 'input') {
                    _this2.nodesOnTheScreen.forEach(function (atom) {
                        if (atom.atomType == "Input" && child.name == atom.name) {
                            atom.setOutput(child.getValue());
                        }
                    });
                }
            });

            //Grab the value from the Molecule's output and set it to be the molecule's code block so that clicking on the molecule will display what it is outputting
            this.nodesOnTheScreen.forEach(function (atom) {
                if (atom.atomType == 'Output') {
                    _this2.codeBlock = atom.codeBlock;
                }
            });

            //Set the output nodes with type 'geometry' to be the generated code
            this.children.forEach(function (child) {
                if (child.valueType == 'geometry' && child.type == 'output') {
                    child.setValue(_this2.codeBlock);
                }
            });

            //If this molecule is selected, send the updated value to the renderer
            if (this.selected) {
                this.sendToRender();
            }
        }
    }, {
        key: 'updateSidebar',
        value: function updateSidebar() {
            //Update the side bar to make it possible to change the molecule name

            var valueList = _get(Molecule.prototype.__proto__ || Object.getPrototypeOf(Molecule.prototype), 'updateSidebar', this).call(this); //call the super function

            this.createEditableValueListItem(valueList, this, "name", "Name", false);

            if (!this.topLevel) {
                this.createButton(valueList, this, "Go To Parent", this.goToParentMolecule);

                this.createButton(valueList, this, "Export To GitHub", this.exportToGithub);
            } else {
                this.createButton(valueList, this, "Load A Different Project", showProjectsToLoad);
            }

            this.createBOM(valueList, this, this.BOMlist);

            return valueList;
        }
    }, {
        key: 'goToParentMolecule',
        value: function goToParentMolecule(self) {
            //Go to the parent molecule if there is one

            _globalvariables2.default.currentMolecule.updateCodeBlock();

            if (!_globalvariables2.default.currentMolecule.topLevel) {
                _globalvariables2.default.currentMolecule = _globalvariables2.default.currentMolecule.parent; //set parent this to be the currently displayed molecule
            }
        }
    }, {
        key: 'exportToGithub',
        value: function exportToGithub(self) {
            //Export this molecule to github
            exportCurrentMoleculeToGithub(self);
        }
    }, {
        key: 'replaceThisMoleculeWithGithub',
        value: function replaceThisMoleculeWithGithub(githubID) {
            console.log(githubID);

            //If we are currently inside the molecule targeted for replacement, go up one
            if (_globalvariables2.default.currentMolecule.uniqueID == this.uniqueID) {
                _globalvariables2.default.currentMolecule = this.parent;
            }

            //Create a new github molecule in the same spot
            _globalvariables2.default.currentMolecule.placeAtom({
                x: this.x,
                y: this.y,
                parent: _globalvariables2.default.currentMolecule,
                name: this.name,
                atomType: "GitHubMolecule",
                projectID: githubID,
                uniqueID: generateUniqueID()
            }, null, availableTypes);

            //Then delete the old molecule which has been replaced
            this.deleteNode();
        }
    }, {
        key: 'requestBOM',
        value: function requestBOM() {
            var generatedBOM = _get(Molecule.prototype.__proto__ || Object.getPrototypeOf(Molecule.prototype), 'requestBOM', this).call(this);
            this.nodesOnTheScreen.forEach(function (molecule) {
                generatedBOM = generatedBOM.concat(molecule.requestBOM());
            });
            return generatedBOM;
        }
    }, {
        key: 'requestReadme',
        value: function requestReadme() {
            var generatedReadme = _get(Molecule.prototype.__proto__ || Object.getPrototypeOf(Molecule.prototype), 'requestReadme', this).call(this);
            generatedReadme.push("## " + this.name);

            var sortableAtomsList = this.nodesOnTheScreen;
            sortableAtomsList.sort(function (a, b) {
                return distBetweenPoints(a.x, 0, a.y, 0) - distBetweenPoints(b.x, 0, b.y, 0);
            });

            sortableAtomsList.forEach(function (molecule) {
                generatedReadme = generatedReadme.concat(molecule.requestReadme());
            });
            return generatedReadme;
        }
    }, {
        key: 'serialize',
        value: function serialize(savedObject) {
            //Save this molecule.

            //This one is a little confusing. Basically each molecule saves like an atom, but also creates a second object 
            //record of itself in the object "savedObject" object. If this is the topLevel molecule we need to create the 
            //savedObject object here to pass to lower levels.

            if (this.topLevel == true) {
                //Create a new blank project to save to
                savedObject = { molecules: [] };
            }

            var allElementsCode = new Array();
            var allAtoms = [];
            var allConnectors = [];

            this.nodesOnTheScreen.forEach(function (atom) {
                if (atom.codeBlock != "") {
                    allElementsCode.push(atom.codeBlock);
                }

                allAtoms.push(JSON.stringify(atom.serialize(savedObject)));

                atom.children.forEach(function (attachmentPoint) {
                    if (attachmentPoint.type == "output") {
                        attachmentPoint.connectors.forEach(function (connector) {
                            allConnectors.push(connector.serialize());
                        });
                    }
                });
            });

            var thisAsObject = {
                atomType: this.atomType,
                name: this.name,
                uniqueID: this.uniqueID,
                topLevel: this.topLevel,
                BOMlist: this.BOMlist,
                allAtoms: allAtoms,
                allConnectors: allConnectors

                //Add an object record of this object

            };savedObject.molecules.push(thisAsObject);

            if (this.topLevel == true) {
                //If this is the top level, return the generated object
                return savedObject;
            } else {
                //If not, return just a placeholder for this molecule
                var object = {
                    atomType: this.atomType,
                    name: this.name,
                    x: this.x,
                    y: this.y,
                    uniqueID: this.uniqueID,
                    BOMlist: this.BOMlist
                };

                return object;
            }
        }
    }, {
        key: 'deserialize',
        value: function deserialize(moleculeList, moleculeID) {
            var _this3 = this;

            //Find the target molecule in the list
            var moleculeObject = moleculeList.filter(function (molecule) {
                return molecule.uniqueID == moleculeID;
            })[0];

            //Grab the name and ID
            this.uniqueID = moleculeObject.uniqueID;
            this.name = moleculeObject.name;
            this.topLevel = moleculeObject.topLevel;
            this.BOMlist = moleculeObject.BOMlist;

            //Place the atoms
            moleculeObject.allAtoms.forEach(function (atom) {
                _this3.placeAtom(JSON.parse(atom), moleculeList, availableTypes);
            });

            //reload the molecule object to prevent persistence issues
            moleculeObject = moleculeList.filter(function (molecule) {
                return molecule.uniqueID == moleculeID;
            })[0];

            //Place the connectors
            this.savedConnectors = moleculeObject.allConnectors; //Save a copy of the connectors so we can use them later if we want
            this.savedConnectors.forEach(function (connector) {
                _this3.placeConnector(JSON.parse(connector));
            });

            this.updateCodeBlock();
        }
    }, {
        key: 'placeAtom',
        value: function placeAtom(newAtomObj, moleculeList, typesList) {
            //Place the atom - note that types not listed in availableTypes will not be placed with no warning (ie go up one level)

            for (var key in typesList) {
                if (typesList[key].atomType == newAtomObj.atomType) {
                    newAtomObj.parent = this;
                    var atom = new typesList[key].creator(newAtomObj);

                    //reassign the name of the Inputs to preserve linking
                    if (atom.atomType == "Input" && typeof newAtomObj.name !== 'undefined') {
                        atom.setValue(newAtomObj.name);
                    }

                    //If this is a molecule, deserialize it
                    if (atom.atomType == "Molecule" && moleculeList != null) {
                        atom.deserialize(moleculeList, atom.uniqueID);
                    }

                    this.nodesOnTheScreen.push(atom);
                }
            }

            if (newAtomObj.atomType == "Output") {
                //re-asign output ID numbers if a new one is supposed to be placed
                this.nodesOnTheScreen.forEach(function (atom) {
                    if (atom.atomType == "Output") {
                        atom.setID(newAtomObj.uniqueID);
                    }
                });
            }
        }
    }, {
        key: 'placeConnector',
        value: function placeConnector(connectorObj) {
            var connector;
            var cp1NotFound = true;
            var cp2NotFound = true;
            var ap2;

            this.nodesOnTheScreen.forEach(function (atom) {
                //Find the output node

                if (atom.uniqueID == connectorObj.ap1ID) {
                    atom.children.forEach(function (child) {
                        if (child.name == connectorObj.ap1Name && child.type == "output") {
                            connector = new Connector({
                                atomType: "Connector",
                                attachmentPoint1: child,
                                parentMolecule: atom
                            });
                            cp1NotFound = false;
                        }
                    });
                }
                //Find the input node
                if (atom.uniqueID == connectorObj.ap2ID) {
                    atom.children.forEach(function (child) {
                        if (child.name == connectorObj.ap2Name && child.type == "input" && child.connectors.length == 0) {
                            cp2NotFound = false;
                            ap2 = child;
                        }
                    });
                }
            });

            if (cp1NotFound || cp2NotFound) {
                console.log("Unable to create connector");
                return;
            }

            connector.attachmentPoint2 = ap2;

            //Store the connector
            connector.attachmentPoint1.connectors.push(connector);
            connector.attachmentPoint2.connectors.push(connector);

            //Update the connection
            connector.propogate();
        }
    }]);

    return Molecule;
}(_atom2.default);

exports.default = Molecule;

/***/ }),

/***/ "./src/js/molecules/output.js":
/*!************************************!*\
  !*** ./src/js/molecules/output.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Output = function (_Atom) {
    _inherits(Output, _Atom);

    function Output(values) {
        _classCallCheck(this, Output);

        //Add a new output to the current molecule
        var _this = _possibleConstructorReturn(this, (Output.__proto__ || Object.getPrototypeOf(Output)).call(this, values));

        if (typeof _this.parent !== 'undefined') {
            _this.parent.addIO("output", "Geometry", _this.parent, "geometry", "");
        }

        _this.defaultCodeBlock = "~number or geometry~";
        _this.codeBlock = "";
        _this.type = "output";
        _this.name = "Output";
        _this.atomType = "Output";
        _this.height = 16;
        _this.radius = 15;

        _this.setValues(values);

        _this.addIO("input", "number or geometry", _this, "geometry", "");
        return _this;
    }

    _createClass(Output, [{
        key: 'setID',
        value: function setID(newID) {
            this.uniqueID = newID;
        }
    }, {
        key: 'draw',
        value: function draw() {

            this.children.forEach(function (child) {
                child.draw();
            });

            c.beginPath();
            c.fillStyle = this.color;
            c.rect(this.x - this.radius, this.y - this.height / 2, 2 * this.radius, this.height);
            c.textAlign = "end";
            c.fillText(this.name, this.x + this.radius, this.y - this.radius);
            c.fill();
            c.closePath();

            c.beginPath();
            c.moveTo(this.x + this.radius, this.y - this.height / 2);
            c.lineTo(this.x + this.radius + 10, this.y);
            c.lineTo(this.x + this.radius, this.y + this.height / 2);
            c.fill();
        }
    }]);

    return Output;
}(_atom2.default);

exports.default = Output;

/***/ }),

/***/ "./src/js/molecules/readme.js":
/*!************************************!*\
  !*** ./src/js/molecules/readme.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Readme = function (_Atom) {
    _inherits(Readme, _Atom);

    function Readme(values) {
        _classCallCheck(this, Readme);

        var _this = _possibleConstructorReturn(this, (Readme.__proto__ || Object.getPrototypeOf(Readme)).call(this, values));

        _this.codeBlock = "";
        _this.atomType = "Readme";
        _this.readmeText = "Readme text here";
        _this.type = "readme";
        _this.name = "README";
        _this.radius = 20;

        _this.setValues(values);
        return _this;
    }

    _createClass(Readme, [{
        key: "updateSidebar",
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            var valueList = _get(Readme.prototype.__proto__ || Object.getPrototypeOf(Readme.prototype), "updateSidebar", this).call(this); //call the super function

            this.createEditableValueListItem(valueList, this, "readmeText", "Notes", false);
        }
    }, {
        key: "draw",
        value: function draw() {

            _get(Readme.prototype.__proto__ || Object.getPrototypeOf(Readme.prototype), "draw", this).call(this); //Super call to draw the rest

            //draw the two slashes on the node//
            c.strokeStyle = "#949294";
            c.lineWidth = 3;
            c.lineCap = "round";

            c.beginPath();
            c.moveTo(this.x - 11, this.y + 10);
            c.lineTo(this.x, this.y - 10);
            c.stroke();

            c.beginPath();
            c.moveTo(this.x, this.y + 10);
            c.lineTo(this.x + 11, this.y - 10);
            c.stroke();
        }
    }, {
        key: "setValue",
        value: function setValue(newText) {
            this.readmeText = newText;
        }
    }, {
        key: "requestReadme",
        value: function requestReadme() {
            //request any contributions from this atom to the readme

            return [this.readmeText];
        }
    }, {
        key: "serialize",
        value: function serialize(values) {
            //Save the readme text to the serial stream
            var valuesObj = _get(Readme.prototype.__proto__ || Object.getPrototypeOf(Readme.prototype), "serialize", this).call(this, values);

            valuesObj.readmeText = this.readmeText;

            return valuesObj;
        }
    }]);

    return Readme;
}(_atom2.default);

exports.default = Readme;

/***/ }),

/***/ "./src/js/molecules/rectangle.js":
/*!***************************************!*\
  !*** ./src/js/molecules/rectangle.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rectangle = function (_Atom) {
    _inherits(Rectangle, _Atom);

    function Rectangle(values) {
        _classCallCheck(this, Rectangle);

        var _this = _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).call(this, values));

        _this.addIO("input", "x length", _this, "number", 10);
        _this.addIO("input", "y length", _this, "number", 10);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Rectangle";
        _this.atomType = "Rectangle";
        _this.defaultCodeBlock = "square([~x length~,~y length~])";
        _this.codeBlock = "";

        //generate the correct codeblock for this atom on creation
        _this.updateCodeBlock();

        _this.setValues(values);
        return _this;
    }

    return Rectangle;
}(_atom2.default);

exports.default = Rectangle;

/***/ }),

/***/ "./src/js/molecules/regularpolygon.js":
/*!********************************************!*\
  !*** ./src/js/molecules/regularpolygon.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RegularPolygon = function (_Atom) {
    _inherits(RegularPolygon, _Atom);

    function RegularPolygon(values) {
        _classCallCheck(this, RegularPolygon);

        var _this = _possibleConstructorReturn(this, (RegularPolygon.__proto__ || Object.getPrototypeOf(RegularPolygon)).call(this, values));

        _this.addIO("input", "number of sides", _this, "number", 6);
        _this.addIO("input", "radius", _this, "number", 10);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "RegularPolygon";
        _this.atomType = "RegularPolygon";

        // create the polygon code block
        _this.updateCodeBlock();

        _this.setValues(values);
        return _this;
    }

    _createClass(RegularPolygon, [{
        key: "updateCodeBlock",
        value: function updateCodeBlock() {
            this.defaultCodeBlock = this.buildPolygonCodeBlock();
            _get(RegularPolygon.prototype.__proto__ || Object.getPrototypeOf(RegularPolygon.prototype), "updateCodeBlock", this).call(this);
        }
    }, {
        key: "buildPolygonCodeBlock",
        value: function buildPolygonCodeBlock() {
            var polygon = [];
            for (var i = 0; i < this.findIOValue("number of sides"); i++) {
                var angle = i * 2 * Math.PI / this.findIOValue("number of sides") - Math.PI / 2;
                polygon.push([this.findIOValue("radius") * Math.cos(angle), this.findIOValue("radius") * Math.sin(angle)]);
            }

            return "polygon(" + JSON.stringify(polygon) + ")";
        }
    }]);

    return RegularPolygon;
}(_atom2.default);

exports.default = RegularPolygon;

/***/ }),

/***/ "./src/js/molecules/rotate.js":
/*!************************************!*\
  !*** ./src/js/molecules/rotate.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rotate = function (_Atom) {
    _inherits(Rotate, _Atom);

    function Rotate(values) {
        _classCallCheck(this, Rotate);

        var _this = _possibleConstructorReturn(this, (Rotate.__proto__ || Object.getPrototypeOf(Rotate)).call(this, values));

        _this.addIO("input", "geometry", _this, "geometry", "");
        _this.addIO("input", "x-axis degrees", _this, "number", 0);
        _this.addIO("input", "y-axis degrees", _this, "number", 0);
        _this.addIO("input", "z-axis degrees", _this, "number", 0);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Rotate";
        _this.atomType = "Rotate";
        _this.defaultCodeBlock = "rotate([~x-axis degrees~,~y-axis degrees~,~z-axis degrees~],~geometry~)";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Rotate;
}(_atom2.default);

exports.default = Rotate;

/***/ }),

/***/ "./src/js/molecules/scale.js":
/*!***********************************!*\
  !*** ./src/js/molecules/scale.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Scale = function (_Atom) {
    _inherits(Scale, _Atom);

    function Scale(values) {
        _classCallCheck(this, Scale);

        var _this = _possibleConstructorReturn(this, (Scale.__proto__ || Object.getPrototypeOf(Scale)).call(this, values));

        _this.addIO("input", "geometry", _this, "geometry", "");
        _this.addIO("input", "multiple", _this, "number", 10);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Scale";
        _this.atomType = "Scale";
        _this.defaultCodeBlock = "~geometry~.scale(~multiple~)";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Scale;
}(_atom2.default);

exports.default = Scale;

/***/ }),

/***/ "./src/js/molecules/shrinkwrap.js":
/*!****************************************!*\
  !*** ./src/js/molecules/shrinkwrap.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ShrinkWrap = function (_Atom) {
    _inherits(ShrinkWrap, _Atom);

    function ShrinkWrap(values) {
        _classCallCheck(this, ShrinkWrap);

        var _this = _possibleConstructorReturn(this, (ShrinkWrap.__proto__ || Object.getPrototypeOf(ShrinkWrap)).call(this, values));

        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Shrink Wrap";
        _this.atomType = "ShrinkWrap";
        _this.defaultCodeBlock = "chain_hull({closed: false}, [ ])";
        _this.codeBlock = "";
        _this.ioValues = [];
        _this.closedSelection = 0;

        _this.setValues(values);

        if (typeof _this.ioValues !== 'undefined') {
            _this.ioValues.forEach(function (ioValue) {
                //for each saved value
                _this.addIO("input", ioValue.name, _this, "geometry", "");
            });
        }

        _this.updateCodeBlock();
        return _this;
    }

    _createClass(ShrinkWrap, [{
        key: "updateCodeBlock",
        value: function updateCodeBlock() {
            var _this2 = this;

            this.codeBlock = this.defaultCodeBlock;

            //Generate the code block string
            var arrayOfChildrenString = "[ ";
            var numberOfElements = 0;
            this.children.forEach(function (io) {
                if (io.type == "input") {
                    if (numberOfElements > 0) {
                        arrayOfChildrenString = arrayOfChildrenString + ", ";
                    }
                    numberOfElements += 1;
                    arrayOfChildrenString = arrayOfChildrenString + io.getValue();
                }
            });
            arrayOfChildrenString = arrayOfChildrenString + "]";

            //Insert the generated string into the code block
            var regex = /\[(.+)\]/gi;
            this.codeBlock = this.codeBlock.replace(regex, arrayOfChildrenString);

            //Add the text for open or closed
            var endString;
            if (this.closedSelection == 0) {
                //closed
                endString = "chain_hull({closed: true}";
            } else {
                endString = "chain_hull({closed: false}";
            }

            var regex = /^.+?\{(.+?)\}/gi;
            this.codeBlock = this.codeBlock.replace(regex, endString);

            //Shrink wrap it one more time if we have solid selected
            if (this.closedSelection == 2) {
                this.codeBlock = "chain_hull({closed: true}, [" + this.codeBlock + "])";
            }

            //Set the output nodes with name 'geometry' to be the generated code
            this.children.forEach(function (child) {
                if (child.valueType == 'geometry' && child.type == 'output') {
                    child.setValue(_this2.codeBlock);
                }
            });

            //If this molecule is selected, send the updated value to the renderer
            if (this.selected) {
                this.sendToRender();
            }

            //Delete or add ports as needed

            //Check to see if any of the loaded ports have been connected to. If they have, remove them from the this.ioValues list 
            this.children.forEach(function (child) {
                _this2.ioValues.forEach(function (ioValue) {
                    if (child.name == ioValue.name && child.connectors.length > 0) {
                        _this2.ioValues.splice(_this2.ioValues.indexOf(ioValue), 1); //Let's remove it from the ioValues list
                    }
                });
            });

            //Add or delete ports as needed
            if (this.howManyInputPortsAvailable() == 0) {
                //We need to make a new port available
                this.addIO("input", "2D shape " + generateUniqueID(), this, "geometry", "");
            }
            if (this.howManyInputPortsAvailable() >= 2 && this.ioValues.length <= 1) {
                //We need to remove the empty port
                this.deleteEmptyPort();
                this.updateCodeBlock();
            }
        }
    }, {
        key: "howManyInputPortsAvailable",
        value: function howManyInputPortsAvailable() {
            var portsAvailable = 0;
            this.children.forEach(function (io) {
                if (io.type == "input" && io.connectors.length == 0) {
                    //if this port is available
                    portsAvailable = portsAvailable + 1; //Add one to the count
                }
            });
            return portsAvailable;
        }
    }, {
        key: "deleteEmptyPort",
        value: function deleteEmptyPort() {
            var _this3 = this;

            this.children.forEach(function (io) {
                if (io.type == "input" && io.connectors.length == 0 && _this3.howManyInputPortsAvailable() >= 2) {
                    _this3.removeIO("input", io.name, _this3);
                }
            });
        }
    }, {
        key: "serialize",
        value: function serialize(savedObject) {
            var thisAsObject = _get(ShrinkWrap.prototype.__proto__ || Object.getPrototypeOf(ShrinkWrap.prototype), "serialize", this).call(this, savedObject);

            var ioValues = [];
            this.children.forEach(function (io) {
                if (io.type == "input") {
                    var saveIO = {
                        name: io.name,
                        ioValue: 10
                    };
                    ioValues.push(saveIO);
                }
            });

            ioValues.forEach(function (ioValue) {
                thisAsObject.ioValues.push(ioValue);
            });

            //Write the selection for if the chain is closed
            thisAsObject.closedSelection = this.closedSelection;

            return thisAsObject;
        }
    }, {
        key: "updateSidebar",
        value: function updateSidebar() {
            //Update the side bar to make it possible to change the molecule name

            var valueList = _get(ShrinkWrap.prototype.__proto__ || Object.getPrototypeOf(ShrinkWrap.prototype), "updateSidebar", this).call(this);

            this.createDropDown(valueList, this, ["Closed", "Open", "Solid"], this.closedSelection, "End:");
        }
    }, {
        key: "changeEquation",
        value: function changeEquation(newValue) {
            this.closedSelection = parseInt(newValue);
            this.updateCodeBlock();
        }
    }]);

    return ShrinkWrap;
}(_atom2.default);

exports.default = ShrinkWrap;

/***/ }),

/***/ "./src/js/molecules/translate.js":
/*!***************************************!*\
  !*** ./src/js/molecules/translate.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Translate = function (_Atom) {
    _inherits(Translate, _Atom);

    function Translate(values) {
        _classCallCheck(this, Translate);

        var _this = _possibleConstructorReturn(this, (Translate.__proto__ || Object.getPrototypeOf(Translate)).call(this, values));

        _this.addIO("input", "geometry", _this, "geometry", "");
        _this.addIO("input", "xDist", _this, "number", 0);
        _this.addIO("input", "yDist", _this, "number", 0);
        _this.addIO("input", "zDist", _this, "number", 0);
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Translate";
        _this.atomType = "Translate";
        _this.defaultCodeBlock = "~geometry~.translate([~xDist~, ~yDist~, ~zDist~])";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Translate;
}(_atom2.default);

exports.default = Translate;

/***/ }),

/***/ "./src/js/molecules/union.js":
/*!***********************************!*\
  !*** ./src/js/molecules/union.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _atom = __webpack_require__(/*! ../prototypes/atom */ "./src/js/prototypes/atom.js");

var _atom2 = _interopRequireDefault(_atom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Union = function (_Atom) {
    _inherits(Union, _Atom);

    function Union(values) {
        _classCallCheck(this, Union);

        var _this = _possibleConstructorReturn(this, (Union.__proto__ || Object.getPrototypeOf(Union)).call(this, values));

        _this.addIO("input", "geometry1", _this, "geometry", "");
        _this.addIO("input", "geometry2", _this, "geometry", "");
        _this.addIO("output", "geometry", _this, "geometry", "");

        _this.name = "Union";
        _this.atomType = "Union";
        _this.defaultCodeBlock = "union(~geometry1~,~geometry2~)";
        _this.codeBlock = "";

        _this.setValues(values);
        return _this;
    }

    return Union;
}(_atom2.default);

exports.default = Union;

/***/ }),

/***/ "./src/js/prototypes/atom.js":
/*!***********************************!*\
  !*** ./src/js/prototypes/atom.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Atom = function () {
    function Atom(values) {
        _classCallCheck(this, Atom);

        //Setup default values
        this.children = [];

        this.x = 0;
        this.y = 0;
        this.radius = 20;
        this.defaultColor = '#F3EFEF';
        this.selectedColor = "#484848";
        this.selected = false;
        this.color = '#F3EFEF';
        this.name = "name";
        this.parentMolecule = null;
        this.codeBlock = "";
        this.defaultCodeBlock = "";
        this.isMoving = false;
        this.BOMlist = [];

        for (var key in values) {
            this[key] = values[key];
        }
    }

    _createClass(Atom, [{
        key: 'setValues',
        value: function setValues(values) {
            var _this = this;

            //Assign the object to have the passed in values

            for (var key in values) {
                this[key] = values[key];
            }

            if (typeof this.ioValues !== 'undefined') {
                this.ioValues.forEach(function (ioValue) {
                    //for each saved value
                    _this.children.forEach(function (io) {
                        //Find the matching IO and set it to be the saved value
                        if (ioValue.name == io.name && io.type == "input") {
                            io.setValue(ioValue.ioValue);
                        }
                    });
                });
            }
        }
    }, {
        key: 'draw',
        value: function draw() {

            this.inputX = this.x - this.radius;
            this.outputX = this.x + this.radius;

            this.children.forEach(function (child) {
                child.draw();
            });

            c.beginPath();
            c.fillStyle = this.color;
            //make it imposible to draw atoms too close to the edge
            //not sure what x left margin should be because if it's too close it would cover expanded text
            var canvasFlow = document.querySelector('#flow-canvas');
            if (this.x < this.radius * 3) {
                this.x += this.radius * 3;
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else if (this.y < this.radius * 2) {
                this.y += this.radius;
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else if (this.x + this.radius * 2 > canvasFlow.width) {
                this.x -= this.radius * 2;
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else if (this.y + this.radius * 2 > canvasFlow.height) {
                this.y -= this.radius;
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else {
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            }
            c.textAlign = "start";
            c.fillText(this.name, this.x + this.radius, this.y - this.radius);
            c.fill();
            c.closePath();
        }
    }, {
        key: 'addIO',
        value: function addIO(type, name, target, valueType, defaultValue) {

            //compute the baseline offset from parent node
            var offset;
            if (type == "input") {
                offset = -1 * target.radius;
            } else {
                offset = target.radius;
            }
            var input = new AttachmentPoint({
                parentMolecule: target,
                defaultOffsetX: offset,
                defaultOffsetY: 0,
                type: type,
                valueType: valueType,
                name: name,
                value: defaultValue,
                uniqueID: generateUniqueID(),
                atomType: "AttachmentPoint"
            });
            target.children.push(input);
        }
    }, {
        key: 'removeIO',
        value: function removeIO(type, name, target) {
            var _this2 = this;

            //Remove the target IO attachment point

            this.children.forEach(function (io) {
                if (io.name == name && io.type == type) {
                    io.deleteSelf();
                    _this2.children.splice(_this2.children.indexOf(io), 1);
                }
            });
        }
    }, {
        key: 'clickDown',
        value: function clickDown(x, y) {
            //Returns true if something was done with the click


            var clickProcessed = false;

            this.children.forEach(function (child) {
                if (child.clickDown(x, y) == true) {
                    clickProcessed = true;
                }
            });

            //If none of the children processed the click
            if (!clickProcessed) {

                var distFromClick = distBetweenPoints(x, this.x, y, this.y);

                if (distFromClick < this.radius) {
                    this.color = this.selectedColor;
                    this.isMoving = true;
                    this.selected = true;
                    this.updateSidebar();

                    this.sendToRender();

                    clickProcessed = true;
                } else {
                    this.color = this.defaultColor;
                    this.selected = false;
                }
            }

            return clickProcessed;
        }
    }, {
        key: 'doubleClick',
        value: function doubleClick(x, y) {
            //returns true if something was done with the click


            var clickProcessed = false;

            var distFromClick = distBetweenPoints(x, this.x, y, this.y);

            if (distFromClick < this.radius) {
                clickProcessed = true;
            }

            return clickProcessed;
        }
    }, {
        key: 'clickUp',
        value: function clickUp(x, y) {
            this.isMoving = false;

            this.children.forEach(function (child) {
                child.clickUp(x, y);
            });
        }
    }, {
        key: 'clickMove',
        value: function clickMove(x, y) {
            if (this.isMoving == true) {
                this.x = x;
                this.y = y;
            }

            this.children.forEach(function (child) {
                child.clickMove(x, y);
            });
        }
    }, {
        key: 'keyPress',
        value: function keyPress(key) {
            //runs whenver a key is pressed
            if (key == 'Delete') {
                if (this.selected == true) {
                    this.deleteNode();
                }
            }

            this.children.forEach(function (child) {
                child.keyPress(key);
            });
        }
    }, {
        key: 'updateSidebar',
        value: function updateSidebar() {
            var _this3 = this;

            //updates the sidebar to display information about this node

            //remove everything in the sideBar now
            while (sideBar.firstChild) {
                sideBar.removeChild(sideBar.firstChild);
            }

            //add the name as a title
            var name = document.createElement('h1');
            name.textContent = this.name;
            name.setAttribute("style", "text-align:center;");
            sideBar.appendChild(name);

            //Create a list element
            var valueList = document.createElement("ul");
            sideBar.appendChild(valueList);
            valueList.setAttribute("class", "sidebar-list");

            //Add options to set all of the inputs
            this.children.forEach(function (child) {
                if (child.type == 'input' && child.valueType != 'geometry') {
                    _this3.createEditableValueListItem(valueList, child, "value", child.name, true);
                }
            });

            return valueList;
        }
    }, {
        key: 'deleteNode',
        value: function deleteNode() {
            //deletes this node and all of it's children

            this.children.forEach(function (child) {
                child.deleteSelf();
            });

            this.parent.nodesOnTheScreen.splice(this.parent.nodesOnTheScreen.indexOf(this), 1); //remove this node from the list
        }
    }, {
        key: 'update',
        value: function update() {

            this.children.forEach(function (child) {
                child.update();
            });

            this.draw();
        }
    }, {
        key: 'serialize',
        value: function serialize(savedObject) {
            //savedObject is only used by Molecule type atoms

            var ioValues = [];
            this.children.forEach(function (io) {
                if (io.valueType == "number" && io.type == "input") {
                    var saveIO = {
                        name: io.name,
                        ioValue: io.getValue()
                    };
                    ioValues.push(saveIO);
                }
            });

            var object = {
                atomType: this.atomType,
                name: this.name,
                x: this.x,
                y: this.y,
                uniqueID: this.uniqueID,
                ioValues: ioValues
            };

            return object;
        }
    }, {
        key: 'requestBOM',
        value: function requestBOM() {
            //Request any contributions from this atom to the BOM


            //Find the number of things attached to this output
            var numberOfThisInstance = 1;
            this.children.forEach(function (io) {
                if (io.type == "output" && io.connectors.length != 0) {
                    numberOfThisInstance = io.connectors.length;
                }
            });
            //And scale up the total needed by that number
            this.BOMlist.forEach(function (bomItem) {
                bomItem.totalNeeded = numberOfThisInstance * bomItem.numberNeeded;
            });

            return this.BOMlist;
        }
    }, {
        key: 'requestReadme',
        value: function requestReadme() {
            //request any contributions from this atom to the readme

            return [];
        }
    }, {
        key: 'updateCodeBlock',
        value: function updateCodeBlock() {
            var _this4 = this;

            //Substitute the result from each input for the ~...~ section with it's name

            var regex = /~(.*?)~/gi;
            this.codeBlock = this.defaultCodeBlock.replace(regex, function (x) {
                return _this4.findIOValue(x);
            });

            //Set the output nodes with name 'geometry' to be the generated code
            this.children.forEach(function (child) {
                if (child.valueType == 'geometry' && child.type == 'output') {
                    child.setValue(_this4.codeBlock);
                }
            });

            //If this molecule is selected, send the updated value to the renderer
            if (this.selected) {
                this.sendToRender();
            }
        }
    }, {
        key: 'sendToRender',
        value: function sendToRender() {
            //Send code to JSCAD to render
            if (this.codeBlock != "") {
                var toRender = "function main () {return " + this.codeBlock + "}";

                window.loadDesign(toRender, "MaslowCreate");
            }
            //Send something invisible just to wipe the rendering
            else {
                    var toRender = "function main () {return sphere({r: .0001, center: true})}";
                    window.loadDesign(toRender, "MaslowCreate");
                }
        }
    }, {
        key: 'findIOValue',
        value: function findIOValue(ioName) {
            //find the value of an input for a given name

            ioName = ioName.split('~').join('');
            var ioValue = null;

            this.children.forEach(function (child) {
                if (child.name == ioName && child.type == "input") {
                    ioValue = child.getValue();
                }
            });

            return ioValue;
        }
    }, {
        key: 'createEditableValueListItem',
        value: function createEditableValueListItem(list, object, key, label, resultShouldBeNumber) {
            var listElement = document.createElement("LI");
            list.appendChild(listElement);

            //Div which contains the entire element
            var div = document.createElement("div");
            listElement.appendChild(div);
            div.setAttribute("class", "sidebar-item");

            //Left div which displays the label
            var labelDiv = document.createElement("div");
            div.appendChild(labelDiv);
            var labelText = document.createTextNode(label + ":");
            labelDiv.appendChild(labelText);
            labelDiv.setAttribute("class", "sidebar-subitem");

            //Right div which is editable and displays the value
            var valueTextDiv = document.createElement("div");
            div.appendChild(valueTextDiv);
            var valueText = document.createTextNode(object[key]);
            valueTextDiv.appendChild(valueText);
            valueTextDiv.setAttribute("contenteditable", "true");
            valueTextDiv.setAttribute("class", "sidebar-subitem");
            var thisID = label + generateUniqueID();
            valueTextDiv.setAttribute("id", thisID);

            document.getElementById(thisID).addEventListener('focusout', function (event) {
                var valueInBox = document.getElementById(thisID).textContent;
                if (resultShouldBeNumber) {
                    valueInBox = parseFloat(valueInBox);
                }

                //If the target is an attachmentPoint then call the setter function
                if (object instanceof AttachmentPoint) {
                    object.setValue(valueInBox);
                } else {
                    object[key] = valueInBox;
                }
            });

            //prevent the return key from being used when editing a value
            document.getElementById(thisID).addEventListener('keypress', function (evt) {
                if (evt.which === 13) {
                    evt.preventDefault();
                    document.getElementById(thisID).blur(); //shift focus away if someone presses enter
                }
            });
        }
    }, {
        key: 'createNonEditableValueListItem',
        value: function createNonEditableValueListItem(list, object, key, label, resultShouldBeNumber) {
            var listElement = document.createElement("LI");
            list.appendChild(listElement);

            //Div which contains the entire element
            var div = document.createElement("div");
            listElement.appendChild(div);
            div.setAttribute("class", "sidebar-item");

            //Left div which displays the label
            var labelDiv = document.createElement("div");
            div.appendChild(labelDiv);
            var labelText = document.createTextNode(label + ":");
            labelDiv.appendChild(labelText);
            labelDiv.setAttribute("class", "sidebar-subitem");

            //Right div which is editable and displays the value
            var valueTextDiv = document.createElement("div");
            div.appendChild(valueTextDiv);
            var valueText = document.createTextNode(object[key]);
            valueTextDiv.appendChild(valueText);
            valueTextDiv.setAttribute("contenteditable", "false");
            valueTextDiv.setAttribute("class", "sidebar-subitem");
            var thisID = label + generateUniqueID();
            valueTextDiv.setAttribute("id", thisID);
        }
    }, {
        key: 'createDropDown',
        value: function createDropDown(list, parent, options, selectedOption, description) {
            var listElement = document.createElement("LI");
            list.appendChild(listElement);

            //Div which contains the entire element
            var div = document.createElement("div");
            listElement.appendChild(div);
            div.setAttribute("class", "sidebar-item");

            //Left div which displays the label
            var labelDiv = document.createElement("div");
            div.appendChild(labelDiv);
            var labelText = document.createTextNode(description);
            labelDiv.appendChild(labelText);
            labelDiv.setAttribute("class", "sidebar-subitem");

            //Right div which is editable and displays the value
            var valueTextDiv = document.createElement("div");
            div.appendChild(valueTextDiv);
            var dropDown = document.createElement("select");
            options.forEach(function (option) {
                var op = new Option();
                op.value = options.findIndex(function (thisOption) {
                    return thisOption === option;
                });
                op.text = option;
                dropDown.options.add(op);
            });
            valueTextDiv.appendChild(dropDown);
            valueTextDiv.setAttribute("class", "sidebar-subitem");

            dropDown.selectedIndex = selectedOption; //display the current selection

            dropDown.addEventListener('change', function () {
                parent.changeEquation(dropDown.value);
            }, false);
        }
    }, {
        key: 'createButton',
        value: function createButton(list, parent, buttonText, functionToCall) {
            var listElement = document.createElement("LI");
            list.appendChild(listElement);

            //Div which contains the entire element
            var div = document.createElement("div");
            listElement.appendChild(div);
            div.setAttribute("class", "sidebar-item");

            //Left div which displays the label
            var labelDiv = document.createElement("div");
            div.appendChild(labelDiv);
            var labelText = document.createTextNode("");
            labelDiv.appendChild(labelText);
            labelDiv.setAttribute("class", "sidebar-subitem");

            //Right div which is button
            var valueTextDiv = document.createElement("div");
            div.appendChild(valueTextDiv);
            var button = document.createElement("button");
            var buttonTextNode = document.createTextNode(buttonText);
            button.setAttribute("class", "sidebar_button");
            button.appendChild(buttonTextNode);
            valueTextDiv.appendChild(button);
            valueTextDiv.setAttribute("class", "sidebar-subitem");

            button.addEventListener('mousedown', function () {
                functionToCall(parent);
            }, false);
        }
    }, {
        key: 'createBOM',
        value: function createBOM(list, parent, BOMlist) {
            var _this5 = this;

            //aBOMEntry = new bomEntry;


            list.appendChild(document.createElement('br'));
            list.appendChild(document.createElement('br'));

            var div = document.createElement("h3");
            div.setAttribute("style", "text-align:center;");
            list.appendChild(div);
            var valueText = document.createTextNode("Bill Of Materials");
            div.appendChild(valueText);

            var x = document.createElement("HR");
            list.appendChild(x);

            this.requestBOM().forEach(function (bomItem) {
                if (_this5.BOMlist.indexOf(bomItem) != -1) {
                    //If the bom item is from this molecule
                    _this5.createEditableValueListItem(list, bomItem, "BOMitemName", "Item", false);
                    _this5.createEditableValueListItem(list, bomItem, "numberNeeded", "Number", true);
                    _this5.createEditableValueListItem(list, bomItem, "costUSD", "Price", true);
                    _this5.createEditableValueListItem(list, bomItem, "source", "Source", false);
                } else {
                    _this5.createNonEditableValueListItem(list, bomItem, "BOMitemName", "Item", false);
                    _this5.createNonEditableValueListItem(list, bomItem, "totalNeeded", "Number", true);
                    _this5.createNonEditableValueListItem(list, bomItem, "costUSD", "Price", true);
                    _this5.createNonEditableValueListItem(list, bomItem, "source", "Source", false);
                }
                var x = document.createElement("HR");
                list.appendChild(x);
            });

            this.createButton(list, parent, "Add BOM Entry", this.addBOMEntry);
        }
    }, {
        key: 'addBOMEntry',
        value: function addBOMEntry(self) {
            console.log("add a bom entry");

            self.BOMlist.push(new BOMEntry());

            self.updateSidebar();
        }
    }]);

    return Atom;
}();

exports.default = Atom;

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Zsb3dEcmF3LmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9nbG9iYWx2YXJpYWJsZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21lbnUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9jaXJjbGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9jb25zdGFudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL2RpZmZlcmVuY2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9lcXVhdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL2V4dHJ1ZGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9naXRodWJtb2xlY3VsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL2lucHV0LmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9tb2xlY3VsZXMvaW50ZXJzZWN0aW9uLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9tb2xlY3VsZXMvbWlycm9yLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9tb2xlY3VsZXMvbW9sZWN1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9vdXRwdXQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9yZWFkbWUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9yZWN0YW5nbGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL21vbGVjdWxlcy9yZWd1bGFycG9seWdvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL3JvdGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL3NjYWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9tb2xlY3VsZXMvc2hyaW5rd3JhcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL3RyYW5zbGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9sZWN1bGVzL3VuaW9uLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9wcm90b3R5cGVzL2F0b20uanMiXSwibmFtZXMiOlsiR2xvYmFsVmFyaWFibGVzIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYyIsImdldENvbnRleHQiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJoZWlnaHQiLCJpbm5lckhlaWdodCIsImxvd2VySGFsZk9mU2NyZWVuIiwic2V0QXR0cmlidXRlIiwiZmxvd0NhbnZhcyIsImdldEVsZW1lbnRCeUlkIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk1lbnUiLCJzaG93bWVudSIsImN1cnJlbnRNb2xlY3VsZSIsIm5vZGVzT25UaGVTY3JlZW4iLCJmb3JFYWNoIiwibW9sZWN1bGUiLCJjbGlja01vdmUiLCJldmVudCIsImNsaWVudFgiLCJjbGllbnRZIiwid2luZG93IiwiY29uc29sZSIsImxvZyIsImJvdW5kcyIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNsaWNrSGFuZGxlZEJ5TW9sZWN1bGUiLCJjbGlja0Rvd24iLCJiYWNrZ3JvdW5kQ2xpY2siLCJjb250YWlucyIsInRhcmdldCIsImhpZGVtZW51IiwiZG91YmxlQ2xpY2siLCJjbGlja1VwIiwia2V5UHJlc3MiLCJrZXkiLCJpbml0IiwiTW9sZWN1bGUiLCJ4IiwieSIsInRvcExldmVsIiwibmFtZSIsImF0b21UeXBlIiwidW5pcXVlSUQiLCJnZW5lcmF0ZVVuaXF1ZUlEIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZGlzdEJldHdlZW5Qb2ludHMiLCJ4MSIsIngyIiwieTEiLCJ5MiIsImEyIiwicG93IiwiYjIiLCJkaXN0Iiwic3FydCIsImFuaW1hdGUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJjbGVhclJlY3QiLCJ1cGRhdGUiLCJhdmFpbGFibGVUeXBlcyIsImNpcmNsZSIsImNyZWF0b3IiLCJDaXJjbGUiLCJyZWN0YW5nbGUiLCJSZWN0YW5nbGUiLCJzaGlyaW5rd3JhcCIsIlNocmlua1dyYXAiLCJ0cmFuc2xhdGUiLCJUcmFuc2xhdGUiLCJyZWd1bGFyUG9seWdvbiIsIlJlZ3VsYXJQb2x5Z29uIiwiZXh0cnVkZSIsIkV4dHJ1ZGUiLCJzY2FsZSIsIlNjYWxlIiwiaW50ZXJzZWN0aW9uIiwiSW50ZXJzZWN0aW9uIiwiZGlmZmVyZW5jZSIsIkRpZmZlcmVuY2UiLCJjb3N0YW50IiwiQ29uc3RhbnQiLCJlcXVhdGlvbiIsIkVxdWF0aW9uIiwiaW5wdXQiLCJJbnB1dCIsInJlYWRtZSIsIlJlYWRtZSIsInJvdGF0ZSIsIlJvdGF0ZSIsIm1pcnJvciIsIk1pcnJvciIsImdpdGh1Ym1vbGVjdWxlIiwiR2l0SHViTW9sZWN1bGUiLCJ1bmlvbiIsIlVuaW9uIiwic2VjcmV0VHlwZXMiLCJvdXRwdXQiLCJPdXRwdXQiLCJ0b3BMZXZlbE1vbGVjdWxlIiwic2lkZUJhciIsIm1lbnUiLCJjbGFzc0xpc3QiLCJhZGQiLCJtZW51TGlzdCIsIm5ld0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW5zdGFuY2UiLCJ0ZXh0IiwiY3JlYXRlVGV4dE5vZGUiLCJhcHBlbmRDaGlsZCIsInBsYWNlTmV3Tm9kZSIsImV2IiwiY2xyIiwiaWQiLCJwbGFjZUF0b20iLCJwYXJlbnQiLCJwcm9qZWN0SUQiLCJjbGljayIsInByZXZlbnREZWZhdWx0IiwidWwiLCJsaSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaSIsImxlbmd0aCIsInN0eWxlIiwiZGlzcGxheSIsInRvcCIsImxlZnQiLCJyZW1vdmUiLCJmb2N1cyIsImV2dCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJmaWx0ZXIiLCJhIiwidHh0VmFsdWUiLCJ2YWx1ZSIsInRvVXBwZXJDYXNlIiwidGV4dENvbnRlbnQiLCJpbm5lclRleHQiLCJpbmRleE9mIiwiY29kZSIsImdpdGh1Ykxpc3QiLCJvbGRSZXN1bHRzIiwib2N0b2tpdCIsInNlYXJjaCIsInJlcG9zIiwicSIsInNvcnQiLCJwZXJfcGFnZSIsInRvcGljIiwicGFnZSIsImhlYWRlcnMiLCJhY2NlcHQiLCJ0aGVuIiwicmVzdWx0IiwiZGF0YSIsIml0ZW1zIiwiaXRlbSIsInRvcGljcyIsImluY2x1ZGVzIiwicGxhY2VHaXRIdWJNb2xlY3VsZSIsInRhYk5hbWUiLCJ0YWJjb250ZW50IiwidGFibGlua3MiLCJjbGFzc05hbWUiLCJyZXBsYWNlIiwiY3VycmVudFRhcmdldCIsInZhbHVlcyIsImRlZmF1bHRDb2RlQmxvY2siLCJjb2RlQmxvY2siLCJhZGRJTyIsInNldFZhbHVlcyIsInVwZGF0ZUNvZGVCbG9jayIsIm1heGltdW1TZWdtZW50U2l6ZSIsImZpbmRJT1ZhbHVlIiwiY2lyY3VtZmVyZW5jZSIsIm51bWJlck9mU2VnbWVudHMiLCJwYXJzZUludCIsInJlZ2V4IiwiQXRvbSIsInR5cGUiLCJyYWRpdXMiLCJpb1ZhbHVlcyIsImNoaWxkcmVuIiwiaW9WYWx1ZSIsImlvIiwic2V0VmFsdWUiLCJ2YWx1ZUxpc3QiLCJjcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0iLCJuZXdOYW1lIiwidmFsdWVzT2JqIiwiZ2V0VmFsdWUiLCJjaGlsZCIsImRyYXciLCJiZWdpblBhdGgiLCJmaWxsU3R5bGUiLCJjb2xvciIsInJlY3QiLCJ0ZXh0QWxpZ24iLCJmaWxsVGV4dCIsImZpbGwiLCJjbG9zZVBhdGgiLCJlcXVhdGlvbk9wdGlvbnMiLCJjdXJyZW50RXF1YXRpb24iLCJzYXZlZE9iamVjdCIsInN1cGVyU2VyaWFsT2JqZWN0IiwieiIsImNvcyIsInNpbiIsIm5ld1ZhbHVlIiwiY3JlYXRlRHJvcERvd24iLCJjZW50ZXJDb2xvciIsImxvYWRQcm9qZWN0QnlJRCIsImNsaWNrUHJvY2Vzc2VkIiwiZGlzdEZyb21DbGljayIsInJlcXVlc3QiLCJ1c2VyIiwib3duZXIiLCJsb2dpbiIsInJlcG9OYW1lIiwiZ2V0Q29udGVudHMiLCJyZXBvIiwicGF0aCIsInJhd0ZpbGUiLCJhdG9iIiwiY29udGVudCIsIm1vbGVjdWxlc0xpc3QiLCJKU09OIiwicGFyc2UiLCJtb2xlY3VsZXMiLCJkZXNlcmlhbGl6ZSIsInNhdmVkQ29ubmVjdG9ycyIsInBsYWNlQ29ubmVjdG9yIiwiY29ubmVjdG9yIiwib2JqZWN0IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwibW92ZVRvIiwibGluZVRvIiwicmVtb3ZlSU8iLCJ0aGVOZXdOYW1lIiwibmV3T3V0cHV0IiwidmFsdWVUeXBlIiwicGFyZW50TW9sZWN1bGUiLCJhcmMiLCJQSSIsInVwZGF0ZVNpZGViYXIiLCJhdG9tIiwic2V0T3V0cHV0Iiwic2VsZWN0ZWQiLCJzZW5kVG9SZW5kZXIiLCJjcmVhdGVCdXR0b24iLCJnb1RvUGFyZW50TW9sZWN1bGUiLCJleHBvcnRUb0dpdGh1YiIsInNob3dQcm9qZWN0c1RvTG9hZCIsImNyZWF0ZUJPTSIsIkJPTWxpc3QiLCJzZWxmIiwiZXhwb3J0Q3VycmVudE1vbGVjdWxlVG9HaXRodWIiLCJnaXRodWJJRCIsImRlbGV0ZU5vZGUiLCJnZW5lcmF0ZWRCT00iLCJjb25jYXQiLCJyZXF1ZXN0Qk9NIiwiZ2VuZXJhdGVkUmVhZG1lIiwicHVzaCIsInNvcnRhYmxlQXRvbXNMaXN0IiwiYiIsInJlcXVlc3RSZWFkbWUiLCJhbGxFbGVtZW50c0NvZGUiLCJBcnJheSIsImFsbEF0b21zIiwiYWxsQ29ubmVjdG9ycyIsInN0cmluZ2lmeSIsInNlcmlhbGl6ZSIsImF0dGFjaG1lbnRQb2ludCIsImNvbm5lY3RvcnMiLCJ0aGlzQXNPYmplY3QiLCJtb2xlY3VsZUxpc3QiLCJtb2xlY3VsZUlEIiwibW9sZWN1bGVPYmplY3QiLCJuZXdBdG9tT2JqIiwidHlwZXNMaXN0Iiwic2V0SUQiLCJjb25uZWN0b3JPYmoiLCJjcDFOb3RGb3VuZCIsImNwMk5vdEZvdW5kIiwiYXAyIiwiYXAxSUQiLCJhcDFOYW1lIiwiQ29ubmVjdG9yIiwiYXR0YWNobWVudFBvaW50MSIsImFwMklEIiwiYXAyTmFtZSIsImF0dGFjaG1lbnRQb2ludDIiLCJwcm9wb2dhdGUiLCJuZXdJRCIsInJlYWRtZVRleHQiLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJzdHJva2UiLCJuZXdUZXh0IiwiYnVpbGRQb2x5Z29uQ29kZUJsb2NrIiwicG9seWdvbiIsImFuZ2xlIiwiY2xvc2VkU2VsZWN0aW9uIiwiYXJyYXlPZkNoaWxkcmVuU3RyaW5nIiwibnVtYmVyT2ZFbGVtZW50cyIsImVuZFN0cmluZyIsInNwbGljZSIsImhvd01hbnlJbnB1dFBvcnRzQXZhaWxhYmxlIiwiZGVsZXRlRW1wdHlQb3J0IiwicG9ydHNBdmFpbGFibGUiLCJzYXZlSU8iLCJkZWZhdWx0Q29sb3IiLCJzZWxlY3RlZENvbG9yIiwiaXNNb3ZpbmciLCJpbnB1dFgiLCJvdXRwdXRYIiwiY2FudmFzRmxvdyIsImRlZmF1bHRWYWx1ZSIsIm9mZnNldCIsIkF0dGFjaG1lbnRQb2ludCIsImRlZmF1bHRPZmZzZXRYIiwiZGVmYXVsdE9mZnNldFkiLCJkZWxldGVTZWxmIiwibnVtYmVyT2ZUaGlzSW5zdGFuY2UiLCJib21JdGVtIiwidG90YWxOZWVkZWQiLCJudW1iZXJOZWVkZWQiLCJ0b1JlbmRlciIsImxvYWREZXNpZ24iLCJpb05hbWUiLCJzcGxpdCIsImpvaW4iLCJsaXN0IiwibGFiZWwiLCJyZXN1bHRTaG91bGRCZU51bWJlciIsImxpc3RFbGVtZW50IiwiZGl2IiwibGFiZWxEaXYiLCJsYWJlbFRleHQiLCJ2YWx1ZVRleHREaXYiLCJ2YWx1ZVRleHQiLCJ0aGlzSUQiLCJ2YWx1ZUluQm94IiwicGFyc2VGbG9hdCIsIndoaWNoIiwiYmx1ciIsIm9wdGlvbnMiLCJzZWxlY3RlZE9wdGlvbiIsImRlc2NyaXB0aW9uIiwiZHJvcERvd24iLCJvcCIsIk9wdGlvbiIsImZpbmRJbmRleCIsInRoaXNPcHRpb24iLCJvcHRpb24iLCJzZWxlY3RlZEluZGV4IiwiY2hhbmdlRXF1YXRpb24iLCJidXR0b25UZXh0IiwiZnVuY3Rpb25Ub0NhbGwiLCJidXR0b24iLCJidXR0b25UZXh0Tm9kZSIsImNyZWF0ZU5vbkVkaXRhYmxlVmFsdWVMaXN0SXRlbSIsImFkZEJPTUVudHJ5IiwiQk9NRW50cnkiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2hGQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBQSwwQkFBZ0JDLE1BQWhCLEdBQXlCQyxTQUFTQyxhQUFULENBQXVCLFFBQXZCLENBQXpCO0FBQ0FILDBCQUFnQkksQ0FBaEIsR0FBb0JKLDBCQUFnQkMsTUFBaEIsQ0FBdUJJLFVBQXZCLENBQWtDLElBQWxDLENBQXBCOztBQUVBTCwwQkFBZ0JDLE1BQWhCLENBQXVCSyxLQUF2QixHQUErQkMsVUFBL0I7QUFDQVAsMEJBQWdCQyxNQUFoQixDQUF1Qk8sTUFBdkIsR0FBZ0NDLGNBQVksQ0FBNUM7O0FBRUEsSUFBSUMsb0JBQW9CUixTQUFTQyxhQUFULENBQXVCLGNBQXZCLENBQXhCO0FBQ0FPLGtCQUFrQkMsWUFBbEIsQ0FB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LElBQXBDLEVBQXlDUixPQUF6QyxFQUFpRCxhQUFqRCxFQUFnRSxRQUFoRSxFQUEwRSxJQUExRTtBQUNBLDJCQUFLcUMsOEJBQUwsQ0FBb0M3QixJQUFwQyxFQUF5Q1IsT0FBekMsRUFBaUQsU0FBakQsRUFBNEQsT0FBNUQsRUFBcUUsSUFBckU7QUFDQSwyQkFBS3FDLDhCQUFMLENBQW9DN0IsSUFBcEMsRUFBeUNSLE9BQXpDLEVBQWlELFFBQWpELEVBQTJELFFBQTNELEVBQXFFLEtBQXJFO0FBQ0g7QUFDRCxvQkFBSXJTLElBQUl4QyxTQUFTOEcsYUFBVCxDQUF1QixJQUF2QixDQUFSO0FBQ0F1TyxxQkFBS25PLFdBQUwsQ0FBaUIxRSxDQUFqQjtBQUNILGFBZkQ7O0FBaUJBLGlCQUFLd04sWUFBTCxDQUFrQnFGLElBQWxCLEVBQXVCN04sTUFBdkIsRUFBOEIsZUFBOUIsRUFBK0MsS0FBSzJQLFdBQXBEO0FBQ0g7OztvQ0FFVzdHLEksRUFBSztBQUNiOU8sb0JBQVFDLEdBQVIsQ0FBWSxpQkFBWjs7QUFFQTZPLGlCQUFLRCxPQUFMLENBQWFTLElBQWIsQ0FBa0IsSUFBSXNHLFFBQUosRUFBbEI7O0FBRUE5RyxpQkFBS1gsYUFBTDtBQUNIOzs7Ozs7a0JBemlCZ0JuRSxJIiwiZmlsZSI6Ii4vanMvZmxvd0RyYXcuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvZmxvd0RyYXcuanNcIik7XG4iLCJcclxuXHJcbmltcG9ydCBNZW51IGZyb20gJy4vanMvbWVudSdcclxuaW1wb3J0IEdsb2JhbFZhcmlhYmxlcyBmcm9tICcuL2pzL2dsb2JhbHZhcmlhYmxlcydcclxuaW1wb3J0IE1vbGVjdWxlIGZyb20gJy4vanMvbW9sZWN1bGVzL21vbGVjdWxlLmpzJ1xyXG5cclxuR2xvYmFsVmFyaWFibGVzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXHJcbkdsb2JhbFZhcmlhYmxlcy5jID0gR2xvYmFsVmFyaWFibGVzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG5HbG9iYWxWYXJpYWJsZXMuY2FudmFzLndpZHRoID0gaW5uZXJXaWR0aFxyXG5HbG9iYWxWYXJpYWJsZXMuY2FudmFzLmhlaWdodCA9IGlubmVySGVpZ2h0LzJcclxuXHJcbmxldCBsb3dlckhhbGZPZlNjcmVlbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mbGV4LXBhcmVudCcpO1xyXG5sb3dlckhhbGZPZlNjcmVlbi5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFwiaGVpZ2h0OlwiK2lubmVySGVpZ2h0LzIuMStcInB4XCIpO1xyXG5cclxuLy8gRXZlbnQgTGlzdGVuZXJzXHJcbmxldCBmbG93Q2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zsb3ctY2FudmFzJyk7XHJcbmZsb3dDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBNZW51LnNob3dtZW51KTsgLy9yZWRpcmVjdCByaWdodCBjbGlja3MgdG8gc2hvdyB0aGUgbWVudVxyXG5cclxuZmxvd0NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldmVudCA9PiB7XHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgbW9sZWN1bGUuY2xpY2tNb3ZlKGV2ZW50LmNsaWVudFgsZXZlbnQuY2xpZW50WSk7ICAgICAgICBcclxuICAgIH0pO1xyXG59KVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGV2ZW50ID0+IHtcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coXCJyZXNpemVcIik7XHJcbiAgICBcclxuICAgIHZhciBib3VuZHMgPSBHbG9iYWxWYXJpYWJsZXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgR2xvYmFsVmFyaWFibGVzLmNhbnZhcy53aWR0aCA9IGJvdW5kcy53aWR0aDtcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jYW52YXMuaGVpZ2h0ID0gYm91bmRzLmhlaWdodDsgXHJcblxyXG59KVxyXG5cclxuZmxvd0NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldmVudCA9PiB7XHJcbiAgICAvL2V2ZXJ5IHRpbWUgdGhlIG1vdXNlIGJ1dHRvbiBnb2VzIGRvd25cclxuICAgIFxyXG4gICAgdmFyIGNsaWNrSGFuZGxlZEJ5TW9sZWN1bGUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2gobW9sZWN1bGUgPT4ge1xyXG4gICAgICAgIGlmIChtb2xlY3VsZS5jbGlja0Rvd24oZXZlbnQuY2xpZW50WCxldmVudC5jbGllbnRZKSA9PSB0cnVlKXtcclxuICAgICAgICAgICAgY2xpY2tIYW5kbGVkQnlNb2xlY3VsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGlmKCFjbGlja0hhbmRsZWRCeU1vbGVjdWxlKXtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLmJhY2tncm91bmRDbGljaygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2hpZGUgdGhlIG1lbnUgaWYgaXQgaXMgdmlzaWJsZVxyXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudScpLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcclxuICAgICAgICBoaWRlbWVudSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbn0pXHJcblxyXG5mbG93Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgZXZlbnQgPT4ge1xyXG4gICAgLy9ldmVyeSB0aW1lIHRoZSBtb3VzZSBidXR0b24gZ29lcyBkb3duXHJcbiAgICBcclxuICAgIHZhciBjbGlja0hhbmRsZWRCeU1vbGVjdWxlID0gZmFsc2U7XHJcbiAgICBcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKG1vbGVjdWxlID0+IHtcclxuICAgICAgICBpZiAobW9sZWN1bGUuZG91YmxlQ2xpY2soZXZlbnQuY2xpZW50WCxldmVudC5jbGllbnRZKSA9PSB0cnVlKXtcclxuICAgICAgICAgICAgY2xpY2tIYW5kbGVkQnlNb2xlY3VsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGlmIChjbGlja0hhbmRsZWRCeU1vbGVjdWxlID09IGZhbHNlKXtcclxuICAgICAgICBzaG93bWVudShldmVudCk7XHJcbiAgICB9XHJcbn0pXHJcblxyXG5mbG93Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBldmVudCA9PiB7XHJcbiAgICAvL2V2ZXJ5IHRpbWUgdGhlIG1vdXNlIGJ1dHRvbiBnb2VzIHVwXHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgbW9sZWN1bGUuY2xpY2tVcChldmVudC5jbGllbnRYLGV2ZW50LmNsaWVudFkpOyAgICAgIFxyXG4gICAgfSk7XHJcbn0pXHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcclxuICAgIC8vZXZlcnkgdGltZSB0aGUgbW91c2UgYnV0dG9uIGdvZXMgdXBcclxuICAgIFxyXG4gICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2gobW9sZWN1bGUgPT4ge1xyXG4gICAgICAgIG1vbGVjdWxlLmtleVByZXNzKGV2ZW50LmtleSk7ICAgICAgXHJcbiAgICB9KTtcclxufSlcclxuXHJcblxyXG4vLyBJbXBsZW1lbnRhdGlvblxyXG5cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUgPSBuZXcgTW9sZWN1bGUoe1xyXG4gICAgICAgIHg6IDAsIFxyXG4gICAgICAgIHk6IDAsIFxyXG4gICAgICAgIHRvcExldmVsOiB0cnVlLCBcclxuICAgICAgICBuYW1lOiBcIk1hc2xvdyBDcmVhdGVcIixcclxuICAgICAgICBhdG9tVHlwZTogXCJNb2xlY3VsZVwiLFxyXG4gICAgICAgIHVuaXF1ZUlEOiBnZW5lcmF0ZVVuaXF1ZUlEKClcclxuICAgIH0pO1xyXG4gICAgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlVW5pcXVlSUQoKXtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqOTAwMDAwKSArIDEwMDAwMDtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlzdEJldHdlZW5Qb2ludHMoeDEsIHgyLCB5MSwgeTIpe1xyXG4gICAgdmFyIGEyID0gTWF0aC5wb3coeDEgLSB4MiwgMik7XHJcbiAgICB2YXIgYjIgPSBNYXRoLnBvdyh5MSAtIHkyLCAyKTtcclxuICAgIHZhciBkaXN0ID0gTWF0aC5zcXJ0KGEyICsgYjIpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZGlzdDtcclxufVxyXG5cclxuLy8gQW5pbWF0aW9uIExvb3BcclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jLmNsZWFyUmVjdCgwLCAwLCBHbG9iYWxWYXJpYWJsZXMuY2FudmFzLndpZHRoLCBHbG9iYWxWYXJpYWJsZXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICBcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKG1vbGVjdWxlID0+IHtcclxuICAgICAgICBtb2xlY3VsZS51cGRhdGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5pbml0KClcclxuYW5pbWF0ZSgpXHJcbiIsImltcG9ydCBDaXJjbGUgZnJvbSAnLi9tb2xlY3VsZXMvY2lyY2xlLmpzJ1xyXG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4vbW9sZWN1bGVzL3JlY3RhbmdsZS5qcydcclxuaW1wb3J0IFNocmlua1dyYXAgZnJvbSAnLi9tb2xlY3VsZXMvc2hyaW5rd3JhcC5qcydcclxuaW1wb3J0IFRyYW5zbGF0ZSBmcm9tICcuL21vbGVjdWxlcy90cmFuc2xhdGUuanMnXHJcbmltcG9ydCBSZWd1bGFyUG9seWdvbiBmcm9tICcuL21vbGVjdWxlcy9yZWd1bGFycG9seWdvbi5qcydcclxuaW1wb3J0IEV4dHJ1ZGUgZnJvbSAnLi9tb2xlY3VsZXMvZXh0cnVkZS5qcydcclxuaW1wb3J0IFNjYWxlIGZyb20gJy4vbW9sZWN1bGVzL3NjYWxlLmpzJ1xyXG5pbXBvcnQgVW5pb24gZnJvbSAnLi9tb2xlY3VsZXMvdW5pb24uanMnXHJcbmltcG9ydCBJbnRlcnNlY3Rpb24gZnJvbSAnLi9tb2xlY3VsZXMvaW50ZXJzZWN0aW9uLmpzJ1xyXG5pbXBvcnQgRGlmZmVyZW5jZSBmcm9tICcuL21vbGVjdWxlcy9kaWZmZXJlbmNlLmpzJ1xyXG5pbXBvcnQgQ29uc3RhbnQgZnJvbSAnLi9tb2xlY3VsZXMvY29uc3RhbnQuanMnXHJcbmltcG9ydCBFcXVhdGlvbiBmcm9tICcuL21vbGVjdWxlcy9lcXVhdGlvbi5qcydcclxuaW1wb3J0IE1vbGVjdWxlIGZyb20gJy4vbW9sZWN1bGVzL21vbGVjdWxlLmpzJ1xyXG5pbXBvcnQgSW5wdXQgZnJvbSAnLi9tb2xlY3VsZXMvaW5wdXQuanMnXHJcbmltcG9ydCBSZWFkbWUgZnJvbSAnLi9tb2xlY3VsZXMvcmVhZG1lLmpzJ1xyXG5pbXBvcnQgUm90YXRlIGZyb20gJy4vbW9sZWN1bGVzL3JvdGF0ZS5qcydcclxuaW1wb3J0IE1pcnJvciBmcm9tICcuL21vbGVjdWxlcy9taXJyb3IuanMnXHJcbmltcG9ydCBHaXRIdWJNb2xlY3VsZSBmcm9tICcuL21vbGVjdWxlcy9naXRodWJtb2xlY3VsZS5qcydcclxuaW1wb3J0IE91dHB1dCBmcm9tICcuL21vbGVjdWxlcy9vdXRwdXQuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxWYXJpYWJsZXN7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbFxyXG4gICAgICAgIHRoaXMuYyA9IG51bGxcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZVR5cGVzID0ge1xyXG4gICAgICAgICAgICBjaXJjbGU6ICAgICAgICB7Y3JlYXRvcjogQ2lyY2xlLCBhdG9tVHlwZTogXCJDaXJjbGVcIn0sXHJcbiAgICAgICAgICAgIHJlY3RhbmdsZTogICAgIHtjcmVhdG9yOiBSZWN0YW5nbGUsIGF0b21UeXBlOiBcIlJlY3RhbmdsZVwifSxcclxuICAgICAgICAgICAgc2hpcmlua3dyYXA6ICAge2NyZWF0b3I6IFNocmlua1dyYXAsIGF0b21UeXBlOiBcIlNocmlua1dyYXBcIn0sXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogICAgIHtjcmVhdG9yOiBUcmFuc2xhdGUsIGF0b21UeXBlOiBcIlRyYW5zbGF0ZVwifSxcclxuICAgICAgICAgICAgcmVndWxhclBvbHlnb246e2NyZWF0b3I6IFJlZ3VsYXJQb2x5Z29uLCBhdG9tVHlwZTogXCJSZWd1bGFyUG9seWdvblwifSxcclxuICAgICAgICAgICAgZXh0cnVkZTogICAgICAge2NyZWF0b3I6IEV4dHJ1ZGUsIGF0b21UeXBlOiBcIkV4dHJ1ZGVcIn0sXHJcbiAgICAgICAgICAgIHNjYWxlOiAgICAgICAgIHtjcmVhdG9yOiBTY2FsZSwgYXRvbVR5cGU6IFwiU2NhbGVcIn0sXHJcbiAgICAgICAgICAgIGludGVyc2VjdGlvbjogIHtjcmVhdG9yOiBJbnRlcnNlY3Rpb24sIGF0b21UeXBlOiBcIkludGVyc2VjdGlvblwifSxcclxuICAgICAgICAgICAgZGlmZmVyZW5jZTogICAge2NyZWF0b3I6IERpZmZlcmVuY2UsIGF0b21UeXBlOiBcIkRpZmZlcmVuY2VcIn0sXHJcbiAgICAgICAgICAgIGNvc3RhbnQ6ICAgICAgIHtjcmVhdG9yOiBDb25zdGFudCwgYXRvbVR5cGU6IFwiQ29uc3RhbnRcIn0sXHJcbiAgICAgICAgICAgIGVxdWF0aW9uOiAgICAgIHtjcmVhdG9yOiBFcXVhdGlvbiwgYXRvbVR5cGU6IFwiRXF1YXRpb25cIn0sXHJcbiAgICAgICAgICAgIG1vbGVjdWxlOiAgICAgIHtjcmVhdG9yOiBNb2xlY3VsZSwgYXRvbVR5cGU6IFwiTW9sZWN1bGVcIn0sXHJcbiAgICAgICAgICAgIGlucHV0OiAgICAgICAgIHtjcmVhdG9yOiBJbnB1dCwgYXRvbVR5cGU6IFwiSW5wdXRcIn0sXHJcbiAgICAgICAgICAgIHJlYWRtZTogICAgICAgIHtjcmVhdG9yOiBSZWFkbWUsIGF0b21UeXBlOiBcIlJlYWRtZVwifSxcclxuICAgICAgICAgICAgcm90YXRlOiAgICAgICAge2NyZWF0b3I6IFJvdGF0ZSwgYXRvbVR5cGU6IFwiUm90YXRlXCJ9LFxyXG4gICAgICAgICAgICBtaXJyb3I6ICAgICAgICB7Y3JlYXRvcjogTWlycm9yLCBhdG9tVHlwZTogXCJNaXJyb3JcIn0sXHJcbiAgICAgICAgICAgIGdpdGh1Ym1vbGVjdWxlOntjcmVhdG9yOiBHaXRIdWJNb2xlY3VsZSwgYXRvbVR5cGU6IFwiR2l0SHViTW9sZWN1bGVcIn0sXHJcbiAgICAgICAgICAgIHVuaW9uOiAgICAgICAgIHtjcmVhdG9yOiBVbmlvbiwgYXRvbVR5cGU6IFwiVW5pb25cIn1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2VjcmV0VHlwZXMgPSB7XHJcbiAgICAgICAgICAgIG91dHB1dDogICAgICAgIHtjcmVhdG9yOiBPdXRwdXQsIGF0b21UeXBlOiBcIk91dHB1dFwifVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudE1vbGVjdWxlO1xyXG4gICAgICAgIHRoaXMudG9wTGV2ZWxNb2xlY3VsZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZUJhcicpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEdsb2JhbFZhcmlhYmxlcyBmcm9tICcuL2dsb2JhbHZhcmlhYmxlcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbnUge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLm1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudScpO1xyXG4gICAgICAgIHRoaXMubWVudS5jbGFzc0xpc3QuYWRkKCdvZmYnKTtcclxuICAgICAgICB0aGlzLm1lbnVMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZW51TGlzdFwiKTtcclxuICAgIFxyXG4gICAgICAgIC8vQWRkIHRoZSBzZWFyY2ggYmFyIHRvIHRoZSBsaXN0IGl0ZW1cclxuICAgIFxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIEdsb2JhbFZhcmlhYmxlcy5hdmFpbGFibGVUeXBlcykge1xyXG4gICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKTtcclxuICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gR2xvYmFsVmFyaWFibGVzLmF2YWlsYWJsZVR5cGVzW2tleV07XHJcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaW5zdGFuY2UuYXRvbVR5cGUpO1xyXG4gICAgICAgICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwibWVudS1pdGVtXCIpO1xyXG4gICAgICAgICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIGluc3RhbmNlLmF0b21UeXBlKTtcclxuICAgICAgICAgICAgbmV3RWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0KTsgXHJcbiAgICAgICAgICAgIG1lbnVMaXN0LmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpOyBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGluc3RhbmNlLmF0b21UeXBlKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBsYWNlTmV3Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwbGFjZU5ld05vZGUoZXYpe1xyXG4gICAgICAgIGhpZGVtZW51KCk7XHJcbiAgICAgICAgbGV0IGNsciA9IGV2LnRhcmdldC5pZDtcclxuICAgICAgICBcclxuICAgICAgICBjdXJyZW50TW9sZWN1bGUucGxhY2VBdG9tKHtcclxuICAgICAgICAgICAgeDogbWVudS54LCBcclxuICAgICAgICAgICAgeTogbWVudS55LCBcclxuICAgICAgICAgICAgcGFyZW50OiBjdXJyZW50TW9sZWN1bGUsXHJcbiAgICAgICAgICAgIGF0b21UeXBlOiBjbHIsXHJcbiAgICAgICAgICAgIHVuaXF1ZUlEOiBnZW5lcmF0ZVVuaXF1ZUlEKClcclxuICAgICAgICB9LCBudWxsLCBhdmFpbGFibGVUeXBlcyk7IC8vbnVsbCBpbmRpY2F0ZXMgdGhhdCB0aGVyZSBpcyBub3RoaW5nIHRvIGxvYWQgZnJvbSB0aGUgbW9sZWN1bGUgbGlzdCBmb3IgdGhpcyBvbmVcclxuICAgIH1cclxuXHJcbiAgICBwbGFjZUdpdEh1Yk1vbGVjdWxlKGV2KXtcclxuICAgICAgICBoaWRlbWVudSgpO1xyXG4gICAgICAgIGxldCBjbHIgPSBldi50YXJnZXQuaWQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3VycmVudE1vbGVjdWxlLnBsYWNlQXRvbSh7XHJcbiAgICAgICAgICAgIHg6IG1lbnUueCwgXHJcbiAgICAgICAgICAgIHk6IG1lbnUueSwgXHJcbiAgICAgICAgICAgIHBhcmVudDogY3VycmVudE1vbGVjdWxlLFxyXG4gICAgICAgICAgICBhdG9tVHlwZTogXCJHaXRIdWJNb2xlY3VsZVwiLFxyXG4gICAgICAgICAgICBwcm9qZWN0SUQ6IGNscixcclxuICAgICAgICAgICAgdW5pcXVlSUQ6IGdlbmVyYXRlVW5pcXVlSUQoKVxyXG4gICAgICAgIH0sIG51bGwsIGF2YWlsYWJsZVR5cGVzKTsgLy9udWxsIGluZGljYXRlcyB0aGF0IHRoZXJlIGlzIG5vdGhpbmcgdG8gbG9hZCBmcm9tIHRoZSBtb2xlY3VsZSBsaXN0IGZvciB0aGlzIG9uZVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dtZW51KGV2KXtcclxuICAgICAgICAvL09wZW4gdGhlIGRlZmF1bHQgdGFiXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2NhbFRhYlwiKS5jbGljaygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc3RvcCB0aGUgcmVhbCByaWdodCBjbGljayBtZW51XHJcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9tYWtlIHN1cmUgYWxsIGVsZW1lbnRzIGFyZSB1bmhpZGRlblxyXG4gICAgICAgIHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZW51TGlzdFwiKTtcclxuICAgICAgICBsaSA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsaVtpXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7IC8vc2V0IGVhY2ggaXRlbSB0byBub3QgZGlzcGxheVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL3Nob3cgdGhlIG1lbnVcclxuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IGAke2V2LmNsaWVudFkgLSAyMH1weGA7XHJcbiAgICAgICAgbWVudS5zdHlsZS5sZWZ0ID0gYCR7ZXYuY2xpZW50WCAtIDIwfXB4YDtcclxuICAgICAgICBtZW51LnggPSBldi5jbGllbnRYO1xyXG4gICAgICAgIG1lbnUueSA9IGV2LmNsaWVudFk7XHJcbiAgICAgICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKCdvZmYnKTtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVudUlucHV0JykuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlbWVudShldil7XHJcbiAgICAgICAgbWVudS5jbGFzc0xpc3QuYWRkKCdvZmYnKTtcclxuICAgICAgICBtZW51LnN0eWxlLnRvcCA9ICctMjAwJSc7XHJcbiAgICAgICAgbWVudS5zdHlsZS5sZWZ0ID0gJy0yMDAlJztcclxuICAgIH1cclxuXHJcbiAgICBzZWFyY2hNZW51KGV2dCkge1xyXG4gICAgICBcclxuICAgICAgICBpZihkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGFibGlua3MgYWN0aXZlXCIpWzBdLmlkID09IFwibG9jYWxUYWJcIil7XHJcbiAgICAgICAgICAgIC8vV2UgYXJlIHNlYXJjaGluZyB0aGUgbG9jYWwgdGFiXHJcbiAgICAgICAgICAgIC8vIERlY2xhcmUgdmFyaWFibGVzXHJcbiAgICAgICAgICAgIHZhciBpbnB1dCwgZmlsdGVyLCB1bCwgbGksIGEsIGksIHR4dFZhbHVlO1xyXG4gICAgICAgICAgICBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51SW5wdXQnKTtcclxuICAgICAgICAgICAgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgdWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lbnVMaXN0XCIpO1xyXG4gICAgICAgICAgICBsaSA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpO1xyXG5cclxuICAgICAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBsaXN0IGl0ZW1zLCBhbmQgaGlkZSB0aG9zZSB3aG8gZG9uJ3QgbWF0Y2ggdGhlIHNlYXJjaCBxdWVyeVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGEgPSBsaVtpXTsgLy90aGlzIGlzIHRoZSBsaW5rIHBhcnQgb2YgdGhlIGxpc3QgaXRlbVxyXG4gICAgICAgICAgICAgICAgdHh0VmFsdWUgPSBhLnRleHRDb250ZW50IHx8IGEuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHR4dFZhbHVlLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXIpID4gLTEpIHsgLy9pZiB0aGUgZW50ZXJlZCBzdHJpbmcgbWF0Y2hlc1xyXG4gICAgICAgICAgICAgICAgICAgIGxpW2ldLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsaVtpXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vSWYgZW50ZXIgd2FzIGp1c3QgcHJlc3NlZCBcImNsaWNrXCIgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdCBpcyBiZWluZyBkaXNwbGF5ZWRcclxuICAgICAgICAgICAgICAgIGlmKGV2dC5jb2RlID09IFwiRW50ZXJcIiAmJiBsaVtpXS5zdHlsZS5kaXNwbGF5ICE9IFwibm9uZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICBsaVtpXS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAvL1dlIGFyZSBzZWFyY2hpbmcgb24gZ2l0aHViXHJcbiAgICAgICAgICAgIGlmKGV2dC5jb2RlID09IFwiRW50ZXJcIil7XHJcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51SW5wdXQnKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZ2l0aHViTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2l0aHViTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgb2xkUmVzdWx0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtZW51LWl0ZW1cIik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2xkUmVzdWx0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9sZFJlc3VsdHNbaV0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBvY3Rva2l0LnNlYXJjaC5yZXBvcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgcTogaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydDogXCJzdGFyc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIHBlcl9wYWdlOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9waWM6IFwibWFzbG93Y3JlYXRlLW1vbGVjdWxlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZTogMSxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIubWVyY3ktcHJldmlldytqc29uJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZGF0YS5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnRvcGljcy5pbmNsdWRlcyhcIm1hc2xvd2NyZWF0ZS1tb2xlY3VsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGl0ZW0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwibWVudS1pdGVtXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpdGVtLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VsZW1lbnQuYXBwZW5kQ2hpbGQodGV4dCk7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2l0aHViTGlzdC5hcHBlbmRDaGlsZChuZXdFbGVtZW50KTsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW0uaWQpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxhY2VHaXRIdWJNb2xlY3VsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3BlblRhYihldnQsIHRhYk5hbWUpIHtcclxuICAgICAgLy8gRGVjbGFyZSBhbGwgdmFyaWFibGVzXHJcbiAgICAgIHZhciBpLCB0YWJjb250ZW50LCB0YWJsaW5rcztcclxuXHJcbiAgICAgIC8vIEdldCBhbGwgZWxlbWVudHMgd2l0aCBjbGFzcz1cInRhYmNvbnRlbnRcIiBhbmQgaGlkZSB0aGVtXHJcbiAgICAgIHRhYmNvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGFiY29udGVudFwiKTtcclxuICAgICAgZm9yIChpID0gMDsgaSA8IHRhYmNvbnRlbnQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0YWJjb250ZW50W2ldLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2V0IGFsbCBlbGVtZW50cyB3aXRoIGNsYXNzPVwidGFibGlua3NcIiBhbmQgcmVtb3ZlIHRoZSBjbGFzcyBcImFjdGl2ZVwiXHJcbiAgICAgIHRhYmxpbmtzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRhYmxpbmtzXCIpO1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGFibGlua3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0YWJsaW5rc1tpXS5jbGFzc05hbWUgPSB0YWJsaW5rc1tpXS5jbGFzc05hbWUucmVwbGFjZShcIiBhY3RpdmVcIiwgXCJcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNob3cgdGhlIGN1cnJlbnQgdGFiLCBhbmQgYWRkIGFuIFwiYWN0aXZlXCIgY2xhc3MgdG8gdGhlIGJ1dHRvbiB0aGF0IG9wZW5lZCB0aGUgdGFiXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhYk5hbWUpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgIGV2dC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZSArPSBcIiBhY3RpdmVcIjtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZSBleHRlbmRzIEF0b20ge1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDaXJjbGVcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJDaXJjbGVcIjtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSBcImNpcmNsZSh7cjogfnJhZGl1c34sIGNlbnRlcjogdHJ1ZSwgZm46IDI1fSlcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwicmFkaXVzXCIsIHRoaXMsIFwibnVtYmVyXCIsIDEwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJtYXggc2VnbWVudCBzaXplXCIsIHRoaXMsIFwibnVtYmVyXCIsIDQpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9nZW5lcmF0ZSB0aGUgY29ycmVjdCBjb2RlYmxvY2sgZm9yIHRoaXMgYXRvbSBvbiBjcmVhdGlvblxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29kZUJsb2NrKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZUNvZGVCbG9jaygpe1xyXG4gICAgICAgIC8vT3ZlcndyaXRlIHRoZSBub3JtYWwgdXBkYXRlIGNvZGUgYmxvY2sgdG8gdXBkYXRlIHRoZSBudW1iZXIgb2Ygc2VnbWVudHMgYWxzb1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBtYXhpbXVtU2VnbWVudFNpemUgPSB0aGlzLmZpbmRJT1ZhbHVlKFwibWF4IHNlZ21lbnQgc2l6ZVwiKTtcclxuICAgICAgICB2YXIgY2lyY3VtZmVyZW5jZSAgPSAzLjE0KjIqdGhpcy5maW5kSU9WYWx1ZShcInJhZGl1c1wiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgbnVtYmVyT2ZTZWdtZW50cyA9IHBhcnNlSW50KCBjaXJjdW1mZXJlbmNlIC8gbWF4aW11bVNlZ21lbnRTaXplICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHJlZ2V4ID0gL2ZuOiAoXFxkKylcXH0vZ2k7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gdGhpcy5kZWZhdWx0Q29kZUJsb2NrLnJlcGxhY2UocmVnZXgsIFwiZm46IFwiICsgbnVtYmVyT2ZTZWdtZW50cyArIFwifVwiKTtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlci51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnN0YW50IGV4dGVuZHMgQXRvbXtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcImNvbnN0YW50XCI7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDb25zdGFudFwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIkNvbnN0YW50XCI7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAxNjtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDE1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcIm51bWJlclwiLCB0aGlzLCBcIm51bWJlclwiLCAxMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmlvVmFsdWVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsdWVzLmZvckVhY2goaW9WYWx1ZSA9PiB7IC8vZm9yIGVhY2ggc2F2ZWQgdmFsdWVcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7ICAvL0ZpbmQgdGhlIG1hdGNoaW5nIElPIGFuZCBzZXQgaXQgdG8gYmUgdGhlIHNhdmVkIHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaW9WYWx1ZS5uYW1lID09IGlvLm5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpby5zZXRWYWx1ZShpb1ZhbHVlLmlvVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZVNpZGViYXIoKXtcclxuICAgICAgICAvL3VwZGF0ZXMgdGhlIHNpZGViYXIgdG8gZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG5vZGVcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gc3VwZXIudXBkYXRlU2lkZWJhcigpOyAvL2NhbGwgdGhlIHN1cGVyIGZ1bmN0aW9uXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuY2hpbGRyZW5bMF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0odmFsdWVMaXN0LG91dHB1dCxcInZhbHVlXCIsIFwiVmFsdWVcIiwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0odmFsdWVMaXN0LHRoaXMsXCJuYW1lXCIsIFwiTmFtZVwiLCBmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFZhbHVlKG5ld05hbWUpe1xyXG4gICAgICAgIC8vQ2FsbGVkIGJ5IHRoZSBzaWRlYmFyIHRvIHNldCB0aGUgbmFtZVxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5ld05hbWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlcmlhbGl6ZSh2YWx1ZXMpe1xyXG4gICAgICAgIC8vU2F2ZSB0aGUgSU8gdmFsdWUgdG8gdGhlIHNlcmlhbCBzdHJlYW1cclxuICAgICAgICB2YXIgdmFsdWVzT2JqID0gc3VwZXIuc2VyaWFsaXplKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFsdWVzT2JqLmlvVmFsdWVzID0gW3tcclxuICAgICAgICAgICAgbmFtZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgaW9WYWx1ZTogdGhpcy5jaGlsZHJlblswXS5nZXRWYWx1ZSgpXHJcbiAgICAgICAgfV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlc09iajtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5kcmF3KCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgYy5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgICAgIGMucmVjdCh0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5oZWlnaHQvMiwgMip0aGlzLnJhZGl1cywgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIGMudGV4dEFsaWduID0gXCJzdGFydFwiOyBcclxuICAgICAgICBjLmZpbGxUZXh0KHRoaXMubmFtZSwgdGhpcy54ICsgdGhpcy5yYWRpdXMsIHRoaXMueS10aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgYy5maWxsKCk7XHJcbiAgICAgICAgYy5jbG9zZVBhdGgoKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmZXJlbmNlIGV4dGVuZHMgQXRvbXtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKHZhbHVlcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeTFcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeTJcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIkRpZmZlcmVuY2VcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJEaWZmZXJlbmNlXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJkaWZmZXJlbmNlKH5nZW9tZXRyeTF+LH5nZW9tZXRyeTJ+KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXF1YXRpb24gZXh0ZW5kcyBBdG9tIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInhcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieVwiLCB0aGlzLCBcIm51bWJlclwiLCAwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwielwiLCB0aGlzLCBcIm51bWJlclwiLCAwKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIkVxdWF0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiRXF1YXRpb25cIjtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLmVxdWF0aW9uT3B0aW9ucyA9IFtcIngreVwiLCBcIngteVwiLCBcIngqeVwiLCBcIngveVwiLCBcImNvcyh4KVwiLCBcInNpbih4KVwiLCBcInheeVwiXTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRFcXVhdGlvbiA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VyaWFsaXplKHNhdmVkT2JqZWN0KXtcclxuICAgICAgICB2YXIgc3VwZXJTZXJpYWxPYmplY3QgPSBzdXBlci5zZXJpYWxpemUobnVsbCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9Xcml0ZSB0aGUgY3VycmVudCBlcXVhdGlvbiB0byB0aGUgc2VyaWFsaXplZCBvYmplY3RcclxuICAgICAgICBzdXBlclNlcmlhbE9iamVjdC5jdXJyZW50RXF1YXRpb24gPSB0aGlzLmN1cnJlbnRFcXVhdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gc3VwZXJTZXJpYWxPYmplY3Q7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZUNvZGVCbG9jaygpe1xyXG4gICAgICAgIC8vQSBzdXBlciBjbGFzc2VkIHZlcnNpb24gb2YgdGhlIHVwZGF0ZSBjb2RlYmxvY2sgZGVmYXVsdCBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgZXF1YXRpb24gdmFsdWVzXHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmZpbmRJT1ZhbHVlKFwieFwiKTtcclxuICAgICAgICB2YXIgeSA9IHRoaXMuZmluZElPVmFsdWUoXCJ5XCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB6O1xyXG4gICAgICAgIHN3aXRjaCh0aGlzLmN1cnJlbnRFcXVhdGlvbil7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIHogPSB4K3k7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgeiA9IHgteTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICB6ID0geCp5O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIHogPSB4L3k7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgeiA9IE1hdGguY29zKHgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIHogPSBNYXRoLnNpbih4KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICB6ID0gTWF0aC5wb3coeCx5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvcHRpb25zIGZvdW5kXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50RXF1YXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL1NldCB0aGUgb3V0cHV0IHRvIGJlIHRoZSBnZW5lcmF0ZWQgdmFsdWVcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC50eXBlID09ICdvdXRwdXQnKXtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnNldFZhbHVlKHopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNoYW5nZUVxdWF0aW9uKG5ld1ZhbHVlKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnRFcXVhdGlvbiA9IHBhcnNlSW50KG5ld1ZhbHVlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVTaWRlYmFyKCl7XHJcbiAgICAgICAgLy9VcGRhdGUgdGhlIHNpZGUgYmFyIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gY2hhbmdlIHRoZSBtb2xlY3VsZSBuYW1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHZhbHVlTGlzdCA9IHN1cGVyLnVwZGF0ZVNpZGViYXIoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNyZWF0ZURyb3BEb3duKHZhbHVlTGlzdCwgdGhpcywgdGhpcy5lcXVhdGlvbk9wdGlvbnMsIHRoaXMuY3VycmVudEVxdWF0aW9uLCBcInogPSBcIik7XHJcbiAgICAgICAgXHJcbiAgICB9IFxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXh0cnVkZSBleHRlbmRzIEF0b217XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIkV4dHJ1ZGVcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJFeHRydWRlXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJsaW5lYXJfZXh0cnVkZSh7IGhlaWdodDogfmhlaWdodH4gfSwgfmdlb21ldHJ5filcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnlcIiAsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiaGVpZ2h0XCIgICAsIHRoaXMsIFwibnVtYmVyXCIsIDEwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IE1vbGVjdWxlIGZyb20gJy4uL21vbGVjdWxlcy9tb2xlY3VsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdpdEh1Yk1vbGVjdWxlIGV4dGVuZHMgTW9sZWN1bGUge1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJHaXRodWIgTW9sZWN1bGVcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJHaXRIdWJNb2xlY3VsZVwiO1xyXG4gICAgICAgIHRoaXMudG9wTGV2ZWwgPSBmYWxzZTsgLy9hIGZsYWcgdG8gc2lnbmFsIGlmIHRoaXMgbm9kZSBpcyB0aGUgdG9wIGxldmVsIG5vZGVcclxuICAgICAgICB0aGlzLmNlbnRlckNvbG9yID0gXCJibGFja1wiO1xyXG4gICAgICAgIHRoaXMucHJvamVjdElEID0gMTc0MjkyMzAyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sb2FkUHJvamVjdEJ5SUQodGhpcy5wcm9qZWN0SUQpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkb3VibGVDbGljayh4LHkpe1xyXG4gICAgICAgIC8vUHJldmVudCB5b3UgZnJvbSBiZWluZyBhYmxlIHRvIGRvdWJsZSBjbGljayBpbnRvIGEgZ2l0aHViIG1vbGVjdWxlXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGNsaWNrUHJvY2Vzc2VkID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGRpc3RGcm9tQ2xpY2sgPSBkaXN0QmV0d2VlblBvaW50cyh4LCB0aGlzLngsIHksIHRoaXMueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRpc3RGcm9tQ2xpY2sgPCB0aGlzLnJhZGl1cyl7XHJcbiAgICAgICAgICAgIGNsaWNrUHJvY2Vzc2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGNsaWNrUHJvY2Vzc2VkOyBcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9hZFByb2plY3RCeUlEKGlkKXtcclxuICAgIC8vR2V0IHRoZSByZXBvIGJ5IElEXHJcbiAgICAgICAgb2N0b2tpdC5yZXF1ZXN0KCdHRVQgL3JlcG9zaXRvcmllcy86aWQnLCB7aWR9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL0ZpbmQgb3V0IHRoZSBvd25lcnMgaW5mbztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciB1c2VyICAgICA9IHJlc3VsdC5kYXRhLm93bmVyLmxvZ2luO1xyXG4gICAgICAgICAgICB2YXIgcmVwb05hbWUgPSByZXN1bHQuZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9HZXQgdGhlIGZpbGUgY29udGVudHNcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG9jdG9raXQucmVwb3MuZ2V0Q29udGVudHMoe1xyXG4gICAgICAgICAgICAgICAgb3duZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICByZXBvOiByZXBvTmFtZSxcclxuICAgICAgICAgICAgICAgIHBhdGg6ICdwcm9qZWN0Lm1hc2xvd2NyZWF0ZSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9jb250ZW50IHdpbGwgYmUgYmFzZTY0IGVuY29kZWRcclxuICAgICAgICAgICAgICAgIGxldCByYXdGaWxlID0gYXRvYihyZXN1bHQuZGF0YS5jb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGxldCBtb2xlY3VsZXNMaXN0ID0gIEpTT04ucGFyc2UocmF3RmlsZSkubW9sZWN1bGVzO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VyaWFsaXplKG1vbGVjdWxlc0xpc3QsIG1vbGVjdWxlc0xpc3QuZmlsdGVyKChtb2xlY3VsZSkgPT4geyByZXR1cm4gbW9sZWN1bGUudG9wTGV2ZWwgPT0gdHJ1ZTsgfSlbMF0udW5pcXVlSUQpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcExldmVsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vVHJ5IHRvIHJlLWVzdGFibGlzaCB0aGUgY29ubmVjdG9ycyBpbiB0aGUgcGFyZW50IG1vbGVjdWxlIHRvIGdldCB0aGUgb25lcyB0aGF0IHdlcmUgbWlzc2VkIGJlZm9yZSB3aGVuIHRoaXMgbW9sZWN1bGUgaGFkIG5vdCB5ZXQgYmVlbiBmdWxseSBsb2FkZWRcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNhdmVkQ29ubmVjdG9ycy5mb3JFYWNoKGNvbm5lY3RvciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucGxhY2VDb25uZWN0b3IoSlNPTi5wYXJzZShjb25uZWN0b3IpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VyaWFsaXplKHNhdmVkT2JqZWN0KXtcclxuICAgICAgICBcclxuICAgICAgICAvL1JldHVybiBhIHBsYWNlaG9sZGVyIGZvciB0aGlzIG1vbGVjdWxlXHJcbiAgICAgICAgdmFyIG9iamVjdCA9IHtcclxuICAgICAgICAgICAgYXRvbVR5cGU6IHRoaXMuYXRvbVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgICAgIHVuaXF1ZUlEOiB0aGlzLnVuaXF1ZUlELFxyXG4gICAgICAgICAgICBwcm9qZWN0SUQ6IHRoaXMucHJvamVjdElEXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZVNpZGViYXIoKXtcclxuICAgICAgICAvL3VwZGF0ZXMgdGhlIHNpZGViYXIgdG8gZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG5vZGVcclxuICAgICAgICBcclxuICAgICAgICAvL3JlbW92ZSBldmVyeXRoaW5nIGluIHRoZSBzaWRlQmFyIG5vd1xyXG4gICAgICAgIHdoaWxlIChzaWRlQmFyLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgc2lkZUJhci5yZW1vdmVDaGlsZChzaWRlQmFyLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL2FkZCB0aGUgbmFtZSBhcyBhIHRpdGxlXHJcbiAgICAgICAgdmFyIG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgIG5hbWUudGV4dENvbnRlbnQgPSB0aGlzLm5hbWU7XHJcbiAgICAgICAgbmFtZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFwidGV4dC1hbGlnbjpjZW50ZXI7XCIpO1xyXG4gICAgICAgIHNpZGVCYXIuYXBwZW5kQ2hpbGQobmFtZSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dCBleHRlbmRzIEF0b20ge1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIHN1cGVyICh2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiSW5wdXRcIiArIGdlbmVyYXRlVW5pcXVlSUQoKTtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJpbnB1dFwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIklucHV0XCI7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAxNjtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDE1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcIm51bWJlciBvciBnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQWRkIGEgbmV3IGlucHV0IHRvIHRoZSBjdXJyZW50IG1vbGVjdWxlXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhcmVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuYWRkSU8oXCJpbnB1dFwiLCB0aGlzLm5hbWUsIHRoaXMucGFyZW50LCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlU2lkZWJhcigpe1xyXG4gICAgICAgIC8vdXBkYXRlcyB0aGUgc2lkZWJhciB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGFib3V0IHRoaXMgbm9kZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSAgc3VwZXIudXBkYXRlU2lkZWJhcigpOyAvL2NhbGwgdGhlIHN1cGVyIGZ1bmN0aW9uXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0odmFsdWVMaXN0LHRoaXMsXCJuYW1lXCIsIFwiTmFtZVwiLCBmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgY2hpbGQuZHJhdygpOyAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBjLmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYy50ZXh0QWxpZ24gPSBcInN0YXJ0XCI7IFxyXG4gICAgICAgIGMuZmlsbFRleHQodGhpcy5uYW1lLCB0aGlzLnggKyB0aGlzLnJhZGl1cywgdGhpcy55LXRoaXMucmFkaXVzKTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBjLm1vdmVUbyh0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5oZWlnaHQvMik7XHJcbiAgICAgICAgYy5saW5lVG8odGhpcy54IC0gdGhpcy5yYWRpdXMgKyAxMCwgdGhpcy55KTtcclxuICAgICAgICBjLmxpbmVUbyh0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55ICsgdGhpcy5oZWlnaHQvMik7XHJcbiAgICAgICAgYy5saW5lVG8odGhpcy54ICsgdGhpcy5yYWRpdXMsIHRoaXMueSArIHRoaXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIGMubGluZVRvKHRoaXMueCArIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLmhlaWdodC8yKTtcclxuICAgICAgICBjLmZpbGwoKTtcclxuICAgICAgICBjLmNsb3NlUGF0aCgpO1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgZGVsZXRlTm9kZSgpIHtcclxuICAgICAgICBcclxuICAgICAgICAvL1JlbW92ZSB0aGlzIGlucHV0IGZyb20gdGhlIHBhcmVudCBtb2xlY3VsZVxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJlbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZUlPKFwiaW5wdXRcIiwgdGhpcy5uYW1lLCB0aGlzLnBhcmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyLmRlbGV0ZU5vZGUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0VmFsdWUodGhlTmV3TmFtZSl7XHJcbiAgICAgICAgLy9DYWxsZWQgYnkgdGhlIHNpZGViYXIgdG8gc2V0IHRoZSBuYW1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SdW4gdGhyb3VnaCB0aGUgcGFyZW50IG1vbGVjdWxlIGFuZCBmaW5kIHRoZSBpbnB1dCB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAgICB0aGlzLnBhcmVudC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT0gdGhpcy5uYW1lKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IHRoZU5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5uYW1lID0gdGhlTmV3TmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRPdXRwdXQobmV3T3V0cHV0KXtcclxuICAgICAgICAvL1NldCB0aGUgaW5wdXQncyBvdXRwdXRcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IG5ld091dHB1dDsgIC8vU2V0IHRoZSBjb2RlIGJsb2NrIHNvIHRoYXQgY2xpY2tpbmcgb24gdGhlIGlucHV0IHByZXZpZXdzIHdoYXQgaXQgaXMgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgdGhlIG91dHB1dCBub2RlcyB3aXRoIHR5cGUgJ2dlb21ldHJ5JyB0byBiZSB0aGUgbmV3IHZhbHVlXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY2hpbGQudmFsdWVUeXBlID09ICdnZW9tZXRyeScgJiYgY2hpbGQudHlwZSA9PSAnb3V0cHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zZXRWYWx1ZShuZXdPdXRwdXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICB1cGRhdGVDb2RlQmxvY2soKXtcclxuICAgICAgICAvL1RoaXMgZW1wdHkgZnVuY3Rpb24gaGFuZGxlcyBhbnkgY2FsbHMgdG8gdGhlIG5vcm1hbCB1cGRhdGUgY29kZSBibG9jayBmdW5jdGlvbiB3aGljaCBicmVha3MgdGhpbmdzIGhlcmVcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcnNlY3Rpb24gZXh0ZW5kcyBBdG9tIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImdlb21ldHJ5MVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImdlb21ldHJ5MlwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiSW50ZXJzZWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiSW50ZXJzZWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJpbnRlcnNlY3Rpb24ofmdlb21ldHJ5MX4sfmdlb21ldHJ5Mn4pXCI7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaXJyb3IgZXh0ZW5kcyBBdG9tIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieFwiLCB0aGlzLCBcIm51bWJlclwiLCAxKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ5XCIsIHRoaXMsIFwibnVtYmVyXCIsIDEpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInpcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJNaXJyb3JcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJNaXJyb3JcIjtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSBcIm1pcnJvcihbfnh+LH55fix+en5dLCB+Z2VvbWV0cnl+KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5pbXBvcnQgR2xvYmFsVmFyaWFibGVzIGZyb20gJy4uL2dsb2JhbHZhcmlhYmxlcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbGVjdWxlIGV4dGVuZHMgQXRvbXtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ub2Rlc09uVGhlU2NyZWVuID0gW107XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiTW9sZWN1bGVcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJNb2xlY3VsZVwiO1xyXG4gICAgICAgIHRoaXMuY2VudGVyQ29sb3IgPSBcIiM5NDkyOTRcIjtcclxuICAgICAgICB0aGlzLnRvcExldmVsID0gZmFsc2U7IC8vYSBmbGFnIHRvIHNpZ25hbCBpZiB0aGlzIG5vZGUgaXMgdGhlIHRvcCBsZXZlbCBub2RlXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCB0aGUgbW9sZWN1bGUncyBvdXRwdXRcclxuICAgICAgICB0aGlzLnBsYWNlQXRvbSh7XHJcbiAgICAgICAgICAgIHBhcmVudE1vbGVjdWxlOiB0aGlzLCBcclxuICAgICAgICAgICAgeDogR2xvYmFsVmFyaWFibGVzLmNhbnZhcy53aWR0aCAtIDUwLFxyXG4gICAgICAgICAgICB5OiBHbG9iYWxWYXJpYWJsZXMuY2FudmFzLmhlaWdodC8yLFxyXG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXHJcbiAgICAgICAgICAgIG5hbWU6IFwiT3V0cHV0XCIsXHJcbiAgICAgICAgICAgIGF0b21UeXBlOiBcIk91dHB1dFwiXHJcbiAgICAgICAgfSwgbnVsbCwgR2xvYmFsVmFyaWFibGVzLnNlY3JldFR5cGVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgc3VwZXIuZHJhdygpOyAvL1N1cGVyIGNhbGwgdG8gZHJhdyB0aGUgcmVzdFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZHJhdyB0aGUgY2lyY2xlIGluIHRoZSBtaWRkbGVcclxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGMuZmlsbFN0eWxlID0gdGhpcy5jZW50ZXJDb2xvcjtcclxuICAgICAgICBjLmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMvMiwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuICAgICAgICBjLmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIGMuZmlsbCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkb3VibGVDbGljayh4LHkpe1xyXG4gICAgICAgIC8vcmV0dXJucyB0cnVlIGlmIHNvbWV0aGluZyB3YXMgZG9uZSB3aXRoIHRoZSBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBjbGlja1Byb2Nlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkaXN0RnJvbUNsaWNrID0gZGlzdEJldHdlZW5Qb2ludHMoeCwgdGhpcy54LCB5LCB0aGlzLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChkaXN0RnJvbUNsaWNrIDwgdGhpcy5yYWRpdXMpe1xyXG4gICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlID0gdGhpczsgLy9zZXQgdGhpcyB0byBiZSB0aGUgY3VycmVudGx5IGRpc3BsYXllZCBtb2xlY3VsZVxyXG4gICAgICAgICAgICBjbGlja1Byb2Nlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBjbGlja1Byb2Nlc3NlZDsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGJhY2tncm91bmRDbGljaygpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlU2lkZWJhcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdmFyIHRvUmVuZGVyID0gXCJmdW5jdGlvbiBtYWluICgpIHtcXG4gICAgcmV0dXJuIG1vbGVjdWxlXCIgKyB0aGlzLnVuaXF1ZUlEICsgXCIuY29kZSgpXFxufVxcblxcblwiICsgdGhpcy5zZXJpYWxpemUoKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vd2luZG93LmxvYWREZXNpZ24odG9SZW5kZXIsXCJNYXNsb3dDcmVhdGVcIik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZUNvZGVCbG9jaygpe1xyXG4gICAgICAgIC8vR3JhYiB0aGUgY29kZSBmcm9tIHRoZSBvdXRwdXQgb2JqZWN0XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9HcmFiIHZhbHVlcyBmcm9tIHRoZSBpbnB1dHMgYW5kIHB1c2ggdGhlbSBvdXQgdG8gdGhlIGlucHV0IG9iamVjdHNcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC52YWx1ZVR5cGUgPT0gJ2dlb21ldHJ5JyAmJiBjaGlsZC50eXBlID09ICdpbnB1dCcpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2goYXRvbSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoYXRvbS5hdG9tVHlwZSA9PSBcIklucHV0XCIgJiYgY2hpbGQubmFtZSA9PSBhdG9tLm5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdG9tLnNldE91dHB1dChjaGlsZC5nZXRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vR3JhYiB0aGUgdmFsdWUgZnJvbSB0aGUgTW9sZWN1bGUncyBvdXRwdXQgYW5kIHNldCBpdCB0byBiZSB0aGUgbW9sZWN1bGUncyBjb2RlIGJsb2NrIHNvIHRoYXQgY2xpY2tpbmcgb24gdGhlIG1vbGVjdWxlIHdpbGwgZGlzcGxheSB3aGF0IGl0IGlzIG91dHB1dHRpbmdcclxuICAgICAgICB0aGlzLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChhdG9tID0+IHtcclxuICAgICAgICAgICAgaWYoYXRvbS5hdG9tVHlwZSA9PSAnT3V0cHV0Jyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGVCbG9jayA9IGF0b20uY29kZUJsb2NrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgdGhlIG91dHB1dCBub2RlcyB3aXRoIHR5cGUgJ2dlb21ldHJ5JyB0byBiZSB0aGUgZ2VuZXJhdGVkIGNvZGVcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC52YWx1ZVR5cGUgPT0gJ2dlb21ldHJ5JyAmJiBjaGlsZC50eXBlID09ICdvdXRwdXQnKXtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnNldFZhbHVlKHRoaXMuY29kZUJsb2NrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vSWYgdGhpcyBtb2xlY3VsZSBpcyBzZWxlY3RlZCwgc2VuZCB0aGUgdXBkYXRlZCB2YWx1ZSB0byB0aGUgcmVuZGVyZXJcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZFRvUmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVTaWRlYmFyKCl7XHJcbiAgICAgICAgLy9VcGRhdGUgdGhlIHNpZGUgYmFyIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gY2hhbmdlIHRoZSBtb2xlY3VsZSBuYW1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHZhbHVlTGlzdCA9IHN1cGVyLnVwZGF0ZVNpZGViYXIoKTsgLy9jYWxsIHRoZSBzdXBlciBmdW5jdGlvblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRWRpdGFibGVWYWx1ZUxpc3RJdGVtKHZhbHVlTGlzdCx0aGlzLFwibmFtZVwiLCBcIk5hbWVcIiwgZmFsc2UpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCF0aGlzLnRvcExldmVsKXtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVCdXR0b24odmFsdWVMaXN0LHRoaXMsXCJHbyBUbyBQYXJlbnRcIix0aGlzLmdvVG9QYXJlbnRNb2xlY3VsZSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUJ1dHRvbih2YWx1ZUxpc3QsdGhpcyxcIkV4cG9ydCBUbyBHaXRIdWJcIiwgdGhpcy5leHBvcnRUb0dpdGh1YilcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVCdXR0b24odmFsdWVMaXN0LHRoaXMsXCJMb2FkIEEgRGlmZmVyZW50IFByb2plY3RcIixzaG93UHJvamVjdHNUb0xvYWQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3JlYXRlQk9NKHZhbHVlTGlzdCx0aGlzLHRoaXMuQk9NbGlzdCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlTGlzdDtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ29Ub1BhcmVudE1vbGVjdWxlKHNlbGYpe1xyXG4gICAgICAgIC8vR28gdG8gdGhlIHBhcmVudCBtb2xlY3VsZSBpZiB0aGVyZSBpcyBvbmVcclxuICAgICAgICBcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCFHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLnRvcExldmVsKXtcclxuICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZSA9IEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUucGFyZW50OyAvL3NldCBwYXJlbnQgdGhpcyB0byBiZSB0aGUgY3VycmVudGx5IGRpc3BsYXllZCBtb2xlY3VsZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0VG9HaXRodWIoc2VsZil7XHJcbiAgICAgICAgLy9FeHBvcnQgdGhpcyBtb2xlY3VsZSB0byBnaXRodWJcclxuICAgICAgICBleHBvcnRDdXJyZW50TW9sZWN1bGVUb0dpdGh1YihzZWxmKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmVwbGFjZVRoaXNNb2xlY3VsZVdpdGhHaXRodWIoZ2l0aHViSUQpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGdpdGh1YklEKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0lmIHdlIGFyZSBjdXJyZW50bHkgaW5zaWRlIHRoZSBtb2xlY3VsZSB0YXJnZXRlZCBmb3IgcmVwbGFjZW1lbnQsIGdvIHVwIG9uZVxyXG4gICAgICAgIGlmIChHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLnVuaXF1ZUlEID09IHRoaXMudW5pcXVlSUQpe1xyXG4gICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlID0gdGhpcy5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQ3JlYXRlIGEgbmV3IGdpdGh1YiBtb2xlY3VsZSBpbiB0aGUgc2FtZSBzcG90XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS5wbGFjZUF0b20oe1xyXG4gICAgICAgICAgICB4OiB0aGlzLngsIFxyXG4gICAgICAgICAgICB5OiB0aGlzLnksIFxyXG4gICAgICAgICAgICBwYXJlbnQ6IEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgYXRvbVR5cGU6IFwiR2l0SHViTW9sZWN1bGVcIixcclxuICAgICAgICAgICAgcHJvamVjdElEOiBnaXRodWJJRCxcclxuICAgICAgICAgICAgdW5pcXVlSUQ6IGdlbmVyYXRlVW5pcXVlSUQoKVxyXG4gICAgICAgIH0sIG51bGwsIGF2YWlsYWJsZVR5cGVzKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL1RoZW4gZGVsZXRlIHRoZSBvbGQgbW9sZWN1bGUgd2hpY2ggaGFzIGJlZW4gcmVwbGFjZWRcclxuICAgICAgICB0aGlzLmRlbGV0ZU5vZGUoKTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlcXVlc3RCT00oKXtcclxuICAgICAgICB2YXIgZ2VuZXJhdGVkQk9NID0gc3VwZXIucmVxdWVzdEJPTSgpO1xyXG4gICAgICAgIHRoaXMubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKG1vbGVjdWxlID0+IHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVkQk9NID0gZ2VuZXJhdGVkQk9NLmNvbmNhdChtb2xlY3VsZS5yZXF1ZXN0Qk9NKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBnZW5lcmF0ZWRCT007XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlcXVlc3RSZWFkbWUoKXtcclxuICAgICAgICB2YXIgZ2VuZXJhdGVkUmVhZG1lID0gc3VwZXIucmVxdWVzdFJlYWRtZSgpO1xyXG4gICAgICAgIGdlbmVyYXRlZFJlYWRtZS5wdXNoKFwiIyMgXCIgKyB0aGlzLm5hbWUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzb3J0YWJsZUF0b21zTGlzdCA9IHRoaXMubm9kZXNPblRoZVNjcmVlbjtcclxuICAgICAgICBzb3J0YWJsZUF0b21zTGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpe3JldHVybiBkaXN0QmV0d2VlblBvaW50cyhhLngsIDAsIGEueSwgMCktZGlzdEJldHdlZW5Qb2ludHMoYi54LCAwLCBiLnksIDApfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc29ydGFibGVBdG9tc0xpc3QuZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlZFJlYWRtZSA9IGdlbmVyYXRlZFJlYWRtZS5jb25jYXQobW9sZWN1bGUucmVxdWVzdFJlYWRtZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZ2VuZXJhdGVkUmVhZG1lO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXJpYWxpemUoc2F2ZWRPYmplY3Qpe1xyXG4gICAgICAgIC8vU2F2ZSB0aGlzIG1vbGVjdWxlLlxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vVGhpcyBvbmUgaXMgYSBsaXR0bGUgY29uZnVzaW5nLiBCYXNpY2FsbHkgZWFjaCBtb2xlY3VsZSBzYXZlcyBsaWtlIGFuIGF0b20sIGJ1dCBhbHNvIGNyZWF0ZXMgYSBzZWNvbmQgb2JqZWN0IFxyXG4gICAgICAgIC8vcmVjb3JkIG9mIGl0c2VsZiBpbiB0aGUgb2JqZWN0IFwic2F2ZWRPYmplY3RcIiBvYmplY3QuIElmIHRoaXMgaXMgdGhlIHRvcExldmVsIG1vbGVjdWxlIHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBcclxuICAgICAgICAvL3NhdmVkT2JqZWN0IG9iamVjdCBoZXJlIHRvIHBhc3MgdG8gbG93ZXIgbGV2ZWxzLlxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMudG9wTGV2ZWwgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGEgbmV3IGJsYW5rIHByb2plY3QgdG8gc2F2ZSB0b1xyXG4gICAgICAgICAgICBzYXZlZE9iamVjdCA9IHttb2xlY3VsZXM6IFtdfVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdmFyIGFsbEVsZW1lbnRzQ29kZSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIHZhciBhbGxBdG9tcyA9IFtdO1xyXG4gICAgICAgIHZhciBhbGxDb25uZWN0b3JzID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2goYXRvbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhdG9tLmNvZGVCbG9jayAhPSBcIlwiKXtcclxuICAgICAgICAgICAgICAgIGFsbEVsZW1lbnRzQ29kZS5wdXNoKGF0b20uY29kZUJsb2NrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYWxsQXRvbXMucHVzaChKU09OLnN0cmluZ2lmeShhdG9tLnNlcmlhbGl6ZShzYXZlZE9iamVjdCkpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGF0b20uY2hpbGRyZW4uZm9yRWFjaChhdHRhY2htZW50UG9pbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoYXR0YWNobWVudFBvaW50LnR5cGUgPT0gXCJvdXRwdXRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNobWVudFBvaW50LmNvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxDb25uZWN0b3JzLnB1c2goY29ubmVjdG9yLnNlcmlhbGl6ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRoaXNBc09iamVjdCA9IHtcclxuICAgICAgICAgICAgYXRvbVR5cGU6IHRoaXMuYXRvbVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgdW5pcXVlSUQ6IHRoaXMudW5pcXVlSUQsXHJcbiAgICAgICAgICAgIHRvcExldmVsOiB0aGlzLnRvcExldmVsLFxyXG4gICAgICAgICAgICBCT01saXN0OiB0aGlzLkJPTWxpc3QsXHJcbiAgICAgICAgICAgIGFsbEF0b21zOiBhbGxBdG9tcyxcclxuICAgICAgICAgICAgYWxsQ29ubmVjdG9yczogYWxsQ29ubmVjdG9yc1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCBhbiBvYmplY3QgcmVjb3JkIG9mIHRoaXMgb2JqZWN0XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2F2ZWRPYmplY3QubW9sZWN1bGVzLnB1c2godGhpc0FzT2JqZWN0KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy50b3BMZXZlbCA9PSB0cnVlKXtcclxuICAgICAgICAgICAgLy9JZiB0aGlzIGlzIHRoZSB0b3AgbGV2ZWwsIHJldHVybiB0aGUgZ2VuZXJhdGVkIG9iamVjdFxyXG4gICAgICAgICAgICByZXR1cm4gc2F2ZWRPYmplY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIC8vSWYgbm90LCByZXR1cm4ganVzdCBhIHBsYWNlaG9sZGVyIGZvciB0aGlzIG1vbGVjdWxlXHJcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSB7XHJcbiAgICAgICAgICAgICAgICBhdG9tVHlwZTogdGhpcy5hdG9tVHlwZSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICAgICAgICAgIHVuaXF1ZUlEOiB0aGlzLnVuaXF1ZUlELFxyXG4gICAgICAgICAgICAgICAgQk9NbGlzdDogdGhpcy5CT01saXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgZGVzZXJpYWxpemUobW9sZWN1bGVMaXN0LCBtb2xlY3VsZUlEKXtcclxuICAgICAgICBcclxuICAgICAgICAvL0ZpbmQgdGhlIHRhcmdldCBtb2xlY3VsZSBpbiB0aGUgbGlzdFxyXG4gICAgICAgIHZhciBtb2xlY3VsZU9iamVjdCA9IG1vbGVjdWxlTGlzdC5maWx0ZXIoKG1vbGVjdWxlKSA9PiB7IHJldHVybiBtb2xlY3VsZS51bmlxdWVJRCA9PSBtb2xlY3VsZUlEO30pWzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vR3JhYiB0aGUgbmFtZSBhbmQgSURcclxuICAgICAgICB0aGlzLnVuaXF1ZUlEICA9IG1vbGVjdWxlT2JqZWN0LnVuaXF1ZUlEO1xyXG4gICAgICAgIHRoaXMubmFtZSAgICAgID0gbW9sZWN1bGVPYmplY3QubmFtZTtcclxuICAgICAgICB0aGlzLnRvcExldmVsICA9IG1vbGVjdWxlT2JqZWN0LnRvcExldmVsO1xyXG4gICAgICAgIHRoaXMuQk9NbGlzdCAgID0gbW9sZWN1bGVPYmplY3QuQk9NbGlzdDtcclxuICAgICAgICBcclxuICAgICAgICAvL1BsYWNlIHRoZSBhdG9tc1xyXG4gICAgICAgIG1vbGVjdWxlT2JqZWN0LmFsbEF0b21zLmZvckVhY2goYXRvbSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGxhY2VBdG9tKEpTT04ucGFyc2UoYXRvbSksIG1vbGVjdWxlTGlzdCwgYXZhaWxhYmxlVHlwZXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcmVsb2FkIHRoZSBtb2xlY3VsZSBvYmplY3QgdG8gcHJldmVudCBwZXJzaXN0ZW5jZSBpc3N1ZXNcclxuICAgICAgICBtb2xlY3VsZU9iamVjdCA9IG1vbGVjdWxlTGlzdC5maWx0ZXIoKG1vbGVjdWxlKSA9PiB7IHJldHVybiBtb2xlY3VsZS51bmlxdWVJRCA9PSBtb2xlY3VsZUlEO30pWzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vUGxhY2UgdGhlIGNvbm5lY3RvcnNcclxuICAgICAgICB0aGlzLnNhdmVkQ29ubmVjdG9ycyA9IG1vbGVjdWxlT2JqZWN0LmFsbENvbm5lY3RvcnM7IC8vU2F2ZSBhIGNvcHkgb2YgdGhlIGNvbm5lY3RvcnMgc28gd2UgY2FuIHVzZSB0aGVtIGxhdGVyIGlmIHdlIHdhbnRcclxuICAgICAgICB0aGlzLnNhdmVkQ29ubmVjdG9ycy5mb3JFYWNoKGNvbm5lY3RvciA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGxhY2VDb25uZWN0b3IoSlNPTi5wYXJzZShjb25uZWN0b3IpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwbGFjZUF0b20obmV3QXRvbU9iaiwgbW9sZWN1bGVMaXN0LCB0eXBlc0xpc3Qpe1xyXG4gICAgICAgIC8vUGxhY2UgdGhlIGF0b20gLSBub3RlIHRoYXQgdHlwZXMgbm90IGxpc3RlZCBpbiBhdmFpbGFibGVUeXBlcyB3aWxsIG5vdCBiZSBwbGFjZWQgd2l0aCBubyB3YXJuaW5nIChpZSBnbyB1cCBvbmUgbGV2ZWwpXHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gdHlwZXNMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlc0xpc3Rba2V5XS5hdG9tVHlwZSA9PSBuZXdBdG9tT2JqLmF0b21UeXBlKXtcclxuICAgICAgICAgICAgICAgIG5ld0F0b21PYmoucGFyZW50ID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciBhdG9tID0gbmV3IHR5cGVzTGlzdFtrZXldLmNyZWF0b3IobmV3QXRvbU9iaik7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vcmVhc3NpZ24gdGhlIG5hbWUgb2YgdGhlIElucHV0cyB0byBwcmVzZXJ2ZSBsaW5raW5nXHJcbiAgICAgICAgICAgICAgICBpZihhdG9tLmF0b21UeXBlID09IFwiSW5wdXRcIiAmJiB0eXBlb2YgbmV3QXRvbU9iai5uYW1lICE9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXRvbS5zZXRWYWx1ZShuZXdBdG9tT2JqLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vSWYgdGhpcyBpcyBhIG1vbGVjdWxlLCBkZXNlcmlhbGl6ZSBpdFxyXG4gICAgICAgICAgICAgICAgaWYoYXRvbS5hdG9tVHlwZSA9PSBcIk1vbGVjdWxlXCIgJiYgbW9sZWN1bGVMaXN0ICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0b20uZGVzZXJpYWxpemUobW9sZWN1bGVMaXN0LCBhdG9tLnVuaXF1ZUlEKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2Rlc09uVGhlU2NyZWVuLnB1c2goYXRvbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYobmV3QXRvbU9iai5hdG9tVHlwZSA9PSBcIk91dHB1dFwiKXtcclxuICAgICAgICAgICAgLy9yZS1hc2lnbiBvdXRwdXQgSUQgbnVtYmVycyBpZiBhIG5ldyBvbmUgaXMgc3VwcG9zZWQgdG8gYmUgcGxhY2VkXHJcbiAgICAgICAgICAgIHRoaXMubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKGF0b20gPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoYXRvbS5hdG9tVHlwZSA9PSBcIk91dHB1dFwiKXtcclxuICAgICAgICAgICAgICAgICAgICBhdG9tLnNldElEKG5ld0F0b21PYmoudW5pcXVlSUQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHBsYWNlQ29ubmVjdG9yKGNvbm5lY3Rvck9iail7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvcjtcclxuICAgICAgICB2YXIgY3AxTm90Rm91bmQgPSB0cnVlO1xyXG4gICAgICAgIHZhciBjcDJOb3RGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgdmFyIGFwMjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChhdG9tID0+IHtcclxuICAgICAgICAgICAgLy9GaW5kIHRoZSBvdXRwdXQgbm9kZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGF0b20udW5pcXVlSUQgPT0gY29ubmVjdG9yT2JqLmFwMUlEKXtcclxuICAgICAgICAgICAgICAgIGF0b20uY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoY2hpbGQubmFtZSA9PSBjb25uZWN0b3JPYmouYXAxTmFtZSAmJiBjaGlsZC50eXBlID09IFwib3V0cHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3IgPSBuZXcgQ29ubmVjdG9yKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0b21UeXBlOiBcIkNvbm5lY3RvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0YWNobWVudFBvaW50MTogY2hpbGQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRNb2xlY3VsZTogIGF0b21cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwMU5vdEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9GaW5kIHRoZSBpbnB1dCBub2RlXHJcbiAgICAgICAgICAgIGlmIChhdG9tLnVuaXF1ZUlEID09IGNvbm5lY3Rvck9iai5hcDJJRCl7XHJcbiAgICAgICAgICAgICAgICBhdG9tLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNoaWxkLm5hbWUgPT0gY29ubmVjdG9yT2JqLmFwMk5hbWUgJiYgY2hpbGQudHlwZSA9PSBcImlucHV0XCIgJiYgY2hpbGQuY29ubmVjdG9ycy5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwMk5vdEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwMiA9IGNoaWxkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoY3AxTm90Rm91bmQgfHwgY3AyTm90Rm91bmQpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBjcmVhdGUgY29ubmVjdG9yXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbm5lY3Rvci5hdHRhY2htZW50UG9pbnQyID0gYXAyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU3RvcmUgdGhlIGNvbm5lY3RvclxyXG4gICAgICAgIGNvbm5lY3Rvci5hdHRhY2htZW50UG9pbnQxLmNvbm5lY3RvcnMucHVzaChjb25uZWN0b3IpO1xyXG4gICAgICAgIGNvbm5lY3Rvci5hdHRhY2htZW50UG9pbnQyLmNvbm5lY3RvcnMucHVzaChjb25uZWN0b3IpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vVXBkYXRlIHRoZSBjb25uZWN0aW9uXHJcbiAgICAgICAgY29ubmVjdG9yLnByb3BvZ2F0ZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3V0cHV0IGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIgKHZhbHVlcylcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCBhIG5ldyBvdXRwdXQgdG8gdGhlIGN1cnJlbnQgbW9sZWN1bGVcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5hZGRJTyhcIm91dHB1dFwiLCBcIkdlb21ldHJ5XCIsIHRoaXMucGFyZW50LCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSBcIn5udW1iZXIgb3IgZ2VvbWV0cnl+XCI7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwib3V0cHV0XCI7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJPdXRwdXRcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJPdXRwdXRcIjtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDE2O1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMTU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJudW1iZXIgb3IgZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0SUQobmV3SUQpe1xyXG4gICAgICAgIHRoaXMudW5pcXVlSUQgPSBuZXdJRDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5kcmF3KCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgYy5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgICAgIGMucmVjdCh0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5oZWlnaHQvMiwgMip0aGlzLnJhZGl1cywgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIGMudGV4dEFsaWduID0gXCJlbmRcIjsgXHJcbiAgICAgICAgYy5maWxsVGV4dCh0aGlzLm5hbWUsIHRoaXMueCArIHRoaXMucmFkaXVzLCB0aGlzLnktdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIGMuZmlsbCgpO1xyXG4gICAgICAgIGMuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBjLm1vdmVUbyh0aGlzLnggKyB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5oZWlnaHQvMik7XHJcbiAgICAgICAgYy5saW5lVG8odGhpcy54ICsgdGhpcy5yYWRpdXMgKyAxMCwgdGhpcy55KTtcclxuICAgICAgICBjLmxpbmVUbyh0aGlzLnggKyB0aGlzLnJhZGl1cywgdGhpcy55ICsgdGhpcy5oZWlnaHQvMik7XHJcbiAgICAgICAgYy5maWxsKCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhZG1lIGV4dGVuZHMgQXRvbXtcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiUmVhZG1lXCI7XHJcbiAgICAgICAgdGhpcy5yZWFkbWVUZXh0ID0gXCJSZWFkbWUgdGV4dCBoZXJlXCI7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJyZWFkbWVcIjtcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlJFQURNRVwiO1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlU2lkZWJhcigpe1xyXG4gICAgICAgIC8vdXBkYXRlcyB0aGUgc2lkZWJhciB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGFib3V0IHRoaXMgbm9kZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSBzdXBlci51cGRhdGVTaWRlYmFyKCk7IC8vY2FsbCB0aGUgc3VwZXIgZnVuY3Rpb25cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbSh2YWx1ZUxpc3QsdGhpcyxcInJlYWRtZVRleHRcIiwgXCJOb3Rlc1wiLCBmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIuZHJhdygpOyAvL1N1cGVyIGNhbGwgdG8gZHJhdyB0aGUgcmVzdFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZHJhdyB0aGUgdHdvIHNsYXNoZXMgb24gdGhlIG5vZGUvL1xyXG4gICAgICAgIGMuc3Ryb2tlU3R5bGUgPSBcIiM5NDkyOTRcIjtcclxuICAgICAgICBjLmxpbmVXaWR0aCA9IDM7XHJcbiAgICAgICAgYy5saW5lQ2FwID0gXCJyb3VuZFwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgYy5tb3ZlVG8odGhpcy54IC0gMTEsIHRoaXMueSArIDEwKTtcclxuICAgICAgICBjLmxpbmVUbyh0aGlzLngsIHRoaXMueSAtIDEwKTtcclxuICAgICAgICBjLnN0cm9rZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgYy5tb3ZlVG8odGhpcy54LCB0aGlzLnkgKyAxMCk7XHJcbiAgICAgICAgYy5saW5lVG8odGhpcy54ICsgMTEsIHRoaXMueSAtIDEwKTtcclxuICAgICAgICBjLnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRWYWx1ZShuZXdUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5yZWFkbWVUZXh0ID0gbmV3VGV4dDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmVxdWVzdFJlYWRtZSgpe1xyXG4gICAgICAgIC8vcmVxdWVzdCBhbnkgY29udHJpYnV0aW9ucyBmcm9tIHRoaXMgYXRvbSB0byB0aGUgcmVhZG1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLnJlYWRtZVRleHRdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXJpYWxpemUodmFsdWVzKXtcclxuICAgICAgICAvL1NhdmUgdGhlIHJlYWRtZSB0ZXh0IHRvIHRoZSBzZXJpYWwgc3RyZWFtXHJcbiAgICAgICAgdmFyIHZhbHVlc09iaiA9IHN1cGVyLnNlcmlhbGl6ZSh2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhbHVlc09iai5yZWFkbWVUZXh0ID0gdGhpcy5yZWFkbWVUZXh0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2YWx1ZXNPYmo7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgQXRvbSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieCBsZW5ndGhcIiwgdGhpcywgXCJudW1iZXJcIiwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInkgbGVuZ3RoXCIsIHRoaXMsIFwibnVtYmVyXCIsIDEwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlJlY3RhbmdsZVwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIlJlY3RhbmdsZVwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwic3F1YXJlKFt+eCBsZW5ndGh+LH55IGxlbmd0aH5dKVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICAvL2dlbmVyYXRlIHRoZSBjb3JyZWN0IGNvZGVibG9jayBmb3IgdGhpcyBhdG9tIG9uIGNyZWF0aW9uXHJcbiAgICAgICAgdGhpcy51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVndWxhclBvbHlnb24gZXh0ZW5kcyBBdG9tIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIHN1cGVyKHZhbHVlcylcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJudW1iZXIgb2Ygc2lkZXNcIiwgdGhpcywgXCJudW1iZXJcIiwgNik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwicmFkaXVzXCIsIHRoaXMsIFwibnVtYmVyXCIsIDEwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlJlZ3VsYXJQb2x5Z29uXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiUmVndWxhclBvbHlnb25cIjtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBwb2x5Z29uIGNvZGUgYmxvY2tcclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ29kZUJsb2NrKCkge1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IHRoaXMuYnVpbGRQb2x5Z29uQ29kZUJsb2NrKCk7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlQ29kZUJsb2NrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYnVpbGRQb2x5Z29uQ29kZUJsb2NrKCkge1xyXG4gICAgICAgIGxldCBwb2x5Z29uID0gW11cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5maW5kSU9WYWx1ZShcIm51bWJlciBvZiBzaWRlc1wiKTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBhbmdsZSA9IGkgKiAyICogTWF0aC5QSSAvIHRoaXMuZmluZElPVmFsdWUoXCJudW1iZXIgb2Ygc2lkZXNcIikgLSBNYXRoLlBJIC8gMjtcclxuICAgICAgICAgICAgcG9seWdvbi5wdXNoKFtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmluZElPVmFsdWUoXCJyYWRpdXNcIikgKiBNYXRoLmNvcyhhbmdsZSksXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRJT1ZhbHVlKFwicmFkaXVzXCIpICogTWF0aC5zaW4oYW5nbGUpXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gXCJwb2x5Z29uKFwiICsgSlNPTi5zdHJpbmdpZnkocG9seWdvbikgKyBcIilcIjtcclxuICAgIH0gICAgXHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3RhdGUgZXh0ZW5kcyBBdG9tIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlcih2YWx1ZXMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ4LWF4aXMgZGVncmVlc1wiLCB0aGlzLCBcIm51bWJlclwiLCAwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ5LWF4aXMgZGVncmVlc1wiLCB0aGlzLCBcIm51bWJlclwiLCAwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ6LWF4aXMgZGVncmVlc1wiLCB0aGlzLCBcIm51bWJlclwiLCAwKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlJvdGF0ZVwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIlJvdGF0ZVwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwicm90YXRlKFt+eC1heGlzIGRlZ3JlZXN+LH55LWF4aXMgZGVncmVlc34sfnotYXhpcyBkZWdyZWVzfl0sfmdlb21ldHJ5filcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjYWxlIGV4dGVuZHMgQXRvbXtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwibXVsdGlwbGVcIiwgdGhpcywgXCJudW1iZXJcIiwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiU2NhbGVcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJTY2FsZVwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwifmdlb21ldHJ5fi5zY2FsZSh+bXVsdGlwbGV+KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hyaW5rV3JhcCBleHRlbmRzIEF0b217XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlNocmluayBXcmFwXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiU2hyaW5rV3JhcFwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwiY2hhaW5faHVsbCh7Y2xvc2VkOiBmYWxzZX0sIFsgXSlcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5pb1ZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2xvc2VkU2VsZWN0aW9uID0gMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5pb1ZhbHVlcyAhPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsdWVzLmZvckVhY2goaW9WYWx1ZSA9PiB7IC8vZm9yIGVhY2ggc2F2ZWQgdmFsdWVcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBpb1ZhbHVlLm5hbWUsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVDb2RlQmxvY2soKXtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IHRoaXMuZGVmYXVsdENvZGVCbG9jaztcclxuICAgICAgICBcclxuICAgICAgICAvL0dlbmVyYXRlIHRoZSBjb2RlIGJsb2NrIHN0cmluZ1xyXG4gICAgICAgIHZhciBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgPSBcIlsgXCI7XHJcbiAgICAgICAgdmFyIG51bWJlck9mRWxlbWVudHMgPSAwO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlvLnR5cGUgPT0gXCJpbnB1dFwiKXtcclxuICAgICAgICAgICAgICAgIGlmKG51bWJlck9mRWxlbWVudHMgPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgPSBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgKyBcIiwgXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBudW1iZXJPZkVsZW1lbnRzICs9IDE7XHJcbiAgICAgICAgICAgICAgICBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgPSBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgKyBpby5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYXJyYXlPZkNoaWxkcmVuU3RyaW5nID0gYXJyYXlPZkNoaWxkcmVuU3RyaW5nICsgXCJdXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9JbnNlcnQgdGhlIGdlbmVyYXRlZCBzdHJpbmcgaW50byB0aGUgY29kZSBibG9ja1xyXG4gICAgICAgIHZhciByZWdleCA9IC9cXFsoLispXFxdL2dpO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gdGhpcy5jb2RlQmxvY2sucmVwbGFjZShyZWdleCwgYXJyYXlPZkNoaWxkcmVuU3RyaW5nKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCB0aGUgdGV4dCBmb3Igb3BlbiBvciBjbG9zZWRcclxuICAgICAgICB2YXIgZW5kU3RyaW5nO1xyXG4gICAgICAgIGlmKHRoaXMuY2xvc2VkU2VsZWN0aW9uID09IDApeyAvL2Nsb3NlZFxyXG4gICAgICAgICAgICBlbmRTdHJpbmcgPSBcImNoYWluX2h1bGwoe2Nsb3NlZDogdHJ1ZX1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZW5kU3RyaW5nID0gXCJjaGFpbl9odWxsKHtjbG9zZWQ6IGZhbHNlfVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgcmVnZXggPSAvXi4rP1xceyguKz8pXFx9L2dpO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gdGhpcy5jb2RlQmxvY2sucmVwbGFjZShyZWdleCwgZW5kU3RyaW5nKTtcclxuICAgICAgICBcclxuICAgICAgICAvL1NocmluayB3cmFwIGl0IG9uZSBtb3JlIHRpbWUgaWYgd2UgaGF2ZSBzb2xpZCBzZWxlY3RlZFxyXG4gICAgICAgIGlmKHRoaXMuY2xvc2VkU2VsZWN0aW9uID09IDIpe1xyXG4gICAgICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiY2hhaW5faHVsbCh7Y2xvc2VkOiB0cnVlfSwgW1wiICsgdGhpcy5jb2RlQmxvY2sgKyBcIl0pXCJcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgdGhlIG91dHB1dCBub2RlcyB3aXRoIG5hbWUgJ2dlb21ldHJ5JyB0byBiZSB0aGUgZ2VuZXJhdGVkIGNvZGVcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC52YWx1ZVR5cGUgPT0gJ2dlb21ldHJ5JyAmJiBjaGlsZC50eXBlID09ICdvdXRwdXQnKXtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnNldFZhbHVlKHRoaXMuY29kZUJsb2NrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vSWYgdGhpcyBtb2xlY3VsZSBpcyBzZWxlY3RlZCwgc2VuZCB0aGUgdXBkYXRlZCB2YWx1ZSB0byB0aGUgcmVuZGVyZXJcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZFRvUmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vRGVsZXRlIG9yIGFkZCBwb3J0cyBhcyBuZWVkZWRcclxuICAgICAgICBcclxuICAgICAgICAvL0NoZWNrIHRvIHNlZSBpZiBhbnkgb2YgdGhlIGxvYWRlZCBwb3J0cyBoYXZlIGJlZW4gY29ubmVjdGVkIHRvLiBJZiB0aGV5IGhhdmUsIHJlbW92ZSB0aGVtIGZyb20gdGhlIHRoaXMuaW9WYWx1ZXMgbGlzdCBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsdWVzLmZvckVhY2goaW9WYWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQubmFtZSA9PSBpb1ZhbHVlLm5hbWUgJiYgY2hpbGQuY29ubmVjdG9ycy5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlvVmFsdWVzLnNwbGljZSh0aGlzLmlvVmFsdWVzLmluZGV4T2YoaW9WYWx1ZSksMSk7IC8vTGV0J3MgcmVtb3ZlIGl0IGZyb20gdGhlIGlvVmFsdWVzIGxpc3RcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgb3IgZGVsZXRlIHBvcnRzIGFzIG5lZWRlZFxyXG4gICAgICAgIGlmKHRoaXMuaG93TWFueUlucHV0UG9ydHNBdmFpbGFibGUoKSA9PSAwKXsgLy9XZSBuZWVkIHRvIG1ha2UgYSBuZXcgcG9ydCBhdmFpbGFibGVcclxuICAgICAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiMkQgc2hhcGUgXCIgKyBnZW5lcmF0ZVVuaXF1ZUlEKCksIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuaG93TWFueUlucHV0UG9ydHNBdmFpbGFibGUoKSA+PSAyICYmIHRoaXMuaW9WYWx1ZXMubGVuZ3RoIDw9IDEpeyAgLy9XZSBuZWVkIHRvIHJlbW92ZSB0aGUgZW1wdHkgcG9ydFxyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUVtcHR5UG9ydCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaG93TWFueUlucHV0UG9ydHNBdmFpbGFibGUoKXtcclxuICAgICAgICB2YXIgcG9ydHNBdmFpbGFibGUgPSAwO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlvLnR5cGUgPT0gXCJpbnB1dFwiICYmIGlvLmNvbm5lY3RvcnMubGVuZ3RoID09IDApeyAgIC8vaWYgdGhpcyBwb3J0IGlzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgICAgcG9ydHNBdmFpbGFibGUgPSBwb3J0c0F2YWlsYWJsZSArIDE7ICAvL0FkZCBvbmUgdG8gdGhlIGNvdW50XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcG9ydHNBdmFpbGFibGVcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGVsZXRlRW1wdHlQb3J0KCl7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGlvID0+IHtcclxuICAgICAgICAgICAgaWYoaW8udHlwZSA9PSBcImlucHV0XCIgJiYgaW8uY29ubmVjdG9ycy5sZW5ndGggPT0gMCAmJiB0aGlzLmhvd01hbnlJbnB1dFBvcnRzQXZhaWxhYmxlKCkgPj0gMil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUlPKFwiaW5wdXRcIiwgaW8ubmFtZSwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VyaWFsaXplKHNhdmVkT2JqZWN0KXtcclxuICAgICAgICB2YXIgdGhpc0FzT2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKHNhdmVkT2JqZWN0KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgaW9WYWx1ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goaW8gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaW8udHlwZSA9PSBcImlucHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHNhdmVJTyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpby5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGlvVmFsdWU6IDEwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW9WYWx1ZXMucHVzaChzYXZlSU8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaW9WYWx1ZXMuZm9yRWFjaChpb1ZhbHVlID0+IHtcclxuICAgICAgICAgICAgdGhpc0FzT2JqZWN0LmlvVmFsdWVzLnB1c2goaW9WYWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9Xcml0ZSB0aGUgc2VsZWN0aW9uIGZvciBpZiB0aGUgY2hhaW4gaXMgY2xvc2VkXHJcbiAgICAgICAgdGhpc0FzT2JqZWN0LmNsb3NlZFNlbGVjdGlvbiA9IHRoaXMuY2xvc2VkU2VsZWN0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzQXNPYmplY3Q7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZVNpZGViYXIoKXtcclxuICAgICAgICAvL1VwZGF0ZSB0aGUgc2lkZSBiYXIgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byBjaGFuZ2UgdGhlIG1vbGVjdWxlIG5hbWVcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gc3VwZXIudXBkYXRlU2lkZWJhcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRHJvcERvd24odmFsdWVMaXN0LCB0aGlzLCBbXCJDbG9zZWRcIiwgXCJPcGVuXCIsIFwiU29saWRcIl0sIHRoaXMuY2xvc2VkU2VsZWN0aW9uLCBcIkVuZDpcIik7XHJcbiAgICAgICAgXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICBjaGFuZ2VFcXVhdGlvbihuZXdWYWx1ZSl7XHJcbiAgICAgICAgdGhpcy5jbG9zZWRTZWxlY3Rpb24gPSBwYXJzZUludChuZXdWYWx1ZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zbGF0ZSBleHRlbmRzIEF0b217XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInhEaXN0XCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInlEaXN0XCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInpEaXN0XCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiVHJhbnNsYXRlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiVHJhbnNsYXRlXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJ+Z2VvbWV0cnl+LnRyYW5zbGF0ZShbfnhEaXN0fiwgfnlEaXN0fiwgfnpEaXN0fl0pXCI7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVbmlvbiBleHRlbmRzIEF0b20ge1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnkxXCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnkyXCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJVbmlvblwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIlVuaW9uXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJ1bmlvbih+Z2VvbWV0cnkxfix+Z2VvbWV0cnkyfilcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0b20ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgLy9TZXR1cCBkZWZhdWx0IHZhbHVlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnggPSAwO1xyXG4gICAgICAgIHRoaXMueSA9IDA7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2xvciA9ICcjRjNFRkVGJztcclxuICAgICAgICB0aGlzLnNlbGVjdGVkQ29sb3IgPSBcIiM0ODQ4NDhcIjtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9ICcjRjNFRkVGJztcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIm5hbWVcIjtcclxuICAgICAgICB0aGlzLnBhcmVudE1vbGVjdWxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLmlzTW92aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5CT01saXN0ID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXNba2V5XSA9IHZhbHVlc1trZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0VmFsdWVzKHZhbHVlcyl7XHJcbiAgICAgICAgLy9Bc3NpZ24gdGhlIG9iamVjdCB0byBoYXZlIHRoZSBwYXNzZWQgaW4gdmFsdWVzXHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXNba2V5XSA9IHZhbHVlc1trZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuaW9WYWx1ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW9WYWx1ZXMuZm9yRWFjaChpb1ZhbHVlID0+IHsgLy9mb3IgZWFjaCBzYXZlZCB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGlvID0+IHsgIC8vRmluZCB0aGUgbWF0Y2hpbmcgSU8gYW5kIHNldCBpdCB0byBiZSB0aGUgc2F2ZWQgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICBpZihpb1ZhbHVlLm5hbWUgPT0gaW8ubmFtZSAmJiBpby50eXBlID09IFwiaW5wdXRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlvLnNldFZhbHVlKGlvVmFsdWUuaW9WYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlucHV0WCA9IHRoaXMueCAtIHRoaXMucmFkaXVzXHJcbiAgICAgICAgdGhpcy5vdXRwdXRYID0gdGhpcy54ICsgdGhpcy5yYWRpdXNcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5kcmF3KCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgYy5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgICAgIC8vbWFrZSBpdCBpbXBvc2libGUgdG8gZHJhdyBhdG9tcyB0b28gY2xvc2UgdG8gdGhlIGVkZ2VcclxuICAgICAgICAvL25vdCBzdXJlIHdoYXQgeCBsZWZ0IG1hcmdpbiBzaG91bGQgYmUgYmVjYXVzZSBpZiBpdCdzIHRvbyBjbG9zZSBpdCB3b3VsZCBjb3ZlciBleHBhbmRlZCB0ZXh0XHJcbiAgICAgICAgdmFyIGNhbnZhc0Zsb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmxvdy1jYW52YXMnKTtcclxuICAgICAgICBpZiAodGhpcy54PHRoaXMucmFkaXVzKjMpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy54Kz0gdGhpcy5yYWRpdXMqMzsgICAgXHJcbiAgICAgICAgICAgICAgICBjLmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMueTx0aGlzLnJhZGl1cyoyKXtcclxuICAgICAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLnJhZGl1czsgXHJcbiAgICAgICAgICAgICAgICBjLmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMueCArIHRoaXMucmFkaXVzKjIgPiBjYW52YXNGbG93LndpZHRoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMueCAtPSB0aGlzLnJhZGl1cyoyOyBcclxuICAgICAgICAgICAgICAgIGMuYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy55ICsgdGhpcy5yYWRpdXMqMiA+IGNhbnZhc0Zsb3cuaGVpZ2h0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMueSAtPSB0aGlzLnJhZGl1czsgXHJcbiAgICAgICAgICAgICAgICBjLmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgYy5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjLnRleHRBbGlnbiA9IFwic3RhcnRcIjsgXHJcbiAgICAgICAgYy5maWxsVGV4dCh0aGlzLm5hbWUsIHRoaXMueCArIHRoaXMucmFkaXVzLCB0aGlzLnktdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIGMuZmlsbCgpO1xyXG4gICAgICAgIGMuY2xvc2VQYXRoKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFkZElPKHR5cGUsIG5hbWUsIHRhcmdldCwgdmFsdWVUeXBlLCBkZWZhdWx0VmFsdWUpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY29tcHV0ZSB0aGUgYmFzZWxpbmUgb2Zmc2V0IGZyb20gcGFyZW50IG5vZGVcclxuICAgICAgICB2YXIgb2Zmc2V0O1xyXG4gICAgICAgIGlmICh0eXBlID09IFwiaW5wdXRcIil7XHJcbiAgICAgICAgICAgIG9mZnNldCA9IC0xKiB0YXJnZXQucmFkaXVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBvZmZzZXQgPSB0YXJnZXQucmFkaXVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaW5wdXQgPSBuZXcgQXR0YWNobWVudFBvaW50KHtcclxuICAgICAgICAgICAgcGFyZW50TW9sZWN1bGU6IHRhcmdldCwgXHJcbiAgICAgICAgICAgIGRlZmF1bHRPZmZzZXRYOiBvZmZzZXQsIFxyXG4gICAgICAgICAgICBkZWZhdWx0T2Zmc2V0WTogMCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIHZhbHVlOiBkZWZhdWx0VmFsdWUsXHJcbiAgICAgICAgICAgIHVuaXF1ZUlEOiBnZW5lcmF0ZVVuaXF1ZUlEKCksXHJcbiAgICAgICAgICAgIGF0b21UeXBlOiBcIkF0dGFjaG1lbnRQb2ludFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGFyZ2V0LmNoaWxkcmVuLnB1c2goaW5wdXQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZW1vdmVJTyh0eXBlLCBuYW1lLCB0YXJnZXQpe1xyXG4gICAgICAgIC8vUmVtb3ZlIHRoZSB0YXJnZXQgSU8gYXR0YWNobWVudCBwb2ludFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlvLm5hbWUgPT0gbmFtZSAmJiBpby50eXBlID09IHR5cGUpe1xyXG4gICAgICAgICAgICAgICAgaW8uZGVsZXRlU2VsZigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UodGhpcy5jaGlsZHJlbi5pbmRleE9mKGlvKSwxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGlja0Rvd24oeCx5KXtcclxuICAgICAgICAvL1JldHVybnMgdHJ1ZSBpZiBzb21ldGhpbmcgd2FzIGRvbmUgd2l0aCB0aGUgY2xpY2tcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB2YXIgY2xpY2tQcm9jZXNzZWQgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC5jbGlja0Rvd24oeCx5KSA9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIGNsaWNrUHJvY2Vzc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vSWYgbm9uZSBvZiB0aGUgY2hpbGRyZW4gcHJvY2Vzc2VkIHRoZSBjbGlja1xyXG4gICAgICAgIGlmKCFjbGlja1Byb2Nlc3NlZCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBkaXN0RnJvbUNsaWNrID0gZGlzdEJldHdlZW5Qb2ludHMoeCwgdGhpcy54LCB5LCB0aGlzLnkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGRpc3RGcm9tQ2xpY2sgPCB0aGlzLnJhZGl1cyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yID0gdGhpcy5zZWxlY3RlZENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc01vdmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2lkZWJhcigpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRUb1JlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjbGlja1Byb2Nlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLmRlZmF1bHRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGNsaWNrUHJvY2Vzc2VkOyBcclxuICAgIH1cclxuXHJcbiAgICBkb3VibGVDbGljayh4LHkpe1xyXG4gICAgICAgIC8vcmV0dXJucyB0cnVlIGlmIHNvbWV0aGluZyB3YXMgZG9uZSB3aXRoIHRoZSBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBjbGlja1Byb2Nlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkaXN0RnJvbUNsaWNrID0gZGlzdEJldHdlZW5Qb2ludHMoeCwgdGhpcy54LCB5LCB0aGlzLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChkaXN0RnJvbUNsaWNrIDwgdGhpcy5yYWRpdXMpe1xyXG4gICAgICAgICAgICBjbGlja1Byb2Nlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBjbGlja1Byb2Nlc3NlZDsgXHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tVcCh4LHkpe1xyXG4gICAgICAgIHRoaXMuaXNNb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5jbGlja1VwKHgseSk7ICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjbGlja01vdmUoeCx5KXtcclxuICAgICAgICBpZiAodGhpcy5pc01vdmluZyA9PSB0cnVlKXtcclxuICAgICAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgY2hpbGQuY2xpY2tNb3ZlKHgseSk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBrZXlQcmVzcyhrZXkpe1xyXG4gICAgICAgIC8vcnVucyB3aGVudmVyIGEga2V5IGlzIHByZXNzZWRcclxuICAgICAgICBpZiAoa2V5ID09ICdEZWxldGUnKXtcclxuICAgICAgICAgICAgaWYodGhpcy5zZWxlY3RlZCA9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlTm9kZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGNoaWxkLmtleVByZXNzKGtleSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZVNpZGViYXIoKXtcclxuICAgICAgICAvL3VwZGF0ZXMgdGhlIHNpZGViYXIgdG8gZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG5vZGVcclxuICAgICAgICBcclxuICAgICAgICAvL3JlbW92ZSBldmVyeXRoaW5nIGluIHRoZSBzaWRlQmFyIG5vd1xyXG4gICAgICAgIHdoaWxlIChzaWRlQmFyLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgc2lkZUJhci5yZW1vdmVDaGlsZChzaWRlQmFyLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL2FkZCB0aGUgbmFtZSBhcyBhIHRpdGxlXHJcbiAgICAgICAgdmFyIG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgIG5hbWUudGV4dENvbnRlbnQgPSB0aGlzLm5hbWU7XHJcbiAgICAgICAgbmFtZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFwidGV4dC1hbGlnbjpjZW50ZXI7XCIpO1xyXG4gICAgICAgIHNpZGVCYXIuYXBwZW5kQ2hpbGQobmFtZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9DcmVhdGUgYSBsaXN0IGVsZW1lbnRcclxuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpO1xyXG4gICAgICAgIHNpZGVCYXIuYXBwZW5kQ2hpbGQodmFsdWVMaXN0KTtcclxuICAgICAgICB2YWx1ZUxpc3Quc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLWxpc3RcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgb3B0aW9ucyB0byBzZXQgYWxsIG9mIHRoZSBpbnB1dHNcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC50eXBlID09ICdpbnB1dCcgJiYgY2hpbGQudmFsdWVUeXBlICE9ICdnZW9tZXRyeScpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0odmFsdWVMaXN0LGNoaWxkLFwidmFsdWVcIiwgY2hpbGQubmFtZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmFsdWVMaXN0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWxldGVOb2RlKCl7XHJcbiAgICAgICAgLy9kZWxldGVzIHRoaXMgbm9kZSBhbmQgYWxsIG9mIGl0J3MgY2hpbGRyZW5cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5kZWxldGVTZWxmKCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyZW50Lm5vZGVzT25UaGVTY3JlZW4uc3BsaWNlKHRoaXMucGFyZW50Lm5vZGVzT25UaGVTY3JlZW4uaW5kZXhPZih0aGlzKSwxKTsgLy9yZW1vdmUgdGhpcyBub2RlIGZyb20gdGhlIGxpc3RcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGNoaWxkLnVwZGF0ZSgpOyAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcmF3KClcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VyaWFsaXplKHNhdmVkT2JqZWN0KXtcclxuICAgICAgICAvL3NhdmVkT2JqZWN0IGlzIG9ubHkgdXNlZCBieSBNb2xlY3VsZSB0eXBlIGF0b21zXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGlvVmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGlvID0+IHtcclxuICAgICAgICAgICAgaWYgKGlvLnZhbHVlVHlwZSA9PSBcIm51bWJlclwiICYmIGlvLnR5cGUgPT0gXCJpbnB1dFwiKXtcclxuICAgICAgICAgICAgICAgIHZhciBzYXZlSU8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW8ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBpb1ZhbHVlOiBpby5nZXRWYWx1ZSgpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW9WYWx1ZXMucHVzaChzYXZlSU8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG9iamVjdCA9IHtcclxuICAgICAgICAgICAgYXRvbVR5cGU6IHRoaXMuYXRvbVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgICAgIHVuaXF1ZUlEOiB0aGlzLnVuaXF1ZUlELFxyXG4gICAgICAgICAgICBpb1ZhbHVlczogaW9WYWx1ZXNcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmVxdWVzdEJPTSgpe1xyXG4gICAgICAgIC8vUmVxdWVzdCBhbnkgY29udHJpYnV0aW9ucyBmcm9tIHRoaXMgYXRvbSB0byB0aGUgQk9NXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9GaW5kIHRoZSBudW1iZXIgb2YgdGhpbmdzIGF0dGFjaGVkIHRvIHRoaXMgb3V0cHV0XHJcbiAgICAgICAgdmFyIG51bWJlck9mVGhpc0luc3RhbmNlID0gMTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goaW8gPT4ge1xyXG4gICAgICAgICAgICBpZihpby50eXBlID09IFwib3V0cHV0XCIgJiYgaW8uY29ubmVjdG9ycy5sZW5ndGggIT0gMCl7XHJcbiAgICAgICAgICAgICAgICBudW1iZXJPZlRoaXNJbnN0YW5jZSA9IGlvLmNvbm5lY3RvcnMubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9BbmQgc2NhbGUgdXAgdGhlIHRvdGFsIG5lZWRlZCBieSB0aGF0IG51bWJlclxyXG4gICAgICAgIHRoaXMuQk9NbGlzdC5mb3JFYWNoKGJvbUl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBib21JdGVtLnRvdGFsTmVlZGVkID0gbnVtYmVyT2ZUaGlzSW5zdGFuY2UqYm9tSXRlbS5udW1iZXJOZWVkZWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQk9NbGlzdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmVxdWVzdFJlYWRtZSgpe1xyXG4gICAgICAgIC8vcmVxdWVzdCBhbnkgY29udHJpYnV0aW9ucyBmcm9tIHRoaXMgYXRvbSB0byB0aGUgcmVhZG1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVDb2RlQmxvY2soKXtcclxuICAgICAgICAvL1N1YnN0aXR1dGUgdGhlIHJlc3VsdCBmcm9tIGVhY2ggaW5wdXQgZm9yIHRoZSB+Li4ufiBzZWN0aW9uIHdpdGggaXQncyBuYW1lXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHJlZ2V4ID0gL34oLio/KX4vZ2k7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSB0aGlzLmRlZmF1bHRDb2RlQmxvY2sucmVwbGFjZShyZWdleCwgeCA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRJT1ZhbHVlKHgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IHRoZSBvdXRwdXQgbm9kZXMgd2l0aCBuYW1lICdnZW9tZXRyeScgdG8gYmUgdGhlIGdlbmVyYXRlZCBjb2RlXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY2hpbGQudmFsdWVUeXBlID09ICdnZW9tZXRyeScgJiYgY2hpbGQudHlwZSA9PSAnb3V0cHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zZXRWYWx1ZSh0aGlzLmNvZGVCbG9jayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL0lmIHRoaXMgbW9sZWN1bGUgaXMgc2VsZWN0ZWQsIHNlbmQgdGhlIHVwZGF0ZWQgdmFsdWUgdG8gdGhlIHJlbmRlcmVyXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRUb1JlbmRlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VuZFRvUmVuZGVyKCl7XHJcbiAgICAgICAgLy9TZW5kIGNvZGUgdG8gSlNDQUQgdG8gcmVuZGVyXHJcbiAgICAgICAgaWYgKHRoaXMuY29kZUJsb2NrICE9IFwiXCIpe1xyXG4gICAgICAgICAgICB2YXIgdG9SZW5kZXIgPSBcImZ1bmN0aW9uIG1haW4gKCkge3JldHVybiBcIiArIHRoaXMuY29kZUJsb2NrICsgXCJ9XCJcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2FkRGVzaWduKHRvUmVuZGVyLFwiTWFzbG93Q3JlYXRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1NlbmQgc29tZXRoaW5nIGludmlzaWJsZSBqdXN0IHRvIHdpcGUgdGhlIHJlbmRlcmluZ1xyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHZhciB0b1JlbmRlciA9IFwiZnVuY3Rpb24gbWFpbiAoKSB7cmV0dXJuIHNwaGVyZSh7cjogLjAwMDEsIGNlbnRlcjogdHJ1ZX0pfVwiXHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2FkRGVzaWduKHRvUmVuZGVyLFwiTWFzbG93Q3JlYXRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZmluZElPVmFsdWUoaW9OYW1lKXtcclxuICAgICAgICAvL2ZpbmQgdGhlIHZhbHVlIG9mIGFuIGlucHV0IGZvciBhIGdpdmVuIG5hbWVcclxuICAgICAgICBcclxuICAgICAgICBpb05hbWUgPSBpb05hbWUuc3BsaXQoJ34nKS5qb2luKCcnKTtcclxuICAgICAgICB2YXIgaW9WYWx1ZSA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY2hpbGQubmFtZSA9PSBpb05hbWUgJiYgY2hpbGQudHlwZSA9PSBcImlucHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgaW9WYWx1ZSA9IGNoaWxkLmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gaW9WYWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY3JlYXRlRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3Qsb2JqZWN0LGtleSwgbGFiZWwsIHJlc3VsdFNob3VsZEJlTnVtYmVyKXtcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIik7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChsaXN0RWxlbWVudCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9EaXYgd2hpY2ggY29udGFpbnMgdGhlIGVudGlyZSBlbGVtZW50XHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgICBkaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLWl0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9MZWZ0IGRpdiB3aGljaCBkaXNwbGF5cyB0aGUgbGFiZWxcclxuICAgICAgICB2YXIgbGFiZWxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChsYWJlbERpdik7XHJcbiAgICAgICAgdmFyIGxhYmVsVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxhYmVsICsgXCI6XCIpO1xyXG4gICAgICAgIGxhYmVsRGl2LmFwcGVuZENoaWxkKGxhYmVsVGV4dCk7XHJcbiAgICAgICAgbGFiZWxEaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SaWdodCBkaXYgd2hpY2ggaXMgZWRpdGFibGUgYW5kIGRpc3BsYXlzIHRoZSB2YWx1ZVxyXG4gICAgICAgIHZhciB2YWx1ZVRleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh2YWx1ZVRleHREaXYpO1xyXG4gICAgICAgIHZhciB2YWx1ZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShvYmplY3Rba2V5XSk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LmFwcGVuZENoaWxkKHZhbHVlVGV4dCk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImNvbnRlbnRlZGl0YWJsZVwiLCBcInRydWVcIik7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhci1zdWJpdGVtXCIpO1xyXG4gICAgICAgIHZhciB0aGlzSUQgPSBsYWJlbCtnZW5lcmF0ZVVuaXF1ZUlEKCk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXNJRCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpc0lEKS5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlSW5Cb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzSUQpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICBpZihyZXN1bHRTaG91bGRCZU51bWJlcil7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZUluQm94ID0gcGFyc2VGbG9hdCh2YWx1ZUluQm94KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9JZiB0aGUgdGFyZ2V0IGlzIGFuIGF0dGFjaG1lbnRQb2ludCB0aGVuIGNhbGwgdGhlIHNldHRlciBmdW5jdGlvblxyXG4gICAgICAgICAgICBpZihvYmplY3QgaW5zdGFuY2VvZiBBdHRhY2htZW50UG9pbnQpe1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0LnNldFZhbHVlKHZhbHVlSW5Cb3gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlSW5Cb3g7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL3ByZXZlbnQgdGhlIHJldHVybiBrZXkgZnJvbSBiZWluZyB1c2VkIHdoZW4gZWRpdGluZyBhIHZhbHVlXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpc0lEKS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgICAgICBpZiAoZXZ0LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzSUQpLmJsdXIoKTsgIC8vc2hpZnQgZm9jdXMgYXdheSBpZiBzb21lb25lIHByZXNzZXMgZW50ZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgY3JlYXRlTm9uRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3Qsb2JqZWN0LGtleSwgbGFiZWwsIHJlc3VsdFNob3VsZEJlTnVtYmVyKXtcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIik7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChsaXN0RWxlbWVudCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9EaXYgd2hpY2ggY29udGFpbnMgdGhlIGVudGlyZSBlbGVtZW50XHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgICBkaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLWl0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9MZWZ0IGRpdiB3aGljaCBkaXNwbGF5cyB0aGUgbGFiZWxcclxuICAgICAgICB2YXIgbGFiZWxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChsYWJlbERpdik7XHJcbiAgICAgICAgdmFyIGxhYmVsVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxhYmVsICsgXCI6XCIpO1xyXG4gICAgICAgIGxhYmVsRGl2LmFwcGVuZENoaWxkKGxhYmVsVGV4dCk7XHJcbiAgICAgICAgbGFiZWxEaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SaWdodCBkaXYgd2hpY2ggaXMgZWRpdGFibGUgYW5kIGRpc3BsYXlzIHRoZSB2YWx1ZVxyXG4gICAgICAgIHZhciB2YWx1ZVRleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh2YWx1ZVRleHREaXYpO1xyXG4gICAgICAgIHZhciB2YWx1ZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShvYmplY3Rba2V5XSk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LmFwcGVuZENoaWxkKHZhbHVlVGV4dCk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImNvbnRlbnRlZGl0YWJsZVwiLCBcImZhbHNlXCIpO1xyXG4gICAgICAgIHZhbHVlVGV4dERpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItc3ViaXRlbVwiKTtcclxuICAgICAgICB2YXIgdGhpc0lEID0gbGFiZWwrZ2VuZXJhdGVVbmlxdWVJRCgpO1xyXG4gICAgICAgIHZhbHVlVGV4dERpdi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0aGlzSUQpO1xyXG4gICAgICAgIFxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVEcm9wRG93bihsaXN0LHBhcmVudCxvcHRpb25zLHNlbGVjdGVkT3B0aW9uLCBkZXNjcmlwdGlvbil7XHJcbiAgICAgICAgdmFyIGxpc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpO1xyXG4gICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQobGlzdEVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vRGl2IHdoaWNoIGNvbnRhaW5zIHRoZSBlbnRpcmUgZWxlbWVudFxyXG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGxpc3RFbGVtZW50LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgICAgICAgZGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhci1pdGVtXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vTGVmdCBkaXYgd2hpY2ggZGlzcGxheXMgdGhlIGxhYmVsXHJcbiAgICAgICAgdmFyIGxhYmVsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobGFiZWxEaXYpO1xyXG4gICAgICAgIHZhciBsYWJlbFRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgbGFiZWxEaXYuYXBwZW5kQ2hpbGQobGFiZWxUZXh0KTtcclxuICAgICAgICBsYWJlbERpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItc3ViaXRlbVwiKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL1JpZ2h0IGRpdiB3aGljaCBpcyBlZGl0YWJsZSBhbmQgZGlzcGxheXMgdGhlIHZhbHVlXHJcbiAgICAgICAgdmFyIHZhbHVlVGV4dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHZhbHVlVGV4dERpdik7XHJcbiAgICAgICAgdmFyIGRyb3BEb3duID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcclxuICAgICAgICBvcHRpb25zLmZvckVhY2gob3B0aW9uID0+IHtcclxuICAgICAgICAgICAgdmFyIG9wID0gbmV3IE9wdGlvbigpO1xyXG4gICAgICAgICAgICBvcC52YWx1ZSA9IG9wdGlvbnMuZmluZEluZGV4KHRoaXNPcHRpb24gPT4gdGhpc09wdGlvbiA9PT0gb3B0aW9uKTtcclxuICAgICAgICAgICAgb3AudGV4dCA9IG9wdGlvbjtcclxuICAgICAgICAgICAgZHJvcERvd24ub3B0aW9ucy5hZGQob3ApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhbHVlVGV4dERpdi5hcHBlbmRDaGlsZChkcm9wRG93bik7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhci1zdWJpdGVtXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRyb3BEb3duLnNlbGVjdGVkSW5kZXggPSBzZWxlY3RlZE9wdGlvbjsgLy9kaXNwbGF5IHRoZSBjdXJyZW50IHNlbGVjdGlvblxyXG4gICAgICAgIFxyXG4gICAgICAgIGRyb3BEb3duLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjaGFuZ2UnLFxyXG4gICAgICAgICAgICBmdW5jdGlvbigpIHsgcGFyZW50LmNoYW5nZUVxdWF0aW9uKGRyb3BEb3duLnZhbHVlKTsgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJ1dHRvbihsaXN0LHBhcmVudCxidXR0b25UZXh0LGZ1bmN0aW9uVG9DYWxsKXtcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIik7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChsaXN0RWxlbWVudCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9EaXYgd2hpY2ggY29udGFpbnMgdGhlIGVudGlyZSBlbGVtZW50XHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgICBkaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLWl0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9MZWZ0IGRpdiB3aGljaCBkaXNwbGF5cyB0aGUgbGFiZWxcclxuICAgICAgICB2YXIgbGFiZWxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChsYWJlbERpdik7XHJcbiAgICAgICAgdmFyIGxhYmVsVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO1xyXG4gICAgICAgIGxhYmVsRGl2LmFwcGVuZENoaWxkKGxhYmVsVGV4dCk7XHJcbiAgICAgICAgbGFiZWxEaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SaWdodCBkaXYgd2hpY2ggaXMgYnV0dG9uXHJcbiAgICAgICAgdmFyIHZhbHVlVGV4dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHZhbHVlVGV4dERpdik7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XHJcbiAgICAgICAgdmFyIGJ1dHRvblRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYnV0dG9uVGV4dCk7XHJcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhcl9idXR0b25cIik7XHJcbiAgICAgICAgYnV0dG9uLmFwcGVuZENoaWxkKGJ1dHRvblRleHROb2RlKTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdtb3VzZWRvd24nLFxyXG4gICAgICAgICAgICBmdW5jdGlvbigpIHsgZnVuY3Rpb25Ub0NhbGwocGFyZW50KTsgfSAsXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVCT00obGlzdCxwYXJlbnQsQk9NbGlzdCl7XHJcbiAgICAgICAgLy9hQk9NRW50cnkgPSBuZXcgYm9tRW50cnk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDNcIik7XHJcbiAgICAgICAgZGl2LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXCJ0ZXh0LWFsaWduOmNlbnRlcjtcIik7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgICAgIHZhciB2YWx1ZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkJpbGwgT2YgTWF0ZXJpYWxzXCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh2YWx1ZVRleHQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkhSXCIpO1xyXG4gICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoeCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0Qk9NKCkuZm9yRWFjaChib21JdGVtID0+IHtcclxuICAgICAgICAgICAgaWYodGhpcy5CT01saXN0LmluZGV4T2YoYm9tSXRlbSkgIT0gLTEpeyAvL0lmIHRoZSBib20gaXRlbSBpcyBmcm9tIHRoaXMgbW9sZWN1bGVcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3QsYm9tSXRlbSxcIkJPTWl0ZW1OYW1lXCIsIFwiSXRlbVwiLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3QsYm9tSXRlbSxcIm51bWJlck5lZWRlZFwiLCBcIk51bWJlclwiLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0obGlzdCxib21JdGVtLFwiY29zdFVTRFwiLCBcIlByaWNlXCIsIHRydWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJzb3VyY2VcIiwgXCJTb3VyY2VcIiwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTm9uRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3QsYm9tSXRlbSxcIkJPTWl0ZW1OYW1lXCIsIFwiSXRlbVwiLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTm9uRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3QsYm9tSXRlbSxcInRvdGFsTmVlZGVkXCIsIFwiTnVtYmVyXCIsIHRydWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU5vbkVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJjb3N0VVNEXCIsIFwiUHJpY2VcIiwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTm9uRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3QsYm9tSXRlbSxcInNvdXJjZVwiLCBcIlNvdXJjZVwiLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgeCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJIUlwiKTtcclxuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZCh4KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNyZWF0ZUJ1dHRvbihsaXN0LHBhcmVudCxcIkFkZCBCT00gRW50cnlcIiwgdGhpcy5hZGRCT01FbnRyeSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFkZEJPTUVudHJ5KHNlbGYpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiYWRkIGEgYm9tIGVudHJ5XCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNlbGYuQk9NbGlzdC5wdXNoKG5ldyBCT01FbnRyeSgpKTtcclxuICAgICAgICBcclxuICAgICAgICBzZWxmLnVwZGF0ZVNpZGViYXIoKTtcclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9