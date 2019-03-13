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


//import utils from './utils'

var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight / 2;

//put some content in the sidebar at launch
var sideBar = document.querySelector('.sideBar');
var lowerHalfOfScreen = document.querySelector('.flex-parent');
lowerHalfOfScreen.setAttribute("style", "height:" + innerHeight / 2.1 + "px");

// Event Listeners
var flowCanvas = document.getElementById('flow-canvas');
flowCanvas.addEventListener('contextmenu', showmenu);

flowCanvas.addEventListener('mousemove', function (event) {
    currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.clickMove(event.clientX, event.clientY);
    });
});

window.addEventListener('resize', function (event) {

    console.log("resize");

    var bounds = canvas.getBoundingClientRect();
    canvas.width = bounds.width;
    canvas.height = bounds.height;
});

flowCanvas.addEventListener('mousedown', function (event) {
    //every time the mouse button goes down

    var clickHandledByMolecule = false;

    currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        if (molecule.clickDown(event.clientX, event.clientY) == true) {
            clickHandledByMolecule = true;
        }
    });

    if (!clickHandledByMolecule) {
        currentMolecule.backgroundClick();
    }

    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        hidemenu();
    }
});

flowCanvas.addEventListener('dblclick', function (event) {
    //every time the mouse button goes down

    var clickHandledByMolecule = false;

    currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
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
    currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.clickUp(event.clientX, event.clientY);
    });
});

window.addEventListener('keydown', function (event) {
    //every time the mouse button goes up

    currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.keyPress(event.key);
    });
});

// Implementation

var availableTypes = {
    circle: { creator: Circle, atomType: "Circle" },
    rectangle: { creator: Rectangle, atomType: "Rectangle" },
    shirinkwrap: { creator: ShrinkWrap, atomType: "ShrinkWrap" },
    translate: { creator: Translate, atomType: "Translate" },
    regularPolygon: { creator: RegularPolygon, atomType: "RegularPolygon" },
    extrude: { creator: Extrude, atomType: "Extrude" },
    scale: { creator: Scale, atomType: "Scale" },
    intersection: { creator: Intersection, atomType: "Intersection" },
    difference: { creator: Difference, atomType: "Difference" },
    costant: { creator: Constant, atomType: "Constant" },
    equation: { creator: Equation, atomType: "Equation" },
    molecule: { creator: Molecule, atomType: "Molecule" },
    input: { creator: Input, atomType: "Input" },
    readme: { creator: Readme, atomType: "Readme" },
    rotate: { creator: Rotate, atomType: "Rotate" },
    mirror: { creator: Mirror, atomType: "Mirror" },
    githubmolecule: { creator: GitHubMolecule, atomType: "GitHubMolecule" },
    union: { creator: Union, atomType: "Union" }
};

var secretTypes = {
    output: { creator: Output, atomType: "Output" }
};

var currentMolecule = void 0;
var topLevelMolecule = void 0;
var menu = void 0;

function init() {
    currentMolecule = new Molecule({
        x: 0,
        y: 0,
        topLevel: true,
        name: "Maslow Create",
        atomType: "Molecule",
        uniqueID: generateUniqueID()
    });

    menu = document.querySelector('.menu');
    menu.classList.add('off');
    menuList = document.getElementById("menuList");

    //Add the search bar to the list item

    for (var key in availableTypes) {
        var newElement = document.createElement("LI");
        var instance = availableTypes[key];
        var text = document.createTextNode(instance.atomType);
        newElement.setAttribute("class", "menu-item");
        newElement.setAttribute("id", instance.atomType);
        newElement.appendChild(text);
        menuList.appendChild(newElement);

        document.getElementById(instance.atomType).addEventListener('click', placeNewNode);
    }
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
    c.clearRect(0, 0, canvas.width, canvas.height);

    //c.fillText('T', mouse.x, mouse.y)
    currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
        molecule.update();
    });
}

init();
animate();

/***/ })

/******/ });
//# sourceMappingURL=flowDraw.bundle.js.map