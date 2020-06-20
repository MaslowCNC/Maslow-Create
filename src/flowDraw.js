import GlobalVariables from './js/globalvariables'
import Molecule from './js/molecules/molecule.js'
import GitHubMolecule from './js/molecules/githubmolecule.js'
import Display from './js/display.js'
//import LocalMenu from './js/localmenu.js'
import {cmenu} from './js/NewMenu.js'


GlobalVariables.display = new Display()
GlobalVariables.canvas = document.querySelector('canvas')
GlobalVariables.c = GlobalVariables.canvas.getContext('2d')
GlobalVariables.runMode = window.location.href.includes('run') //Check if we are using the run mode based on url

GlobalVariables.canvas.width = window.innerWidth
GlobalVariables.canvas.height = window.innerHeight/2.5

// Event Listeners
/** 
 * The cansvas on which the atoms are placed.
 * @type {object}
 */
let flowCanvas = document.getElementById('flow-canvas')

flowCanvas.addEventListener('mousemove', event => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {

        molecule.clickMove(event.clientX,event.clientY)    
    })
})

flowCanvas.addEventListener('mousedown', event => {

    //every time the mouse button goes down
    
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
    
})

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down    
    var clickHandledByMolecule = false
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.doubleClick(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true
        }
    })
    
    if (clickHandledByMolecule == false){
        console.warn('double click menu open not working in flowDraw.js')
        //showmenu(event);
    }
})


document.addEventListener('mouseup',(e)=>{
    if (!e.srcElement.isContentEditable){

        //puts focus back into mainbody after clicking button
        document.activeElement.blur()
        document.getElementById("mainBody").focus()
    }
})


flowCanvas.addEventListener('mouseup', event => {
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY)      
    })
    GlobalVariables.currentMolecule.clickUp(event.clientX,event.clientY)      
})



/** 
* Array containing selected atoms to copy or delete
* @type {array}
*/
window.addEventListener('keydown', e => {
    //Prevents default behavior of the browser on canvas to allow for copy/paste/delete
    if(e.srcElement.tagName.toLowerCase() !== ("textarea")
        && e.srcElement.tagName.toLowerCase() !== ("input")
        &&(!e.srcElement.isContentEditable)
        && ['c','v', 'Backspace'].includes(e.key)){
            e.preventDefault()
    }

    if (document.activeElement.id == "mainBody"){
        //Copy /paste listeners
        if (e.key == "Control" || e.key == "Meta") {
            GlobalVariables.ctrlDown = true
        }      
        if (GlobalVariables.ctrlDown &&  e.key == "c") {
            GlobalVariables.atomsToCopy = []
            GlobalVariables.currentMolecule.copy()
        }
        if (GlobalVariables.ctrlDown &&  e.key == "v") {
            GlobalVariables.atomsToCopy.forEach(item => {
                let newAtomID = GlobalVariables.generateUniqueID()
                item.uniqueID = newAtomID
                GlobalVariables.currentMolecule.placeAtom(item, true)    
            })   
        }
        if (GlobalVariables.ctrlDown &&  e.key == "s") {
            e.preventDefault()
            GlobalVariables.gitHub.saveProject()
        }
        if (e.key == ("Backspace"||"Delete")) {
            GlobalVariables.atomsToCopy = []
            GlobalVariables.currentMolecule.copy()
            console.log(GlobalVariables.atomsToCopy)
            GlobalVariables.atomsToCopy.forEach(item => {
                GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(nodeOnTheScreen => {
                    if(nodeOnTheScreen.uniqueID == item.uniqueID){
                        nodeOnTheScreen.deleteNode()
                    }
                })
            })
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
            GlobalVariables.topLevelMolecule.loadProjectByID(ID).then( ()=> {
                GlobalVariables.topLevelMolecule.backgroundClick()
            })
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
    GlobalVariables.display.onWindowResize()

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

    GlobalVariables.display.render()
    GlobalVariables.display.controls.update()
}

init()

