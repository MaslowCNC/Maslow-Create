import Menu from './js/menu'
import GlobalVariables from './js/globalvariables'
import Molecule from './js/molecules/molecule.js'
import GitHubMolecule from './js/molecules/githubmolecule.js'
import Display from './js/display.js'

GlobalVariables.display = new Display()
GlobalVariables.canvas = document.querySelector('canvas')
GlobalVariables.c = GlobalVariables.canvas.getContext('2d')

GlobalVariables.canvas.width = innerWidth
GlobalVariables.canvas.height = innerHeight/2
/** 
 * The original width of the canvas before scaling.
 * @type {number}
 */
let originalWidth = GlobalVariables.canvas.width

GlobalVariables.runMode = window.location.href.includes('run') //Check if we are using the run mode based on url

if(!GlobalVariables.runMode){
    document.querySelector('.flex-parent').setAttribute('style','height:'+innerHeight/2+'px')
}else{
    document.querySelector('.flex-parent').setAttribute('style','height:'+innerHeight+'px')
}
document.querySelector('#flow-canvas').setAttribute('style','height: 100'+innerHeight/2+'px')
document.querySelector('.jscad-container').setAttribute('style','width:90%')


// Event Listeners
/** 
 * The cansvas on which the atoms are placed.
 * @type {object}
 */
let flowCanvas = document.getElementById('flow-canvas')

flowCanvas.addEventListener('mousemove', event => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {

        molecule.clickMove(event.clientX/GlobalVariables.scale1,event.clientY/GlobalVariables.scale1)    
    })
})

flowCanvas.addEventListener('mousedown', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        
        if (molecule.clickDown(event.clientX/GlobalVariables.scale1,event.clientY/GlobalVariables.scale1) == true){
            clickHandledByMolecule = true
        }

    })
    
    if(!clickHandledByMolecule){
        GlobalVariables.currentMolecule.backgroundClick()
    }
    else{
        GlobalVariables.currentMolecule.deselect()
    }
    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        Menu.hidemenu()
    }
    
})

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.doubleClick(event.clientX/GlobalVariables.scale1,event.clientY/GlobalVariables.scale1) == true){
            clickHandledByMolecule = true
        }
    })
    
    if (clickHandledByMolecule == false){
        console.warn('double click menu open not working in flowDraw.js')
        //showmenu(event);
    }
})

flowCanvas.addEventListener('mouseup', event => {
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX/GlobalVariables.scale1,event.clientY/GlobalVariables.scale1)      
    })
})

window.addEventListener('keydown', event => {
    //every time the mouse button goes up
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.keyPress(event.key)      
    })
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
            GlobalVariables.topLevelMolecule.loadProjectByID(ID).then( ()=> {
                GlobalVariables.evalLock = false
                GlobalVariables.topLevelMolecule.unlock()
                GlobalVariables.topLevelMolecule.beginPropogation()
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
    
    var bounds = GlobalVariables.canvas.getBoundingClientRect()
    GlobalVariables.canvas.width = bounds.width
    GlobalVariables.canvas.height = bounds.height 
    //reset screen parameters 
    if(!GlobalVariables.runMode){
        document.querySelector('.flex-parent').setAttribute('style','height:'+innerHeight/2+'px')
    }else{
        document.querySelector('.flex-parent').setAttribute('style','height:'+innerHeight+'px')
    }
    document.querySelector('#flow-canvas').setAttribute('style','height:'+innerHeight/2+'px')
    document.querySelector('.jscad-container').setAttribute('style','width:'+innerWidth/2+'px')

    GlobalVariables.scale1 =  GlobalVariables.canvas.width/originalWidth

    GlobalVariables.display.onWindowResize()
}



/**
 * Animation loop. Runs with every frame to draw the program on the display.
 */ 
function animate() {
    requestAnimationFrame(animate)
    GlobalVariables.c.clearRect(0, 0, GlobalVariables.canvas.width, GlobalVariables.canvas.height)
    GlobalVariables.c.scale(GlobalVariables.scale1,GlobalVariables.scale1)
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.update()

    })
    GlobalVariables.c.setTransform(1,0,0,1,0,0)

    GlobalVariables.display.render()
    GlobalVariables.display.controls.update()
}

init()

