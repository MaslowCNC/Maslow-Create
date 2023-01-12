import GlobalVariables from './js/globalvariables'
import Molecule from './js/molecules/molecule.js'
import GitHubMolecule from './js/molecules/githubmolecule.js'
import {cmenu, showGitHubSearch} from './js/NewMenu.js'
import initOpenCascade from "opencascade.js";

import { visualizeShapes } from "./js/visualize.js";


GlobalVariables.canvas = document.querySelector('canvas')
GlobalVariables.c = GlobalVariables.canvas.getContext('2d')
GlobalVariables.runMode = window.location.href.includes('run') //Check if we are using the run mode based on url

GlobalVariables.canvas.width = window.innerWidth
GlobalVariables.canvas.height = window.innerHeight/2.5

// Event Listeners
/** 
 * The canvas on which the atoms are placed.
 * @type {object}
 */
let flowCanvas = document.getElementById('flow-canvas')
var longTouchTimer
var lastMoveTouch
/** 
 * The last time a touch was detected...used for timing a long touch.
 */
var lastTouchTime = new Date().getTime()

//const scene = setupThreeJSViewport();

initOpenCascade().then(oc => {

    const sphereSize  = .6;
    const box = new oc.BRepPrimAPI_MakeBox_2(1, 1, 1);
    const sphere = new oc.BRepPrimAPI_MakeSphere_5(new oc.gp_Pnt_3(0.5, 0.5, 0.5), sphereSize);
    const cut = new oc.BRepAlgoAPI_Cut_3(box.Shape(), sphere.Shape(), new oc.Message_ProgressRange_1());
    cut.Build(new oc.Message_ProgressRange_1());
    const dataBlob = visualizeShapes(oc, cut.Shape());
    
    document.getElementById('modelViewer').src = dataBlob;

});

flowCanvas.addEventListener('touchstart', event => {
    
    //Keep track of this for the touch up
    lastMoveTouch = event.touches[0]
    GlobalVariables.touchInterface = true
    
    //Check for a double touch
    var timesinceLastTouch = new Date().getTime() - lastTouchTime
    if((timesinceLastTouch < 600) && (timesinceLastTouch > 0)){
        onDoubleClick(event.touches[0])
    }
    else{
        onMouseDown(event.touches[0])
    }
    
    lastTouchTime = new Date().getTime()
    
    //This should be a fake right click 
    longTouchTimer = setTimeout(function() {
        const downEvt = new MouseEvent('mousedown', {
            clientX: event.touches[0].clientX,
            clientY: event.touches[0].clientY,
            which: 3,
            button: 2,
            detail: 1
        })
        document.getElementById('flow-canvas').dispatchEvent(downEvt)
    }, 1500)
})
flowCanvas.addEventListener('mousedown', event => {
    onMouseDown(event)
})


flowCanvas.addEventListener('touchmove', event => {
    lastMoveTouch = event.touches[0]
    clearTimeout(longTouchTimer)
    onMouseMove(lastMoveTouch)
})
flowCanvas.addEventListener('mousemove', event => {
    onMouseMove(event)
})

flowCanvas.addEventListener('dblclick', event => {
    onDoubleClick(event)
})

document.addEventListener('mouseup',(e)=>{
    if(e.srcElement.tagName.toLowerCase() !== ("textarea")
        && e.srcElement.tagName.toLowerCase() !== ("input")
        && e.srcElement.tagName.toLowerCase() !== ("select")
        &&(!e.srcElement.isContentEditable)){
        //puts focus back into mainbody after clicking button
        document.activeElement.blur()
        document.getElementById("mainBody").focus()
    }
})
flowCanvas.addEventListener('touchend', () => {
    clearTimeout(longTouchTimer)
    onMouseUp(lastMoveTouch)
})
flowCanvas.addEventListener('mouseup', event => {
    onMouseUp(event)
})

