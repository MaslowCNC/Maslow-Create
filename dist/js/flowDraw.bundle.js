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
        _menu2.default.hidemenu();
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
        console.log("double click menu open not working in flowDraw.js");
        //showmenu(event);
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
        uniqueID: _globalvariables2.default.generateUniqueID()
    });
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

/***/ "./src/js/githubOauth.js":
/*!*******************************!*\
  !*** ./src/js/githubOauth.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _molecule = __webpack_require__(/*! ./molecules/molecule.js */ "./src/js/molecules/molecule.js");

var _molecule2 = _interopRequireDefault(_molecule);

var _globalvariables = __webpack_require__(/*! ./globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GitHubModule = function () {
    function GitHubModule() {
        var _this2 = this;

        _classCallCheck(this, GitHubModule);

        this.octokit = new Octokit();
        this.popup = document.getElementById('projects-popup');
        this.currentRepoName = null;
        this.currentUser = null;
        this.bomHeader = "###### Note: Do not edit this file directly, it is automatically generated from the CAD model \n# Bill Of Materials \n |Part|Number Needed|Price|Source| \n |----|----------|-----|-----|";

        this.intervalTimer;

        var button = document.getElementById("loginButton");
        button.addEventListener("mousedown", function (e) {
            _this2.tryLogin();
        });
    }

    _createClass(GitHubModule, [{
        key: 'tryLogin',
        value: function tryLogin() {
            var _this3 = this;

            // Initialize with your OAuth.io app public key
            OAuth.initialize('BYP9iFpD7aTV9SDhnalvhZ4fwD8');
            // Use popup for oauth
            OAuth.popup('github').then(function (github) {

                _this3.octokit.authenticate({
                    type: "oauth",
                    token: github.access_token
                });

                //Test the authentication 
                _this3.octokit.users.getAuthenticated({}).then(function (result) {
                    _this3.showProjectsToLoad();
                });
            });
        }
    }, {
        key: 'showProjectsToLoad',
        value: function showProjectsToLoad() {
            var _this4 = this;

            //Remove everything in the this.popup now
            while (this.popup.firstChild) {
                this.popup.removeChild(this.popup.firstChild);
            }

            this.popup.classList.remove('off');

            //Add a title
            var titleDiv = document.createElement("DIV");
            titleDiv.setAttribute("style", "width: 100%");
            titleDiv.setAttribute("style", "padding: 30px");
            var title = document.createElement("H1");
            title.appendChild(document.createTextNode("Projects:"));
            titleDiv.appendChild(title);
            this.popup.appendChild(titleDiv);
            this.popup.appendChild(document.createElement("br"));

            var projectsSpaceDiv = document.createElement("DIV");
            projectsSpaceDiv.setAttribute("class", "float-left-div{");
            this.popup.appendChild(projectsSpaceDiv);

            //Add the create a new project button
            this.addProject("New Project");

            //store the current user name for later use
            this.octokit.users.getAuthenticated({}).then(function (result) {
                _this4.currentUser = result.data.login;
            });

            //List all of the repos that a user is the owner of
            this.octokit.repos.list({
                affiliation: 'owner'
            }).then(function (_ref) {
                var data = _ref.data,
                    headers = _ref.headers,
                    status = _ref.status;

                data.forEach(function (repo) {

                    //Check to see if this is a maslow create project
                    _this4.octokit.repos.listTopics({
                        owner: repo.owner.login,
                        repo: repo.name,
                        headers: {
                            accept: 'application/vnd.github.mercy-preview+json'
                        }
                    }).then(function (data) {
                        if (data.data.names.includes("maslowcreate") || data.data.names.includes("maslowcreate-molecule")) {
                            _this4.addProject(repo.name);
                        }
                    });
                });
            });
        }
    }, {
        key: 'addProject',
        value: function addProject(projectName) {
            var _this5 = this;

            //create a project element to display

            var project = document.createElement("DIV");

            var projectPicture = document.createElement("IMG");
            projectPicture.setAttribute("src", "testPicture.png");
            projectPicture.setAttribute("style", "width: 100%");
            projectPicture.setAttribute("style", "height: 100%");
            project.appendChild(projectPicture);

            var shortProjectName;
            if (projectName.length > 9) {
                shortProjectName = document.createTextNode(projectName.substr(0, 7) + "..");
            } else {
                shortProjectName = document.createTextNode(projectName);
            }
            project.setAttribute("class", "project");
            project.setAttribute("id", projectName);
            project.appendChild(shortProjectName);
            this.popup.appendChild(project);

            document.getElementById(projectName).addEventListener('click', function (event) {
                _this5.projectClicked(projectName);
            });
        }
    }, {
        key: 'projectClicked',
        value: function projectClicked(projectName) {
            //runs when you click on one of the projects
            if (projectName == "New Project") {
                this.createNewProjectPopup();
            } else {
                this.loadProject(projectName);
            }
        }
    }, {
        key: 'createNewProjectPopup',
        value: function createNewProjectPopup() {
            //Clear the popup and populate the fields we will need to create the new repo

            while (this.popup.firstChild) {
                this.popup.removeChild(this.popup.firstChild);
            }

            //Project name
            // <div class="form">
            var createNewProjectDiv = document.createElement("DIV");
            createNewProjectDiv.setAttribute("class", "form");

            //Add a title
            var header = document.createElement("H1");
            var title = document.createTextNode("Create a new project");
            header.appendChild(title);
            createNewProjectDiv.appendChild(header);

            //Create the form object
            var form = document.createElement("form");
            form.setAttribute("class", "login-form");
            createNewProjectDiv.appendChild(form);

            //Create the name field
            var name = document.createElement("input");
            name.setAttribute("id", "project-name");
            name.setAttribute("type", "text");
            name.setAttribute("placeholder", "Project name");
            form.appendChild(name);

            //Add the description field
            var description = document.createElement("input");
            description.setAttribute("id", "project-description");
            description.setAttribute("type", "text");
            description.setAttribute("placeholder", "Project description");
            form.appendChild(description);

            //Add the button
            var createButton = document.createElement("button");
            createButton.setAttribute("type", "button");
            createButton.setAttribute("onclick", "this.createNewProject()");
            var buttonText = document.createTextNode("Create Project");
            createButton.appendChild(buttonText);
            form.appendChild(createButton);

            this.popup.appendChild(createNewProjectDiv);
        }
    }, {
        key: 'createNewProject',
        value: function createNewProject() {
            var _this6 = this;

            if (_typeof(this.intervalTimer) != undefined) {
                clearInterval(this.intervalTimer); //Turn of auto saving
            }

            //Get name and description
            var name = document.getElementById('project-name').value;
            var description = document.getElementById('project-description').value;

            //Load a blank project
            _globalvariables2.default.topLevelMolecule = new _molecule2.default({
                x: 0,
                y: 0,
                topLevel: true,
                name: name,
                atomType: "Molecule",
                uniqueID: generateUniqueID()
            });

            _globalvariables2.default.currentMolecule = _globalvariables2.default.topLevelMolecule;

            //Create a new repo
            this.octokit.repos.createForAuthenticatedUser({
                name: name,
                description: description
            }).then(function (result) {
                //Once we have created the new repo we need to create a file within it to store the project in
                _this6.currentRepoName = result.data.name;
                var path = "project.maslowcreate";
                var content = window.btoa("init"); // create a file with just the word "init" in it and base64 encode it
                _this6.octokit.repos.createFile({
                    owner: _this6.currentUser,
                    repo: _this6.currentRepoName,
                    path: path,
                    message: "initialize repo",
                    content: content
                }).then(function (result) {
                    //Then create the BOM file
                    content = window.btoa(_this6.bomHeader); // create a file with just the header in it and base64 encode it
                    _this6.octokit.repos.createFile({
                        owner: _this6.currentUser,
                        repo: _this6.currentRepoName,
                        path: "BillOfMaterials.md",
                        message: "initialize BOM",
                        content: content
                    }).then(function (result) {
                        //Then create the README file
                        content = window.btoa("readme init"); // create a file with just the word "init" in it and base64 encode it
                        _this6.octokit.repos.createFile({
                            owner: _this6.currentUser,
                            repo: _this6.currentRepoName,
                            path: "README.md",
                            message: "initialize README",
                            content: content
                        }).then(function (result) {
                            console.log("Readme created");

                            var _this = _this6;
                            _this6.intervalTimer = setInterval(function () {
                                _this.saveProject();
                            }, 30000); //Save the project regularly
                        });
                    });
                });

                //Update the project topics
                _this6.octokit.repos.replaceTopics({
                    owner: _this6.currentUser,
                    repo: _this6.currentRepoName,
                    names: ["maslowcreate"],
                    headers: {
                        accept: 'application/vnd.github.mercy-preview+json'
                    }
                });
            });

            _globalvariables2.default.currentMolecule.backgroundClick();

            //Clear and hide the popup
            while (this.popup.firstChild) {
                this.popup.removeChild(this.popup.firstChild);
            }
            this.popup.classList.add('off');
        }
    }, {
        key: 'saveProject',
        value: function saveProject() {
            var _this7 = this;

            //Save the current project into the github repo
            if (this.currentRepoName != null) {
                var path = "project.maslowcreate";
                var content = window.btoa(JSON.stringify(_globalvariables2.default.topLevelMolecule.serialize(null), null, 4)); //Convert the GlobalVariables.topLevelMolecule object to a JSON string and then convert it to base64 encoding

                //Get the SHA for the file
                this.octokit.repos.getContents({
                    owner: this.currentUser,
                    repo: this.currentRepoName,
                    path: path
                }).then(function (thisRepo) {
                    var sha = thisRepo.data.sha;

                    //Save the repo to the file
                    _this7.octokit.repos.updateFile({
                        owner: _this7.currentUser,
                        repo: _this7.currentRepoName,
                        path: path,
                        message: "autosave",
                        content: content,
                        sha: sha
                    }).then(function (result) {

                        //Then update the BOM file

                        path = "BillOfMaterials.md";
                        content = _this7.bomHeader;

                        _globalvariables2.default.topLevelMolecule.requestBOM().forEach(function (item) {
                            content = content + "\n|" + item.BOMitemName + "|" + item.totalNeeded + "|" + item.costUSD + "|" + item.source + "|";
                        });

                        content = window.btoa(content);

                        //Get the SHA for the file
                        _this7.octokit.repos.getContents({
                            owner: _this7.currentUser,
                            repo: _this7.currentRepoName,
                            path: path
                        }).then(function (result) {
                            var sha = result.data.sha;

                            //Save the BOM to the file
                            _this7.octokit.repos.updateFile({
                                owner: _this7.currentUser,
                                repo: _this7.currentRepoName,
                                path: path,
                                message: "update Bom",
                                content: content,
                                sha: sha
                            }).then(function (result) {
                                console.log("BOM updated");

                                _this7.octokit.repos.get({
                                    owner: _this7.currentUser,
                                    repo: _this7.currentRepoName
                                }).then(function (result) {

                                    path = "README.md";
                                    content = "# " + result.data.name + "\n" + result.data.description + "\n";

                                    _globalvariables2.default.topLevelMolecule.requestReadme().forEach(function (item) {
                                        content = content + item + "\n\n\n";
                                    });

                                    content = window.btoa(content);

                                    //Get the SHA for the file
                                    _this7.octokit.repos.getContents({
                                        owner: _this7.currentUser,
                                        repo: _this7.currentRepoName,
                                        path: path
                                    }).then(function (result) {
                                        var sha = result.data.sha;

                                        //Save the README to the file
                                        _this7.octokit.repos.updateFile({
                                            owner: _this7.currentUser,
                                            repo: _this7.currentRepoName,
                                            path: path,
                                            message: "update Readme",
                                            content: content,
                                            sha: sha
                                        }).then(function (result) {
                                            console.log("README updated");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        }
    }, {
        key: 'loadProject',
        value: function loadProject(projectName) {
            var _this8 = this;

            if (_typeof(this.intervalTimer) != undefined) {
                clearInterval(this.intervalTimer); //Turn of auto saving
            }

            this.currentRepoName = projectName;

            this.octokit.repos.getContents({
                owner: this.currentUser,
                repo: projectName,
                path: 'project.maslowcreate'
            }).then(function (result) {

                //content will be base64 encoded
                var rawFile = atob(result.data.content);

                var moleculesList = JSON.parse(rawFile).molecules;

                //Load a blank project
                _globalvariables2.default.topLevelMolecule = new _molecule2.default({
                    x: 0,
                    y: 0,
                    topLevel: true,
                    atomType: "Molecule"
                });

                _globalvariables2.default.currentMolecule = _globalvariables2.default.topLevelMolecule;

                //Load the top level molecule from the file
                _globalvariables2.default.topLevelMolecule.deserialize(moleculesList, moleculesList.filter(function (molecule) {
                    return molecule.topLevel == true;
                })[0].uniqueID);

                _globalvariables2.default.currentMolecule.backgroundClick();

                //Clear and hide the popup
                while (_this8.popup.firstChild) {
                    _this8.popup.removeChild(_this8.popup.firstChild);
                }
                _this8.popup.classList.add('off');

                var _this = _this8;
                _this8.intervalTimer = setInterval(function () {
                    _this.saveProject();
                }, 30000); //Save the project regularly
            });
        }
    }, {
        key: 'exportCurrentMoleculeToGithub',
        value: function exportCurrentMoleculeToGithub(molecule) {
            var _this9 = this;

            //Get name and description
            var name = molecule.name;
            var description = "A stand alone molecule exported from Maslow Create";

            //Create a new repo
            this.octokit.repos.createForAuthenticatedUser({
                name: name,
                description: description
            }).then(function (result) {
                //Once we have created the new repo we need to create a file within it to store the project in
                var repoName = result.data.name;
                var id = result.data.id;
                var path = "project.maslowcreate";
                var content = window.btoa("init"); // create a file with just the word "init" in it and base64 encode it
                _this9.octokit.repos.createFile({
                    owner: _this9.currentUser,
                    repo: repoName,
                    path: path,
                    message: "initialize repo",
                    content: content
                }).then(function (result) {

                    //Save the molecule into the newly created repo

                    var path = "project.maslowcreate";

                    molecule.topLevel = true; //force the molecule to export in the long form as if it were the top level molecule
                    var content = window.btoa(JSON.stringify(molecule.serialize(null), null, 4)); //Convert the passed molecule object to a JSON string and then convert it to base64 encoding

                    //Get the SHA for the file
                    _this9.octokit.repos.getContents({
                        owner: _this9.currentUser,
                        repo: repoName,
                        path: path
                    }).then(function (result) {
                        var sha = result.data.sha;

                        //Save the repo to the file
                        _this9.octokit.repos.updateFile({
                            owner: _this9.currentUser,
                            repo: repoName,
                            path: path,
                            message: "export Molecule",
                            content: content,
                            sha: sha
                        }).then(function (result) {
                            console.log("Molecule Exported.");

                            //Replace the existing molecule now that we just exported
                            molecule.replaceThisMoleculeWithGithub(id);
                        });
                    });
                });

                //Update the project topics
                _this9.octokit.repos.replaceTopics({
                    owner: _this9.currentUser,
                    repo: repoName,
                    names: ["maslowcreate-molecule"],
                    headers: {
                        accept: 'application/vnd.github.mercy-preview+json'
                    }
                });
            });
        }
    }]);

    return GitHubModule;
}();

exports.default = GitHubModule;

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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _githubOauth = __webpack_require__(/*! ./githubOauth */ "./src/js/githubOauth.js");

