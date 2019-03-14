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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GitHubModule = function () {
    function GitHubModule() {
        var _this = this;

        _classCallCheck(this, GitHubModule);

        this.octokit = new Octokit();
        this.popup = document.getElementById('projects-popup');
        this.currentRepoName = null;
        this.currentUser = null;
        this.bomHeader = "###### Note: Do not edit this file directly, it is automatically generated from the CAD model \n# Bill Of Materials \n |Part|Number Needed|Price|Source| \n |----|----------|-----|-----|";

        this.intervalTimer = null;

        var button = document.getElementById("loginButton");
        button.addEventListener("mousedown", function (e) {
            _this.tryLogin();
        });
    }

    _createClass(GitHubModule, [{
        key: "tryLogin",
        value: function tryLogin() {
            var _this2 = this;

            // Initialize with your OAuth.io app public key
            OAuth.initialize('BYP9iFpD7aTV9SDhnalvhZ4fwD8');
            // Use popup for oauth
            OAuth.popup('github').then(function (github) {

                _this2.octokit.authenticate({
                    type: "oauth",
                    token: github.access_token
                });

                //Test the authentication 
                _this2.octokit.users.getAuthenticated({}).then(function (result) {
                    _this2.showProjectsToLoad();
                });
            });
        }
    }, {
        key: "showProjectsToLoad",
        value: function showProjectsToLoad() {
            var _this3 = this;

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
            addProject("New Project");

            //store the current user name for later use
            this.octokit.users.getAuthenticated({}).then(function (result) {
                _this3.currentUser = result.data.login;
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
                    _this3.octokit.repos.listTopics({
                        owner: repo.owner.login,
                        repo: repo.name,
                        headers: {
                            accept: 'application/vnd.github.mercy-preview+json'
                        }
                    }).then(function (data) {
                        if (data.data.names.includes("maslowcreate") || data.data.names.includes("maslowcreate-molecule")) {
                            addProject(repo.name);
                        }
                    });
                });
            });
        }
    }, {
        key: "addProject",
        value: function addProject(projectName) {
            var _this4 = this;

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
                _this4.projectClicked(projectName);
            });
        }
    }, {
        key: "projectClicked",
        value: function projectClicked(projectName) {
            //runs when you click on one of the projects
            if (projectName == "New Project") {
                this.createNewProjectPopup();
            } else {
                this.loadProject(projectName);
            }
        }
    }, {
        key: "createNewProjectPopup",
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
        key: "createNewProject",
        value: function createNewProject() {
            var _this5 = this;

            if (_typeof(this.intervalTimer) != undefined) {
                clearInterval(this.intervalTimer); //Turn of auto saving
            }

            //Get name and description
            var name = document.getElementById('project-name').value;
            var description = document.getElementById('project-description').value;

            //Load a blank project
            topLevelMolecule = new Molecule({
                x: 0,
                y: 0,
                topLevel: true,
                name: name,
                atomType: "Molecule",
                uniqueID: generateUniqueID()
            });

            currentMolecule = topLevelMolecule;

            //Create a new repo
            this.octokit.repos.createForAuthenticatedUser({
                name: name,
                description: description
            }).then(function (result) {
                //Once we have created the new repo we need to create a file within it to store the project in
                _this5.currentRepoName = result.data.name;
                var path = "project.maslowcreate";
                var content = window.btoa("init"); // create a file with just the word "init" in it and base64 encode it
                _this5.octokit.repos.createFile({
                    owner: _this5.currentUser,
                    repo: _this5.currentRepoName,
                    path: path,
                    message: "initialize repo",
                    content: content
                }).then(function (result) {
                    //Then create the BOM file
                    content = window.btoa(_this5.bomHeader); // create a file with just the header in it and base64 encode it
                    _this5.octokit.repos.createFile({
                        owner: _this5.currentUser,
                        repo: _this5.currentRepoName,
                        path: "BillOfMaterials.md",
                        message: "initialize BOM",
                        content: content
                    }).then(function (result) {
                        //Then create the README file
                        content = window.btoa("readme init"); // create a file with just the word "init" in it and base64 encode it
                        _this5.octokit.repos.createFile({
                            owner: _this5.currentUser,
                            repo: _this5.currentRepoName,
                            path: "README.md",
                            message: "initialize README",
                            content: content
                        }).then(function (result) {
                            console.log("readme created");

                            _this5.intervalTimer = setInterval(_this5.saveProject, 30000); //Save the project regularly
                        });
                    });
                });

                //Update the project topics
                _this5.octokit.repos.replaceTopics({
                    owner: _this5.currentUser,
                    repo: _this5.currentRepoName,
                    names: ["maslowcreate"],
                    headers: {
                        accept: 'application/vnd.github.mercy-preview+json'
                    }
                });
            });

            currentMolecule.backgroundClick();

            //Clear and hide the popup
            while (this.popup.firstChild) {
                this.popup.removeChild(this.popup.firstChild);
            }
            this.popup.classList.add('off');
        }
    }, {
        key: "saveProject",
        value: function saveProject() {
            var _this6 = this;

            //Save the current project into the github repo

            if (this.currentRepoName != null) {

                var path = "project.maslowcreate";
                var content = window.btoa(JSON.stringify(topLevelMolecule.serialize(null), null, 4)); //Convert the topLevelMolecule object to a JSON string and then convert it to base64 encoding

                //Get the SHA for the file
                this.octokit.repos.getContents({
                    owner: this.currentUser,
                    repo: this.currentRepoName,
                    path: path
                }).then(function (thisRepo) {
                    var sha = thisRepo.data.sha;

                    //Save the repo to the file
                    _this6.octokit.repos.updateFile({
                        owner: _this6.currentUser,
                        repo: _this6.currentRepoName,
                        path: path,
                        message: "autosave",
                        content: content,
                        sha: sha
                    }).then(function (result) {

                        console.log("Project Saved");

                        //Then update the BOM file

                        path = "BillOfMaterials.md";
                        content = _this6.bomHeader;

                        topLevelMolecule.requestBOM().forEach(function (item) {
                            content = content + "\n|" + item.BOMitemName + "|" + item.totalNeeded + "|" + item.costUSD + "|" + item.source + "|";
                        });

                        content = window.btoa(content);

                        //Get the SHA for the file
                        _this6.octokit.repos.getContents({
                            owner: _this6.currentUser,
                            repo: _this6.currentRepoName,
                            path: path
                        }).then(function (result) {
                            var sha = result.data.sha;

                            //Save the BOM to the file
                            _this6.octokit.repos.updateFile({
                                owner: _this6.currentUser,
                                repo: _this6.currentRepoName,
                                path: path,
                                message: "update Bom",
                                content: content,
                                sha: sha
                            }).then(function (result) {
                                console.log("BOM updated");

                                _this6.octokit.repos.get({
                                    owner: _this6.currentUser,
                                    repo: _this6.currentRepoName
                                }).then(function (result) {

                                    path = "README.md";
                                    content = "# " + result.data.name + "\n" + result.data.description + "\n";

                                    topLevelMolecule.requestReadme().forEach(function (item) {
                                        content = content + item + "\n\n\n";
                                    });

                                    content = window.btoa(content);

                                    //Get the SHA for the file
                                    _this6.octokit.repos.getContents({
                                        owner: _this6.currentUser,
                                        repo: _this6.currentRepoName,
                                        path: path
                                    }).then(function (result) {
                                        var sha = result.data.sha;

                                        //Save the README to the file
                                        _this6.octokit.repos.updateFile({
                                            owner: _this6.currentUser,
                                            repo: _this6.currentRepoName,
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
        key: "loadProject",
        value: function loadProject(projectName) {
            var _this7 = this;

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

                moleculesList = JSON.parse(rawFile).molecules;

                //Load a blank project
                topLevelMolecule = new Molecule({
                    x: 0,
                    y: 0,
                    topLevel: true,
                    atomType: "Molecule"
                });

                currentMolecule = topLevelMolecule;

                //Load the top level molecule from the file
                topLevelMolecule.deserialize(moleculesList, moleculesList.filter(function (molecule) {
                    return molecule.topLevel == true;
                })[0].uniqueID);

                currentMolecule.backgroundClick();

                //Clear and hide the popup
                while (_this7.popup.firstChild) {
                    _this7.popup.removeChild(_this7.popup.firstChild);
                }
                _this7.popup.classList.add('off');

                _this7.intervalTimer = setInterval(_this7.saveProject, 30000); //Save the project regularly
            });
        }
    }, {
        key: "exportCurrentMoleculeToGithub",
        value: function exportCurrentMoleculeToGithub(molecule) {
            var _this8 = this;

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
                _this8.octokit.repos.createFile({
                    owner: _this8.currentUser,
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
                    _this8.octokit.repos.getContents({
                        owner: _this8.currentUser,
                        repo: repoName,
                        path: path
                    }).then(function (result) {
                        var sha = result.data.sha;

                        //Save the repo to the file
                        _this8.octokit.repos.updateFile({
                            owner: _this8.currentUser,
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
                _this8.octokit.repos.replaceTopics({
                    owner: _this8.currentUser,
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

        console.log("global variables constructor ran");
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

            c.beginPath();
            c.fillStyle = this.color;
            c.strokeStyle = this.color;
            c.globalCompositeOperation = 'destination-over'; //draw under other elements;
            if (this.selected) {
                c.lineWidth = 3;
            } else {
                c.lineWidth = 1;
            }
            c.moveTo(this.startX, this.startY);
            c.bezierCurveTo(this.startX + 100, this.startY, this.endX - 100, this.endY, this.endX, this.endY);
            c.stroke();
            c.globalCompositeOperation = 'source-over'; //switch back to drawing on top
        }
    }, {
        key: 'clickUp',
        value: function clickUp(x, y) {
            var _this = this;

            if (this.isMoving) {
                //we only want to attach the connector which is currently moving
                currentMolecule.nodesOnTheScreen.forEach(function (molecule) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9qcy9mbG93RHJhdy5idW5kbGUuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3NyYy9mbG93RHJhdy5qcyIsIndlYnBhY2s6Ly8vc3JjL2pzL2dpdGh1Yk9hdXRoLmpzIiwid2VicGFjazovLy9zcmMvanMvZ2xvYmFsdmFyaWFibGVzLmpzIiwid2VicGFjazovLy9zcmMvanMvbWVudS5qcyIsIndlYnBhY2s6Ly8vc3JjL2pzL21vbGVjdWxlcy9jaXJjbGUuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvZGlmZmVyZW5jZS5qcyIsIndlYnBhY2s6Ly8vc3JjL2pzL21vbGVjdWxlcy9lcXVhdGlvbi5qcyIsIndlYnBhY2s6Ly8vc3JjL2pzL21vbGVjdWxlcy9leHRydWRlLmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL2dpdGh1Ym1vbGVjdWxlLmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL2lucHV0LmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL2ludGVyc2VjdGlvbi5qcyIsIndlYnBhY2s6Ly8vc3JjL2pzL21vbGVjdWxlcy9taXJyb3IuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvbW9sZWN1bGUuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvb3V0cHV0LmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL3JlYWRtZS5qcyIsIndlYnBhY2s6Ly8vc3JjL2pzL21vbGVjdWxlcy9yZWN0YW5nbGUuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvcmVndWxhcnBvbHlnb24uanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvcm90YXRlLmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL3NjYWxlLmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL3Nocmlua3dyYXAuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9tb2xlY3VsZXMvdHJhbnNsYXRlLmpzIiwid2VicGFjazovLy9zcmMvanMvbW9sZWN1bGVzL3VuaW9uLmpzIiwid2VicGFjazovLy9zcmMvanMvcHJvdG90eXBlcy9hdG9tLmpzIiwid2VicGFjazovLy9zcmMvanMvcHJvdG90eXBlcy9hdHRhY2htZW50cG9pbnQuanMiLCJ3ZWJwYWNrOi8vL3NyYy9qcy9wcm90b3R5cGVzL2Nvbm5lY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9mbG93RHJhdy5qc1wiKTtcbiIsIlxyXG5cclxuaW1wb3J0IE1lbnUgZnJvbSAnLi9qcy9tZW51J1xyXG5pbXBvcnQgR2xvYmFsVmFyaWFibGVzIGZyb20gJy4vanMvZ2xvYmFsdmFyaWFibGVzJ1xyXG5pbXBvcnQgTW9sZWN1bGUgZnJvbSAnLi9qcy9tb2xlY3VsZXMvbW9sZWN1bGUuanMnXHJcblxyXG5HbG9iYWxWYXJpYWJsZXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJylcclxuR2xvYmFsVmFyaWFibGVzLmMgPSBHbG9iYWxWYXJpYWJsZXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuXHJcbkdsb2JhbFZhcmlhYmxlcy5jYW52YXMud2lkdGggPSBpbm5lcldpZHRoXHJcbkdsb2JhbFZhcmlhYmxlcy5jYW52YXMuaGVpZ2h0ID0gaW5uZXJIZWlnaHQvMlxyXG5cclxubGV0IGxvd2VySGFsZk9mU2NyZWVuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZsZXgtcGFyZW50Jyk7XHJcbmxvd2VySGFsZk9mU2NyZWVuLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXCJoZWlnaHQ6XCIraW5uZXJIZWlnaHQvMi4xK1wicHhcIik7XHJcblxyXG4vLyBFdmVudCBMaXN0ZW5lcnNcclxubGV0IGZsb3dDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxvdy1jYW52YXMnKTtcclxuZmxvd0NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIE1lbnUuc2hvd21lbnUpOyAvL3JlZGlyZWN0IHJpZ2h0IGNsaWNrcyB0byBzaG93IHRoZSBtZW51XHJcblxyXG5mbG93Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2ZW50ID0+IHtcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKG1vbGVjdWxlID0+IHtcclxuICAgICAgICBtb2xlY3VsZS5jbGlja01vdmUoZXZlbnQuY2xpZW50WCxldmVudC5jbGllbnRZKTsgICAgICAgIFxyXG4gICAgfSk7XHJcbn0pXHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZXZlbnQgPT4ge1xyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhcInJlc2l6ZVwiKTtcclxuICAgIFxyXG4gICAgdmFyIGJvdW5kcyA9IEdsb2JhbFZhcmlhYmxlcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuY2FudmFzLndpZHRoID0gYm91bmRzLndpZHRoO1xyXG4gICAgR2xvYmFsVmFyaWFibGVzLmNhbnZhcy5oZWlnaHQgPSBib3VuZHMuaGVpZ2h0OyBcclxuXHJcbn0pXHJcblxyXG5mbG93Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2ZW50ID0+IHtcclxuICAgIC8vZXZlcnkgdGltZSB0aGUgbW91c2UgYnV0dG9uIGdvZXMgZG93blxyXG4gICAgXHJcbiAgICB2YXIgY2xpY2tIYW5kbGVkQnlNb2xlY3VsZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgaWYgKG1vbGVjdWxlLmNsaWNrRG93bihldmVudC5jbGllbnRYLGV2ZW50LmNsaWVudFkpID09IHRydWUpe1xyXG4gICAgICAgICAgICBjbGlja0hhbmRsZWRCeU1vbGVjdWxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgaWYoIWNsaWNrSGFuZGxlZEJ5TW9sZWN1bGUpe1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUuYmFja2dyb3VuZENsaWNrKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vaGlkZSB0aGUgbWVudSBpZiBpdCBpcyB2aXNpYmxlXHJcbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51JykuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xyXG4gICAgICAgIGhpZGVtZW51KCk7XHJcbiAgICB9XHJcbiAgICBcclxufSlcclxuXHJcbmZsb3dDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBldmVudCA9PiB7XHJcbiAgICAvL2V2ZXJ5IHRpbWUgdGhlIG1vdXNlIGJ1dHRvbiBnb2VzIGRvd25cclxuICAgIFxyXG4gICAgdmFyIGNsaWNrSGFuZGxlZEJ5TW9sZWN1bGUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2gobW9sZWN1bGUgPT4ge1xyXG4gICAgICAgIGlmIChtb2xlY3VsZS5kb3VibGVDbGljayhldmVudC5jbGllbnRYLGV2ZW50LmNsaWVudFkpID09IHRydWUpe1xyXG4gICAgICAgICAgICBjbGlja0hhbmRsZWRCeU1vbGVjdWxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgaWYgKGNsaWNrSGFuZGxlZEJ5TW9sZWN1bGUgPT0gZmFsc2Upe1xyXG4gICAgICAgIHNob3dtZW51KGV2ZW50KTtcclxuICAgIH1cclxufSlcclxuXHJcbmZsb3dDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2ZW50ID0+IHtcclxuICAgIC8vZXZlcnkgdGltZSB0aGUgbW91c2UgYnV0dG9uIGdvZXMgdXBcclxuICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKG1vbGVjdWxlID0+IHtcclxuICAgICAgICBtb2xlY3VsZS5jbGlja1VwKGV2ZW50LmNsaWVudFgsZXZlbnQuY2xpZW50WSk7ICAgICAgXHJcbiAgICB9KTtcclxufSlcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xyXG4gICAgLy9ldmVyeSB0aW1lIHRoZSBtb3VzZSBidXR0b24gZ29lcyB1cFxyXG4gICAgXHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgbW9sZWN1bGUua2V5UHJlc3MoZXZlbnQua2V5KTsgICAgICBcclxuICAgIH0pO1xyXG59KVxyXG5cclxuXHJcbi8vIEltcGxlbWVudGF0aW9uXHJcblxyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZSA9IG5ldyBNb2xlY3VsZSh7XHJcbiAgICAgICAgeDogMCwgXHJcbiAgICAgICAgeTogMCwgXHJcbiAgICAgICAgdG9wTGV2ZWw6IHRydWUsIFxyXG4gICAgICAgIG5hbWU6IFwiTWFzbG93IENyZWF0ZVwiLFxyXG4gICAgICAgIGF0b21UeXBlOiBcIk1vbGVjdWxlXCIsXHJcbiAgICAgICAgdW5pcXVlSUQ6IEdsb2JhbFZhcmlhYmxlcy5nZW5lcmF0ZVVuaXF1ZUlEKClcclxuICAgIH0pO1xyXG4gICAgXHJcbn1cclxuXHJcbi8vIEFuaW1hdGlvbiBMb29wXHJcbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuYy5jbGVhclJlY3QoMCwgMCwgR2xvYmFsVmFyaWFibGVzLmNhbnZhcy53aWR0aCwgR2xvYmFsVmFyaWFibGVzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgbW9sZWN1bGUudXBkYXRlKCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuaW5pdCgpXHJcbmFuaW1hdGUoKVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0SHViTW9kdWxle1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5vY3Rva2l0ID0gbmV3IE9jdG9raXQoKTtcclxuICAgICAgICB0aGlzLnBvcHVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2plY3RzLXBvcHVwJyk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UmVwb05hbWUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFVzZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYm9tSGVhZGVyID0gXCIjIyMjIyMgTm90ZTogRG8gbm90IGVkaXQgdGhpcyBmaWxlIGRpcmVjdGx5LCBpdCBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBmcm9tIHRoZSBDQUQgbW9kZWwgXFxuIyBCaWxsIE9mIE1hdGVyaWFscyBcXG4gfFBhcnR8TnVtYmVyIE5lZWRlZHxQcmljZXxTb3VyY2V8IFxcbiB8LS0tLXwtLS0tLS0tLS0tfC0tLS0tfC0tLS0tfFwiO1xyXG5cclxuICAgICAgICB0aGlzLmludGVydmFsVGltZXIgPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ2luQnV0dG9uXCIpO1xyXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgdGhpcy50cnlMb2dpbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeUxvZ2luKCl7XHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoIHlvdXIgT0F1dGguaW8gYXBwIHB1YmxpYyBrZXlcclxuICAgICAgICBPQXV0aC5pbml0aWFsaXplKCdCWVA5aUZwRDdhVFY5U0RobmFsdmhaNGZ3RDgnKTtcclxuICAgICAgICAvLyBVc2UgcG9wdXAgZm9yIG9hdXRoXHJcbiAgICAgICAgT0F1dGgucG9wdXAoJ2dpdGh1YicpLnRoZW4oZ2l0aHViID0+IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMub2N0b2tpdC5hdXRoZW50aWNhdGUoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJvYXV0aFwiLFxyXG4gICAgICAgICAgICAgICAgdG9rZW46IGdpdGh1Yi5hY2Nlc3NfdG9rZW5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vVGVzdCB0aGUgYXV0aGVudGljYXRpb24gXHJcbiAgICAgICAgICAgIHRoaXMub2N0b2tpdC51c2Vycy5nZXRBdXRoZW50aWNhdGVkKHt9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQcm9qZWN0c1RvTG9hZCgpO1xyXG4gICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1Byb2plY3RzVG9Mb2FkKCl7XHJcbiAgICAgICAgLy9SZW1vdmUgZXZlcnl0aGluZyBpbiB0aGUgdGhpcy5wb3B1cCBub3dcclxuICAgICAgICB3aGlsZSAodGhpcy5wb3B1cC5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAucmVtb3ZlQ2hpbGQodGhpcy5wb3B1cC5maXJzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdvZmYnKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCBhIHRpdGxlXHJcbiAgICAgICAgdmFyIHRpdGxlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICB0aXRsZURpdi5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcIndpZHRoOiAxMDAlXCIpO1xyXG4gICAgICAgIHRpdGxlRGl2LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwicGFkZGluZzogMzBweFwiKTtcclxuICAgICAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiSDFcIik7XHJcbiAgICAgICAgdGl0bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJQcm9qZWN0czpcIikpO1xyXG4gICAgICAgIHRpdGxlRGl2LmFwcGVuZENoaWxkKHRpdGxlKTtcclxuICAgICAgICB0aGlzLnBvcHVwLmFwcGVuZENoaWxkKHRpdGxlRGl2KTtcclxuICAgICAgICB0aGlzLnBvcHVwLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHByb2plY3RzU3BhY2VEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiRElWXCIpO1xyXG4gICAgICAgIHByb2plY3RzU3BhY2VEaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJmbG9hdC1sZWZ0LWRpdntcIik7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5hcHBlbmRDaGlsZChwcm9qZWN0c1NwYWNlRGl2KTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCB0aGUgY3JlYXRlIGEgbmV3IHByb2plY3QgYnV0dG9uXHJcbiAgICAgICAgYWRkUHJvamVjdChcIk5ldyBQcm9qZWN0XCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc3RvcmUgdGhlIGN1cnJlbnQgdXNlciBuYW1lIGZvciBsYXRlciB1c2VcclxuICAgICAgICB0aGlzLm9jdG9raXQudXNlcnMuZ2V0QXV0aGVudGljYXRlZCh7fSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRVc2VyID0gcmVzdWx0LmRhdGEubG9naW47XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9MaXN0IGFsbCBvZiB0aGUgcmVwb3MgdGhhdCBhIHVzZXIgaXMgdGhlIG93bmVyIG9mXHJcbiAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmxpc3Qoe1xyXG4gICAgICAgICAgYWZmaWxpYXRpb246ICdvd25lcicsXHJcbiAgICAgICAgfSkudGhlbigoe2RhdGEsIGhlYWRlcnMsIHN0YXR1c30pID0+IHtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKHJlcG8gPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGEgbWFzbG93IGNyZWF0ZSBwcm9qZWN0XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9jdG9raXQucmVwb3MubGlzdFRvcGljcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgb3duZXI6IHJlcG8ub3duZXIubG9naW4sIFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcG86IHJlcG8ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIubWVyY3ktcHJldmlldytqc29uJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0YS5kYXRhLm5hbWVzLmluY2x1ZGVzKFwibWFzbG93Y3JlYXRlXCIpIHx8IGRhdGEuZGF0YS5uYW1lcy5pbmNsdWRlcyhcIm1hc2xvd2NyZWF0ZS1tb2xlY3VsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFByb2plY3QocmVwby5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgYWRkUHJvamVjdChwcm9qZWN0TmFtZSl7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBwcm9qZWN0IGVsZW1lbnQgdG8gZGlzcGxheVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwcm9qZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgcHJvamVjdFBpY3R1cmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiSU1HXCIpO1xyXG4gICAgICAgIHByb2plY3RQaWN0dXJlLnNldEF0dHJpYnV0ZShcInNyY1wiLCBcInRlc3RQaWN0dXJlLnBuZ1wiKTtcclxuICAgICAgICBwcm9qZWN0UGljdHVyZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcIndpZHRoOiAxMDAlXCIpO1xyXG4gICAgICAgIHByb2plY3RQaWN0dXJlLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiaGVpZ2h0OiAxMDAlXCIpO1xyXG4gICAgICAgIHByb2plY3QuYXBwZW5kQ2hpbGQocHJvamVjdFBpY3R1cmUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzaG9ydFByb2plY3ROYW1lO1xyXG4gICAgICAgIGlmKHByb2plY3ROYW1lLmxlbmd0aCA+IDkpe1xyXG4gICAgICAgICAgICBzaG9ydFByb2plY3ROYW1lID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocHJvamVjdE5hbWUuc3Vic3RyKDAsNykrXCIuLlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgc2hvcnRQcm9qZWN0TmFtZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHByb2plY3ROYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvamVjdC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInByb2plY3RcIik7XHJcbiAgICAgICAgcHJvamVjdC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBwcm9qZWN0TmFtZSk7XHJcbiAgICAgICAgcHJvamVjdC5hcHBlbmRDaGlsZChzaG9ydFByb2plY3ROYW1lKTsgXHJcbiAgICAgICAgdGhpcy5wb3B1cC5hcHBlbmRDaGlsZChwcm9qZWN0KTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJvamVjdE5hbWUpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnByb2plY3RDbGlja2VkKHByb2plY3ROYW1lKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcm9qZWN0Q2xpY2tlZChwcm9qZWN0TmFtZSl7XHJcbiAgICAgICAgLy9ydW5zIHdoZW4geW91IGNsaWNrIG9uIG9uZSBvZiB0aGUgcHJvamVjdHNcclxuICAgICAgICBpZihwcm9qZWN0TmFtZSA9PSBcIk5ldyBQcm9qZWN0XCIpe1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU5ld1Byb2plY3RQb3B1cCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRQcm9qZWN0KHByb2plY3ROYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlTmV3UHJvamVjdFBvcHVwKCl7XHJcbiAgICAgICAgLy9DbGVhciB0aGUgcG9wdXAgYW5kIHBvcHVsYXRlIHRoZSBmaWVsZHMgd2Ugd2lsbCBuZWVkIHRvIGNyZWF0ZSB0aGUgbmV3IHJlcG9cclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSAodGhpcy5wb3B1cC5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAucmVtb3ZlQ2hpbGQodGhpcy5wb3B1cC5maXJzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9Qcm9qZWN0IG5hbWVcclxuICAgICAgICAvLyA8ZGl2IGNsYXNzPVwiZm9ybVwiPlxyXG4gICAgICAgIHZhciBjcmVhdGVOZXdQcm9qZWN0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICBjcmVhdGVOZXdQcm9qZWN0RGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiZm9ybVwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCBhIHRpdGxlXHJcbiAgICAgICAgdmFyIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJIMVwiKTtcclxuICAgICAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkNyZWF0ZSBhIG5ldyBwcm9qZWN0XCIpO1xyXG4gICAgICAgIGhlYWRlci5hcHBlbmRDaGlsZCh0aXRsZSk7XHJcbiAgICAgICAgY3JlYXRlTmV3UHJvamVjdERpdi5hcHBlbmRDaGlsZChoZWFkZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQ3JlYXRlIHRoZSBmb3JtIG9iamVjdFxyXG4gICAgICAgIHZhciBmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImZvcm1cIik7XHJcbiAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImxvZ2luLWZvcm1cIik7XHJcbiAgICAgICAgY3JlYXRlTmV3UHJvamVjdERpdi5hcHBlbmRDaGlsZChmb3JtKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0NyZWF0ZSB0aGUgbmFtZSBmaWVsZFxyXG4gICAgICAgIHZhciBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgIG5hbWUuc2V0QXR0cmlidXRlKFwiaWRcIixcInByb2plY3QtbmFtZVwiKTtcclxuICAgICAgICBuYW1lLnNldEF0dHJpYnV0ZShcInR5cGVcIixcInRleHRcIik7XHJcbiAgICAgICAgbmFtZS5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLFwiUHJvamVjdCBuYW1lXCIpO1xyXG4gICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQobmFtZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgdGhlIGRlc2NyaXB0aW9uIGZpZWxkXHJcbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgIGRlc2NyaXB0aW9uLnNldEF0dHJpYnV0ZShcImlkXCIsIFwicHJvamVjdC1kZXNjcmlwdGlvblwiKTtcclxuICAgICAgICBkZXNjcmlwdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcclxuICAgICAgICBkZXNjcmlwdGlvbi5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLCBcIlByb2plY3QgZGVzY3JpcHRpb25cIik7XHJcbiAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgdGhlIGJ1dHRvblxyXG4gICAgICAgIHZhciBjcmVhdGVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xyXG4gICAgICAgIGNyZWF0ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xyXG4gICAgICAgIGNyZWF0ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJvbmNsaWNrXCIsIFwidGhpcy5jcmVhdGVOZXdQcm9qZWN0KClcIik7XHJcbiAgICAgICAgdmFyIGJ1dHRvblRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkNyZWF0ZSBQcm9qZWN0XCIpO1xyXG4gICAgICAgIGNyZWF0ZUJ1dHRvbi5hcHBlbmRDaGlsZChidXR0b25UZXh0KTtcclxuICAgICAgICBmb3JtLmFwcGVuZENoaWxkKGNyZWF0ZUJ1dHRvbik7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMucG9wdXAuYXBwZW5kQ2hpbGQoY3JlYXRlTmV3UHJvamVjdERpdik7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZU5ld1Byb2plY3QoKXtcclxuICAgICAgICBcclxuICAgICAgICBpZih0eXBlb2YgdGhpcy5pbnRlcnZhbFRpbWVyICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbFRpbWVyKTsgLy9UdXJuIG9mIGF1dG8gc2F2aW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vR2V0IG5hbWUgYW5kIGRlc2NyaXB0aW9uXHJcbiAgICAgICAgdmFyIG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvamVjdC1uYW1lJykudmFsdWU7XHJcbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2plY3QtZGVzY3JpcHRpb24nKS52YWx1ZTtcclxuICAgICAgICBcclxuICAgICAgICAvL0xvYWQgYSBibGFuayBwcm9qZWN0XHJcbiAgICAgICAgdG9wTGV2ZWxNb2xlY3VsZSA9IG5ldyBNb2xlY3VsZSh7XHJcbiAgICAgICAgICAgIHg6IDAsIFxyXG4gICAgICAgICAgICB5OiAwLCBcclxuICAgICAgICAgICAgdG9wTGV2ZWw6IHRydWUsIFxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICBhdG9tVHlwZTogXCJNb2xlY3VsZVwiLFxyXG4gICAgICAgICAgICB1bmlxdWVJRDogZ2VuZXJhdGVVbmlxdWVJRCgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3VycmVudE1vbGVjdWxlID0gdG9wTGV2ZWxNb2xlY3VsZTtcclxuICAgICAgICBcclxuICAgICAgICAvL0NyZWF0ZSBhIG5ldyByZXBvXHJcbiAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmNyZWF0ZUZvckF1dGhlbnRpY2F0ZWRVc2VyKHtcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uXHJcbiAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAvL09uY2Ugd2UgaGF2ZSBjcmVhdGVkIHRoZSBuZXcgcmVwbyB3ZSBuZWVkIHRvIGNyZWF0ZSBhIGZpbGUgd2l0aGluIGl0IHRvIHN0b3JlIHRoZSBwcm9qZWN0IGluXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcG9OYW1lID0gcmVzdWx0LmRhdGEubmFtZTtcclxuICAgICAgICAgICAgdmFyIHBhdGggPSBcInByb2plY3QubWFzbG93Y3JlYXRlXCI7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gd2luZG93LmJ0b2EoXCJpbml0XCIpOyAvLyBjcmVhdGUgYSBmaWxlIHdpdGgganVzdCB0aGUgd29yZCBcImluaXRcIiBpbiBpdCBhbmQgYmFzZTY0IGVuY29kZSBpdFxyXG4gICAgICAgICAgICB0aGlzLm9jdG9raXQucmVwb3MuY3JlYXRlRmlsZSh7XHJcbiAgICAgICAgICAgICAgICBvd25lcjogdGhpcy5jdXJyZW50VXNlcixcclxuICAgICAgICAgICAgICAgIHJlcG86IHRoaXMuY3VycmVudFJlcG9OYW1lLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiaW5pdGlhbGl6ZSByZXBvXCIsIFxyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudFxyXG4gICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL1RoZW4gY3JlYXRlIHRoZSBCT00gZmlsZVxyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IHdpbmRvdy5idG9hKHRoaXMuYm9tSGVhZGVyKTsgLy8gY3JlYXRlIGEgZmlsZSB3aXRoIGp1c3QgdGhlIGhlYWRlciBpbiBpdCBhbmQgYmFzZTY0IGVuY29kZSBpdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmNyZWF0ZUZpbGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcG86IHRoaXMuY3VycmVudFJlcG9OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IFwiQmlsbE9mTWF0ZXJpYWxzLm1kXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJpbml0aWFsaXplIEJPTVwiLCBcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9UaGVuIGNyZWF0ZSB0aGUgUkVBRE1FIGZpbGVcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gd2luZG93LmJ0b2EoXCJyZWFkbWUgaW5pdFwiKTsgLy8gY3JlYXRlIGEgZmlsZSB3aXRoIGp1c3QgdGhlIHdvcmQgXCJpbml0XCIgaW4gaXQgYW5kIGJhc2U2NCBlbmNvZGUgaXRcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9jdG9raXQucmVwb3MuY3JlYXRlRmlsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBvOiB0aGlzLmN1cnJlbnRSZXBvTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogXCJSRUFETUUubWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJpbml0aWFsaXplIFJFQURNRVwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudFxyXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWFkbWUgY3JlYXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKHRoaXMuc2F2ZVByb2plY3QsIDMwMDAwKTsgLy9TYXZlIHRoZSBwcm9qZWN0IHJlZ3VsYXJseVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9VcGRhdGUgdGhlIHByb2plY3QgdG9waWNzXHJcbiAgICAgICAgICAgIHRoaXMub2N0b2tpdC5yZXBvcy5yZXBsYWNlVG9waWNzKHtcclxuICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgcmVwbzogdGhpcy5jdXJyZW50UmVwb05hbWUsXHJcbiAgICAgICAgICAgICAgICBuYW1lczogW1wibWFzbG93Y3JlYXRlXCJdLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIubWVyY3ktcHJldmlldytqc29uJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN1cnJlbnRNb2xlY3VsZS5iYWNrZ3JvdW5kQ2xpY2soKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0NsZWFyIGFuZCBoaWRlIHRoZSBwb3B1cFxyXG4gICAgICAgIHdoaWxlICh0aGlzLnBvcHVwLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cC5yZW1vdmVDaGlsZCh0aGlzLnBvcHVwLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvcHVwLmNsYXNzTGlzdC5hZGQoJ29mZicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHNhdmVQcm9qZWN0KCl7XHJcbiAgICAgICAgLy9TYXZlIHRoZSBjdXJyZW50IHByb2plY3QgaW50byB0aGUgZ2l0aHViIHJlcG9cclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRSZXBvTmFtZSAhPSBudWxsKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBwYXRoID0gXCJwcm9qZWN0Lm1hc2xvd2NyZWF0ZVwiO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHdpbmRvdy5idG9hKEpTT04uc3RyaW5naWZ5KHRvcExldmVsTW9sZWN1bGUuc2VyaWFsaXplKG51bGwpLCBudWxsLCA0KSk7IC8vQ29udmVydCB0aGUgdG9wTGV2ZWxNb2xlY3VsZSBvYmplY3QgdG8gYSBKU09OIHN0cmluZyBhbmQgdGhlbiBjb252ZXJ0IGl0IHRvIGJhc2U2NCBlbmNvZGluZ1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9HZXQgdGhlIFNIQSBmb3IgdGhlIGZpbGVcclxuICAgICAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmdldENvbnRlbnRzKHtcclxuICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgcmVwbzogdGhpcy5jdXJyZW50UmVwb05hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoXHJcbiAgICAgICAgICAgIH0pLnRoZW4odGhpc1JlcG8gPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNoYSA9IHRoaXNSZXBvLmRhdGEuc2hhXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vU2F2ZSB0aGUgcmVwbyB0byB0aGUgZmlsZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLnVwZGF0ZUZpbGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcG86IHRoaXMuY3VycmVudFJlcG9OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJhdXRvc2F2ZVwiLCBcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYTogc2hhXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQcm9qZWN0IFNhdmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vVGhlbiB1cGRhdGUgdGhlIEJPTSBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFwiQmlsbE9mTWF0ZXJpYWxzLm1kXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuYm9tSGVhZGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcExldmVsTW9sZWN1bGUucmVxdWVzdEJPTSgpLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50ICsgXCJcXG58XCIgKyBpdGVtLkJPTWl0ZW1OYW1lICsgXCJ8XCIgKyBpdGVtLnRvdGFsTmVlZGVkICsgXCJ8XCIgKyBpdGVtLmNvc3RVU0QgKyBcInxcIiArIGl0ZW0uc291cmNlICsgXCJ8XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHdpbmRvdy5idG9hKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vR2V0IHRoZSBTSEEgZm9yIHRoZSBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmdldENvbnRlbnRzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMuY3VycmVudFVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcG86IHRoaXMuY3VycmVudFJlcG9OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2hhID0gcmVzdWx0LmRhdGEuc2hhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1NhdmUgdGhlIEJPTSB0byB0aGUgZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9jdG9raXQucmVwb3MudXBkYXRlRmlsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcy5jdXJyZW50VXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcG86IHRoaXMuY3VycmVudFJlcG9OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwidXBkYXRlIEJvbVwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGE6IHNoYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkJPTSB1cGRhdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9jdG9raXQucmVwb3MuZ2V0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcy5jdXJyZW50VXNlciwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbzogdGhpcy5jdXJyZW50UmVwb05hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gXCJSRUFETUUubWRcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gXCIjIFwiICsgcmVzdWx0LmRhdGEubmFtZSArIFwiXFxuXCIgKyByZXN1bHQuZGF0YS5kZXNjcmlwdGlvbiArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wTGV2ZWxNb2xlY3VsZS5yZXF1ZXN0UmVhZG1lKCkuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQgKyBpdGVtICsgXCJcXG5cXG5cXG5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB3aW5kb3cuYnRvYShjb250ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0dldCB0aGUgU0hBIGZvciB0aGUgZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2N0b2tpdC5yZXBvcy5nZXRDb250ZW50cyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBvOiB0aGlzLmN1cnJlbnRSZXBvTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNoYSA9IHJlc3VsdC5kYXRhLnNoYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TYXZlIHRoZSBSRUFETUUgdG8gdGhlIGZpbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLnVwZGF0ZUZpbGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMuY3VycmVudFVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBvOiB0aGlzLmN1cnJlbnRSZXBvTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcInVwZGF0ZSBSZWFkbWVcIiwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhOiBzaGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSRUFETUUgdXBkYXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxvYWRQcm9qZWN0KHByb2plY3ROYW1lKXtcclxuICAgICAgICBcclxuICAgICAgICBpZih0eXBlb2YgdGhpcy5pbnRlcnZhbFRpbWVyICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbFRpbWVyKTsgLy9UdXJuIG9mIGF1dG8gc2F2aW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3VycmVudFJlcG9OYW1lID0gcHJvamVjdE5hbWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmdldENvbnRlbnRzKHtcclxuICAgICAgICAgICAgb3duZXI6IHRoaXMuY3VycmVudFVzZXIsXHJcbiAgICAgICAgICAgIHJlcG86IHByb2plY3ROYW1lLFxyXG4gICAgICAgICAgICBwYXRoOiAncHJvamVjdC5tYXNsb3djcmVhdGUnXHJcbiAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vY29udGVudCB3aWxsIGJlIGJhc2U2NCBlbmNvZGVkXHJcbiAgICAgICAgICAgIGxldCByYXdGaWxlID0gYXRvYihyZXN1bHQuZGF0YS5jb250ZW50KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBtb2xlY3VsZXNMaXN0ID0gSlNPTi5wYXJzZShyYXdGaWxlKS5tb2xlY3VsZXM7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL0xvYWQgYSBibGFuayBwcm9qZWN0XHJcbiAgICAgICAgICAgIHRvcExldmVsTW9sZWN1bGUgPSBuZXcgTW9sZWN1bGUoe1xyXG4gICAgICAgICAgICAgICAgeDogMCwgXHJcbiAgICAgICAgICAgICAgICB5OiAwLCBcclxuICAgICAgICAgICAgICAgIHRvcExldmVsOiB0cnVlLCBcclxuICAgICAgICAgICAgICAgIGF0b21UeXBlOiBcIk1vbGVjdWxlXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjdXJyZW50TW9sZWN1bGUgPSB0b3BMZXZlbE1vbGVjdWxlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9Mb2FkIHRoZSB0b3AgbGV2ZWwgbW9sZWN1bGUgZnJvbSB0aGUgZmlsZVxyXG4gICAgICAgICAgICB0b3BMZXZlbE1vbGVjdWxlLmRlc2VyaWFsaXplKG1vbGVjdWxlc0xpc3QsIG1vbGVjdWxlc0xpc3QuZmlsdGVyKChtb2xlY3VsZSkgPT4geyByZXR1cm4gbW9sZWN1bGUudG9wTGV2ZWwgPT0gdHJ1ZTsgfSlbMF0udW5pcXVlSUQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY3VycmVudE1vbGVjdWxlLmJhY2tncm91bmRDbGljaygpO1xyXG5cclxuICAgICAgICAgICAgLy9DbGVhciBhbmQgaGlkZSB0aGUgcG9wdXBcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMucG9wdXAuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cC5yZW1vdmVDaGlsZCh0aGlzLnBvcHVwLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAuY2xhc3NMaXN0LmFkZCgnb2ZmJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmludGVydmFsVGltZXIgPSBzZXRJbnRlcnZhbCh0aGlzLnNhdmVQcm9qZWN0LCAzMDAwMCk7IC8vU2F2ZSB0aGUgcHJvamVjdCByZWd1bGFybHlcclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydEN1cnJlbnRNb2xlY3VsZVRvR2l0aHViKG1vbGVjdWxlKXtcclxuICAgICAgICBcclxuICAgICAgICAvL0dldCBuYW1lIGFuZCBkZXNjcmlwdGlvblxyXG4gICAgICAgIHZhciBuYW1lID0gbW9sZWN1bGUubmFtZTtcclxuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBcIkEgc3RhbmQgYWxvbmUgbW9sZWN1bGUgZXhwb3J0ZWQgZnJvbSBNYXNsb3cgQ3JlYXRlXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9DcmVhdGUgYSBuZXcgcmVwb1xyXG4gICAgICAgIHRoaXMub2N0b2tpdC5yZXBvcy5jcmVhdGVGb3JBdXRoZW50aWNhdGVkVXNlcih7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvblxyXG4gICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgLy9PbmNlIHdlIGhhdmUgY3JlYXRlZCB0aGUgbmV3IHJlcG8gd2UgbmVlZCB0byBjcmVhdGUgYSBmaWxlIHdpdGhpbiBpdCB0byBzdG9yZSB0aGUgcHJvamVjdCBpblxyXG4gICAgICAgICAgICB2YXIgcmVwb05hbWUgPSByZXN1bHQuZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICB2YXIgaWQgICAgICAgPSByZXN1bHQuZGF0YS5pZDtcclxuICAgICAgICAgICAgdmFyIHBhdGggICAgID0gXCJwcm9qZWN0Lm1hc2xvd2NyZWF0ZVwiO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCAgPSB3aW5kb3cuYnRvYShcImluaXRcIik7IC8vIGNyZWF0ZSBhIGZpbGUgd2l0aCBqdXN0IHRoZSB3b3JkIFwiaW5pdFwiIGluIGl0IGFuZCBiYXNlNjQgZW5jb2RlIGl0XHJcbiAgICAgICAgICAgIHRoaXMub2N0b2tpdC5yZXBvcy5jcmVhdGVGaWxlKHtcclxuICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgcmVwbzogcmVwb05hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJpbml0aWFsaXplIHJlcG9cIiwgXHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50XHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9TYXZlIHRoZSBtb2xlY3VsZSBpbnRvIHRoZSBuZXdseSBjcmVhdGVkIHJlcG9cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBcInByb2plY3QubWFzbG93Y3JlYXRlXCI7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG1vbGVjdWxlLnRvcExldmVsID0gdHJ1ZTsgLy9mb3JjZSB0aGUgbW9sZWN1bGUgdG8gZXhwb3J0IGluIHRoZSBsb25nIGZvcm0gYXMgaWYgaXQgd2VyZSB0aGUgdG9wIGxldmVsIG1vbGVjdWxlXHJcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudCA9IHdpbmRvdy5idG9hKEpTT04uc3RyaW5naWZ5KG1vbGVjdWxlLnNlcmlhbGl6ZShudWxsKSwgbnVsbCwgNCkpOyAvL0NvbnZlcnQgdGhlIHBhc3NlZCBtb2xlY3VsZSBvYmplY3QgdG8gYSBKU09OIHN0cmluZyBhbmQgdGhlbiBjb252ZXJ0IGl0IHRvIGJhc2U2NCBlbmNvZGluZ1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL0dldCB0aGUgU0hBIGZvciB0aGUgZmlsZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vY3Rva2l0LnJlcG9zLmdldENvbnRlbnRzKHtcclxuICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcy5jdXJyZW50VXNlcixcclxuICAgICAgICAgICAgICAgICAgICByZXBvOiByZXBvTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNoYSA9IHJlc3VsdC5kYXRhLnNoYVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vU2F2ZSB0aGUgcmVwbyB0byB0aGUgZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2N0b2tpdC5yZXBvcy51cGRhdGVGaWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMuY3VycmVudFVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcG86IHJlcG9OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImV4cG9ydCBNb2xlY3VsZVwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hhOiBzaGFcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTW9sZWN1bGUgRXhwb3J0ZWQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9SZXBsYWNlIHRoZSBleGlzdGluZyBtb2xlY3VsZSBub3cgdGhhdCB3ZSBqdXN0IGV4cG9ydGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbGVjdWxlLnJlcGxhY2VUaGlzTW9sZWN1bGVXaXRoR2l0aHViKGlkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9VcGRhdGUgdGhlIHByb2plY3QgdG9waWNzXHJcbiAgICAgICAgICAgIHRoaXMub2N0b2tpdC5yZXBvcy5yZXBsYWNlVG9waWNzKHtcclxuICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICAgICAgcmVwbzogcmVwb05hbWUsXHJcbiAgICAgICAgICAgICAgICBuYW1lczogW1wibWFzbG93Y3JlYXRlLW1vbGVjdWxlXCJdLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIubWVyY3ktcHJldmlldytqc29uJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IENpcmNsZSBmcm9tICcuL21vbGVjdWxlcy9jaXJjbGUuanMnXHJcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi9tb2xlY3VsZXMvcmVjdGFuZ2xlLmpzJ1xyXG5pbXBvcnQgU2hyaW5rV3JhcCBmcm9tICcuL21vbGVjdWxlcy9zaHJpbmt3cmFwLmpzJ1xyXG5pbXBvcnQgVHJhbnNsYXRlIGZyb20gJy4vbW9sZWN1bGVzL3RyYW5zbGF0ZS5qcydcclxuaW1wb3J0IFJlZ3VsYXJQb2x5Z29uIGZyb20gJy4vbW9sZWN1bGVzL3JlZ3VsYXJwb2x5Z29uLmpzJ1xyXG5pbXBvcnQgRXh0cnVkZSBmcm9tICcuL21vbGVjdWxlcy9leHRydWRlLmpzJ1xyXG5pbXBvcnQgU2NhbGUgZnJvbSAnLi9tb2xlY3VsZXMvc2NhbGUuanMnXHJcbmltcG9ydCBVbmlvbiBmcm9tICcuL21vbGVjdWxlcy91bmlvbi5qcydcclxuaW1wb3J0IEludGVyc2VjdGlvbiBmcm9tICcuL21vbGVjdWxlcy9pbnRlcnNlY3Rpb24uanMnXHJcbmltcG9ydCBEaWZmZXJlbmNlIGZyb20gJy4vbW9sZWN1bGVzL2RpZmZlcmVuY2UuanMnXHJcbmltcG9ydCBDb25zdGFudCBmcm9tICcuL21vbGVjdWxlcy9jb25zdGFudC5qcydcclxuaW1wb3J0IEVxdWF0aW9uIGZyb20gJy4vbW9sZWN1bGVzL2VxdWF0aW9uLmpzJ1xyXG5pbXBvcnQgTW9sZWN1bGUgZnJvbSAnLi9tb2xlY3VsZXMvbW9sZWN1bGUuanMnXHJcbmltcG9ydCBJbnB1dCBmcm9tICcuL21vbGVjdWxlcy9pbnB1dC5qcydcclxuaW1wb3J0IFJlYWRtZSBmcm9tICcuL21vbGVjdWxlcy9yZWFkbWUuanMnXHJcbmltcG9ydCBSb3RhdGUgZnJvbSAnLi9tb2xlY3VsZXMvcm90YXRlLmpzJ1xyXG5pbXBvcnQgTWlycm9yIGZyb20gJy4vbW9sZWN1bGVzL21pcnJvci5qcydcclxuaW1wb3J0IEdpdEh1Yk1vbGVjdWxlIGZyb20gJy4vbW9sZWN1bGVzL2dpdGh1Ym1vbGVjdWxlLmpzJ1xyXG5pbXBvcnQgT3V0cHV0IGZyb20gJy4vbW9sZWN1bGVzL291dHB1dC5qcydcclxuXHJcbmltcG9ydCBHaXRIdWJNb2R1bGUgZnJvbSAnLi9naXRodWJPYXV0aCdcclxuXHJcbmNsYXNzIEdsb2JhbFZhcmlhYmxlc3tcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsXHJcbiAgICAgICAgdGhpcy5jID0gbnVsbFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlVHlwZXMgPSB7XHJcbiAgICAgICAgICAgIGNpcmNsZTogICAgICAgIHtjcmVhdG9yOiBDaXJjbGUsIGF0b21UeXBlOiBcIkNpcmNsZVwifSxcclxuICAgICAgICAgICAgcmVjdGFuZ2xlOiAgICAge2NyZWF0b3I6IFJlY3RhbmdsZSwgYXRvbVR5cGU6IFwiUmVjdGFuZ2xlXCJ9LFxyXG4gICAgICAgICAgICBzaGlyaW5rd3JhcDogICB7Y3JlYXRvcjogU2hyaW5rV3JhcCwgYXRvbVR5cGU6IFwiU2hyaW5rV3JhcFwifSxcclxuICAgICAgICAgICAgdHJhbnNsYXRlOiAgICAge2NyZWF0b3I6IFRyYW5zbGF0ZSwgYXRvbVR5cGU6IFwiVHJhbnNsYXRlXCJ9LFxyXG4gICAgICAgICAgICByZWd1bGFyUG9seWdvbjp7Y3JlYXRvcjogUmVndWxhclBvbHlnb24sIGF0b21UeXBlOiBcIlJlZ3VsYXJQb2x5Z29uXCJ9LFxyXG4gICAgICAgICAgICBleHRydWRlOiAgICAgICB7Y3JlYXRvcjogRXh0cnVkZSwgYXRvbVR5cGU6IFwiRXh0cnVkZVwifSxcclxuICAgICAgICAgICAgc2NhbGU6ICAgICAgICAge2NyZWF0b3I6IFNjYWxlLCBhdG9tVHlwZTogXCJTY2FsZVwifSxcclxuICAgICAgICAgICAgaW50ZXJzZWN0aW9uOiAge2NyZWF0b3I6IEludGVyc2VjdGlvbiwgYXRvbVR5cGU6IFwiSW50ZXJzZWN0aW9uXCJ9LFxyXG4gICAgICAgICAgICBkaWZmZXJlbmNlOiAgICB7Y3JlYXRvcjogRGlmZmVyZW5jZSwgYXRvbVR5cGU6IFwiRGlmZmVyZW5jZVwifSxcclxuICAgICAgICAgICAgY29zdGFudDogICAgICAge2NyZWF0b3I6IENvbnN0YW50LCBhdG9tVHlwZTogXCJDb25zdGFudFwifSxcclxuICAgICAgICAgICAgZXF1YXRpb246ICAgICAge2NyZWF0b3I6IEVxdWF0aW9uLCBhdG9tVHlwZTogXCJFcXVhdGlvblwifSxcclxuICAgICAgICAgICAgbW9sZWN1bGU6ICAgICAge2NyZWF0b3I6IE1vbGVjdWxlLCBhdG9tVHlwZTogXCJNb2xlY3VsZVwifSxcclxuICAgICAgICAgICAgaW5wdXQ6ICAgICAgICAge2NyZWF0b3I6IElucHV0LCBhdG9tVHlwZTogXCJJbnB1dFwifSxcclxuICAgICAgICAgICAgcmVhZG1lOiAgICAgICAge2NyZWF0b3I6IFJlYWRtZSwgYXRvbVR5cGU6IFwiUmVhZG1lXCJ9LFxyXG4gICAgICAgICAgICByb3RhdGU6ICAgICAgICB7Y3JlYXRvcjogUm90YXRlLCBhdG9tVHlwZTogXCJSb3RhdGVcIn0sXHJcbiAgICAgICAgICAgIG1pcnJvcjogICAgICAgIHtjcmVhdG9yOiBNaXJyb3IsIGF0b21UeXBlOiBcIk1pcnJvclwifSxcclxuICAgICAgICAgICAgZ2l0aHVibW9sZWN1bGU6e2NyZWF0b3I6IEdpdEh1Yk1vbGVjdWxlLCBhdG9tVHlwZTogXCJHaXRIdWJNb2xlY3VsZVwifSxcclxuICAgICAgICAgICAgdW5pb246ICAgICAgICAge2NyZWF0b3I6IFVuaW9uLCBhdG9tVHlwZTogXCJVbmlvblwifVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZWNyZXRUeXBlcyA9IHtcclxuICAgICAgICAgICAgb3V0cHV0OiAgICAgICAge2NyZWF0b3I6IE91dHB1dCwgYXRvbVR5cGU6IFwiT3V0cHV0XCJ9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50TW9sZWN1bGU7XHJcbiAgICAgICAgdGhpcy50b3BMZXZlbE1vbGVjdWxlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2lkZUJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlQmFyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5naXRIdWIgPSBuZXcgR2l0SHViTW9kdWxlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJnbG9iYWwgdmFyaWFibGVzIGNvbnN0cnVjdG9yIHJhblwiKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2VuZXJhdGVVbmlxdWVJRCgpe1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqOTAwMDAwKSArIDEwMDAwMDtcclxuICAgIH1cclxuXHJcbiAgICBkaXN0QmV0d2VlblBvaW50cyh4MSwgeDIsIHkxLCB5Mil7XHJcbiAgICAgICAgdmFyIGEyID0gTWF0aC5wb3coeDEgLSB4MiwgMik7XHJcbiAgICAgICAgdmFyIGIyID0gTWF0aC5wb3coeTEgLSB5MiwgMik7XHJcbiAgICAgICAgdmFyIGRpc3QgPSBNYXRoLnNxcnQoYTIgKyBiMik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRpc3Q7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IChuZXcgR2xvYmFsVmFyaWFibGVzKTsiLCJpbXBvcnQgR2xvYmFsVmFyaWFibGVzIGZyb20gJy4vZ2xvYmFsdmFyaWFibGVzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVudSB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMubWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51Jyk7XHJcbiAgICAgICAgdGhpcy5tZW51LmNsYXNzTGlzdC5hZGQoJ29mZicpO1xyXG4gICAgICAgIHRoaXMubWVudUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lbnVMaXN0XCIpO1xyXG4gICAgXHJcbiAgICAgICAgLy9BZGQgdGhlIHNlYXJjaCBiYXIgdG8gdGhlIGxpc3QgaXRlbVxyXG4gICAgXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gR2xvYmFsVmFyaWFibGVzLmF2YWlsYWJsZVR5cGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpO1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBHbG9iYWxWYXJpYWJsZXMuYXZhaWxhYmxlVHlwZXNba2V5XTtcclxuICAgICAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpbnN0YW5jZS5hdG9tVHlwZSk7XHJcbiAgICAgICAgICAgIG5ld0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJtZW51LWl0ZW1cIik7XHJcbiAgICAgICAgICAgIG5ld0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgaW5zdGFuY2UuYXRvbVR5cGUpO1xyXG4gICAgICAgICAgICBuZXdFbGVtZW50LmFwcGVuZENoaWxkKHRleHQpOyBcclxuICAgICAgICAgICAgbWVudUxpc3QuYXBwZW5kQ2hpbGQobmV3RWxlbWVudCk7IFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaW5zdGFuY2UuYXRvbVR5cGUpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxhY2VOZXdOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHBsYWNlTmV3Tm9kZShldil7XHJcbiAgICAgICAgaGlkZW1lbnUoKTtcclxuICAgICAgICBsZXQgY2xyID0gZXYudGFyZ2V0LmlkO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN1cnJlbnRNb2xlY3VsZS5wbGFjZUF0b20oe1xyXG4gICAgICAgICAgICB4OiBtZW51LngsIFxyXG4gICAgICAgICAgICB5OiBtZW51LnksIFxyXG4gICAgICAgICAgICBwYXJlbnQ6IGN1cnJlbnRNb2xlY3VsZSxcclxuICAgICAgICAgICAgYXRvbVR5cGU6IGNscixcclxuICAgICAgICAgICAgdW5pcXVlSUQ6IGdlbmVyYXRlVW5pcXVlSUQoKVxyXG4gICAgICAgIH0sIG51bGwsIGF2YWlsYWJsZVR5cGVzKTsgLy9udWxsIGluZGljYXRlcyB0aGF0IHRoZXJlIGlzIG5vdGhpbmcgdG8gbG9hZCBmcm9tIHRoZSBtb2xlY3VsZSBsaXN0IGZvciB0aGlzIG9uZVxyXG4gICAgfVxyXG5cclxuICAgIHBsYWNlR2l0SHViTW9sZWN1bGUoZXYpe1xyXG4gICAgICAgIGhpZGVtZW51KCk7XHJcbiAgICAgICAgbGV0IGNsciA9IGV2LnRhcmdldC5pZDtcclxuICAgICAgICBcclxuICAgICAgICBjdXJyZW50TW9sZWN1bGUucGxhY2VBdG9tKHtcclxuICAgICAgICAgICAgeDogbWVudS54LCBcclxuICAgICAgICAgICAgeTogbWVudS55LCBcclxuICAgICAgICAgICAgcGFyZW50OiBjdXJyZW50TW9sZWN1bGUsXHJcbiAgICAgICAgICAgIGF0b21UeXBlOiBcIkdpdEh1Yk1vbGVjdWxlXCIsXHJcbiAgICAgICAgICAgIHByb2plY3RJRDogY2xyLFxyXG4gICAgICAgICAgICB1bmlxdWVJRDogZ2VuZXJhdGVVbmlxdWVJRCgpXHJcbiAgICAgICAgfSwgbnVsbCwgYXZhaWxhYmxlVHlwZXMpOyAvL251bGwgaW5kaWNhdGVzIHRoYXQgdGhlcmUgaXMgbm90aGluZyB0byBsb2FkIGZyb20gdGhlIG1vbGVjdWxlIGxpc3QgZm9yIHRoaXMgb25lXHJcbiAgICB9XHJcblxyXG4gICAgc2hvd21lbnUoZXYpe1xyXG4gICAgICAgIC8vT3BlbiB0aGUgZGVmYXVsdCB0YWJcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvY2FsVGFiXCIpLmNsaWNrKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9zdG9wIHRoZSByZWFsIHJpZ2h0IGNsaWNrIG1lbnVcclxuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpOyBcclxuICAgICAgICBcclxuICAgICAgICAvL21ha2Ugc3VyZSBhbGwgZWxlbWVudHMgYXJlIHVuaGlkZGVuXHJcbiAgICAgICAgdWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lbnVMaXN0XCIpO1xyXG4gICAgICAgIGxpID0gdWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxpW2ldLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjsgLy9zZXQgZWFjaCBpdGVtIHRvIG5vdCBkaXNwbGF5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc2hvdyB0aGUgbWVudVxyXG4gICAgICAgIG1lbnUuc3R5bGUudG9wID0gYCR7ZXYuY2xpZW50WSAtIDIwfXB4YDtcclxuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBgJHtldi5jbGllbnRYIC0gMjB9cHhgO1xyXG4gICAgICAgIG1lbnUueCA9IGV2LmNsaWVudFg7XHJcbiAgICAgICAgbWVudS55ID0gZXYuY2xpZW50WTtcclxuICAgICAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoJ29mZicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51SW5wdXQnKS5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVtZW51KGV2KXtcclxuICAgICAgICBtZW51LmNsYXNzTGlzdC5hZGQoJ29mZicpO1xyXG4gICAgICAgIG1lbnUuc3R5bGUudG9wID0gJy0yMDAlJztcclxuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSAnLTIwMCUnO1xyXG4gICAgfVxyXG5cclxuICAgIHNlYXJjaE1lbnUoZXZ0KSB7XHJcbiAgICAgIFxyXG4gICAgICAgIGlmKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0YWJsaW5rcyBhY3RpdmVcIilbMF0uaWQgPT0gXCJsb2NhbFRhYlwiKXtcclxuICAgICAgICAgICAgLy9XZSBhcmUgc2VhcmNoaW5nIHRoZSBsb2NhbCB0YWJcclxuICAgICAgICAgICAgLy8gRGVjbGFyZSB2YXJpYWJsZXNcclxuICAgICAgICAgICAgdmFyIGlucHV0LCBmaWx0ZXIsIHVsLCBsaSwgYSwgaSwgdHh0VmFsdWU7XHJcbiAgICAgICAgICAgIGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lbnVJbnB1dCcpO1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSBpbnB1dC52YWx1ZS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudUxpc3RcIik7XHJcbiAgICAgICAgICAgIGxpID0gdWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIGxpc3QgaXRlbXMsIGFuZCBoaWRlIHRob3NlIHdobyBkb24ndCBtYXRjaCB0aGUgc2VhcmNoIHF1ZXJ5XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgYSA9IGxpW2ldOyAvL3RoaXMgaXMgdGhlIGxpbmsgcGFydCBvZiB0aGUgbGlzdCBpdGVtXHJcbiAgICAgICAgICAgICAgICB0eHRWYWx1ZSA9IGEudGV4dENvbnRlbnQgfHwgYS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodHh0VmFsdWUudG9VcHBlckNhc2UoKS5pbmRleE9mKGZpbHRlcikgPiAtMSkgeyAvL2lmIHRoZSBlbnRlcmVkIHN0cmluZyBtYXRjaGVzXHJcbiAgICAgICAgICAgICAgICAgICAgbGlbaV0uc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpW2ldLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9JZiBlbnRlciB3YXMganVzdCBwcmVzc2VkIFwiY2xpY2tcIiB0aGUgZmlyc3QgZWxlbWVudCB0aGF0IGlzIGJlaW5nIGRpc3BsYXllZFxyXG4gICAgICAgICAgICAgICAgaWYoZXZ0LmNvZGUgPT0gXCJFbnRlclwiICYmIGxpW2ldLnN0eWxlLmRpc3BsYXkgIT0gXCJub25lXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxpW2ldLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIC8vV2UgYXJlIHNlYXJjaGluZyBvbiBnaXRodWJcclxuICAgICAgICAgICAgaWYoZXZ0LmNvZGUgPT0gXCJFbnRlclwiKXtcclxuICAgICAgICAgICAgICAgIGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lbnVJbnB1dCcpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBnaXRodWJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnaXRodWJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBvbGRSZXN1bHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1lbnUtaXRlbVwiKTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBvbGRSZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2xkUmVzdWx0c1tpXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG9jdG9raXQuc2VhcmNoLnJlcG9zKHtcclxuICAgICAgICAgICAgICAgICAgICBxOiBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICBzb3J0OiBcInN0YXJzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcGVyX3BhZ2U6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB0b3BpYzogXCJtYXNsb3djcmVhdGUtbW9sZWN1bGVcIixcclxuICAgICAgICAgICAgICAgICAgICBwYWdlOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi5tZXJjeS1wcmV2aWV3K2pzb24nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kYXRhLml0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0udG9waWNzLmluY2x1ZGVzKFwibWFzbG93Y3JlYXRlLW1vbGVjdWxlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaXRlbS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJtZW51LWl0ZW1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIGl0ZW0uaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0KTsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaXRodWJMaXN0LmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbS5pZCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGFjZUdpdEh1Yk1vbGVjdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvcGVuVGFiKGV2dCwgdGFiTmFtZSkge1xyXG4gICAgICAvLyBEZWNsYXJlIGFsbCB2YXJpYWJsZXNcclxuICAgICAgdmFyIGksIHRhYmNvbnRlbnQsIHRhYmxpbmtzO1xyXG5cclxuICAgICAgLy8gR2V0IGFsbCBlbGVtZW50cyB3aXRoIGNsYXNzPVwidGFiY29udGVudFwiIGFuZCBoaWRlIHRoZW1cclxuICAgICAgdGFiY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0YWJjb250ZW50XCIpO1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGFiY29udGVudC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRhYmNvbnRlbnRbaV0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgYWxsIGVsZW1lbnRzIHdpdGggY2xhc3M9XCJ0YWJsaW5rc1wiIGFuZCByZW1vdmUgdGhlIGNsYXNzIFwiYWN0aXZlXCJcclxuICAgICAgdGFibGlua3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGFibGlua3NcIik7XHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0YWJsaW5rcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRhYmxpbmtzW2ldLmNsYXNzTmFtZSA9IHRhYmxpbmtzW2ldLmNsYXNzTmFtZS5yZXBsYWNlKFwiIGFjdGl2ZVwiLCBcIlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hvdyB0aGUgY3VycmVudCB0YWIsIGFuZCBhZGQgYW4gXCJhY3RpdmVcIiBjbGFzcyB0byB0aGUgYnV0dG9uIHRoYXQgb3BlbmVkIHRoZSB0YWJcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFiTmFtZSkuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgZXZ0LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lICs9IFwiIGFjdGl2ZVwiO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2lyY2xlIGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIkNpcmNsZVwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIkNpcmNsZVwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwiY2lyY2xlKHtyOiB+cmFkaXVzfiwgY2VudGVyOiB0cnVlLCBmbjogMjV9KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJyYWRpdXNcIiwgdGhpcywgXCJudW1iZXJcIiwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcIm1heCBzZWdtZW50IHNpemVcIiwgdGhpcywgXCJudW1iZXJcIiwgNCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2dlbmVyYXRlIHRoZSBjb3JyZWN0IGNvZGVibG9jayBmb3IgdGhpcyBhdG9tIG9uIGNyZWF0aW9uXHJcbiAgICAgICAgdGhpcy51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlQ29kZUJsb2NrKCl7XHJcbiAgICAgICAgLy9PdmVyd3JpdGUgdGhlIG5vcm1hbCB1cGRhdGUgY29kZSBibG9jayB0byB1cGRhdGUgdGhlIG51bWJlciBvZiBzZWdtZW50cyBhbHNvXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG1heGltdW1TZWdtZW50U2l6ZSA9IHRoaXMuZmluZElPVmFsdWUoXCJtYXggc2VnbWVudCBzaXplXCIpO1xyXG4gICAgICAgIHZhciBjaXJjdW1mZXJlbmNlICA9IDMuMTQqMip0aGlzLmZpbmRJT1ZhbHVlKFwicmFkaXVzXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBudW1iZXJPZlNlZ21lbnRzID0gcGFyc2VJbnQoIGNpcmN1bWZlcmVuY2UgLyBtYXhpbXVtU2VnbWVudFNpemUgKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgcmVnZXggPSAvZm46IChcXGQrKVxcfS9naTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSB0aGlzLmRlZmF1bHRDb2RlQmxvY2sucmVwbGFjZShyZWdleCwgXCJmbjogXCIgKyBudW1iZXJPZlNlZ21lbnRzICsgXCJ9XCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5pbXBvcnQgR2xvYmFsVmFyaWFibGVzIGZyb20gJy4uL2dsb2JhbHZhcmlhYmxlcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnN0YW50IGV4dGVuZHMgQXRvbXtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcImNvbnN0YW50XCI7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDb25zdGFudFwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIkNvbnN0YW50XCI7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAxNjtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDE1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcIm51bWJlclwiLCB0aGlzLCBcIm51bWJlclwiLCAxMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmlvVmFsdWVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsdWVzLmZvckVhY2goaW9WYWx1ZSA9PiB7IC8vZm9yIGVhY2ggc2F2ZWQgdmFsdWVcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7ICAvL0ZpbmQgdGhlIG1hdGNoaW5nIElPIGFuZCBzZXQgaXQgdG8gYmUgdGhlIHNhdmVkIHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaW9WYWx1ZS5uYW1lID09IGlvLm5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpby5zZXRWYWx1ZShpb1ZhbHVlLmlvVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZVNpZGViYXIoKXtcclxuICAgICAgICAvL3VwZGF0ZXMgdGhlIHNpZGViYXIgdG8gZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG5vZGVcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gc3VwZXIudXBkYXRlU2lkZWJhcigpOyAvL2NhbGwgdGhlIHN1cGVyIGZ1bmN0aW9uXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuY2hpbGRyZW5bMF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0odmFsdWVMaXN0LG91dHB1dCxcInZhbHVlXCIsIFwiVmFsdWVcIiwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0odmFsdWVMaXN0LHRoaXMsXCJuYW1lXCIsIFwiTmFtZVwiLCBmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFZhbHVlKG5ld05hbWUpe1xyXG4gICAgICAgIC8vQ2FsbGVkIGJ5IHRoZSBzaWRlYmFyIHRvIHNldCB0aGUgbmFtZVxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5ld05hbWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlcmlhbGl6ZSh2YWx1ZXMpe1xyXG4gICAgICAgIC8vU2F2ZSB0aGUgSU8gdmFsdWUgdG8gdGhlIHNlcmlhbCBzdHJlYW1cclxuICAgICAgICB2YXIgdmFsdWVzT2JqID0gc3VwZXIuc2VyaWFsaXplKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFsdWVzT2JqLmlvVmFsdWVzID0gW3tcclxuICAgICAgICAgICAgbmFtZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgaW9WYWx1ZTogdGhpcy5jaGlsZHJlblswXS5nZXRWYWx1ZSgpXHJcbiAgICAgICAgfV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlc09iajtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5kcmF3KCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMucmVjdCh0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5oZWlnaHQvMiwgMip0aGlzLnJhZGl1cywgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLnRleHRBbGlnbiA9IFwic3RhcnRcIjsgXHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFRleHQodGhpcy5uYW1lLCB0aGlzLnggKyB0aGlzLnJhZGl1cywgdGhpcy55LXRoaXMucmFkaXVzKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsKCk7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuY2xvc2VQYXRoKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZmVyZW5jZSBleHRlbmRzIEF0b217XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yICh2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnkxXCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnkyXCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJEaWZmZXJlbmNlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiRGlmZmVyZW5jZVwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwiZGlmZmVyZW5jZSh+Z2VvbWV0cnkxfix+Z2VvbWV0cnkyfilcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWF0aW9uIGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ4XCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInlcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcInpcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJFcXVhdGlvblwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIkVxdWF0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5lcXVhdGlvbk9wdGlvbnMgPSBbXCJ4K3lcIiwgXCJ4LXlcIiwgXCJ4KnlcIiwgXCJ4L3lcIiwgXCJjb3MoeClcIiwgXCJzaW4oeClcIiwgXCJ4XnlcIl07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RXF1YXRpb24gPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlcmlhbGl6ZShzYXZlZE9iamVjdCl7XHJcbiAgICAgICAgdmFyIHN1cGVyU2VyaWFsT2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKG51bGwpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vV3JpdGUgdGhlIGN1cnJlbnQgZXF1YXRpb24gdG8gdGhlIHNlcmlhbGl6ZWQgb2JqZWN0XHJcbiAgICAgICAgc3VwZXJTZXJpYWxPYmplY3QuY3VycmVudEVxdWF0aW9uID0gdGhpcy5jdXJyZW50RXF1YXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHN1cGVyU2VyaWFsT2JqZWN0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVDb2RlQmxvY2soKXtcclxuICAgICAgICAvL0Egc3VwZXIgY2xhc3NlZCB2ZXJzaW9uIG9mIHRoZSB1cGRhdGUgY29kZWJsb2NrIGRlZmF1bHQgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIGVxdWF0aW9uIHZhbHVlc1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5maW5kSU9WYWx1ZShcInhcIik7XHJcbiAgICAgICAgdmFyIHkgPSB0aGlzLmZpbmRJT1ZhbHVlKFwieVwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgejtcclxuICAgICAgICBzd2l0Y2godGhpcy5jdXJyZW50RXF1YXRpb24pe1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICB6ID0geCt5O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIHogPSB4LXk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgeiA9IHgqeTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICB6ID0geC95O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIHogPSBNYXRoLmNvcyh4KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICB6ID0gTWF0aC5zaW4oeCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgeiA9IE1hdGgucG93KHgseSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gb3B0aW9ucyBmb3VuZFwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudEVxdWF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgdGhlIG91dHB1dCB0byBiZSB0aGUgZ2VuZXJhdGVkIHZhbHVlXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY2hpbGQudHlwZSA9PSAnb3V0cHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zZXRWYWx1ZSh6KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjaGFuZ2VFcXVhdGlvbihuZXdWYWx1ZSl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RXF1YXRpb24gPSBwYXJzZUludChuZXdWYWx1ZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlU2lkZWJhcigpe1xyXG4gICAgICAgIC8vVXBkYXRlIHRoZSBzaWRlIGJhciB0byBtYWtlIGl0IHBvc3NpYmxlIHRvIGNoYW5nZSB0aGUgbW9sZWN1bGUgbmFtZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSBzdXBlci51cGRhdGVTaWRlYmFyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jcmVhdGVEcm9wRG93bih2YWx1ZUxpc3QsIHRoaXMsIHRoaXMuZXF1YXRpb25PcHRpb25zLCB0aGlzLmN1cnJlbnRFcXVhdGlvbiwgXCJ6ID0gXCIpO1xyXG4gICAgICAgIFxyXG4gICAgfSBcclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4dHJ1ZGUgZXh0ZW5kcyBBdG9te1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJFeHRydWRlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiRXh0cnVkZVwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwibGluZWFyX2V4dHJ1ZGUoeyBoZWlnaHQ6IH5oZWlnaHR+IH0sIH5nZW9tZXRyeX4pXCI7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImdlb21ldHJ5XCIgLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImhlaWdodFwiICAgLCB0aGlzLCBcIm51bWJlclwiLCAxMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxufSIsImltcG9ydCBNb2xlY3VsZSBmcm9tICcuLi9tb2xlY3VsZXMvbW9sZWN1bGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRIdWJNb2xlY3VsZSBleHRlbmRzIE1vbGVjdWxlIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiR2l0aHViIE1vbGVjdWxlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiR2l0SHViTW9sZWN1bGVcIjtcclxuICAgICAgICB0aGlzLnRvcExldmVsID0gZmFsc2U7IC8vYSBmbGFnIHRvIHNpZ25hbCBpZiB0aGlzIG5vZGUgaXMgdGhlIHRvcCBsZXZlbCBub2RlXHJcbiAgICAgICAgdGhpcy5jZW50ZXJDb2xvciA9IFwiYmxhY2tcIjtcclxuICAgICAgICB0aGlzLnByb2plY3RJRCA9IDE3NDI5MjMwMjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubG9hZFByb2plY3RCeUlEKHRoaXMucHJvamVjdElEKTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZG91YmxlQ2xpY2soeCx5KXtcclxuICAgICAgICAvL1ByZXZlbnQgeW91IGZyb20gYmVpbmcgYWJsZSB0byBkb3VibGUgY2xpY2sgaW50byBhIGdpdGh1YiBtb2xlY3VsZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBjbGlja1Byb2Nlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkaXN0RnJvbUNsaWNrID0gZGlzdEJldHdlZW5Qb2ludHMoeCwgdGhpcy54LCB5LCB0aGlzLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChkaXN0RnJvbUNsaWNrIDwgdGhpcy5yYWRpdXMpe1xyXG4gICAgICAgICAgICBjbGlja1Byb2Nlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBjbGlja1Byb2Nlc3NlZDsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvYWRQcm9qZWN0QnlJRChpZCl7XHJcbiAgICAvL0dldCB0aGUgcmVwbyBieSBJRFxyXG4gICAgICAgIG9jdG9raXQucmVxdWVzdCgnR0VUIC9yZXBvc2l0b3JpZXMvOmlkJywge2lkfSkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9GaW5kIG91dCB0aGUgb3duZXJzIGluZm87XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB2YXIgdXNlciAgICAgPSByZXN1bHQuZGF0YS5vd25lci5sb2dpbjtcclxuICAgICAgICAgICAgdmFyIHJlcG9OYW1lID0gcmVzdWx0LmRhdGEubmFtZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vR2V0IHRoZSBmaWxlIGNvbnRlbnRzXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBvY3Rva2l0LnJlcG9zLmdldENvbnRlbnRzKHtcclxuICAgICAgICAgICAgICAgIG93bmVyOiB1c2VyLFxyXG4gICAgICAgICAgICAgICAgcmVwbzogcmVwb05hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiAncHJvamVjdC5tYXNsb3djcmVhdGUnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vY29udGVudCB3aWxsIGJlIGJhc2U2NCBlbmNvZGVkXHJcbiAgICAgICAgICAgICAgICBsZXQgcmF3RmlsZSA9IGF0b2IocmVzdWx0LmRhdGEuY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9sZWN1bGVzTGlzdCA9ICBKU09OLnBhcnNlKHJhd0ZpbGUpLm1vbGVjdWxlcztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlcmlhbGl6ZShtb2xlY3VsZXNMaXN0LCBtb2xlY3VsZXNMaXN0LmZpbHRlcigobW9sZWN1bGUpID0+IHsgcmV0dXJuIG1vbGVjdWxlLnRvcExldmVsID09IHRydWU7IH0pWzBdLnVuaXF1ZUlEKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy50b3BMZXZlbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL1RyeSB0byByZS1lc3RhYmxpc2ggdGhlIGNvbm5lY3RvcnMgaW4gdGhlIHBhcmVudCBtb2xlY3VsZSB0byBnZXQgdGhlIG9uZXMgdGhhdCB3ZXJlIG1pc3NlZCBiZWZvcmUgd2hlbiB0aGlzIG1vbGVjdWxlIGhhZCBub3QgeWV0IGJlZW4gZnVsbHkgbG9hZGVkXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zYXZlZENvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnBsYWNlQ29ubmVjdG9yKEpTT04ucGFyc2UoY29ubmVjdG9yKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlcmlhbGl6ZShzYXZlZE9iamVjdCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SZXR1cm4gYSBwbGFjZWhvbGRlciBmb3IgdGhpcyBtb2xlY3VsZVxyXG4gICAgICAgIHZhciBvYmplY3QgPSB7XHJcbiAgICAgICAgICAgIGF0b21UeXBlOiB0aGlzLmF0b21UeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgICAgICB1bmlxdWVJRDogdGhpcy51bmlxdWVJRCxcclxuICAgICAgICAgICAgcHJvamVjdElEOiB0aGlzLnByb2plY3RJRFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVTaWRlYmFyKCl7XHJcbiAgICAgICAgLy91cGRhdGVzIHRoZSBzaWRlYmFyIHRvIGRpc3BsYXkgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBub2RlXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yZW1vdmUgZXZlcnl0aGluZyBpbiB0aGUgc2lkZUJhciBub3dcclxuICAgICAgICB3aGlsZSAoc2lkZUJhci5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIHNpZGVCYXIucmVtb3ZlQ2hpbGQoc2lkZUJhci5maXJzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9hZGQgdGhlIG5hbWUgYXMgYSB0aXRsZVxyXG4gICAgICAgIHZhciBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgICAgICBuYW1lLnRleHRDb250ZW50ID0gdGhpcy5uYW1lO1xyXG4gICAgICAgIG5hbWUuc2V0QXR0cmlidXRlKFwic3R5bGVcIixcInRleHQtYWxpZ246Y2VudGVyO1wiKTtcclxuICAgICAgICBzaWRlQmFyLmFwcGVuZENoaWxkKG5hbWUpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5pbXBvcnQgR2xvYmFsVmFyaWFibGVzIGZyb20gJy4uL2dsb2JhbHZhcmlhYmxlcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0IGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIgKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJJbnB1dFwiICsgZ2VuZXJhdGVVbmlxdWVJRCgpO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcImlucHV0XCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiSW5wdXRcIjtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDE2O1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMTU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwibnVtYmVyIG9yIGdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgYSBuZXcgaW5wdXQgdG8gdGhlIGN1cnJlbnQgbW9sZWN1bGVcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5hZGRJTyhcImlucHV0XCIsIHRoaXMubmFtZSwgdGhpcy5wYXJlbnQsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVTaWRlYmFyKCl7XHJcbiAgICAgICAgLy91cGRhdGVzIHRoZSBzaWRlYmFyIHRvIGRpc3BsYXkgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBub2RlXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHZhbHVlTGlzdCA9ICBzdXBlci51cGRhdGVTaWRlYmFyKCk7IC8vY2FsbCB0aGUgc3VwZXIgZnVuY3Rpb25cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbSh2YWx1ZUxpc3QsdGhpcyxcIm5hbWVcIiwgXCJOYW1lXCIsIGZhbHNlKTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5kcmF3KCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICAgICAgXHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMudGV4dEFsaWduID0gXCJzdGFydFwiOyBcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsVGV4dCh0aGlzLm5hbWUsIHRoaXMueCArIHRoaXMucmFkaXVzLCB0aGlzLnktdGhpcy5yYWRpdXMpO1xyXG5cclxuICAgICAgICBcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5tb3ZlVG8odGhpcy54IC0gdGhpcy5yYWRpdXMsIHRoaXMueSAtIHRoaXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmxpbmVUbyh0aGlzLnggLSB0aGlzLnJhZGl1cyArIDEwLCB0aGlzLnkpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmxpbmVUbyh0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55ICsgdGhpcy5oZWlnaHQvMik7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMubGluZVRvKHRoaXMueCArIHRoaXMucmFkaXVzLCB0aGlzLnkgKyB0aGlzLmhlaWdodC8yKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5saW5lVG8odGhpcy54ICsgdGhpcy5yYWRpdXMsIHRoaXMueSAtIHRoaXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmZpbGwoKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5jbG9zZVBhdGgoKTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRlbGV0ZU5vZGUoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SZW1vdmUgdGhpcyBpbnB1dCBmcm9tIHRoZSBwYXJlbnQgbW9sZWN1bGVcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVJTyhcImlucHV0XCIsIHRoaXMubmFtZSwgdGhpcy5wYXJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBzdXBlci5kZWxldGVOb2RlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFZhbHVlKHRoZU5ld05hbWUpe1xyXG4gICAgICAgIC8vQ2FsbGVkIGJ5IHRoZSBzaWRlYmFyIHRvIHNldCB0aGUgbmFtZVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vUnVuIHRocm91Z2ggdGhlIHBhcmVudCBtb2xlY3VsZSBhbmQgZmluZCB0aGUgaW5wdXQgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5uYW1lID09IHRoaXMubmFtZSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUgPSB0aGVOZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubmFtZSA9IHRoZU5ld05hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0T3V0cHV0KG5ld091dHB1dCl7XHJcbiAgICAgICAgLy9TZXQgdGhlIGlucHV0J3Mgb3V0cHV0XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBuZXdPdXRwdXQ7ICAvL1NldCB0aGUgY29kZSBibG9jayBzbyB0aGF0IGNsaWNraW5nIG9uIHRoZSBpbnB1dCBwcmV2aWV3cyB3aGF0IGl0IGlzIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IHRoZSBvdXRwdXQgbm9kZXMgd2l0aCB0eXBlICdnZW9tZXRyeScgdG8gYmUgdGhlIG5ldyB2YWx1ZVxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkLnZhbHVlVHlwZSA9PSAnZ2VvbWV0cnknICYmIGNoaWxkLnR5cGUgPT0gJ291dHB1dCcpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0VmFsdWUobmV3T3V0cHV0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBcclxuICAgIFxyXG4gICAgdXBkYXRlQ29kZUJsb2NrKCl7XHJcbiAgICAgICAgLy9UaGlzIGVtcHR5IGZ1bmN0aW9uIGhhbmRsZXMgYW55IGNhbGxzIHRvIHRoZSBub3JtYWwgdXBkYXRlIGNvZGUgYmxvY2sgZnVuY3Rpb24gd2hpY2ggYnJlYWtzIHRoaW5ncyBoZXJlXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJzZWN0aW9uIGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeTFcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeTJcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIkludGVyc2VjdGlvblwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIkludGVyc2VjdGlvblwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwiaW50ZXJzZWN0aW9uKH5nZW9tZXRyeTF+LH5nZW9tZXRyeTJ+KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlycm9yIGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInhcIiwgdGhpcywgXCJudW1iZXJcIiwgMSk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieVwiLCB0aGlzLCBcIm51bWJlclwiLCAxKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ6XCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiTWlycm9yXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiTWlycm9yXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJtaXJyb3IoW354fix+eX4sfnp+XSwgfmdlb21ldHJ5filcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuaW1wb3J0IEdsb2JhbFZhcmlhYmxlcyBmcm9tICcuLi9nbG9iYWx2YXJpYWJsZXMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2xlY3VsZSBleHRlbmRzIEF0b217XHJcblxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubm9kZXNPblRoZVNjcmVlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIk1vbGVjdWxlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiTW9sZWN1bGVcIjtcclxuICAgICAgICB0aGlzLmNlbnRlckNvbG9yID0gXCIjOTQ5Mjk0XCI7XHJcbiAgICAgICAgdGhpcy50b3BMZXZlbCA9IGZhbHNlOyAvL2EgZmxhZyB0byBzaWduYWwgaWYgdGhpcyBub2RlIGlzIHRoZSB0b3AgbGV2ZWwgbm9kZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgdGhlIG1vbGVjdWxlJ3Mgb3V0cHV0XHJcbiAgICAgICAgdGhpcy5wbGFjZUF0b20oe1xyXG4gICAgICAgICAgICBwYXJlbnRNb2xlY3VsZTogdGhpcywgXHJcbiAgICAgICAgICAgIHg6IEdsb2JhbFZhcmlhYmxlcy5jYW52YXMud2lkdGggLSA1MCxcclxuICAgICAgICAgICAgeTogR2xvYmFsVmFyaWFibGVzLmNhbnZhcy5oZWlnaHQvMixcclxuICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxyXG4gICAgICAgICAgICBuYW1lOiBcIk91dHB1dFwiLFxyXG4gICAgICAgICAgICBhdG9tVHlwZTogXCJPdXRwdXRcIlxyXG4gICAgICAgIH0sIG51bGwsIEdsb2JhbFZhcmlhYmxlcy5zZWNyZXRUeXBlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHN1cGVyLmRyYXcoKTsgLy9TdXBlciBjYWxsIHRvIGRyYXcgdGhlIHJlc3RcclxuICAgICAgICBcclxuICAgICAgICAvL2RyYXcgdGhlIGNpcmNsZSBpbiB0aGUgbWlkZGxlXHJcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBjLmZpbGxTdHlsZSA9IHRoaXMuY2VudGVyQ29sb3I7XHJcbiAgICAgICAgYy5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLzIsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgYy5jbG9zZVBhdGgoKTtcclxuICAgICAgICBjLmZpbGwoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZG91YmxlQ2xpY2soeCx5KXtcclxuICAgICAgICAvL3JldHVybnMgdHJ1ZSBpZiBzb21ldGhpbmcgd2FzIGRvbmUgd2l0aCB0aGUgY2xpY2tcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB2YXIgY2xpY2tQcm9jZXNzZWQgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZGlzdEZyb21DbGljayA9IGRpc3RCZXR3ZWVuUG9pbnRzKHgsIHRoaXMueCwgeSwgdGhpcy55KTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZGlzdEZyb21DbGljayA8IHRoaXMucmFkaXVzKXtcclxuICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZSA9IHRoaXM7IC8vc2V0IHRoaXMgdG8gYmUgdGhlIGN1cnJlbnRseSBkaXNwbGF5ZWQgbW9sZWN1bGVcclxuICAgICAgICAgICAgY2xpY2tQcm9jZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gY2xpY2tQcm9jZXNzZWQ7IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBiYWNrZ3JvdW5kQ2xpY2soKXtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZVNpZGViYXIoKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3ZhciB0b1JlbmRlciA9IFwiZnVuY3Rpb24gbWFpbiAoKSB7XFxuICAgIHJldHVybiBtb2xlY3VsZVwiICsgdGhpcy51bmlxdWVJRCArIFwiLmNvZGUoKVxcbn1cXG5cXG5cIiArIHRoaXMuc2VyaWFsaXplKClcclxuICAgICAgICBcclxuICAgICAgICAvL3dpbmRvdy5sb2FkRGVzaWduKHRvUmVuZGVyLFwiTWFzbG93Q3JlYXRlXCIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVDb2RlQmxvY2soKXtcclxuICAgICAgICAvL0dyYWIgdGhlIGNvZGUgZnJvbSB0aGUgb3V0cHV0IG9iamVjdFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vR3JhYiB2YWx1ZXMgZnJvbSB0aGUgaW5wdXRzIGFuZCBwdXNoIHRoZW0gb3V0IHRvIHRoZSBpbnB1dCBvYmplY3RzXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY2hpbGQudmFsdWVUeXBlID09ICdnZW9tZXRyeScgJiYgY2hpbGQudHlwZSA9PSAnaW5wdXQnKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKGF0b20gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGF0b20uYXRvbVR5cGUgPT0gXCJJbnB1dFwiICYmIGNoaWxkLm5hbWUgPT0gYXRvbS5uYW1lKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXRvbS5zZXRPdXRwdXQoY2hpbGQuZ2V0VmFsdWUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL0dyYWIgdGhlIHZhbHVlIGZyb20gdGhlIE1vbGVjdWxlJ3Mgb3V0cHV0IGFuZCBzZXQgaXQgdG8gYmUgdGhlIG1vbGVjdWxlJ3MgY29kZSBibG9jayBzbyB0aGF0IGNsaWNraW5nIG9uIHRoZSBtb2xlY3VsZSB3aWxsIGRpc3BsYXkgd2hhdCBpdCBpcyBvdXRwdXR0aW5nXHJcbiAgICAgICAgdGhpcy5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2goYXRvbSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGF0b20uYXRvbVR5cGUgPT0gJ091dHB1dCcpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBhdG9tLmNvZGVCbG9jaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IHRoZSBvdXRwdXQgbm9kZXMgd2l0aCB0eXBlICdnZW9tZXRyeScgdG8gYmUgdGhlIGdlbmVyYXRlZCBjb2RlXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY2hpbGQudmFsdWVUeXBlID09ICdnZW9tZXRyeScgJiYgY2hpbGQudHlwZSA9PSAnb3V0cHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zZXRWYWx1ZSh0aGlzLmNvZGVCbG9jayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL0lmIHRoaXMgbW9sZWN1bGUgaXMgc2VsZWN0ZWQsIHNlbmQgdGhlIHVwZGF0ZWQgdmFsdWUgdG8gdGhlIHJlbmRlcmVyXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRUb1JlbmRlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlU2lkZWJhcigpe1xyXG4gICAgICAgIC8vVXBkYXRlIHRoZSBzaWRlIGJhciB0byBtYWtlIGl0IHBvc3NpYmxlIHRvIGNoYW5nZSB0aGUgbW9sZWN1bGUgbmFtZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSBzdXBlci51cGRhdGVTaWRlYmFyKCk7IC8vY2FsbCB0aGUgc3VwZXIgZnVuY3Rpb25cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbSh2YWx1ZUxpc3QsdGhpcyxcIm5hbWVcIiwgXCJOYW1lXCIsIGZhbHNlKTtcclxuICAgICAgICBcclxuICAgICAgICBpZighdGhpcy50b3BMZXZlbCl7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQnV0dG9uKHZhbHVlTGlzdCx0aGlzLFwiR28gVG8gUGFyZW50XCIsdGhpcy5nb1RvUGFyZW50TW9sZWN1bGUpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVCdXR0b24odmFsdWVMaXN0LHRoaXMsXCJFeHBvcnQgVG8gR2l0SHViXCIsIHRoaXMuZXhwb3J0VG9HaXRodWIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQnV0dG9uKHZhbHVlTGlzdCx0aGlzLFwiTG9hZCBBIERpZmZlcmVudCBQcm9qZWN0XCIsc2hvd1Byb2plY3RzVG9Mb2FkKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNyZWF0ZUJPTSh2YWx1ZUxpc3QsdGhpcyx0aGlzLkJPTWxpc3QpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2YWx1ZUxpc3Q7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdvVG9QYXJlbnRNb2xlY3VsZShzZWxmKXtcclxuICAgICAgICAvL0dvIHRvIHRoZSBwYXJlbnQgbW9sZWN1bGUgaWYgdGhlcmUgaXMgb25lXHJcbiAgICAgICAgXHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgICAgICBcclxuICAgICAgICBpZighR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS50b3BMZXZlbCl7XHJcbiAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUgPSBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLnBhcmVudDsgLy9zZXQgcGFyZW50IHRoaXMgdG8gYmUgdGhlIGN1cnJlbnRseSBkaXNwbGF5ZWQgbW9sZWN1bGVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydFRvR2l0aHViKHNlbGYpe1xyXG4gICAgICAgIC8vRXhwb3J0IHRoaXMgbW9sZWN1bGUgdG8gZ2l0aHViXHJcbiAgICAgICAgZXhwb3J0Q3VycmVudE1vbGVjdWxlVG9HaXRodWIoc2VsZik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlcGxhY2VUaGlzTW9sZWN1bGVXaXRoR2l0aHViKGdpdGh1YklEKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhnaXRodWJJRCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9JZiB3ZSBhcmUgY3VycmVudGx5IGluc2lkZSB0aGUgbW9sZWN1bGUgdGFyZ2V0ZWQgZm9yIHJlcGxhY2VtZW50LCBnbyB1cCBvbmVcclxuICAgICAgICBpZiAoR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZS51bmlxdWVJRCA9PSB0aGlzLnVuaXF1ZUlEKXtcclxuICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmN1cnJlbnRNb2xlY3VsZSA9IHRoaXMucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL0NyZWF0ZSBhIG5ldyBnaXRodWIgbW9sZWN1bGUgaW4gdGhlIHNhbWUgc3BvdFxyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jdXJyZW50TW9sZWN1bGUucGxhY2VBdG9tKHtcclxuICAgICAgICAgICAgeDogdGhpcy54LCBcclxuICAgICAgICAgICAgeTogdGhpcy55LCBcclxuICAgICAgICAgICAgcGFyZW50OiBHbG9iYWxWYXJpYWJsZXMuY3VycmVudE1vbGVjdWxlLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgIGF0b21UeXBlOiBcIkdpdEh1Yk1vbGVjdWxlXCIsXHJcbiAgICAgICAgICAgIHByb2plY3RJRDogZ2l0aHViSUQsXHJcbiAgICAgICAgICAgIHVuaXF1ZUlEOiBnZW5lcmF0ZVVuaXF1ZUlEKClcclxuICAgICAgICB9LCBudWxsLCBhdmFpbGFibGVUeXBlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9UaGVuIGRlbGV0ZSB0aGUgb2xkIG1vbGVjdWxlIHdoaWNoIGhhcyBiZWVuIHJlcGxhY2VkXHJcbiAgICAgICAgdGhpcy5kZWxldGVOb2RlKCk7XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXF1ZXN0Qk9NKCl7XHJcbiAgICAgICAgdmFyIGdlbmVyYXRlZEJPTSA9IHN1cGVyLnJlcXVlc3RCT00oKTtcclxuICAgICAgICB0aGlzLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlZEJPTSA9IGdlbmVyYXRlZEJPTS5jb25jYXQobW9sZWN1bGUucmVxdWVzdEJPTSgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZ2VuZXJhdGVkQk9NO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXF1ZXN0UmVhZG1lKCl7XHJcbiAgICAgICAgdmFyIGdlbmVyYXRlZFJlYWRtZSA9IHN1cGVyLnJlcXVlc3RSZWFkbWUoKTtcclxuICAgICAgICBnZW5lcmF0ZWRSZWFkbWUucHVzaChcIiMjIFwiICsgdGhpcy5uYW1lKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgc29ydGFibGVBdG9tc0xpc3QgPSB0aGlzLm5vZGVzT25UaGVTY3JlZW47XHJcbiAgICAgICAgc29ydGFibGVBdG9tc0xpc3Quc29ydChmdW5jdGlvbihhLCBiKXtyZXR1cm4gZGlzdEJldHdlZW5Qb2ludHMoYS54LCAwLCBhLnksIDApLWRpc3RCZXR3ZWVuUG9pbnRzKGIueCwgMCwgYi55LCAwKX0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNvcnRhYmxlQXRvbXNMaXN0LmZvckVhY2gobW9sZWN1bGUgPT4ge1xyXG4gICAgICAgICAgICBnZW5lcmF0ZWRSZWFkbWUgPSBnZW5lcmF0ZWRSZWFkbWUuY29uY2F0KG1vbGVjdWxlLnJlcXVlc3RSZWFkbWUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlZFJlYWRtZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VyaWFsaXplKHNhdmVkT2JqZWN0KXtcclxuICAgICAgICAvL1NhdmUgdGhpcyBtb2xlY3VsZS5cclxuICAgICAgICBcclxuICAgICAgICAvL1RoaXMgb25lIGlzIGEgbGl0dGxlIGNvbmZ1c2luZy4gQmFzaWNhbGx5IGVhY2ggbW9sZWN1bGUgc2F2ZXMgbGlrZSBhbiBhdG9tLCBidXQgYWxzbyBjcmVhdGVzIGEgc2Vjb25kIG9iamVjdCBcclxuICAgICAgICAvL3JlY29yZCBvZiBpdHNlbGYgaW4gdGhlIG9iamVjdCBcInNhdmVkT2JqZWN0XCIgb2JqZWN0LiBJZiB0aGlzIGlzIHRoZSB0b3BMZXZlbCBtb2xlY3VsZSB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgXHJcbiAgICAgICAgLy9zYXZlZE9iamVjdCBvYmplY3QgaGVyZSB0byBwYXNzIHRvIGxvd2VyIGxldmVscy5cclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLnRvcExldmVsID09IHRydWUpe1xyXG4gICAgICAgICAgICAvL0NyZWF0ZSBhIG5ldyBibGFuayBwcm9qZWN0IHRvIHNhdmUgdG9cclxuICAgICAgICAgICAgc2F2ZWRPYmplY3QgPSB7bW9sZWN1bGVzOiBbXX1cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHZhciBhbGxFbGVtZW50c0NvZGUgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICB2YXIgYWxsQXRvbXMgPSBbXTtcclxuICAgICAgICB2YXIgYWxsQ29ubmVjdG9ycyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKGF0b20gPT4ge1xyXG4gICAgICAgICAgICBpZiAoYXRvbS5jb2RlQmxvY2sgIT0gXCJcIil7XHJcbiAgICAgICAgICAgICAgICBhbGxFbGVtZW50c0NvZGUucHVzaChhdG9tLmNvZGVCbG9jayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGFsbEF0b21zLnB1c2goSlNPTi5zdHJpbmdpZnkoYXRvbS5zZXJpYWxpemUoc2F2ZWRPYmplY3QpKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBhdG9tLmNoaWxkcmVuLmZvckVhY2goYXR0YWNobWVudFBvaW50ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKGF0dGFjaG1lbnRQb2ludC50eXBlID09IFwib3V0cHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRQb2ludC5jb25uZWN0b3JzLmZvckVhY2goY29ubmVjdG9yID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsQ29ubmVjdG9ycy5wdXNoKGNvbm5lY3Rvci5zZXJpYWxpemUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0aGlzQXNPYmplY3QgPSB7XHJcbiAgICAgICAgICAgIGF0b21UeXBlOiB0aGlzLmF0b21UeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgIHVuaXF1ZUlEOiB0aGlzLnVuaXF1ZUlELFxyXG4gICAgICAgICAgICB0b3BMZXZlbDogdGhpcy50b3BMZXZlbCxcclxuICAgICAgICAgICAgQk9NbGlzdDogdGhpcy5CT01saXN0LFxyXG4gICAgICAgICAgICBhbGxBdG9tczogYWxsQXRvbXMsXHJcbiAgICAgICAgICAgIGFsbENvbm5lY3RvcnM6IGFsbENvbm5lY3RvcnNcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9BZGQgYW4gb2JqZWN0IHJlY29yZCBvZiB0aGlzIG9iamVjdFxyXG4gICAgICAgIFxyXG4gICAgICAgIHNhdmVkT2JqZWN0Lm1vbGVjdWxlcy5wdXNoKHRoaXNBc09iamVjdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMudG9wTGV2ZWwgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgIC8vSWYgdGhpcyBpcyB0aGUgdG9wIGxldmVsLCByZXR1cm4gdGhlIGdlbmVyYXRlZCBvYmplY3RcclxuICAgICAgICAgICAgcmV0dXJuIHNhdmVkT2JqZWN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAvL0lmIG5vdCwgcmV0dXJuIGp1c3QgYSBwbGFjZWhvbGRlciBmb3IgdGhpcyBtb2xlY3VsZVxyXG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgYXRvbVR5cGU6IHRoaXMuYXRvbVR5cGUsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgICAgICAgICB1bmlxdWVJRDogdGhpcy51bmlxdWVJRCxcclxuICAgICAgICAgICAgICAgIEJPTWxpc3Q6IHRoaXMuQk9NbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgICAgICBcclxuICAgIGRlc2VyaWFsaXplKG1vbGVjdWxlTGlzdCwgbW9sZWN1bGVJRCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9GaW5kIHRoZSB0YXJnZXQgbW9sZWN1bGUgaW4gdGhlIGxpc3RcclxuICAgICAgICB2YXIgbW9sZWN1bGVPYmplY3QgPSBtb2xlY3VsZUxpc3QuZmlsdGVyKChtb2xlY3VsZSkgPT4geyByZXR1cm4gbW9sZWN1bGUudW5pcXVlSUQgPT0gbW9sZWN1bGVJRDt9KVswXTtcclxuICAgICAgICBcclxuICAgICAgICAvL0dyYWIgdGhlIG5hbWUgYW5kIElEXHJcbiAgICAgICAgdGhpcy51bmlxdWVJRCAgPSBtb2xlY3VsZU9iamVjdC51bmlxdWVJRDtcclxuICAgICAgICB0aGlzLm5hbWUgICAgICA9IG1vbGVjdWxlT2JqZWN0Lm5hbWU7XHJcbiAgICAgICAgdGhpcy50b3BMZXZlbCAgPSBtb2xlY3VsZU9iamVjdC50b3BMZXZlbDtcclxuICAgICAgICB0aGlzLkJPTWxpc3QgICA9IG1vbGVjdWxlT2JqZWN0LkJPTWxpc3Q7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9QbGFjZSB0aGUgYXRvbXNcclxuICAgICAgICBtb2xlY3VsZU9iamVjdC5hbGxBdG9tcy5mb3JFYWNoKGF0b20gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsYWNlQXRvbShKU09OLnBhcnNlKGF0b20pLCBtb2xlY3VsZUxpc3QsIGF2YWlsYWJsZVR5cGVzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL3JlbG9hZCB0aGUgbW9sZWN1bGUgb2JqZWN0IHRvIHByZXZlbnQgcGVyc2lzdGVuY2UgaXNzdWVzXHJcbiAgICAgICAgbW9sZWN1bGVPYmplY3QgPSBtb2xlY3VsZUxpc3QuZmlsdGVyKChtb2xlY3VsZSkgPT4geyByZXR1cm4gbW9sZWN1bGUudW5pcXVlSUQgPT0gbW9sZWN1bGVJRDt9KVswXTtcclxuICAgICAgICBcclxuICAgICAgICAvL1BsYWNlIHRoZSBjb25uZWN0b3JzXHJcbiAgICAgICAgdGhpcy5zYXZlZENvbm5lY3RvcnMgPSBtb2xlY3VsZU9iamVjdC5hbGxDb25uZWN0b3JzOyAvL1NhdmUgYSBjb3B5IG9mIHRoZSBjb25uZWN0b3JzIHNvIHdlIGNhbiB1c2UgdGhlbSBsYXRlciBpZiB3ZSB3YW50XHJcbiAgICAgICAgdGhpcy5zYXZlZENvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsYWNlQ29ubmVjdG9yKEpTT04ucGFyc2UoY29ubmVjdG9yKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcGxhY2VBdG9tKG5ld0F0b21PYmosIG1vbGVjdWxlTGlzdCwgdHlwZXNMaXN0KXtcclxuICAgICAgICAvL1BsYWNlIHRoZSBhdG9tIC0gbm90ZSB0aGF0IHR5cGVzIG5vdCBsaXN0ZWQgaW4gYXZhaWxhYmxlVHlwZXMgd2lsbCBub3QgYmUgcGxhY2VkIHdpdGggbm8gd2FybmluZyAoaWUgZ28gdXAgb25lIGxldmVsKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHR5cGVzTGlzdCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZXNMaXN0W2tleV0uYXRvbVR5cGUgPT0gbmV3QXRvbU9iai5hdG9tVHlwZSl7XHJcbiAgICAgICAgICAgICAgICBuZXdBdG9tT2JqLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXRvbSA9IG5ldyB0eXBlc0xpc3Rba2V5XS5jcmVhdG9yKG5ld0F0b21PYmopO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL3JlYXNzaWduIHRoZSBuYW1lIG9mIHRoZSBJbnB1dHMgdG8gcHJlc2VydmUgbGlua2luZ1xyXG4gICAgICAgICAgICAgICAgaWYoYXRvbS5hdG9tVHlwZSA9PSBcIklucHV0XCIgJiYgdHlwZW9mIG5ld0F0b21PYmoubmFtZSAhPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0b20uc2V0VmFsdWUobmV3QXRvbU9iai5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL0lmIHRoaXMgaXMgYSBtb2xlY3VsZSwgZGVzZXJpYWxpemUgaXRcclxuICAgICAgICAgICAgICAgIGlmKGF0b20uYXRvbVR5cGUgPT0gXCJNb2xlY3VsZVwiICYmIG1vbGVjdWxlTGlzdCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICBhdG9tLmRlc2VyaWFsaXplKG1vbGVjdWxlTGlzdCwgYXRvbS51bmlxdWVJRCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZXNPblRoZVNjcmVlbi5wdXNoKGF0b20pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKG5ld0F0b21PYmouYXRvbVR5cGUgPT0gXCJPdXRwdXRcIil7XHJcbiAgICAgICAgICAgIC8vcmUtYXNpZ24gb3V0cHV0IElEIG51bWJlcnMgaWYgYSBuZXcgb25lIGlzIHN1cHBvc2VkIHRvIGJlIHBsYWNlZFxyXG4gICAgICAgICAgICB0aGlzLm5vZGVzT25UaGVTY3JlZW4uZm9yRWFjaChhdG9tID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKGF0b20uYXRvbVR5cGUgPT0gXCJPdXRwdXRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXRvbS5zZXRJRChuZXdBdG9tT2JqLnVuaXF1ZUlEKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwbGFjZUNvbm5lY3Rvcihjb25uZWN0b3JPYmope1xyXG4gICAgICAgIHZhciBjb25uZWN0b3I7XHJcbiAgICAgICAgdmFyIGNwMU5vdEZvdW5kID0gdHJ1ZTtcclxuICAgICAgICB2YXIgY3AyTm90Rm91bmQgPSB0cnVlO1xyXG4gICAgICAgIHZhciBhcDI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ub2Rlc09uVGhlU2NyZWVuLmZvckVhY2goYXRvbSA9PiB7XHJcbiAgICAgICAgICAgIC8vRmluZCB0aGUgb3V0cHV0IG5vZGVcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChhdG9tLnVuaXF1ZUlEID09IGNvbm5lY3Rvck9iai5hcDFJRCl7XHJcbiAgICAgICAgICAgICAgICBhdG9tLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNoaWxkLm5hbWUgPT0gY29ubmVjdG9yT2JqLmFwMU5hbWUgJiYgY2hpbGQudHlwZSA9PSBcIm91dHB1dFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yID0gbmV3IENvbm5lY3Rvcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdG9tVHlwZTogXCJDb25uZWN0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRQb2ludDE6IGNoaWxkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50TW9sZWN1bGU6ICBhdG9tXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcDFOb3RGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vRmluZCB0aGUgaW5wdXQgbm9kZVxyXG4gICAgICAgICAgICBpZiAoYXRvbS51bmlxdWVJRCA9PSBjb25uZWN0b3JPYmouYXAySUQpe1xyXG4gICAgICAgICAgICAgICAgYXRvbS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihjaGlsZC5uYW1lID09IGNvbm5lY3Rvck9iai5hcDJOYW1lICYmIGNoaWxkLnR5cGUgPT0gXCJpbnB1dFwiICYmIGNoaWxkLmNvbm5lY3RvcnMubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcDJOb3RGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcDIgPSBjaGlsZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKGNwMU5vdEZvdW5kIHx8IGNwMk5vdEZvdW5kKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gY3JlYXRlIGNvbm5lY3RvclwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25uZWN0b3IuYXR0YWNobWVudFBvaW50MiA9IGFwMjtcclxuICAgICAgICBcclxuICAgICAgICAvL1N0b3JlIHRoZSBjb25uZWN0b3JcclxuICAgICAgICBjb25uZWN0b3IuYXR0YWNobWVudFBvaW50MS5jb25uZWN0b3JzLnB1c2goY29ubmVjdG9yKTtcclxuICAgICAgICBjb25uZWN0b3IuYXR0YWNobWVudFBvaW50Mi5jb25uZWN0b3JzLnB1c2goY29ubmVjdG9yKTtcclxuICAgICAgICBcclxuICAgICAgICAvL1VwZGF0ZSB0aGUgY29ubmVjdGlvblxyXG4gICAgICAgIGNvbm5lY3Rvci5wcm9wb2dhdGUoKTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5pbXBvcnQgR2xvYmFsVmFyaWFibGVzIGZyb20gJy4uL2dsb2JhbHZhcmlhYmxlcydcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPdXRwdXQgZXh0ZW5kcyBBdG9tIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlciAodmFsdWVzKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQWRkIGEgbmV3IG91dHB1dCB0byB0aGUgY3VycmVudCBtb2xlY3VsZVxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJlbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmFkZElPKFwib3V0cHV0XCIsIFwiR2VvbWV0cnlcIiwgdGhpcy5wYXJlbnQsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwifm51bWJlciBvciBnZW9tZXRyeX5cIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJvdXRwdXRcIjtcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIk91dHB1dFwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIk91dHB1dFwiO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMTY7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAxNTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcIm51bWJlciBvciBnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRJRChuZXdJRCl7XHJcbiAgICAgICAgdGhpcy51bmlxdWVJRCA9IG5ld0lEO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGNoaWxkLmRyYXcoKTsgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5yZWN0KHRoaXMueCAtIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLmhlaWdodC8yLCAyKnRoaXMucmFkaXVzLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMudGV4dEFsaWduID0gXCJlbmRcIjsgXHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFRleHQodGhpcy5uYW1lLCB0aGlzLnggKyB0aGlzLnJhZGl1cywgdGhpcy55LXRoaXMucmFkaXVzKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsKCk7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMubW92ZVRvKHRoaXMueCArIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLmhlaWdodC8yKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5saW5lVG8odGhpcy54ICsgdGhpcy5yYWRpdXMgKyAxMCwgdGhpcy55KTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5saW5lVG8odGhpcy54ICsgdGhpcy5yYWRpdXMsIHRoaXMueSArIHRoaXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmZpbGwoKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkbWUgZXh0ZW5kcyBBdG9te1xyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJSZWFkbWVcIjtcclxuICAgICAgICB0aGlzLnJlYWRtZVRleHQgPSBcIlJlYWRtZSB0ZXh0IGhlcmVcIjtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInJlYWRtZVwiO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUkVBRE1FXCI7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVTaWRlYmFyKCl7XHJcbiAgICAgICAgLy91cGRhdGVzIHRoZSBzaWRlYmFyIHRvIGRpc3BsYXkgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBub2RlXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHZhbHVlTGlzdCA9IHN1cGVyLnVwZGF0ZVNpZGViYXIoKTsgLy9jYWxsIHRoZSBzdXBlciBmdW5jdGlvblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRWRpdGFibGVWYWx1ZUxpc3RJdGVtKHZhbHVlTGlzdCx0aGlzLFwicmVhZG1lVGV4dFwiLCBcIk5vdGVzXCIsIGZhbHNlKTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlci5kcmF3KCk7IC8vU3VwZXIgY2FsbCB0byBkcmF3IHRoZSByZXN0XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kcmF3IHRoZSB0d28gc2xhc2hlcyBvbiB0aGUgbm9kZS8vXHJcbiAgICAgICAgYy5zdHJva2VTdHlsZSA9IFwiIzk0OTI5NFwiO1xyXG4gICAgICAgIGMubGluZVdpZHRoID0gMztcclxuICAgICAgICBjLmxpbmVDYXAgPSBcInJvdW5kXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBjLm1vdmVUbyh0aGlzLnggLSAxMSwgdGhpcy55ICsgMTApO1xyXG4gICAgICAgIGMubGluZVRvKHRoaXMueCwgdGhpcy55IC0gMTApO1xyXG4gICAgICAgIGMuc3Ryb2tlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBjLm1vdmVUbyh0aGlzLngsIHRoaXMueSArIDEwKTtcclxuICAgICAgICBjLmxpbmVUbyh0aGlzLnggKyAxMSwgdGhpcy55IC0gMTApO1xyXG4gICAgICAgIGMuc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFZhbHVlKG5ld1RleHQpIHtcclxuICAgICAgICB0aGlzLnJlYWRtZVRleHQgPSBuZXdUZXh0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXF1ZXN0UmVhZG1lKCl7XHJcbiAgICAgICAgLy9yZXF1ZXN0IGFueSBjb250cmlidXRpb25zIGZyb20gdGhpcyBhdG9tIHRvIHRoZSByZWFkbWVcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gW3RoaXMucmVhZG1lVGV4dF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlcmlhbGl6ZSh2YWx1ZXMpe1xyXG4gICAgICAgIC8vU2F2ZSB0aGUgcmVhZG1lIHRleHQgdG8gdGhlIHNlcmlhbCBzdHJlYW1cclxuICAgICAgICB2YXIgdmFsdWVzT2JqID0gc3VwZXIuc2VyaWFsaXplKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFsdWVzT2JqLnJlYWRtZVRleHQgPSB0aGlzLnJlYWRtZVRleHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlc09iajtcclxuICAgICAgICBcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBBdG9tIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIHN1cGVyKHZhbHVlcylcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJ4IGxlbmd0aFwiLCB0aGlzLCBcIm51bWJlclwiLCAxMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieSBsZW5ndGhcIiwgdGhpcywgXCJudW1iZXJcIiwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUmVjdGFuZ2xlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiUmVjdGFuZ2xlXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJzcXVhcmUoW354IGxlbmd0aH4sfnkgbGVuZ3Rofl0pXCI7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZ2VuZXJhdGUgdGhlIGNvcnJlY3QgY29kZWJsb2NrIGZvciB0aGlzIGF0b20gb24gY3JlYXRpb25cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWd1bGFyUG9seWdvbiBleHRlbmRzIEF0b20ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgc3VwZXIodmFsdWVzKVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcIm51bWJlciBvZiBzaWRlc1wiLCB0aGlzLCBcIm51bWJlclwiLCA2KTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJyYWRpdXNcIiwgdGhpcywgXCJudW1iZXJcIiwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUmVndWxhclBvbHlnb25cIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJSZWd1bGFyUG9seWdvblwiO1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgdGhlIHBvbHlnb24gY29kZSBibG9ja1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ29kZUJsb2NrKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVDb2RlQmxvY2soKSB7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gdGhpcy5idWlsZFBvbHlnb25Db2RlQmxvY2soKTtcclxuICAgICAgICBzdXBlci51cGRhdGVDb2RlQmxvY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBidWlsZFBvbHlnb25Db2RlQmxvY2soKSB7XHJcbiAgICAgICAgbGV0IHBvbHlnb24gPSBbXVxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmZpbmRJT1ZhbHVlKFwibnVtYmVyIG9mIHNpZGVzXCIpOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGFuZ2xlID0gaSAqIDIgKiBNYXRoLlBJIC8gdGhpcy5maW5kSU9WYWx1ZShcIm51bWJlciBvZiBzaWRlc1wiKSAtIE1hdGguUEkgLyAyO1xyXG4gICAgICAgICAgICBwb2x5Z29uLnB1c2goW1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kSU9WYWx1ZShcInJhZGl1c1wiKSAqIE1hdGguY29zKGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZmluZElPVmFsdWUoXCJyYWRpdXNcIikgKiBNYXRoLnNpbihhbmdsZSlcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBcInBvbHlnb24oXCIgKyBKU09OLnN0cmluZ2lmeShwb2x5Z29uKSArIFwiKVwiO1xyXG4gICAgfSAgICBcclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdGF0ZSBleHRlbmRzIEF0b20ge1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcylcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcIngtYXhpcyBkZWdyZWVzXCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInktYXhpcyBkZWdyZWVzXCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcInotYXhpcyBkZWdyZWVzXCIsIHRoaXMsIFwibnVtYmVyXCIsIDApO1xyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUm90YXRlXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiUm90YXRlXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJyb3RhdGUoW354LWF4aXMgZGVncmVlc34sfnktYXhpcyBkZWdyZWVzfix+ei1heGlzIGRlZ3JlZXN+XSx+Z2VvbWV0cnl+KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhbGUgZXh0ZW5kcyBBdG9te1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJtdWx0aXBsZVwiLCB0aGlzLCBcIm51bWJlclwiLCAxMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJTY2FsZVwiO1xyXG4gICAgICAgIHRoaXMuYXRvbVR5cGUgPSBcIlNjYWxlXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJ+Z2VvbWV0cnl+LnNjYWxlKH5tdWx0aXBsZX4pXCI7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgQXRvbSBmcm9tICcuLi9wcm90b3R5cGVzL2F0b20nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaHJpbmtXcmFwIGV4dGVuZHMgQXRvbXtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJvdXRwdXRcIiwgXCJnZW9tZXRyeVwiLCB0aGlzLCBcImdlb21ldHJ5XCIsIFwiXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiU2hyaW5rIFdyYXBcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJTaHJpbmtXcmFwXCI7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29kZUJsb2NrID0gXCJjaGFpbl9odWxsKHtjbG9zZWQ6IGZhbHNlfSwgWyBdKVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICB0aGlzLmlvVmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5jbG9zZWRTZWxlY3Rpb24gPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmlvVmFsdWVzICE9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgICAgIHRoaXMuaW9WYWx1ZXMuZm9yRWFjaChpb1ZhbHVlID0+IHsgLy9mb3IgZWFjaCBzYXZlZCB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIGlvVmFsdWUubmFtZSwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29kZUJsb2NrKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZUNvZGVCbG9jaygpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gdGhpcy5kZWZhdWx0Q29kZUJsb2NrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vR2VuZXJhdGUgdGhlIGNvZGUgYmxvY2sgc3RyaW5nXHJcbiAgICAgICAgdmFyIGFycmF5T2ZDaGlsZHJlblN0cmluZyA9IFwiWyBcIjtcclxuICAgICAgICB2YXIgbnVtYmVyT2ZFbGVtZW50cyA9IDA7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGlvID0+IHtcclxuICAgICAgICAgICAgaWYoaW8udHlwZSA9PSBcImlucHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgaWYobnVtYmVyT2ZFbGVtZW50cyA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGFycmF5T2ZDaGlsZHJlblN0cmluZyA9IGFycmF5T2ZDaGlsZHJlblN0cmluZyArIFwiLCBcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG51bWJlck9mRWxlbWVudHMgKz0gMTtcclxuICAgICAgICAgICAgICAgIGFycmF5T2ZDaGlsZHJlblN0cmluZyA9IGFycmF5T2ZDaGlsZHJlblN0cmluZyArIGlvLmdldFZhbHVlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgPSBhcnJheU9mQ2hpbGRyZW5TdHJpbmcgKyBcIl1cIjtcclxuICAgICAgICBcclxuICAgICAgICAvL0luc2VydCB0aGUgZ2VuZXJhdGVkIHN0cmluZyBpbnRvIHRoZSBjb2RlIGJsb2NrXHJcbiAgICAgICAgdmFyIHJlZ2V4ID0gL1xcWyguKylcXF0vZ2k7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSB0aGlzLmNvZGVCbG9jay5yZXBsYWNlKHJlZ2V4LCBhcnJheU9mQ2hpbGRyZW5TdHJpbmcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQWRkIHRoZSB0ZXh0IGZvciBvcGVuIG9yIGNsb3NlZFxyXG4gICAgICAgIHZhciBlbmRTdHJpbmc7XHJcbiAgICAgICAgaWYodGhpcy5jbG9zZWRTZWxlY3Rpb24gPT0gMCl7IC8vY2xvc2VkXHJcbiAgICAgICAgICAgIGVuZFN0cmluZyA9IFwiY2hhaW5faHVsbCh7Y2xvc2VkOiB0cnVlfVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBlbmRTdHJpbmcgPSBcImNoYWluX2h1bGwoe2Nsb3NlZDogZmFsc2V9XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciByZWdleCA9IC9eLis/XFx7KC4rPylcXH0vZ2k7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSB0aGlzLmNvZGVCbG9jay5yZXBsYWNlKHJlZ2V4LCBlbmRTdHJpbmcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2hyaW5rIHdyYXAgaXQgb25lIG1vcmUgdGltZSBpZiB3ZSBoYXZlIHNvbGlkIHNlbGVjdGVkXHJcbiAgICAgICAgaWYodGhpcy5jbG9zZWRTZWxlY3Rpb24gPT0gMil7XHJcbiAgICAgICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJjaGFpbl9odWxsKHtjbG9zZWQ6IHRydWV9LCBbXCIgKyB0aGlzLmNvZGVCbG9jayArIFwiXSlcIlxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL1NldCB0aGUgb3V0cHV0IG5vZGVzIHdpdGggbmFtZSAnZ2VvbWV0cnknIHRvIGJlIHRoZSBnZW5lcmF0ZWQgY29kZVxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkLnZhbHVlVHlwZSA9PSAnZ2VvbWV0cnknICYmIGNoaWxkLnR5cGUgPT0gJ291dHB1dCcpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuc2V0VmFsdWUodGhpcy5jb2RlQmxvY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9JZiB0aGlzIG1vbGVjdWxlIGlzIHNlbGVjdGVkLCBzZW5kIHRoZSB1cGRhdGVkIHZhbHVlIHRvIHRoZSByZW5kZXJlclxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKXtcclxuICAgICAgICAgICAgdGhpcy5zZW5kVG9SZW5kZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9EZWxldGUgb3IgYWRkIHBvcnRzIGFzIG5lZWRlZFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQ2hlY2sgdG8gc2VlIGlmIGFueSBvZiB0aGUgbG9hZGVkIHBvcnRzIGhhdmUgYmVlbiBjb25uZWN0ZWQgdG8uIElmIHRoZXkgaGF2ZSwgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgdGhpcy5pb1ZhbHVlcyBsaXN0IFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW9WYWx1ZXMuZm9yRWFjaChpb1ZhbHVlID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5uYW1lID09IGlvVmFsdWUubmFtZSAmJiBjaGlsZC5jb25uZWN0b3JzLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW9WYWx1ZXMuc3BsaWNlKHRoaXMuaW9WYWx1ZXMuaW5kZXhPZihpb1ZhbHVlKSwxKTsgLy9MZXQncyByZW1vdmUgaXQgZnJvbSB0aGUgaW9WYWx1ZXMgbGlzdFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCBvciBkZWxldGUgcG9ydHMgYXMgbmVlZGVkXHJcbiAgICAgICAgaWYodGhpcy5ob3dNYW55SW5wdXRQb3J0c0F2YWlsYWJsZSgpID09IDApeyAvL1dlIG5lZWQgdG8gbWFrZSBhIG5ldyBwb3J0IGF2YWlsYWJsZVxyXG4gICAgICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCIyRCBzaGFwZSBcIiArIGdlbmVyYXRlVW5pcXVlSUQoKSwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5ob3dNYW55SW5wdXRQb3J0c0F2YWlsYWJsZSgpID49IDIgJiYgdGhpcy5pb1ZhbHVlcy5sZW5ndGggPD0gMSl7ICAvL1dlIG5lZWQgdG8gcmVtb3ZlIHRoZSBlbXB0eSBwb3J0XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlRW1wdHlQb3J0KCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ29kZUJsb2NrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBob3dNYW55SW5wdXRQb3J0c0F2YWlsYWJsZSgpe1xyXG4gICAgICAgIHZhciBwb3J0c0F2YWlsYWJsZSA9IDA7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGlvID0+IHtcclxuICAgICAgICAgICAgaWYoaW8udHlwZSA9PSBcImlucHV0XCIgJiYgaW8uY29ubmVjdG9ycy5sZW5ndGggPT0gMCl7ICAgLy9pZiB0aGlzIHBvcnQgaXMgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgICBwb3J0c0F2YWlsYWJsZSA9IHBvcnRzQXZhaWxhYmxlICsgMTsgIC8vQWRkIG9uZSB0byB0aGUgY291bnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwb3J0c0F2YWlsYWJsZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWxldGVFbXB0eVBvcnQoKXtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goaW8gPT4ge1xyXG4gICAgICAgICAgICBpZihpby50eXBlID09IFwiaW5wdXRcIiAmJiBpby5jb25uZWN0b3JzLmxlbmd0aCA9PSAwICYmIHRoaXMuaG93TWFueUlucHV0UG9ydHNBdmFpbGFibGUoKSA+PSAyKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlSU8oXCJpbnB1dFwiLCBpby5uYW1lLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXJpYWxpemUoc2F2ZWRPYmplY3Qpe1xyXG4gICAgICAgIHZhciB0aGlzQXNPYmplY3QgPSBzdXBlci5zZXJpYWxpemUoc2F2ZWRPYmplY3QpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBpb1ZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpby50eXBlID09IFwiaW5wdXRcIil7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2F2ZUlPID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGlvLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW9WYWx1ZTogMTBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpb1ZhbHVlcy5wdXNoKHNhdmVJTyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBpb1ZhbHVlcy5mb3JFYWNoKGlvVmFsdWUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzQXNPYmplY3QuaW9WYWx1ZXMucHVzaChpb1ZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL1dyaXRlIHRoZSBzZWxlY3Rpb24gZm9yIGlmIHRoZSBjaGFpbiBpcyBjbG9zZWRcclxuICAgICAgICB0aGlzQXNPYmplY3QuY2xvc2VkU2VsZWN0aW9uID0gdGhpcy5jbG9zZWRTZWxlY3Rpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXNBc09iamVjdDtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlU2lkZWJhcigpe1xyXG4gICAgICAgIC8vVXBkYXRlIHRoZSBzaWRlIGJhciB0byBtYWtlIGl0IHBvc3NpYmxlIHRvIGNoYW5nZSB0aGUgbW9sZWN1bGUgbmFtZVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSBzdXBlci51cGRhdGVTaWRlYmFyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jcmVhdGVEcm9wRG93bih2YWx1ZUxpc3QsIHRoaXMsIFtcIkNsb3NlZFwiLCBcIk9wZW5cIiwgXCJTb2xpZFwiXSwgdGhpcy5jbG9zZWRTZWxlY3Rpb24sIFwiRW5kOlwiKTtcclxuICAgICAgICBcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGNoYW5nZUVxdWF0aW9uKG5ld1ZhbHVlKXtcclxuICAgICAgICB0aGlzLmNsb3NlZFNlbGVjdGlvbiA9IHBhcnNlSW50KG5ld1ZhbHVlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0b20gZnJvbSAnLi4vcHJvdG90eXBlcy9hdG9tJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhbnNsYXRlIGV4dGVuZHMgQXRvbXtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBzdXBlcih2YWx1ZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWRkSU8oXCJpbnB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieERpc3RcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwieURpc3RcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcImlucHV0XCIsIFwiekRpc3RcIiwgdGhpcywgXCJudW1iZXJcIiwgMCk7XHJcbiAgICAgICAgdGhpcy5hZGRJTyhcIm91dHB1dFwiLCBcImdlb21ldHJ5XCIsIHRoaXMsIFwiZ2VvbWV0cnlcIiwgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJUcmFuc2xhdGVcIjtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJUcmFuc2xhdGVcIjtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSBcIn5nZW9tZXRyeX4udHJhbnNsYXRlKFt+eERpc3R+LCB+eURpc3R+LCB+ekRpc3R+XSlcIjtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcclxuICAgIH1cclxufSIsImltcG9ydCBBdG9tIGZyb20gJy4uL3Byb3RvdHlwZXMvYXRvbSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVuaW9uIGV4dGVuZHMgQXRvbSB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIodmFsdWVzKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeTFcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwiaW5wdXRcIiwgXCJnZW9tZXRyeTJcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmFkZElPKFwib3V0cHV0XCIsIFwiZ2VvbWV0cnlcIiwgdGhpcywgXCJnZW9tZXRyeVwiLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlVuaW9uXCI7XHJcbiAgICAgICAgdGhpcy5hdG9tVHlwZSA9IFwiVW5pb25cIjtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2RlQmxvY2sgPSBcInVuaW9uKH5nZW9tZXRyeTF+LH5nZW9tZXRyeTJ+KVwiO1xyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNldFZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IEF0dGFjaG1lbnRQb2ludCBmcm9tICcuL2F0dGFjaG1lbnRwb2ludCdcclxuaW1wb3J0IEdsb2JhbFZhcmlhYmxlcyBmcm9tICcuLi9nbG9iYWx2YXJpYWJsZXMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpe1xyXG4gICAgICAgIC8vU2V0dXAgZGVmYXVsdCB2YWx1ZXNcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy54ID0gMDtcclxuICAgICAgICB0aGlzLnkgPSAwO1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29sb3IgPSAnI0YzRUZFRic7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvbG9yID0gXCIjNDg0ODQ4XCI7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSAnI0YzRUZFRic7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJuYW1lXCI7XHJcbiAgICAgICAgdGhpcy5wYXJlbnRNb2xlY3VsZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jb2RlQmxvY2sgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvZGVCbG9jayA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5pc01vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuQk9NbGlzdCA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHZhbHVlcykge1xyXG4gICAgICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZXNba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFZhbHVlcyh2YWx1ZXMpe1xyXG4gICAgICAgIC8vQXNzaWduIHRoZSBvYmplY3QgdG8gaGF2ZSB0aGUgcGFzc2VkIGluIHZhbHVlc1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHZhbHVlcykge1xyXG4gICAgICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZXNba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmlvVmFsdWVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLmlvVmFsdWVzLmZvckVhY2goaW9WYWx1ZSA9PiB7IC8vZm9yIGVhY2ggc2F2ZWQgdmFsdWVcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7ICAvL0ZpbmQgdGhlIG1hdGNoaW5nIElPIGFuZCBzZXQgaXQgdG8gYmUgdGhlIHNhdmVkIHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaW9WYWx1ZS5uYW1lID09IGlvLm5hbWUgJiYgaW8udHlwZSA9PSBcImlucHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpby5zZXRWYWx1ZShpb1ZhbHVlLmlvVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbnB1dFggPSB0aGlzLnggLSB0aGlzLnJhZGl1c1xyXG4gICAgICAgIHRoaXMub3V0cHV0WCA9IHRoaXMueCArIHRoaXMucmFkaXVzXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgY2hpbGQuZHJhdygpOyAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGMuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgICAgICAvL21ha2UgaXQgaW1wb3NpYmxlIHRvIGRyYXcgYXRvbXMgdG9vIGNsb3NlIHRvIHRoZSBlZGdlXHJcbiAgICAgICAgLy9ub3Qgc3VyZSB3aGF0IHggbGVmdCBtYXJnaW4gc2hvdWxkIGJlIGJlY2F1c2UgaWYgaXQncyB0b28gY2xvc2UgaXQgd291bGQgY292ZXIgZXhwYW5kZWQgdGV4dFxyXG4gICAgICAgIHZhciBjYW52YXNGbG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Zsb3ctY2FudmFzJyk7XHJcbiAgICAgICAgaWYgKHRoaXMueDx0aGlzLnJhZGl1cyozKXtcclxuICAgICAgICAgICAgICAgIHRoaXMueCs9IHRoaXMucmFkaXVzKjM7ICAgIFxyXG4gICAgICAgICAgICAgICAgYy5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnk8dGhpcy5yYWRpdXMqMil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5yYWRpdXM7IFxyXG4gICAgICAgICAgICAgICAgYy5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnggKyB0aGlzLnJhZGl1cyoyID4gY2FudmFzRmxvdy53aWR0aCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggLT0gdGhpcy5yYWRpdXMqMjsgXHJcbiAgICAgICAgICAgICAgICBjLmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMueSArIHRoaXMucmFkaXVzKjIgPiBjYW52YXNGbG93LmhlaWdodCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgLT0gdGhpcy5yYWRpdXM7IFxyXG4gICAgICAgICAgICAgICAgYy5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgIGMuYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYy50ZXh0QWxpZ24gPSBcInN0YXJ0XCI7IFxyXG4gICAgICAgIGMuZmlsbFRleHQodGhpcy5uYW1lLCB0aGlzLnggKyB0aGlzLnJhZGl1cywgdGhpcy55LXRoaXMucmFkaXVzKTtcclxuICAgICAgICBjLmZpbGwoKTtcclxuICAgICAgICBjLmNsb3NlUGF0aCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhZGRJTyh0eXBlLCBuYW1lLCB0YXJnZXQsIHZhbHVlVHlwZSwgZGVmYXVsdFZhbHVlKXtcclxuICAgICAgICBcclxuICAgICAgICAvL2NvbXB1dGUgdGhlIGJhc2VsaW5lIG9mZnNldCBmcm9tIHBhcmVudCBub2RlXHJcbiAgICAgICAgdmFyIG9mZnNldDtcclxuICAgICAgICBpZiAodHlwZSA9PSBcImlucHV0XCIpe1xyXG4gICAgICAgICAgICBvZmZzZXQgPSAtMSogdGFyZ2V0LnJhZGl1cztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gdGFyZ2V0LnJhZGl1cztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlucHV0ID0gbmV3IEF0dGFjaG1lbnRQb2ludCh7XHJcbiAgICAgICAgICAgIHBhcmVudE1vbGVjdWxlOiB0YXJnZXQsIFxyXG4gICAgICAgICAgICBkZWZhdWx0T2Zmc2V0WDogb2Zmc2V0LCBcclxuICAgICAgICAgICAgZGVmYXVsdE9mZnNldFk6IDAsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIHZhbHVlVHlwZTogdmFsdWVUeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB2YWx1ZTogZGVmYXVsdFZhbHVlLFxyXG4gICAgICAgICAgICB1bmlxdWVJRDogR2xvYmFsVmFyaWFibGVzLmdlbmVyYXRlVW5pcXVlSUQoKSxcclxuICAgICAgICAgICAgYXRvbVR5cGU6IFwiQXR0YWNobWVudFBvaW50XCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0YXJnZXQuY2hpbGRyZW4ucHVzaChpbnB1dCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlbW92ZUlPKHR5cGUsIG5hbWUsIHRhcmdldCl7XHJcbiAgICAgICAgLy9SZW1vdmUgdGhlIHRhcmdldCBJTyBhdHRhY2htZW50IHBvaW50XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGlvID0+IHtcclxuICAgICAgICAgICAgaWYoaW8ubmFtZSA9PSBuYW1lICYmIGlvLnR5cGUgPT0gdHlwZSl7XHJcbiAgICAgICAgICAgICAgICBpby5kZWxldGVTZWxmKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZSh0aGlzLmNoaWxkcmVuLmluZGV4T2YoaW8pLDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsaWNrRG93bih4LHkpe1xyXG4gICAgICAgIC8vUmV0dXJucyB0cnVlIGlmIHNvbWV0aGluZyB3YXMgZG9uZSB3aXRoIHRoZSBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBjbGlja1Byb2Nlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkLmNsaWNrRG93bih4LHkpID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgY2xpY2tQcm9jZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9JZiBub25lIG9mIHRoZSBjaGlsZHJlbiBwcm9jZXNzZWQgdGhlIGNsaWNrXHJcbiAgICAgICAgaWYoIWNsaWNrUHJvY2Vzc2VkKXtcclxuICAgICAgICBcclxuICAgICAgICAgICAgdmFyIGRpc3RGcm9tQ2xpY2sgPSBkaXN0QmV0d2VlblBvaW50cyh4LCB0aGlzLngsIHksIHRoaXMueSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoZGlzdEZyb21DbGljayA8IHRoaXMucmFkaXVzKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLnNlbGVjdGVkQ29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTW92aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTaWRlYmFyKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFRvUmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNsaWNrUHJvY2Vzc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvciA9IHRoaXMuZGVmYXVsdENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gY2xpY2tQcm9jZXNzZWQ7IFxyXG4gICAgfVxyXG5cclxuICAgIGRvdWJsZUNsaWNrKHgseSl7XHJcbiAgICAgICAgLy9yZXR1cm5zIHRydWUgaWYgc29tZXRoaW5nIHdhcyBkb25lIHdpdGggdGhlIGNsaWNrXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGNsaWNrUHJvY2Vzc2VkID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGRpc3RGcm9tQ2xpY2sgPSBkaXN0QmV0d2VlblBvaW50cyh4LCB0aGlzLngsIHksIHRoaXMueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGRpc3RGcm9tQ2xpY2sgPCB0aGlzLnJhZGl1cyl7XHJcbiAgICAgICAgICAgIGNsaWNrUHJvY2Vzc2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGNsaWNrUHJvY2Vzc2VkOyBcclxuICAgIH1cclxuXHJcbiAgICBjbGlja1VwKHgseSl7XHJcbiAgICAgICAgdGhpcy5pc01vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGNoaWxkLmNsaWNrVXAoeCx5KTsgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWNrTW92ZSh4LHkpe1xyXG4gICAgICAgIGlmICh0aGlzLmlzTW92aW5nID09IHRydWUpe1xyXG4gICAgICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5jbGlja01vdmUoeCx5KTsgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGtleVByZXNzKGtleSl7XHJcbiAgICAgICAgLy9ydW5zIHdoZW52ZXIgYSBrZXkgaXMgcHJlc3NlZFxyXG4gICAgICAgIGlmIChrZXkgPT0gJ0RlbGV0ZScpe1xyXG4gICAgICAgICAgICBpZih0aGlzLnNlbGVjdGVkID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVOb2RlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgY2hpbGQua2V5UHJlc3Moa2V5KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlU2lkZWJhcigpe1xyXG4gICAgICAgIC8vdXBkYXRlcyB0aGUgc2lkZWJhciB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGFib3V0IHRoaXMgbm9kZVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcmVtb3ZlIGV2ZXJ5dGhpbmcgaW4gdGhlIHNpZGVCYXIgbm93XHJcbiAgICAgICAgd2hpbGUgKHNpZGVCYXIuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBzaWRlQmFyLnJlbW92ZUNoaWxkKHNpZGVCYXIuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vYWRkIHRoZSBuYW1lIGFzIGEgdGl0bGVcclxuICAgICAgICB2YXIgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJyk7XHJcbiAgICAgICAgbmFtZS50ZXh0Q29udGVudCA9IHRoaXMubmFtZTtcclxuICAgICAgICBuYW1lLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXCJ0ZXh0LWFsaWduOmNlbnRlcjtcIik7XHJcbiAgICAgICAgc2lkZUJhci5hcHBlbmRDaGlsZChuYW1lKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0NyZWF0ZSBhIGxpc3QgZWxlbWVudFxyXG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIik7XHJcbiAgICAgICAgc2lkZUJhci5hcHBlbmRDaGlsZCh2YWx1ZUxpc3QpO1xyXG4gICAgICAgIHZhbHVlTGlzdC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItbGlzdFwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0FkZCBvcHRpb25zIHRvIHNldCBhbGwgb2YgdGhlIGlucHV0c1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkLnR5cGUgPT0gJ2lucHV0JyAmJiBjaGlsZC52YWx1ZVR5cGUgIT0gJ2dlb21ldHJ5Jyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbSh2YWx1ZUxpc3QsY2hpbGQsXCJ2YWx1ZVwiLCBjaGlsZC5uYW1lLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2YWx1ZUxpc3Q7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRlbGV0ZU5vZGUoKXtcclxuICAgICAgICAvL2RlbGV0ZXMgdGhpcyBub2RlIGFuZCBhbGwgb2YgaXQncyBjaGlsZHJlblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGNoaWxkLmRlbGV0ZVNlbGYoKTsgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wYXJlbnQubm9kZXNPblRoZVNjcmVlbi5zcGxpY2UodGhpcy5wYXJlbnQubm9kZXNPblRoZVNjcmVlbi5pbmRleE9mKHRoaXMpLDEpOyAvL3JlbW92ZSB0aGlzIG5vZGUgZnJvbSB0aGUgbGlzdFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgY2hpbGQudXBkYXRlKCk7ICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyYXcoKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXJpYWxpemUoc2F2ZWRPYmplY3Qpe1xyXG4gICAgICAgIC8vc2F2ZWRPYmplY3QgaXMgb25seSB1c2VkIGJ5IE1vbGVjdWxlIHR5cGUgYXRvbXNcclxuICAgICAgICBcclxuICAgICAgICB2YXIgaW9WYWx1ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goaW8gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaW8udmFsdWVUeXBlID09IFwibnVtYmVyXCIgJiYgaW8udHlwZSA9PSBcImlucHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHNhdmVJTyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpby5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGlvVmFsdWU6IGlvLmdldFZhbHVlKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpb1ZhbHVlcy5wdXNoKHNhdmVJTyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgb2JqZWN0ID0ge1xyXG4gICAgICAgICAgICBhdG9tVHlwZTogdGhpcy5hdG9tVHlwZSxcclxuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICAgICAgdW5pcXVlSUQ6IHRoaXMudW5pcXVlSUQsXHJcbiAgICAgICAgICAgIGlvVmFsdWVzOiBpb1ZhbHVlc1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXF1ZXN0Qk9NKCl7XHJcbiAgICAgICAgLy9SZXF1ZXN0IGFueSBjb250cmlidXRpb25zIGZyb20gdGhpcyBhdG9tIHRvIHRoZSBCT01cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL0ZpbmQgdGhlIG51bWJlciBvZiB0aGluZ3MgYXR0YWNoZWQgdG8gdGhpcyBvdXRwdXRcclxuICAgICAgICB2YXIgbnVtYmVyT2ZUaGlzSW5zdGFuY2UgPSAxO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChpbyA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlvLnR5cGUgPT0gXCJvdXRwdXRcIiAmJiBpby5jb25uZWN0b3JzLmxlbmd0aCAhPSAwKXtcclxuICAgICAgICAgICAgICAgIG51bWJlck9mVGhpc0luc3RhbmNlID0gaW8uY29ubmVjdG9ycy5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL0FuZCBzY2FsZSB1cCB0aGUgdG90YWwgbmVlZGVkIGJ5IHRoYXQgbnVtYmVyXHJcbiAgICAgICAgdGhpcy5CT01saXN0LmZvckVhY2goYm9tSXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGJvbUl0ZW0udG90YWxOZWVkZWQgPSBudW1iZXJPZlRoaXNJbnN0YW5jZSpib21JdGVtLm51bWJlck5lZWRlZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcy5CT01saXN0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXF1ZXN0UmVhZG1lKCl7XHJcbiAgICAgICAgLy9yZXF1ZXN0IGFueSBjb250cmlidXRpb25zIGZyb20gdGhpcyBhdG9tIHRvIHRoZSByZWFkbWVcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZUNvZGVCbG9jaygpe1xyXG4gICAgICAgIC8vU3Vic3RpdHV0ZSB0aGUgcmVzdWx0IGZyb20gZWFjaCBpbnB1dCBmb3IgdGhlIH4uLi5+IHNlY3Rpb24gd2l0aCBpdCdzIG5hbWVcclxuICAgICAgICBcclxuICAgICAgICB2YXIgcmVnZXggPSAvfiguKj8pfi9naTtcclxuICAgICAgICB0aGlzLmNvZGVCbG9jayA9IHRoaXMuZGVmYXVsdENvZGVCbG9jay5yZXBsYWNlKHJlZ2V4LCB4ID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZElPVmFsdWUoeCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgdGhlIG91dHB1dCBub2RlcyB3aXRoIG5hbWUgJ2dlb21ldHJ5JyB0byBiZSB0aGUgZ2VuZXJhdGVkIGNvZGVcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC52YWx1ZVR5cGUgPT0gJ2dlb21ldHJ5JyAmJiBjaGlsZC50eXBlID09ICdvdXRwdXQnKXtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnNldFZhbHVlKHRoaXMuY29kZUJsb2NrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vSWYgdGhpcyBtb2xlY3VsZSBpcyBzZWxlY3RlZCwgc2VuZCB0aGUgdXBkYXRlZCB2YWx1ZSB0byB0aGUgcmVuZGVyZXJcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZFRvUmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZW5kVG9SZW5kZXIoKXtcclxuICAgICAgICAvL1NlbmQgY29kZSB0byBKU0NBRCB0byByZW5kZXJcclxuICAgICAgICBpZiAodGhpcy5jb2RlQmxvY2sgIT0gXCJcIil7XHJcbiAgICAgICAgICAgIHZhciB0b1JlbmRlciA9IFwiZnVuY3Rpb24gbWFpbiAoKSB7cmV0dXJuIFwiICsgdGhpcy5jb2RlQmxvY2sgKyBcIn1cIlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgd2luZG93LmxvYWREZXNpZ24odG9SZW5kZXIsXCJNYXNsb3dDcmVhdGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vU2VuZCBzb21ldGhpbmcgaW52aXNpYmxlIGp1c3QgdG8gd2lwZSB0aGUgcmVuZGVyaW5nXHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdmFyIHRvUmVuZGVyID0gXCJmdW5jdGlvbiBtYWluICgpIHtyZXR1cm4gc3BoZXJlKHtyOiAuMDAwMSwgY2VudGVyOiB0cnVlfSl9XCJcclxuICAgICAgICAgICAgd2luZG93LmxvYWREZXNpZ24odG9SZW5kZXIsXCJNYXNsb3dDcmVhdGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5kSU9WYWx1ZShpb05hbWUpe1xyXG4gICAgICAgIC8vZmluZCB0aGUgdmFsdWUgb2YgYW4gaW5wdXQgZm9yIGEgZ2l2ZW4gbmFtZVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlvTmFtZSA9IGlvTmFtZS5zcGxpdCgnficpLmpvaW4oJycpO1xyXG4gICAgICAgIHZhciBpb1ZhbHVlID0gbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZihjaGlsZC5uYW1lID09IGlvTmFtZSAmJiBjaGlsZC50eXBlID09IFwiaW5wdXRcIil7XHJcbiAgICAgICAgICAgICAgICBpb1ZhbHVlID0gY2hpbGQuZ2V0VmFsdWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBpb1ZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0obGlzdCxvYmplY3Qsa2V5LCBsYWJlbCwgcmVzdWx0U2hvdWxkQmVOdW1iZXIpe1xyXG4gICAgICAgIHZhciBsaXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKTtcclxuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGxpc3RFbGVtZW50KTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL0RpdiB3aGljaCBjb250YWlucyB0aGUgZW50aXJlIGVsZW1lbnRcclxuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBsaXN0RWxlbWVudC5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgICAgIGRpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItaXRlbVwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0xlZnQgZGl2IHdoaWNoIGRpc3BsYXlzIHRoZSBsYWJlbFxyXG4gICAgICAgIHZhciBsYWJlbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGxhYmVsRGl2KTtcclxuICAgICAgICB2YXIgbGFiZWxUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGFiZWwgKyBcIjpcIik7XHJcbiAgICAgICAgbGFiZWxEaXYuYXBwZW5kQ2hpbGQobGFiZWxUZXh0KTtcclxuICAgICAgICBsYWJlbERpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItc3ViaXRlbVwiKTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL1JpZ2h0IGRpdiB3aGljaCBpcyBlZGl0YWJsZSBhbmQgZGlzcGxheXMgdGhlIHZhbHVlXHJcbiAgICAgICAgdmFyIHZhbHVlVGV4dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHZhbHVlVGV4dERpdik7XHJcbiAgICAgICAgdmFyIHZhbHVlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG9iamVjdFtrZXldKTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuYXBwZW5kQ2hpbGQodmFsdWVUZXh0KTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuc2V0QXR0cmlidXRlKFwiY29udGVudGVkaXRhYmxlXCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgdmFyIHRoaXNJRCA9IGxhYmVsK0dsb2JhbFZhcmlhYmxlcy5nZW5lcmF0ZVVuaXF1ZUlEKCk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXNJRCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpc0lEKS5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlSW5Cb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzSUQpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICBpZihyZXN1bHRTaG91bGRCZU51bWJlcil7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZUluQm94ID0gcGFyc2VGbG9hdCh2YWx1ZUluQm94KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9JZiB0aGUgdGFyZ2V0IGlzIGFuIGF0dGFjaG1lbnRQb2ludCB0aGVuIGNhbGwgdGhlIHNldHRlciBmdW5jdGlvblxyXG4gICAgICAgICAgICBpZihvYmplY3QgaW5zdGFuY2VvZiBBdHRhY2htZW50UG9pbnQpe1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0LnNldFZhbHVlKHZhbHVlSW5Cb3gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlSW5Cb3g7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL3ByZXZlbnQgdGhlIHJldHVybiBrZXkgZnJvbSBiZWluZyB1c2VkIHdoZW4gZWRpdGluZyBhIHZhbHVlXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpc0lEKS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgICAgICBpZiAoZXZ0LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzSUQpLmJsdXIoKTsgIC8vc2hpZnQgZm9jdXMgYXdheSBpZiBzb21lb25lIHByZXNzZXMgZW50ZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgY3JlYXRlTm9uRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3Qsb2JqZWN0LGtleSwgbGFiZWwsIHJlc3VsdFNob3VsZEJlTnVtYmVyKXtcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIik7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChsaXN0RWxlbWVudCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9EaXYgd2hpY2ggY29udGFpbnMgdGhlIGVudGlyZSBlbGVtZW50XHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgICBkaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLWl0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9MZWZ0IGRpdiB3aGljaCBkaXNwbGF5cyB0aGUgbGFiZWxcclxuICAgICAgICB2YXIgbGFiZWxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChsYWJlbERpdik7XHJcbiAgICAgICAgdmFyIGxhYmVsVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxhYmVsICsgXCI6XCIpO1xyXG4gICAgICAgIGxhYmVsRGl2LmFwcGVuZENoaWxkKGxhYmVsVGV4dCk7XHJcbiAgICAgICAgbGFiZWxEaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SaWdodCBkaXYgd2hpY2ggaXMgZWRpdGFibGUgYW5kIGRpc3BsYXlzIHRoZSB2YWx1ZVxyXG4gICAgICAgIHZhciB2YWx1ZVRleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh2YWx1ZVRleHREaXYpO1xyXG4gICAgICAgIHZhciB2YWx1ZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShvYmplY3Rba2V5XSk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LmFwcGVuZENoaWxkKHZhbHVlVGV4dCk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImNvbnRlbnRlZGl0YWJsZVwiLCBcImZhbHNlXCIpO1xyXG4gICAgICAgIHZhbHVlVGV4dERpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItc3ViaXRlbVwiKTtcclxuICAgICAgICB2YXIgdGhpc0lEID0gbGFiZWwrR2xvYmFsVmFyaWFibGVzLmdlbmVyYXRlVW5pcXVlSUQoKTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuc2V0QXR0cmlidXRlKFwiaWRcIiwgdGhpc0lEKTtcclxuICAgICAgICBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlRHJvcERvd24obGlzdCxwYXJlbnQsb3B0aW9ucyxzZWxlY3RlZE9wdGlvbiwgZGVzY3JpcHRpb24pe1xyXG4gICAgICAgIHZhciBsaXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKTtcclxuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGxpc3RFbGVtZW50KTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL0RpdiB3aGljaCBjb250YWlucyB0aGUgZW50aXJlIGVsZW1lbnRcclxuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBsaXN0RWxlbWVudC5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgICAgIGRpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItaXRlbVwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0xlZnQgZGl2IHdoaWNoIGRpc3BsYXlzIHRoZSBsYWJlbFxyXG4gICAgICAgIHZhciBsYWJlbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGxhYmVsRGl2KTtcclxuICAgICAgICB2YXIgbGFiZWxUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGVzY3JpcHRpb24pO1xyXG4gICAgICAgIGxhYmVsRGl2LmFwcGVuZENoaWxkKGxhYmVsVGV4dCk7XHJcbiAgICAgICAgbGFiZWxEaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzaWRlYmFyLXN1Yml0ZW1cIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SaWdodCBkaXYgd2hpY2ggaXMgZWRpdGFibGUgYW5kIGRpc3BsYXlzIHRoZSB2YWx1ZVxyXG4gICAgICAgIHZhciB2YWx1ZVRleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh2YWx1ZVRleHREaXYpO1xyXG4gICAgICAgIHZhciBkcm9wRG93biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XHJcbiAgICAgICAgb3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIHZhciBvcCA9IG5ldyBPcHRpb24oKTtcclxuICAgICAgICAgICAgb3AudmFsdWUgPSBvcHRpb25zLmZpbmRJbmRleCh0aGlzT3B0aW9uID0+IHRoaXNPcHRpb24gPT09IG9wdGlvbik7XHJcbiAgICAgICAgICAgIG9wLnRleHQgPSBvcHRpb247XHJcbiAgICAgICAgICAgIGRyb3BEb3duLm9wdGlvbnMuYWRkKG9wKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YWx1ZVRleHREaXYuYXBwZW5kQ2hpbGQoZHJvcERvd24pO1xyXG4gICAgICAgIHZhbHVlVGV4dERpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXItc3ViaXRlbVwiKTtcclxuICAgICAgICBcclxuICAgICAgICBkcm9wRG93bi5zZWxlY3RlZEluZGV4ID0gc2VsZWN0ZWRPcHRpb247IC8vZGlzcGxheSB0aGUgY3VycmVudCBzZWxlY3Rpb25cclxuICAgICAgICBcclxuICAgICAgICBkcm9wRG93bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2hhbmdlJyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHBhcmVudC5jaGFuZ2VFcXVhdGlvbihkcm9wRG93bi52YWx1ZSk7IH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVCdXR0b24obGlzdCxwYXJlbnQsYnV0dG9uVGV4dCxmdW5jdGlvblRvQ2FsbCl7XHJcbiAgICAgICAgdmFyIGxpc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpO1xyXG4gICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQobGlzdEVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vRGl2IHdoaWNoIGNvbnRhaW5zIHRoZSBlbnRpcmUgZWxlbWVudFxyXG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGxpc3RFbGVtZW50LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgICAgICAgZGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhci1pdGVtXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vTGVmdCBkaXYgd2hpY2ggZGlzcGxheXMgdGhlIGxhYmVsXHJcbiAgICAgICAgdmFyIGxhYmVsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobGFiZWxEaXYpO1xyXG4gICAgICAgIHZhciBsYWJlbFRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtcclxuICAgICAgICBsYWJlbERpdi5hcHBlbmRDaGlsZChsYWJlbFRleHQpO1xyXG4gICAgICAgIGxhYmVsRGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhci1zdWJpdGVtXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vUmlnaHQgZGl2IHdoaWNoIGlzIGJ1dHRvblxyXG4gICAgICAgIHZhciB2YWx1ZVRleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh2YWx1ZVRleHREaXYpO1xyXG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xyXG4gICAgICAgIHZhciBidXR0b25UZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGJ1dHRvblRleHQpO1xyXG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInNpZGViYXJfYnV0dG9uXCIpO1xyXG4gICAgICAgIGJ1dHRvbi5hcHBlbmRDaGlsZChidXR0b25UZXh0Tm9kZSk7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XHJcbiAgICAgICAgdmFsdWVUZXh0RGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwic2lkZWJhci1zdWJpdGVtXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnbW91c2Vkb3duJyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7IGZ1bmN0aW9uVG9DYWxsKHBhcmVudCk7IH0gLFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQk9NKGxpc3QscGFyZW50LEJPTWxpc3Qpe1xyXG4gICAgICAgIC8vYUJPTUVudHJ5ID0gbmV3IGJvbUVudHJ5O1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgzXCIpO1xyXG4gICAgICAgIGRpdi5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFwidGV4dC1hbGlnbjpjZW50ZXI7XCIpO1xyXG4gICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICAgICAgICB2YXIgdmFsdWVUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJCaWxsIE9mIE1hdGVyaWFsc1wiKTtcclxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQodmFsdWVUZXh0KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgeCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJIUlwiKTtcclxuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKHgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucmVxdWVzdEJPTSgpLmZvckVhY2goYm9tSXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuQk9NbGlzdC5pbmRleE9mKGJvbUl0ZW0pICE9IC0xKXsgLy9JZiB0aGUgYm9tIGl0ZW0gaXMgZnJvbSB0aGlzIG1vbGVjdWxlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJCT01pdGVtTmFtZVwiLCBcIkl0ZW1cIiwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJudW1iZXJOZWVkZWRcIiwgXCJOdW1iZXJcIiwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRWRpdGFibGVWYWx1ZUxpc3RJdGVtKGxpc3QsYm9tSXRlbSxcImNvc3RVU0RcIiwgXCJQcmljZVwiLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVFZGl0YWJsZVZhbHVlTGlzdEl0ZW0obGlzdCxib21JdGVtLFwic291cmNlXCIsIFwiU291cmNlXCIsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU5vbkVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJCT01pdGVtTmFtZVwiLCBcIkl0ZW1cIiwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU5vbkVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJ0b3RhbE5lZWRlZFwiLCBcIk51bWJlclwiLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVOb25FZGl0YWJsZVZhbHVlTGlzdEl0ZW0obGlzdCxib21JdGVtLFwiY29zdFVTRFwiLCBcIlByaWNlXCIsIHRydWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU5vbkVkaXRhYmxlVmFsdWVMaXN0SXRlbShsaXN0LGJvbUl0ZW0sXCJzb3VyY2VcIiwgXCJTb3VyY2VcIiwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiSFJcIik7XHJcbiAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoeCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jcmVhdGVCdXR0b24obGlzdCxwYXJlbnQsXCJBZGQgQk9NIEVudHJ5XCIsIHRoaXMuYWRkQk9NRW50cnkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhZGRCT01FbnRyeShzZWxmKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImFkZCBhIGJvbSBlbnRyeVwiKTtcclxuICAgICAgICBcclxuICAgICAgICBzZWxmLkJPTWxpc3QucHVzaChuZXcgQk9NRW50cnkoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2VsZi51cGRhdGVTaWRlYmFyKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IENvbm5lY3RvciBmcm9tICcuL2Nvbm5lY3RvcidcclxuaW1wb3J0IEdsb2JhbFZhcmlhYmxlcyBmcm9tICcuLi9nbG9iYWx2YXJpYWJsZXMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdHRhY2htZW50UG9pbnQge1xyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuIFxyXG4gICAgICAgIHRoaXMuZGVmYXVsdFJhZGl1cyA9IDg7XHJcbiAgICAgICAgdGhpcy5leHBhbmRlZFJhZGl1cyA9IDE0O1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gODtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhvdmVyRGV0ZWN0UmFkaXVzID0gODtcclxuICAgICAgICB0aGlzLmhvdmVyT2Zmc2V0WCA9IDA7XHJcbiAgICAgICAgdGhpcy5ob3Zlck9mZnNldFkgPSAwO1xyXG4gICAgICAgIHRoaXMudW5pcXVlSUQgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdE9mZnNldFggPSAwO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdE9mZnNldFkgPSAwO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0WCA9IDA7XHJcbiAgICAgICAgdGhpcy5vZmZzZXRZID0gMDtcclxuICAgICAgICB0aGlzLnNob3dIb3ZlclRleHQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJBdHRhY2htZW50UG9pbnRcIjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnZhbHVlVHlwZSA9IFwibnVtYmVyXCI7IC8vb3B0aW9ucyBhcmUgbnVtYmVyLCBnZW9tZXRyeSwgYXJyYXlcclxuICAgICAgICB0aGlzLnR5cGUgPSBcIm91dHB1dFwiO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSAxMDsgLy9UaGUgZGVmYXVsdCBpbnB1dCB2YWx1ZSB3aGVuIG5vdGhpbmcgaXMgY29ubmVjdGVkXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb25uZWN0b3JzID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vZmZzZXRYID0gdGhpcy5kZWZhdWx0T2Zmc2V0WDtcclxuICAgICAgICB0aGlzLm9mZnNldFkgPSB0aGlzLmRlZmF1bHRPZmZzZXRZO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHZhbHVlcykge1xyXG4gICAgICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZXNba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jbGlja01vdmUoMCwwKTsgLy90cmlnZ2VyIGEgcmVmcmVzaCB0byBnZXQgYWxsIHRoZSBjdXJyZW50IHZhbHVlc1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkcmF3KCkge1xyXG5cclxuICAgICAgICB2YXIgdHh0ID0gdGhpcy5uYW1lO1xyXG4gICAgICAgIHZhciB0ZXh0V2lkdGggPSBHbG9iYWxWYXJpYWJsZXMuYy5tZWFzdXJlVGV4dCh0eHQpLndpZHRoO1xyXG4gICAgICAgIHZhciBidWJibGVDb2xvciA9IFwiIzAwODA4MFwiO1xyXG4gICAgICAgIHZhciBzY2FsZVJhZGl1c0Rvd24gPSB0aGlzLnJhZGl1cyouNztcclxuICAgICAgICB2YXIgaGFsZlJhZGl1cyA9IHRoaXMucmFkaXVzKi41O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLnNob3dIb3ZlclRleHQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLnR5cGUgPT0gXCJpbnB1dFwiKXtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFN0eWxlID0gYnViYmxlQ29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmFkaXVzID09IHRoaXMuZXhwYW5kZWRSYWRpdXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5yZWN0KHRoaXMueCAtIHRleHRXaWR0aCAtIHRoaXMucmFkaXVzIC0gaGFsZlJhZGl1cywgdGhpcy55IC0gc2NhbGVSYWRpdXNEb3duLCB0ZXh0V2lkdGggKyB0aGlzLnJhZGl1cyArIGhhbGZSYWRpdXMgLCBzY2FsZVJhZGl1c0Rvd24qMik7XHJcbiAgICAgICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuYXJjKHRoaXMueCAtIHRleHRXaWR0aCAtIHRoaXMucmFkaXVzIC0gaGFsZlJhZGl1cywgdGhpcy55LCBzY2FsZVJhZGl1c0Rvd24sIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZih0aGlzLnJhZGl1cyA9PSB0aGlzLmRlZmF1bHRSYWRpdXMpe1xyXG4gICAgICAgICAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLnJlY3QodGhpcy54IC0gdGV4dFdpZHRoIC0gdGhpcy5yYWRpdXMgLSBoYWxmUmFkaXVzLCB0aGlzLnkgLSB0aGlzLnJhZGl1cywgdGV4dFdpZHRoICsgdGhpcy5yYWRpdXMgKyBoYWxmUmFkaXVzICwgdGhpcy5yYWRpdXMqMik7ICAgXHJcbiAgICAgICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuYXJjKHRoaXMueCAtIHRleHRXaWR0aCAtIHRoaXMucmFkaXVzIC0gaGFsZlJhZGl1cywgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmZpbGwoKTtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFN0eWxlID0gdGhpcy5wYXJlbnRNb2xlY3VsZS5kZWZhdWx0Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy50ZXh0QWxpZ24gPSBcImVuZFwiO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFRleHQodGhpcy5uYW1lLCB0aGlzLnggLSAodGhpcy5yYWRpdXMgKyAzKSwgdGhpcy55KzIpXHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5jbG9zZVBhdGgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsU3R5bGUgPSBidWJibGVDb2xvcjtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLnJlY3QodGhpcy54LCB0aGlzLnkgLSBzY2FsZVJhZGl1c0Rvd24sIHRleHRXaWR0aCArIHRoaXMucmFkaXVzICsgaGFsZlJhZGl1cywgc2NhbGVSYWRpdXNEb3duKjIpO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuYXJjKHRoaXMueCArIHRleHRXaWR0aCArIHRoaXMucmFkaXVzICsgaGFsZlJhZGl1cywgdGhpcy55LCBzY2FsZVJhZGl1c0Rvd24sIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5jbG9zZVBhdGgoKTtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFN0eWxlID0gdGhpcy5wYXJlbnRNb2xlY3VsZS5kZWZhdWx0Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy50ZXh0QWxpZ24gPSBcInN0YXJ0XCI7IFxyXG4gICAgICAgICAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbFRleHQodGhpcy5uYW1lLCAodGhpcy54ICsgaGFsZlJhZGl1cykgKyAodGhpcy5yYWRpdXMgKyAzKSwgdGhpcy55KzIpXHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5jbG9zZVBhdGgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5iZWdpblBhdGgoKTtcclxuICAgICAgICBHbG9iYWxWYXJpYWJsZXMuYy5maWxsU3R5bGUgPSB0aGlzLnBhcmVudE1vbGVjdWxlLmNvbG9yO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICAgICAgR2xvYmFsVmFyaWFibGVzLmMuZmlsbCgpO1xyXG4gICAgICAgIEdsb2JhbFZhcmlhYmxlcy5jLmNsb3NlUGF0aCgpOyAgXHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tEb3duKHgseSl7XHJcbiAgICAgICAgaWYoR2xvYmFsVmFyaWFibGVzLmRpc3RCZXR3ZWVuUG9pbnRzICh0aGlzLngsIHgsIHRoaXMueSwgeSkgPCB0aGlzLmRlZmF1bHRSYWRpdXMpe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy50eXBlID09ICdvdXRwdXQnKXsgICAgICAgICAgICAgICAgICAvL2JlZ2luIHRvIGV4dGVuZCBhIGNvbm5lY3RvciBmcm9tIHRoaXMgaWYgaXQgaXMgYW4gb3V0cHV0XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IENvbm5lY3Rvcih7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50TW9sZWN1bGU6IHRoaXMucGFyZW50TW9sZWN1bGUsIFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRQb2ludDE6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgYXRvbVR5cGU6IFwiQ29ubmVjdG9yXCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0b3JzLnB1c2goY29ubmVjdG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy50eXBlID09ICdpbnB1dCcpeyAvL2Nvbm5lY3RvcnMgY2FuIG9ubHkgYmUgc2VsZWN0ZWQgYnkgY2xpY2tpbmcgb24gYW4gaW5wdXRcclxuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdG9ycy5mb3JFYWNoKGNvbm5lY3RvciA9PiB7ICAgICAvL3NlbGVjdCBhbnkgY29ubmVjdG9ycyBhdHRhY2hlZCB0byB0aGlzIG5vZGVcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3Iuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvL2luZGljYXRlIHRoYXQgdGhlIGNsaWNrIHdhcyBoYW5kbGVkIGJ5IHRoaXMgb2JqZWN0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHlwZSA9PSAnaW5wdXQnKXsgLy9jb25uZWN0b3JzIGNhbiBvbmx5IGJlIHNlbGVjdGVkIGJ5IGNsaWNraW5nIG9uIGFuIGlucHV0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4geyAgICAgIC8vdW5zZWxlY3QgYW55IGNvbm5lY3RvcnMgYXR0YWNoZWQgdG8gdGhpcyBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vaW5kaWNhdGUgdGhhdCB0aGUgY2xpY2sgd2FzIG5vdCBoYW5kbGVkIGJ5IHRoaXMgb2JqZWN0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsaWNrVXAoeCx5KXtcclxuICAgICAgICB0aGlzLmNvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4ge1xyXG4gICAgICAgICAgICBjb25uZWN0b3IuY2xpY2tVcCh4LCB5KTsgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tNb3ZlKHgseSl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9leHBhbmQgaWYgdG91Y2hlZCBieSBtb3VzZVxyXG4gICAgICAgIHZhciBkaXN0RnJvbUN1cnNvciA9IEdsb2JhbFZhcmlhYmxlcy5kaXN0QmV0d2VlblBvaW50cyAodGhpcy54LCB4LCB0aGlzLnksIHkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vSWYgd2UgYXJlIGhvdmVyaW5nIG92ZXIgdGhlIGF0dGFjaG1lbnQgcG9pbnQsIGluZGljYXRlIHRoYXQgYnkgbWFraW5nIGl0IGJpZ1xyXG4gICAgICAgIGlmIChkaXN0RnJvbUN1cnNvciA8IHRoaXMuZGVmYXVsdFJhZGl1cyl7XHJcbiAgICAgICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy5leHBhbmRlZFJhZGl1cztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5yYWRpdXMgPSB0aGlzLmRlZmF1bHRSYWRpdXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vSWYgd2UgYXJlIGNsb3NlIHRvIHRoZSBhdHRhY2htZW50IHBvaW50IG1vdmUgaXQgdG8gaXQncyBob3ZlciBsb2NhdGlvbiB0byBtYWtlIGl0IGFjY2Vzc2libGVcclxuICAgICAgICAvL0NoYW5nZSBkaXJlY3Rpb24gb2YgaG92ZXIgZHJvcCBkb3duIGlmIHRvbyBjbG9zZSB0byB0aGUgdG9wLlxyXG4gICAgICAgIGlmIChkaXN0RnJvbUN1cnNvciA8IHRoaXMuaG92ZXJEZXRlY3RSYWRpdXMpe1xyXG5cclxuICAgICAgICAgICAgdmFyIG51bUF0dGFjaG1lbnRQb2ludHM9IHRoaXMucGFyZW50TW9sZWN1bGUuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgYXR0YWNobWVudFBvaW50TnVtYmVyID0gdGhpcy5wYXJlbnRNb2xlY3VsZS5jaGlsZHJlbi5pbmRleE9mKHRoaXMpOyAgXHJcbiAgICAgICBcclxuICAgICAgICAgICAgIC8vIGlmIGlucHV0IHR5cGUgdGhlbiBvZmZzZXQgZmlyc3QgZWxlbWVudCBkb3duIHRvIGdpdmUgc3BhY2UgZm9yIHJhZGlhbCBtZW51IFxyXG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09IFwib3V0cHV0XCIpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRYID0gdGhpcy5kZWZhdWx0T2Zmc2V0WDtcclxuICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0WSA9IHRoaXMuZGVmYXVsdE9mZnNldFk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciBhbmdsZVBlcklPID0gMi4wOTQ0LyBudW1BdHRhY2htZW50UG9pbnRzOyAvLzEyMCBkZWcvbnVtXHJcbiAgICAgICAgICAgICAgICAvLyBhbmdsZSBjb3JyZWN0aW9uIHNvIHRoYXQgaXQgY2VudGVycyBtZW51IGFkanVzdGluZyB0byBob3dldmVyIG1hbnkgYXR0YWNobWVudCBwb2ludHMgdGhlcmUgYXJlIFxyXG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlQ29ycmVjdGlvbiA9IGFuZ2xlUGVySU8gKiAobnVtQXR0YWNobWVudFBvaW50cyAtIDIgLyogLTEgY29ycmVjdGlvbiArIDEgZm9yIFwib3V0cHV0XCIgSU8gKi8pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaG92ZXJPZmZzZXRZID0gTWF0aC5yb3VuZCggMS41KiB0aGlzLnBhcmVudE1vbGVjdWxlLnJhZGl1cyAqIChNYXRoLnNpbigtYW5nbGVDb3JyZWN0aW9uICsgYW5nbGVQZXJJTyAqIDIgKiBhdHRhY2htZW50UG9pbnROdW1iZXIpKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdmVyT2Zmc2V0WCA9IC1NYXRoLnJvdW5kKDEuNSogdGhpcy5wYXJlbnRNb2xlY3VsZS5yYWRpdXMgKiAoTWF0aC5jb3MoLWFuZ2xlQ29ycmVjdGlvbiArIGFuZ2xlUGVySU8gKiAyICogYXR0YWNobWVudFBvaW50TnVtYmVyKSkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRYID0gdGhpcy5ob3Zlck9mZnNldFg7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRZID0gdGhpcy5ob3Zlck9mZnNldFk7ICBcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0hvdmVyVGV4dCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuaG92ZXJEZXRlY3RSYWRpdXMgPSB0aGlzLmRlZmF1bHRSYWRpdXMgKyBHbG9iYWxWYXJpYWJsZXMuZGlzdEJldHdlZW5Qb2ludHMgKHRoaXMuZGVmYXVsdE9mZnNldFgsIHRoaXMuaG92ZXJPZmZzZXRYLCB0aGlzLmRlZmF1bHRPZmZzZXRZLCB0aGlzLmhvdmVyT2Zmc2V0WSk7IFxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0WCA9IHRoaXMuZGVmYXVsdE9mZnNldFg7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0WSA9IHRoaXMuZGVmYXVsdE9mZnNldFk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0hvdmVyVGV4dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdmVyRGV0ZWN0UmFkaXVzID0gdGhpcy5kZWZhdWx0UmFkaXVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4ge1xyXG4gICAgICAgICAgICBjb25uZWN0b3IuY2xpY2tNb3ZlKHgsIHkpOyAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAga2V5UHJlc3Moa2V5KXtcclxuICAgICAgICB0aGlzLmNvbm5lY3RvcnMuZm9yRWFjaChjb25uZWN0b3IgPT4ge1xyXG4gICAgICAgICAgICBjb25uZWN0b3Iua2V5UHJlc3Moa2V5KTsgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRlbGV0ZVNlbGYoKXtcclxuICAgICAgICAvL3JlbW92ZSBhbnkgY29ubmVjdG9ycyB3aGljaCB3ZXJlIGF0dGFjaGVkIHRvIHRoaXMgYXR0YWNobWVudCBwb2ludFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29ubmVjdG9ycy5mb3JFYWNoKGNvbm5lY3RvciA9PiB7XHJcbiAgICAgICAgICAgIGNvbm5lY3Rvci5kZWxldGVTZWxmKCk7ICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVTaWRlYmFyKCl7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQudXBkYXRlU2lkZWJhcigpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB3YXNDb25uZWN0aW9uTWFkZSh4LHksIGNvbm5lY3Rvcil7XHJcbiAgICAgICAgLy90aGlzIGZ1bmN0aW9uIHJldHVybnMgaXRzZWxmIGlmIHRoZSBjb29yZGluYXRlcyBwYXNzZWQgaW4gYXJlIHdpdGhpbiBpdHNlbGZcclxuICAgICAgICBpZiAoR2xvYmFsVmFyaWFibGVzLmRpc3RCZXR3ZWVuUG9pbnRzKHRoaXMueCwgeCwgdGhpcy55LCB5KSA8IHRoaXMucmFkaXVzICYmIHRoaXMudHlwZSA9PSAnaW5wdXQnKXsgIC8vSWYgd2UgaGF2ZSByZWxlYXNlZCB0aGUgbW91c2UgaGVyZSBhbmQgdGhpcyBpcyBhbiBpbnB1dC4uLlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy5jb25uZWN0b3JzLmxlbmd0aCA+IDApeyAvL0Rvbid0IGFjY2VwdCBhIHNlY29uZCBjb25uZWN0aW9uIHRvIGFuIGlucHV0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdG9ycy5wdXNoKGNvbm5lY3Rvcik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXRWYWx1ZSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRWYWx1ZShuZXdWYWx1ZSl7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcHJvcGlnYXRlIHRoZSBjaGFuZ2UgdG8gbGlua2VkIGVsZW1lbnRzIGlmIHRoaXMgaXMgYW4gb3V0cHV0XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSAnb3V0cHV0Jyl7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdG9ycy5mb3JFYWNoKGNvbm5lY3RvciA9PiB7ICAgICAvL3NlbGVjdCBhbnkgY29ubmVjdG9ycyBhdHRhY2hlZCB0byB0aGlzIG5vZGVcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rvci5wcm9wb2dhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vaWYgdGhpcyBpcyBhbiBpbnB1dFxyXG4gICAgICAgIGVsc2V7ICAgLy91cGRhdGUgdGhlIGNvZGUgYmxvY2sgdG8gcmVmbGVjdCB0aGUgbmV3IHZhbHVlc1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudE1vbGVjdWxlLnVwZGF0ZUNvZGVCbG9jaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMucGFyZW50TW9sZWN1bGUueCArIHRoaXMub2Zmc2V0WDtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnBhcmVudE1vbGVjdWxlLnkgKyB0aGlzLm9mZnNldFk7XHJcbiAgICAgICAgdGhpcy5kcmF3KClcclxuICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29ubmVjdG9ycy5mb3JFYWNoKGNvbm5lY3RvciA9PiB7XHJcbiAgICAgICAgICAgIGNvbm5lY3Rvci51cGRhdGUoKTsgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0b3Ige1xyXG4gICAgY29uc3RydWN0b3IodmFsdWVzKXtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlzTW92aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gJ2JsYWNrJztcclxuICAgICAgICB0aGlzLmF0b21UeXBlID0gXCJDb25uZWN0b3JcIjtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdHRhY2htZW50UG9pbnQxID0gbnVsbDtcclxuICAgICAgICB0aGlzLmF0dGFjaG1lbnRQb2ludDIgPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHZhbHVlcykge1xyXG4gICAgICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZXNba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zdGFydFggPSB0aGlzLnBhcmVudE1vbGVjdWxlLm91dHB1dFg7XHJcbiAgICAgICAgdGhpcy5zdGFydFkgPSB0aGlzLnBhcmVudE1vbGVjdWxlLnk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRyYXcoKXtcclxuICAgICAgICBcclxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGMuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgICAgICBjLnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgICAgICBjLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1vdmVyJzsgLy9kcmF3IHVuZGVyIG90aGVyIGVsZW1lbnRzO1xyXG4gICAgICAgIGlmKHRoaXMuc2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICBjLmxpbmVXaWR0aCA9IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGMubGluZVdpZHRoID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYy5tb3ZlVG8odGhpcy5zdGFydFgsIHRoaXMuc3RhcnRZKTtcclxuICAgICAgICBjLmJlemllckN1cnZlVG8odGhpcy5zdGFydFggKyAxMDAsIHRoaXMuc3RhcnRZLCB0aGlzLmVuZFggLSAxMDAsIHRoaXMuZW5kWSwgdGhpcy5lbmRYLCB0aGlzLmVuZFkpO1xyXG4gICAgICAgIGMuc3Ryb2tlKCk7XHJcbiAgICAgICAgYy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInOyAvL3N3aXRjaCBiYWNrIHRvIGRyYXdpbmcgb24gdG9wXHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tVcCh4LHkpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuaXNNb3ZpbmcpeyAgLy93ZSBvbmx5IHdhbnQgdG8gYXR0YWNoIHRoZSBjb25uZWN0b3Igd2hpY2ggaXMgY3VycmVudGx5IG1vdmluZ1xyXG4gICAgICAgICAgICBjdXJyZW50TW9sZWN1bGUubm9kZXNPblRoZVNjcmVlbi5mb3JFYWNoKG1vbGVjdWxlID0+IHsgICAgICAgICAgICAgICAgICAgICAgLy9Gb3IgZXZlcnkgbW9sZWN1bGUgb24gdGhlIHNjcmVlbiAgXHJcbiAgICAgICAgICAgICAgICBtb2xlY3VsZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0ZvciBlYWNoIG9mIHRoZWlyIGF0dGFjaG1lbnQgcG9pbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNDb25uZWN0aW9uVmFsaWQgPSBjaGlsZC53YXNDb25uZWN0aW9uTWFkZSh4LHksIHRoaXMpOyAgICAgICAvL0NoZWNrIHRvIHNlZSBpZiB3ZSBtYWRlIGEgY29ubmVjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXNDb25uZWN0aW9uVmFsaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaG1lbnRQb2ludDIgPSB0aGlzQ29ubmVjdGlvblZhbGlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BvZ2F0ZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZW5kIGluZm9ybWF0aW9uIGZyb20gb25lIHBvaW50IHRvIHRoZSBvdGhlclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNobWVudFBvaW50MiA9PSBudWxsKXsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0lmIHdlIGhhdmUgbm90IG1hZGUgYSBjb25uZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlU2VsZigpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0RlbGV0ZSB0aGlzIGNvbm5lY3RvclxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlzTW92aW5nID0gZmFsc2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Nb3ZlIG92ZXIgXHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tNb3ZlKHgseSl7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNNb3ZpbmcgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kWCA9IHg7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kWSA9IHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBrZXlQcmVzcyhrZXkpe1xyXG4gICAgICAgIGlmKHRoaXMuc2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09ICdEZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlU2VsZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWxldGVTZWxmKCl7XHJcbiAgICAgICAgLy9GcmVlIHVwIHRoZSBpbnB1dCB0byB3aGljaCB0aGlzIHdhcyBhdHRhY2hlZFxyXG4gICAgICAgIGlmKHRoaXMuYXR0YWNobWVudFBvaW50MiAhPSBudWxsKXtcclxuICAgICAgICAgICAgdGhpcy5hdHRhY2htZW50UG9pbnQyLmNvbm5lY3RvcnMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9SZW1vdmUgdGhpcyBjb25uZWN0b3IgZnJvbSB0aGUgb3V0cHV0IGl0IGlzIGF0dGFjaGVkIHRvXHJcbiAgICAgICAgdGhpcy5hdHRhY2htZW50UG9pbnQxLmNvbm5lY3RvcnMuc3BsaWNlKHRoaXMuYXR0YWNobWVudFBvaW50MS5jb25uZWN0b3JzLmluZGV4T2YodGhpcyksMSk7IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXJpYWxpemUoKXtcclxuICAgICAgICBpZiAoIHRoaXMuYXR0YWNobWVudFBvaW50MiAhPSBudWxsKXtcclxuICAgICAgICAgICAgdmFyIG9iamVjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFwMU5hbWU6IHRoaXMuYXR0YWNobWVudFBvaW50MS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgYXAyTmFtZTogdGhpcy5hdHRhY2htZW50UG9pbnQyLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBhcDFJRDogdGhpcy5hdHRhY2htZW50UG9pbnQxLnBhcmVudE1vbGVjdWxlLnVuaXF1ZUlELFxyXG4gICAgICAgICAgICAgICAgYXAySUQ6IHRoaXMuYXR0YWNobWVudFBvaW50Mi5wYXJlbnRNb2xlY3VsZS51bmlxdWVJRFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmplY3QpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvcG9nYXRlKCl7XHJcbiAgICAgICAgLy90YWtlcyB0aGUgaW5wdXQgYW5kIHBhc3NlcyBpdCB0byB0aGUgb3V0cHV0XHJcbiAgICAgICAgdGhpcy5hdHRhY2htZW50UG9pbnQyLnNldFZhbHVlKHRoaXMuYXR0YWNobWVudFBvaW50MS5nZXRWYWx1ZSgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RhcnRYID0gdGhpcy5hdHRhY2htZW50UG9pbnQxLnhcclxuICAgICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuYXR0YWNobWVudFBvaW50MS55XHJcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNobWVudFBvaW50Mil7ICAvL2NoZWNrIHRvIHNlZSBpZiB0aGUgYXR0YWNobWVudCBwb2ludCBpcyBkZWZpbmVkXHJcbiAgICAgICAgICAgIHRoaXMuZW5kWCA9IHRoaXMuYXR0YWNobWVudFBvaW50Mi54O1xyXG4gICAgICAgICAgICB0aGlzLmVuZFkgPSB0aGlzLmF0dGFjaG1lbnRQb2ludDIueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kcmF3KClcclxuICAgIH1cclxuICAgIFxyXG4gICAgd2FzQ29ubmVjdGlvbk1hZGUoeCx5LCBjb25uZWN0b3Ipe1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbn0iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUNoRkE7QUFDQTs7O0FBQUE7QUFDQTs7O0FBQUE7QUFDQTs7Ozs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pIQTtBQUVBO0FBQUE7QUFDQTtBQURBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRUE7QUFBQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFIQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBOzs7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTs7O0FBRUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTs7O0FBRUE7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7OztBQUVBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFKQTtBQVNBO0FBQ0E7Ozs7OztBQTlkQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNEQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFBQTtBQUNBOzs7QUFDQTtBQUNBOzs7Ozs7O0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWxCQTtBQUNBO0FBb0JBO0FBQ0E7QUFEQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVFQTtBQUNBOzs7Ozs7O0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFRQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFOQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQXJLQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7Ozs7Ozs7Ozs7O0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWhCQTtBQWlCQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQWpDQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBOzs7QUFBQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF0QkE7QUF1QkE7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7OztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUVBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBdEVBO0FBQ0E7QUFEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSEE7QUFDQTs7Ozs7Ozs7Ozs7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYkE7QUFjQTtBQUNBOztBQWpCQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFmQTtBQWdCQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXhCQTtBQUNBO0FBMEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7QUFsRkE7QUFDQTtBQURBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFiQTtBQWNBO0FBQ0E7O0FBakJBO0FBQ0E7QUFEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFiQTtBQWNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFDQTtBQVFBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUE3RkE7QUFDQTtBQURBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTs7O0FBQUE7QUFDQTs7Ozs7Ozs7Ozs7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBREE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWpCQTtBQWtCQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7Ozs7QUE1RkE7QUFDQTtBQURBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFiQTtBQWNBO0FBQ0E7O0FBakJBO0FBQ0E7QUFEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTs7Ozs7Ozs7Ozs7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWZBO0FBZ0JBO0FBQ0E7O0FBbkJBO0FBQ0E7QUFEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7OztBQUFBO0FBQ0E7Ozs7Ozs7Ozs7O0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFDQTtBQVFBO0FBdkJBO0FBd0JBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVVBO0FBQ0E7QUFFQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBWEE7QUFDQTtBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQWpXQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSEE7QUFDQTs7O0FBQUE7QUFDQTs7Ozs7Ozs7Ozs7QUFFQTs7O0FBRUE7QUFBQTtBQUNBO0FBRUE7QUFIQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbEJBO0FBbUJBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQTlDQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKQTtBQUNBOzs7Ozs7Ozs7OztBQUVBOzs7QUFDQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVZBO0FBV0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7QUE3REE7QUFDQTtBQURBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFmQTtBQWdCQTtBQUNBOztBQW5CQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBOzs7Ozs7Ozs7OztBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFEQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWJBO0FBY0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTs7OztBQWxDQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7Ozs7Ozs7Ozs7O0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFmQTtBQWdCQTtBQUNBOztBQW5CQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7Ozs7Ozs7Ozs7O0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWJBO0FBY0E7QUFDQTs7QUFqQkE7QUFDQTtBQURBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTs7Ozs7Ozs7Ozs7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBREE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBcEJBO0FBcUJBO0FBQ0E7OztBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7OztBQXhKQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7Ozs7Ozs7Ozs7O0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQURBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFkQTtBQWVBO0FBQ0E7O0FBbEJBO0FBQ0E7QUFEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTs7Ozs7Ozs7Ozs7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYkE7QUFjQTtBQUNBOztBQWpCQTtBQUNBO0FBREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTs7O0FBQUE7QUFDQTs7Ozs7OztBQUNBO0FBRUE7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7OztBQUNBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVEE7QUFXQTtBQUNBOzs7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBQ0E7QUFRQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQUE7QUFHQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFBQTtBQUdBOzs7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQXppQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSEE7QUFDQTs7O0FBQUE7QUFDQTs7Ozs7OztBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBRUE7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFNQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUF2T0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFNQTtBQUNBO0FBQ0E7OztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQTtBQUNBO0FBQ0E7Ozs7OztBQWpIQTs7OztBIiwic291cmNlUm9vdCI6IiJ9