/** 
* Called by mouse down
*/
function onMouseDown(event){
    
    var isRightMB
    if ("which" in event){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = event.which == 3
    }
    else if ("button" in event){  // IE, Opera 
        isRightMB = event.button == 2
    }
    if(isRightMB){
        return
    }

    var clickHandledByMolecule = false

    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        
        if (molecule.clickDown(event.clientX,event.clientY,clickHandledByMolecule) == true){
            clickHandledByMolecule = true
        }

    })
    
    //Draw the selection box
    if (!clickHandledByMolecule){
        GlobalVariables.currentMolecule.placeAtom({
            parentMolecule: GlobalVariables.currentMolecule, 
            x: GlobalVariables.pixelsToWidth(event.clientX),
            y: GlobalVariables.pixelsToHeight(event.clientY),
            parent: GlobalVariables.currentMolecule,
            name: 'Box',
            atomType: 'Box'
        }, null, GlobalVariables.availableTypes)
    }
    
    if(!clickHandledByMolecule){
        GlobalVariables.currentMolecule.backgroundClick() 
    }
    else{
        GlobalVariables.currentMolecule.selected = false
    }
    
    //hide the menu if it is visible
    if (!document.querySelector('#circle-menu1').contains(event.target)) {
        cmenu.hide()
    }
    //hide search menu if it is visible
    if (!document.querySelector('#canvas_menu').contains(event.target)) {
        const menu = document.querySelector('#canvas_menu')
        menu.classList.add('off')
        menu.style.top = '-200%'
        menu.style.left = '-200%'
    }
    //hide the menu if it is visible
    if (!document.querySelector('#straight_menu').contains(event.target)) {
        closeTopMenu()
        let options = document.querySelectorAll('.option')
        Array.prototype.forEach.call(options, a => {
            a.classList.remove("openMenu") 
        })
    }
    
}
/** 
* Called by mouse up
*/
function onMouseUp(event){
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY)
    })
    GlobalVariables.currentMolecule.clickUp(event.clientX,event.clientY)
}
/** 
* Called by mouse moves
*/
function onMouseMove(event){
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY)
    })
}
/** 
* Called by double clicks
*/
function onDoubleClick(event){
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.doubleClick(event.clientX,event.clientY)
    })
}

/** 
* Array containing selected atoms to copy or delete
* @type {array}
*/
window.addEventListener('keydown', e => {
    //Prevents default behavior of the browser on canvas to allow for copy/paste/delete
    if(e.srcElement.tagName.toLowerCase() !== ("textarea")
        && e.srcElement.tagName.toLowerCase() !== ("input")
        &&(!e.srcElement.isContentEditable)
        && ['c','v','Backspace'].includes(e.key)){
        e.preventDefault()
    }

    if (document.activeElement.id == "mainBody"){
        if (e.key == "Backspace" || e.key == "Delete") {
            GlobalVariables.atomsSelected = []
            //Adds items to the  array that we will use to delete
            GlobalVariables.currentMolecule.copy()
            GlobalVariables.atomsSelected.forEach(item => {
                GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(nodeOnTheScreen => {
                    if(nodeOnTheScreen.uniqueID == item.uniqueID){
                        nodeOnTheScreen.deleteNode()
                    }
                })
            })
        }    

        /** 
        * Object containing letters and values used for keyboard shortcuts
        * @type {object?}
        */ 
        var shortCuts = {
            a: "Assembly",
            b: "ShrinkWrap",//>
            c: "Copy",
            d: "Difference",
            e: "Extrude",
            g: "GitHub", // Not working yet
            i: "Input",
            j: "Translate", 
            k: "Rectangle",
            l: "Circle",
            m: "Molecule",
            s: "Save", 
            v: "Paste",
            x: "Equation",
            y: "Code", //is there a more natural code letter? can't seem to prevent command t new tab behavior
            z: "Undo" //saving this letter 
        }

        //Copy /paste listeners
        if (e.key == "Control" || e.key == "Meta") {
            GlobalVariables.ctrlDown = true
        }  

        if (GlobalVariables.ctrlDown && shortCuts.hasOwnProperty([e.key])) {
            
            e.preventDefault()
            //Copy & Paste
            if (e.key == "c") {
                GlobalVariables.atomsSelected = []
                GlobalVariables.currentMolecule.copy()
            }
            if (e.key == "v") {
                GlobalVariables.atomsSelected.forEach(item => {
                    let newAtomID = GlobalVariables.generateUniqueID()
                    item.uniqueID = newAtomID
                    GlobalVariables.currentMolecule.placeAtom(item, true)
                })   
            }
            //Save project
            if (e.key == "s") {
                GlobalVariables.gitHub.saveProject()
            }
            //Opens menu to search for github molecule
            if (e.key == "g") {
                showGitHubSearch()
            }
            
            else { 

                GlobalVariables.currentMolecule.placeAtom({
                    parentMolecule: GlobalVariables.currentMolecule, 
                    x: 0.5,
                    y: 0.5,
                    parent: GlobalVariables.currentMolecule,
                    atomType: `${shortCuts[e.key]}`,
                    uniqueID: GlobalVariables.generateUniqueID()
                }, true)
            }
            
        }
    }
    //every time a key is pressed
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {  
        molecule.keyPress(e.key)      
    })
   
})