var _githubOauth2 = _interopRequireDefault(_githubOauth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlobalVariables = function () {
    function GlobalVariables() {
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

        this.gitHub = new _githubOauth2.default();
    }

    _createClass(GlobalVariables, [{
        key: 'generateUniqueID',
        value: function generateUniqueID() {
            return Math.floor(Math.random() * 900000) + 100000;
        }
    }, {
        key: 'distBetweenPoints',
        value: function distBetweenPoints(x1, x2, y1, y2) {
            var a2 = Math.pow(x1 - x2, 2);
            var b2 = Math.pow(y1 - y2, 2);
            var dist = Math.sqrt(a2 + b2);

            return dist;
        }
    }]);

    return GlobalVariables;
}();

exports.default = new GlobalVariables();

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
        var _this = this;

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
            this.menuList.appendChild(newElement);

            //Add function to call when atom is selected
            document.getElementById(instance.atomType).addEventListener('click', function (e) {
                _this.placeNewNode(e);
            });
        }

        //Add functions to call when tabs are clicked
        document.getElementById("localTab").addEventListener("click", function (e) {
            _this.openTab(e, "menuList");
        });
        document.getElementById("githubTab").addEventListener("click", function (e) {
            _this.openTab(e, "githubList");
        });
        //Add function call when background is right clicked
        document.getElementById('flow-canvas').addEventListener('contextmenu', function (e) {
            _this.showmenu(e);
        });
        //Add function call to search when typing
        document.getElementById('menuInput').addEventListener('keyup', function (e) {
            _this.searchMenu(e);
        });
    }

    _createClass(Menu, [{
        key: 'placeNewNode',
        value: function placeNewNode(ev) {
            var clr = ev.target.id;

            _globalvariables2.default.currentMolecule.placeAtom({
                x: this.menu.x,
                y: this.menu.y,
                parent: _globalvariables2.default.currentMolecule,
                atomType: clr,
                uniqueID: _globalvariables2.default.generateUniqueID()
            }, null, _globalvariables2.default.availableTypes); //null indicates that there is nothing to load from the molecule list for this one
        }
    }, {
        key: 'placeGitHubMolecule',
        value: function placeGitHubMolecule(ev) {
            this.hidemenu();
            var clr = ev.target.id;

            _globalvariables2.default.currentMolecule.placeAtom({
                x: this.menu.x,
                y: this.menu.y,
                parent: _globalvariables2.default.currentMolecule,
                atomType: "GitHubMolecule",
                projectID: clr,
                uniqueID: _globalvariables2.default.generateUniqueID()
            }, null, _globalvariables2.default.availableTypes); //null indicates that there is nothing to load from the molecule list for this one
        }
    }, {
        key: 'showmenu',
        value: function showmenu(ev) {
            //Open the default tab
            document.getElementById("localTab").click();

            //stop the real right click menu
            ev.preventDefault();

            //make sure all elements are unhidden
            var ul = document.getElementById("menuList");
            var li = ul.getElementsByTagName('li');
            for (var i = 0; i < li.length; i++) {
                li[i].style.display = "none"; //set each item to not display
            }

            //show the menu
            this.menu.style.top = ev.clientY - 20 + 'px';
            this.menu.style.left = ev.clientX - 20 + 'px';
            this.menu.x = ev.clientX;
            this.menu.y = ev.clientY;
            this.menu.classList.remove('off');

            document.getElementById('menuInput').focus();
        }
    }, {
        key: 'hidemenu',
        value: function hidemenu(ev) {
            this.menu.classList.add('off');
            this.menu.style.top = '-200%';
            this.menu.style.left = '-200%';
        }
    }, {
        key: 'searchMenu',
        value: function searchMenu(evt) {
            var _this2 = this;

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

                    this.githubList = document.getElementById("githubList");

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
                                _this2.githubList.appendChild(newElement);

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

exports.default = new Menu();

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

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

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
        key: 'updateSidebar',
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            var valueList = _get(Constant.prototype.__proto__ || Object.getPrototypeOf(Constant.prototype), 'updateSidebar', this).call(this); //call the super function

            var output = this.children[0];

            this.createEditableValueListItem(valueList, output, "value", "Value", true);
            this.createEditableValueListItem(valueList, this, "name", "Name", false);
        }
    }, {
        key: 'setValue',
        value: function setValue(newName) {
            //Called by the sidebar to set the name
            this.name = newName;
        }
    }, {
        key: 'serialize',
        value: function serialize(values) {
            //Save the IO value to the serial stream
            var valuesObj = _get(Constant.prototype.__proto__ || Object.getPrototypeOf(Constant.prototype), 'serialize', this).call(this, values);

            valuesObj.ioValues = [{
                name: "number",
                ioValue: this.children[0].getValue()
            }];

            return valuesObj;
        }
    }, {
        key: 'draw',
        value: function draw() {

            this.children.forEach(function (child) {
                child.draw();
            });

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.fillStyle = this.color;
            _globalvariables2.default.c.rect(this.x - this.radius, this.y - this.height / 2, 2 * this.radius, this.height);
            _globalvariables2.default.c.textAlign = "start";
            _globalvariables2.default.c.fillText(this.name, this.x + this.radius, this.y - this.radius);
            _globalvariables2.default.c.fill();
            _globalvariables2.default.c.closePath();
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

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

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
        key: 'updateSidebar',
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            var valueList = _get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), 'updateSidebar', this).call(this); //call the super function

            this.createEditableValueListItem(valueList, this, "name", "Name", false);
        }
    }, {
        key: 'draw',
        value: function draw() {

            this.children.forEach(function (child) {
                child.draw();
            });

            _globalvariables2.default.c.fillStyle = this.color;

            _globalvariables2.default.c.textAlign = "start";
            _globalvariables2.default.c.fillText(this.name, this.x + this.radius, this.y - this.radius);

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.moveTo(this.x - this.radius, this.y - this.height / 2);
            _globalvariables2.default.c.lineTo(this.x - this.radius + 10, this.y);
            _globalvariables2.default.c.lineTo(this.x - this.radius, this.y + this.height / 2);
            _globalvariables2.default.c.lineTo(this.x + this.radius, this.y + this.height / 2);
            _globalvariables2.default.c.lineTo(this.x + this.radius, this.y - this.height / 2);
            _globalvariables2.default.c.fill();
            _globalvariables2.default.c.closePath();
        }
    }, {
        key: 'deleteNode',
        value: function deleteNode() {

            //Remove this input from the parent molecule
            if (typeof this.parent !== 'undefined') {
                this.parent.removeIO("input", this.name, this.parent);
            }

            _get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), 'deleteNode', this).call(this);
        }
    }, {
        key: 'setValue',
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
        key: 'setOutput',
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
        key: 'updateCodeBlock',
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

var _connector = __webpack_require__(/*! ../prototypes/connector */ "./src/js/prototypes/connector.js");

var _connector2 = _interopRequireDefault(_connector);

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
            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.fillStyle = this.centerColor;
            _globalvariables2.default.c.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2, false);
            _globalvariables2.default.c.closePath();
            _globalvariables2.default.c.fill();
        }
    }, {
        key: 'doubleClick',
        value: function doubleClick(x, y) {
            //returns true if something was done with the click


            var clickProcessed = false;

            var distFromClick = _globalvariables2.default.distBetweenPoints(x, this.x, y, this.y);

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
                this.createButton(valueList, this, "Load A Different Project", _globalvariables2.default.gitHub.showProjectsToLoad);
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
            }, null, _globalvariables2.default.availableTypes);

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
                return _globalvariables2.default.distBetweenPoints(a.x, 0, a.y, 0) - _globalvariables2.default.distBetweenPoints(b.x, 0, b.y, 0);
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
                _this3.placeAtom(JSON.parse(atom), moleculeList, _globalvariables2.default.availableTypes);
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
                            connector = new _connector2.default({
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

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

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

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.fillStyle = this.color;
            _globalvariables2.default.c.rect(this.x - this.radius, this.y - this.height / 2, 2 * this.radius, this.height);
            _globalvariables2.default.c.textAlign = "end";
            _globalvariables2.default.c.fillText(this.name, this.x + this.radius, this.y - this.radius);
            _globalvariables2.default.c.fill();
            _globalvariables2.default.c.closePath();

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.moveTo(this.x + this.radius, this.y - this.height / 2);
            _globalvariables2.default.c.lineTo(this.x + this.radius + 10, this.y);
            _globalvariables2.default.c.lineTo(this.x + this.radius, this.y + this.height / 2);
            _globalvariables2.default.c.fill();
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

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

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
        key: 'updateSidebar',
        value: function updateSidebar() {
            //updates the sidebar to display information about this node

            var valueList = _get(Readme.prototype.__proto__ || Object.getPrototypeOf(Readme.prototype), 'updateSidebar', this).call(this); //call the super function

            this.createEditableValueListItem(valueList, this, "readmeText", "Notes", false);
        }
    }, {
        key: 'draw',
        value: function draw() {

            _get(Readme.prototype.__proto__ || Object.getPrototypeOf(Readme.prototype), 'draw', this).call(this); //Super call to draw the rest

            //draw the two slashes on the node//
            _globalvariables2.default.c.strokeStyle = "#949294";
            _globalvariables2.default.c.lineWidth = 3;
            _globalvariables2.default.c.lineCap = "round";

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.moveTo(this.x - 11, this.y + 10);
            _globalvariables2.default.c.lineTo(this.x, this.y - 10);
            _globalvariables2.default.c.stroke();

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.moveTo(this.x, this.y + 10);
            _globalvariables2.default.c.lineTo(this.x + 11, this.y - 10);
            _globalvariables2.default.c.stroke();
        }
    }, {
        key: 'setValue',
        value: function setValue(newText) {
            this.readmeText = newText;
        }
    }, {
        key: 'requestReadme',
        value: function requestReadme() {
            //request any contributions from this atom to the readme

            return [this.readmeText];
        }
    }, {
        key: 'serialize',
        value: function serialize(values) {
            //Save the readme text to the serial stream
            var valuesObj = _get(Readme.prototype.__proto__ || Object.getPrototypeOf(Readme.prototype), 'serialize', this).call(this, values);

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

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

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
        key: 'updateCodeBlock',
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
                this.addIO("input", "2D shape " + _globalvariables2.default.generateUniqueID(), this, "geometry", "");
            }
            if (this.howManyInputPortsAvailable() >= 2 && this.ioValues.length <= 1) {
                //We need to remove the empty port
                this.deleteEmptyPort();
                this.updateCodeBlock();
            }
        }
    }, {
        key: 'howManyInputPortsAvailable',
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
        key: 'deleteEmptyPort',
        value: function deleteEmptyPort() {
            var _this3 = this;

            this.children.forEach(function (io) {
                if (io.type == "input" && io.connectors.length == 0 && _this3.howManyInputPortsAvailable() >= 2) {
                    _this3.removeIO("input", io.name, _this3);
                }
            });
        }
    }, {
        key: 'serialize',
        value: function serialize(savedObject) {
            var thisAsObject = _get(ShrinkWrap.prototype.__proto__ || Object.getPrototypeOf(ShrinkWrap.prototype), 'serialize', this).call(this, savedObject);

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
        key: 'updateSidebar',
        value: function updateSidebar() {
            //Update the side bar to make it possible to change the molecule name

            var valueList = _get(ShrinkWrap.prototype.__proto__ || Object.getPrototypeOf(ShrinkWrap.prototype), 'updateSidebar', this).call(this);

            this.createDropDown(valueList, this, ["Closed", "Open", "Solid"], this.closedSelection, "End:");
        }
    }, {
        key: 'changeEquation',
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

var _attachmentpoint = __webpack_require__(/*! ./attachmentpoint */ "./src/js/prototypes/attachmentpoint.js");

var _attachmentpoint2 = _interopRequireDefault(_attachmentpoint);

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.fillStyle = this.color;
            //make it imposible to draw atoms too close to the edge
            //not sure what x left margin should be because if it's too close it would cover expanded text
            var canvasFlow = document.querySelector('#flow-canvas');
            if (this.x < this.radius * 3) {
                this.x += this.radius * 3;
                _globalvariables2.default.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else if (this.y < this.radius * 2) {
                this.y += this.radius;
                _globalvariables2.default.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else if (this.x + this.radius * 2 > canvasFlow.width) {
                this.x -= this.radius * 2;
                _globalvariables2.default.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else if (this.y + this.radius * 2 > canvasFlow.height) {
                this.y -= this.radius;
                _globalvariables2.default.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            } else {
                _globalvariables2.default.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            }
            _globalvariables2.default.c.textAlign = "start";
            _globalvariables2.default.c.fillText(this.name, this.x + this.radius, this.y - this.radius);
            _globalvariables2.default.c.fill();
            _globalvariables2.default.c.closePath();
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
            var input = new _attachmentpoint2.default({
                parentMolecule: target,
                defaultOffsetX: offset,
                defaultOffsetY: 0,
                type: type,
                valueType: valueType,
                name: name,
                value: defaultValue,
                uniqueID: _globalvariables2.default.generateUniqueID(),
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

                var distFromClick = _globalvariables2.default.distBetweenPoints(x, this.x, y, this.y);

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

            var distFromClick = _globalvariables2.default.distBetweenPoints(x, this.x, y, this.y);

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
            while (_globalvariables2.default.sideBar.firstChild) {
                _globalvariables2.default.sideBar.removeChild(_globalvariables2.default.sideBar.firstChild);
            }

            //add the name as a title
            var name = document.createElement('h1');
            name.textContent = this.name;
            name.setAttribute("style", "text-align:center;");
            _globalvariables2.default.sideBar.appendChild(name);

            //Create a list element
            var valueList = document.createElement("ul");
            _globalvariables2.default.sideBar.appendChild(valueList);
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
            var thisID = label + _globalvariables2.default.generateUniqueID();
            valueTextDiv.setAttribute("id", thisID);

            document.getElementById(thisID).addEventListener('focusout', function (event) {
                var valueInBox = document.getElementById(thisID).textContent;
                if (resultShouldBeNumber) {
                    valueInBox = parseFloat(valueInBox);
                }

                //If the target is an attachmentPoint then call the setter function
                if (object instanceof _attachmentpoint2.default) {
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
            var thisID = label + _globalvariables2.default.generateUniqueID();
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

/***/ }),

/***/ "./src/js/prototypes/attachmentpoint.js":
/*!**********************************************!*\
  !*** ./src/js/prototypes/attachmentpoint.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _connector = __webpack_require__(/*! ./connector */ "./src/js/prototypes/connector.js");

var _connector2 = _interopRequireDefault(_connector);

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AttachmentPoint = function () {
    function AttachmentPoint(values) {
        _classCallCheck(this, AttachmentPoint);

        this.defaultRadius = 8;
        this.expandedRadius = 14;
        this.radius = 8;

        this.hoverDetectRadius = 8;
        this.hoverOffsetX = 0;
        this.hoverOffsetY = 0;
        this.uniqueID = 0;
        this.defaultOffsetX = 0;
        this.defaultOffsetY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.showHoverText = false;
        this.atomType = "AttachmentPoint";

        this.valueType = "number"; //options are number, geometry, array
        this.type = "output";
        this.value = 10; //The default input value when nothing is connected

        this.connectors = [];

        this.offsetX = this.defaultOffsetX;
        this.offsetY = this.defaultOffsetY;

        for (var key in values) {
            this[key] = values[key];
        }

        this.clickMove(0, 0); //trigger a refresh to get all the current values
    }

    _createClass(AttachmentPoint, [{
        key: 'draw',
        value: function draw() {

            var txt = this.name;
            var textWidth = _globalvariables2.default.c.measureText(txt).width;
            var bubbleColor = "#008080";
            var scaleRadiusDown = this.radius * .7;
            var halfRadius = this.radius * .5;

            if (this.showHoverText) {
                if (this.type == "input") {
                    _globalvariables2.default.c.beginPath();
                    _globalvariables2.default.c.fillStyle = bubbleColor;
                    if (this.radius == this.expandedRadius) {
                        _globalvariables2.default.c.rect(this.x - textWidth - this.radius - halfRadius, this.y - scaleRadiusDown, textWidth + this.radius + halfRadius, scaleRadiusDown * 2);
                        _globalvariables2.default.c.arc(this.x - textWidth - this.radius - halfRadius, this.y, scaleRadiusDown, 0, Math.PI * 2, false);
                    } else if (this.radius == this.defaultRadius) {
                        _globalvariables2.default.c.rect(this.x - textWidth - this.radius - halfRadius, this.y - this.radius, textWidth + this.radius + halfRadius, this.radius * 2);
                        _globalvariables2.default.c.arc(this.x - textWidth - this.radius - halfRadius, this.y, this.radius, 0, Math.PI * 2, false);
                    }
                    _globalvariables2.default.c.fill();
                    _globalvariables2.default.c.beginPath();
                    _globalvariables2.default.c.fillStyle = this.parentMolecule.defaultColor;
                    _globalvariables2.default.c.textAlign = "end";
                    _globalvariables2.default.c.fillText(this.name, this.x - (this.radius + 3), this.y + 2);
                    _globalvariables2.default.c.fill();
                    _globalvariables2.default.c.closePath();
                } else {
                    _globalvariables2.default.c.beginPath();
                    _globalvariables2.default.c.fillStyle = bubbleColor;
                    _globalvariables2.default.c.rect(this.x, this.y - scaleRadiusDown, textWidth + this.radius + halfRadius, scaleRadiusDown * 2);
                    _globalvariables2.default.c.arc(this.x + textWidth + this.radius + halfRadius, this.y, scaleRadiusDown, 0, Math.PI * 2, false);
                    _globalvariables2.default.c.fill();
                    _globalvariables2.default.c.closePath();
                    _globalvariables2.default.c.beginPath();
                    _globalvariables2.default.c.fillStyle = this.parentMolecule.defaultColor;
                    _globalvariables2.default.c.textAlign = "start";
                    _globalvariables2.default.c.fillText(this.name, this.x + halfRadius + (this.radius + 3), this.y + 2);
                    _globalvariables2.default.c.fill();
                    _globalvariables2.default.c.closePath();
                }
            }
            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.fillStyle = this.parentMolecule.color;
            _globalvariables2.default.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            _globalvariables2.default.c.fill();
            _globalvariables2.default.c.closePath();
        }
    }, {
        key: 'clickDown',
        value: function clickDown(x, y) {
            if (_globalvariables2.default.distBetweenPoints(this.x, x, this.y, y) < this.defaultRadius) {

                if (this.type == 'output') {
                    //begin to extend a connector from this if it is an output
                    var connector = new _connector2.default({
                        parentMolecule: this.parentMolecule,
                        attachmentPoint1: this,
                        atomType: "Connector"
                    });
                    this.connectors.push(connector);
                }

                if (this.type == 'input') {
                    //connectors can only be selected by clicking on an input
                    this.connectors.forEach(function (connector) {
                        //select any connectors attached to this node
                        connector.selected = true;
                    });
                }

                return true; //indicate that the click was handled by this object
            } else {
                if (this.type == 'input') {
                    //connectors can only be selected by clicking on an input
                    this.connectors.forEach(function (connector) {
                        //unselect any connectors attached to this node
                        connector.selected = false;
                    });
                }
                return false; //indicate that the click was not handled by this object
            }
        }
    }, {
        key: 'clickUp',
        value: function clickUp(x, y) {
            this.connectors.forEach(function (connector) {
                connector.clickUp(x, y);
            });
        }
    }, {
        key: 'clickMove',
        value: function clickMove(x, y) {

            //expand if touched by mouse
            var distFromCursor = _globalvariables2.default.distBetweenPoints(this.x, x, this.y, y);

            //If we are hovering over the attachment point, indicate that by making it big
            if (distFromCursor < this.defaultRadius) {
                this.radius = this.expandedRadius;
            } else {
                this.radius = this.defaultRadius;
            }
            //If we are close to the attachment point move it to it's hover location to make it accessible
            //Change direction of hover drop down if too close to the top.
            if (distFromCursor < this.hoverDetectRadius) {

                var numAttachmentPoints = this.parentMolecule.children.length;
                var attachmentPointNumber = this.parentMolecule.children.indexOf(this);

                // if input type then offset first element down to give space for radial menu 
                if (this.type == "output") {
                    this.offsetX = this.defaultOffsetX;
                    this.offsetY = this.defaultOffsetY;
                } else {
                    var anglePerIO = 2.0944 / numAttachmentPoints; //120 deg/num
                    // angle correction so that it centers menu adjusting to however many attachment points there are 
                    var angleCorrection = anglePerIO * (numAttachmentPoints - 2 /* -1 correction + 1 for "output" IO */);

                    this.hoverOffsetY = Math.round(1.5 * this.parentMolecule.radius * Math.sin(-angleCorrection + anglePerIO * 2 * attachmentPointNumber));
                    this.hoverOffsetX = -Math.round(1.5 * this.parentMolecule.radius * Math.cos(-angleCorrection + anglePerIO * 2 * attachmentPointNumber));
                    this.offsetX = this.hoverOffsetX;
                    this.offsetY = this.hoverOffsetY;
                }
                this.showHoverText = true;
                this.hoverDetectRadius = this.defaultRadius + _globalvariables2.default.distBetweenPoints(this.defaultOffsetX, this.hoverOffsetX, this.defaultOffsetY, this.hoverOffsetY);
            } else {
                this.offsetX = this.defaultOffsetX;
                this.offsetY = this.defaultOffsetY;
                this.showHoverText = false;
                this.hoverDetectRadius = this.defaultRadius;
            }

            this.connectors.forEach(function (connector) {
                connector.clickMove(x, y);
            });
        }
    }, {
        key: 'keyPress',
        value: function keyPress(key) {
            this.connectors.forEach(function (connector) {
                connector.keyPress(key);
            });
        }
    }, {
        key: 'deleteSelf',
        value: function deleteSelf() {
            //remove any connectors which were attached to this attachment point

            this.connectors.forEach(function (connector) {
                connector.deleteSelf();
            });
        }
    }, {
        key: 'updateSidebar',
        value: function updateSidebar() {
            this.parent.updateSidebar();
        }
    }, {
        key: 'wasConnectionMade',
        value: function wasConnectionMade(x, y, connector) {
            //this function returns itself if the coordinates passed in are within itself
            if (_globalvariables2.default.distBetweenPoints(this.x, x, this.y, y) < this.radius && this.type == 'input') {
                //If we have released the mouse here and this is an input...

                if (this.connectors.length > 0) {
                    //Don't accept a second connection to an input
                    return false;
                }

                this.connectors.push(connector);

                return this;
            }
            return false;
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return this.value;
        }
    }, {
        key: 'setValue',
        value: function setValue(newValue) {
            this.value = newValue;

            //propigate the change to linked elements if this is an output
            if (this.type == 'output') {
                this.connectors.forEach(function (connector) {
                    //select any connectors attached to this node
                    connector.propogate();
                });
            }
            //if this is an input
            else {
                    //update the code block to reflect the new values
                    this.parentMolecule.updateCodeBlock();
                }
        }
    }, {
        key: 'update',
        value: function update() {
            this.x = this.parentMolecule.x + this.offsetX;
            this.y = this.parentMolecule.y + this.offsetY;
            this.draw();

            this.connectors.forEach(function (connector) {
                connector.update();
            });
        }
    }]);

    return AttachmentPoint;
}();

exports.default = AttachmentPoint;

/***/ }),

/***/ "./src/js/prototypes/connector.js":
/*!****************************************!*\
  !*** ./src/js/prototypes/connector.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _globalvariables = __webpack_require__(/*! ../globalvariables */ "./src/js/globalvariables.js");

var _globalvariables2 = _interopRequireDefault(_globalvariables);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Connector = function () {
    function Connector(values) {
        _classCallCheck(this, Connector);

        this.isMoving = true;
        this.color = 'black';
        this.atomType = "Connector";
        this.selected = false;
        this.attachmentPoint1 = null;
        this.attachmentPoint2 = null;

        for (var key in values) {
            this[key] = values[key];
        }

        this.startX = this.parentMolecule.outputX;
        this.startY = this.parentMolecule.y;
    }

    _createClass(Connector, [{
        key: 'draw',
        value: function draw() {

            _globalvariables2.default.c.beginPath();
            _globalvariables2.default.c.fillStyle = this.color;
            _globalvariables2.default.c.strokeStyle = this.color;
            _globalvariables2.default.c.globalCompositeOperation = 'destination-over'; //draw under other elements;
            if (this.selected) {
                _globalvariables2.default.c.lineWidth = 3;
            } else {
                _globalvariables2.default.c.lineWidth = 1;
            }
            _globalvariables2.default.c.moveTo(this.startX, this.startY);
            _globalvariables2.default.c.bezierCurveTo(this.startX + 100, this.startY, this.endX - 100, this.endY, this.endX, this.endY);
            _globalvariables2.default.c.stroke();
            _globalvariables2.default.c.globalCompositeOperation = 'source-over'; //switch back to drawing on top
        }
    }, {
        key: 'clickUp',
        value: function clickUp(x, y) {
            var _this = this;

            if (this.isMoving) {
                //we only want to attach the connector which is currently moving
                _globalvariables2.default.currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
                    //For every molecule on the screen  
                    molecule.children.forEach(function (child) {
                        //For each of their attachment points
                        var thisConnectionValid = child.wasConnectionMade(x, y, _this); //Check to see if we made a connection
                        if (thisConnectionValid) {
                            _this.attachmentPoint2 = thisConnectionValid;
                            _this.propogate(); //Send information from one point to the other
                        }
                    });
                });
            }

            if (this.attachmentPoint2 == null) {
                //If we have not made a connection
                this.deleteSelf(); //Delete this connector
            }

            this.isMoving = false; //Move over 
        }
    }, {
        key: 'clickMove',
        value: function clickMove(x, y) {
            if (this.isMoving == true) {
                this.endX = x;
                this.endY = y;
            }
        }
    }, {
        key: 'keyPress',
        value: function keyPress(key) {
            if (this.selected) {
                if (key == 'Delete') {
                    this.deleteSelf();
                }
            }
        }
    }, {
        key: 'deleteSelf',
        value: function deleteSelf() {
            //Free up the input to which this was attached
            if (this.attachmentPoint2 != null) {
                this.attachmentPoint2.connectors = [];
            }

            //Remove this connector from the output it is attached to
            this.attachmentPoint1.connectors.splice(this.attachmentPoint1.connectors.indexOf(this), 1);
        }
    }, {
        key: 'serialize',
        value: function serialize() {
            if (this.attachmentPoint2 != null) {
                var object = {
                    ap1Name: this.attachmentPoint1.name,
                    ap2Name: this.attachmentPoint2.name,
                    ap1ID: this.attachmentPoint1.parentMolecule.uniqueID,
                    ap2ID: this.attachmentPoint2.parentMolecule.uniqueID
                };
                return JSON.stringify(object);
            }
        }
    }, {
        key: 'propogate',
        value: function propogate() {
            //takes the input and passes it to the output
            this.attachmentPoint2.setValue(this.attachmentPoint1.getValue());
        }
    }, {
        key: 'update',
        value: function update() {

            this.startX = this.attachmentPoint1.x;
            this.startY = this.attachmentPoint1.y;
            if (this.attachmentPoint2) {
                //check to see if the attachment point is defined
                this.endX = this.attachmentPoint2.x;
                this.endY = this.attachmentPoint2.y;
            }
            this.draw();
        }
    }, {
        key: 'wasConnectionMade',
        value: function wasConnectionMade(x, y, connector) {
            return false;
        }
    }]);

    return Connector;
}();

exports.default = Connector;

/***/ })

/******/ });
//# sourceMappingURL=flowDraw.bundle.js.map