window.addEventListener('keyup', e => {
    if (e.key == "Control" || e.key == "Meta") {
        GlobalVariables.ctrlDown = false
    }
})

/* Button to open top menu */
document.getElementById('straight_menu').addEventListener('mousedown', () => {
    openTopMenu()
}) 

/**
 * Checks if menu is open and changes class to trigger hiding of individual buttons
 */ 
function openTopMenu(){

    document.querySelector('#toggle_wrap').style.display = "inline"
    let options = document.querySelectorAll('.option')
    var step = -150
    Array.prototype.forEach.call(options, a => {
        if (a.classList.contains("openMenu")){
            closeTopMenu() 
            a.classList.remove("openMenu")
        }
        else{
            a.classList.add("openMenu")
            a.style.transition = `transform 0.5s`
            a.style.transform = `translateX(${step}%)` 
            step-=100
            document.getElementById('goup_top').style.visibility = "hidden"
        }
    })
}

/**
 * Closes main menu on background click or on button click if open
 */
function closeTopMenu(){
    document.querySelector('#toggle_wrap').style.display = "inline"
    let options = document.querySelectorAll('.option')
    var step = 0
    document.getElementById('goup_top').style.visibility = "visible"
    Array.prototype.forEach.call(options, a => {
        a.style.transition = `transform 0.5s`
        a.style.transform = `translateX(${step}%)`              
    })  
}


/**
 * Top Button menu event listeners if not in run mode
 */ 
if (!GlobalVariables.runMode){
    
    let githubButton = document.getElementById('github_top')
    githubButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.openGitHubPage()
    })
    let otherProjectsButton = document.getElementById('projectmenu_top')
    otherProjectsButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.showProjectsToLoad()
    })
    let shareButton = document.getElementById('share_top')
    shareButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.shareOpenedProject()
    })
    let bomButton = document.getElementById('bom_top')
    bomButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.openBillOfMaterialsPage()
    })
    let readButton = document.getElementById('read_top')
    readButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.openREADMEPage()
    })
    let saveButton = document.getElementById('save_top')
    saveButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.saveProject()
    })
    let parentButton = document.getElementById('goup_top')
    parentButton.addEventListener('mousedown', () => {
        if(!GlobalVariables.currentMolecule.topLevel){
            GlobalVariables.currentMolecule.goToParentMolecule()  
        }
    })
    let deleteButton = document.getElementById('delete_top')
    deleteButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.deleteProject() 
    })
    let pullButton = document.getElementById('pull_top')
    pullButton.addEventListener('mousedown', () => {
        GlobalVariables.gitHub.makePullRequest() 
    })
}

//Add viewer bar which lets you turn on and off things like wireframe view
/**
 * Contains the check boxes to hide and show the display attributes
 */ 
let viewerBar = document.querySelector('#viewer_bar')
/**
 * The up arrow for going up one level
 */ 
let arrowUpMenu = document.querySelector('#arrow-up-menu')

/**
 * Creates the checkbox hidden menu when viewer is active. These really shouldn't be regenerated every time. They should just be hidden.
 */ 
function checkBoxes(){
    
    //Update the values from all the check boxes
    function checkBoxChange(){
        GlobalVariables.displayGrid = document.getElementById('gridCheck').checked
        GlobalVariables.displayAxis = document.getElementById('axesCheck').checked
        GlobalVariables.displayEdges = document.getElementById('edgesCheck').checked
        GlobalVariables.displayTriangles = document.getElementById('facesCheck').checked
        
        GlobalVariables.writeToDisplay(GlobalVariables.displayedPath)
    }
    
    let viewerBar = document.querySelector('#viewer_bar')
    viewerBar.classList.add('slidedown')

    //Grid display html element
    var gridDiv = document.createElement('div')
    viewerBar.appendChild(gridDiv)
    gridDiv.setAttribute('id', 'gridDiv')
    var gridCheck = document.createElement('input')
    gridDiv.appendChild(gridCheck)
    gridCheck.setAttribute('type', 'checkbox')
    gridCheck.setAttribute('id', 'gridCheck')
    gridDiv.setAttribute('style', 'float:right;')
           
    if (GlobalVariables.displayGrid){
        gridCheck.setAttribute('checked', 'true')
    }

    var gridCheckLabel = document.createElement('label')
    gridDiv.appendChild(gridCheckLabel)
    gridCheckLabel.setAttribute('for', 'gridCheck')
    gridCheckLabel.setAttribute('style', 'margin-right:1em;')
    gridCheckLabel.textContent= "Grid"
    gridCheckLabel.setAttribute('style', 'user-select: none;')


    gridCheck.addEventListener('change', checkBoxChange)

    //Axes Html

    var axesDiv = document.createElement('div')
    viewerBar.appendChild(axesDiv)
    var axesCheck = document.createElement('input')
    axesDiv.appendChild(axesCheck)
    axesCheck.setAttribute('type', 'checkbox')
    axesCheck.setAttribute('id', 'axesCheck')
            
    if (GlobalVariables.displayAxis){
        axesCheck.setAttribute('checked', 'true')
    }

    var axesCheckLabel = document.createElement('label')
    axesDiv.appendChild(axesCheckLabel)
    axesCheckLabel.setAttribute('for', 'axesCheck')
    axesCheckLabel.setAttribute('style', 'margin-right:1em;')
    axesDiv.setAttribute('style', 'float:right;')
    axesCheckLabel.textContent= "Axes"
    axesCheckLabel.setAttribute('style', 'user-select: none;')

    axesCheck.addEventListener('change', checkBoxChange)
    
    
    //Display faces
    var facesDiv = document.createElement('div')
    viewerBar.appendChild(facesDiv)
    var facesCheck = document.createElement('input')
    facesDiv.appendChild(facesCheck)
    facesCheck.setAttribute('type', 'checkbox')
    facesCheck.setAttribute('id', 'facesCheck')
    
    if(GlobalVariables.displayTriangles){
        facesCheck.setAttribute('checked', 'true')
    }
    
    var facesCheckLabel = document.createElement('label')
    facesDiv.appendChild(facesCheckLabel)
    facesCheckLabel.setAttribute('for', 'facesCheck')
    facesCheckLabel.setAttribute('style', 'margin-right:1em;')
    facesDiv.setAttribute('style', 'float:right;')
    facesCheckLabel.textContent= "Faces"
    facesCheckLabel.setAttribute('style', 'user-select: none;')

    facesCheck.addEventListener('change', checkBoxChange)
    
    //Display edges
    var edgesDiv = document.createElement('div')
    viewerBar.appendChild(edgesDiv)
    var edgesCheck = document.createElement('input')
    edgesDiv.appendChild(edgesCheck)
    edgesCheck.setAttribute('type', 'checkbox')
    edgesCheck.setAttribute('id', 'edgesCheck')
    
    if(GlobalVariables.displayEdges){
        edgesCheck.setAttribute('checked', 'true')
    }
    
    var edgesCheckLabel = document.createElement('label')
    edgesDiv.appendChild(edgesCheckLabel)
    edgesCheckLabel.setAttribute('for', 'edgesCheck')
    edgesCheckLabel.setAttribute('style', 'margin-right:1em;')
    edgesDiv.setAttribute('style', 'float:right;')
    edgesCheckLabel.textContent= "Edges"
    edgesCheckLabel.setAttribute('style', 'user-select: none;')

    edgesCheck.addEventListener('change', checkBoxChange)
    
    //Display wireframe
    var resetDiv = document.createElement('div')
    viewerBar.appendChild(resetDiv)
    var resetButton = document.createElement('button')
    resetButton.innerHTML = "Reset View"
    resetDiv.appendChild(resetButton)
    resetButton.setAttribute('type', 'checkbox')
    resetButton.setAttribute('id', 'resetButton')
    
    var resetButtonLabel = document.createElement('label')
    resetDiv.appendChild(resetButtonLabel)
    resetButtonLabel.setAttribute('for', 'resetButton')
    resetButtonLabel.setAttribute('style', 'margin-right:1em;')
    resetDiv.setAttribute('style', 'float:right;')
    resetButtonLabel.textContent= " "
    resetButtonLabel.setAttribute('style', 'user-select: none;')

    resetButton.addEventListener('click', ()=>{GlobalVariables.writeToDisplay(GlobalVariables.displayedPath, true)})
    
}

document.getElementById('modelViewer').addEventListener('mouseenter', () => {
    if(viewerBar.innerHTML.trim().length == 0){
        checkBoxes()
    }
})

/** 
* A flag to indicate if the startTimer event has already fired
* @type {boolean}
*/
var evtFired = false
var g_timer

/**
 * Starts the timer to retract the menu
 */ 
function startTimer(){
    g_timer = setTimeout(function() {
        if (!evtFired) {
            viewerBar.classList.remove("slideup")
            viewerBar.classList.add('slidedown')  
        }
    }, 2000)
}

arrowUpMenu.addEventListener('mouseenter', () =>{
    clearTimeout(g_timer)
    viewerBar.classList.remove("slidedown")
    viewerBar.classList.add('slideup')   
})
viewerBar.addEventListener('mouseleave', () =>{
    evtFired = false
    viewerBar.classList.remove("slideup")
    viewerBar.classList.add('slidedown')   
})
viewerBar.addEventListener('mouseenter', () =>{
    evtFired = true
    viewerBar.classList.remove("slidedown")
    viewerBar.classList.add('slideup')   
})
arrowUpMenu.addEventListener('mouseleave', () =>{
    startTimer()
})


// Implementation
/**
 * Runs once when the program begins to initialize variables.
 */ 
function init() {
    if(!GlobalVariables.runMode){ //If we are in CAD mode load an empty project as a placeholder
        GlobalVariables.currentMolecule = new Molecule({
            x: 0, 
            y: 0, 
            topLevel: true, 
            name: 'Maslow Create',
            atomType: 'Molecule',
            uniqueID: GlobalVariables.generateUniqueID()
        })
    }
    else{
        var ID = window.location.href.split('?')[1]
        
        //Have the current molecule load it
        if(typeof ID != undefined){
            GlobalVariables.currentMolecule = new GitHubMolecule({
                projectID: ID,
                topLevel: true
            })
            GlobalVariables.topLevelMolecule = GlobalVariables.currentMolecule
            
            //This is used because window.ask takes some time to load so we need to wait for it. This sets up a callback which will be called in jsxcad.js once window.ask exists
            window.askSetupCallback = () => {
                GlobalVariables.topLevelMolecule.loadProjectByID(ID).then( ()=> {
                    GlobalVariables.topLevelMolecule.backgroundClick()
                })
            }
        }
    }
    window.addEventListener('resize', () => { onWindowResize() }, false)

    onWindowResize()
    animate()
}

/**
 * Handles the window's resize behavior when the browser size changes.
 */ 
function onWindowResize() {

    GlobalVariables.canvas.width = window.innerWidth

    //reset screen parameters 
    if(!GlobalVariables.runMode){
        document.querySelector('.flex-parent').setAttribute('style','height:'+ (window.innerHeight - GlobalVariables.canvas.height)+'px')
    }else{
        document.querySelector('.flex-parent').setAttribute('style','height:'+innerHeight+'px')
    }
    document.querySelector('.jscad-container').setAttribute('style','width:'+innerWidth/1.7+'px')
}



/**
 * Animation loop. Runs with every frame to draw the program on the display.
 */ 
function animate() {
    requestAnimationFrame(animate)
    GlobalVariables.c.clearRect(0, 0, GlobalVariables.canvas.width, GlobalVariables.canvas.height)
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom => {
        atom.update()
    })
}

init()

