

import Menu from './js/menu'
import GlobalVariables from './js/globalvariables'
import Molecule from './js/molecules/molecule.js'

GlobalVariables.canvas = document.querySelector('canvas')
GlobalVariables.c = GlobalVariables.canvas.getContext('2d')

GlobalVariables.canvas.width = innerWidth
GlobalVariables.canvas.height = innerHeight/2

let lowerHalfOfScreen = document.querySelector('.flex-parent');
lowerHalfOfScreen.setAttribute("style","height:"+innerHeight/2.1+"px");

// Event Listeners
let flowCanvas = document.getElementById('flow-canvas');
flowCanvas.addEventListener('contextmenu', Menu.showmenu); //redirect right clicks to show the menu

flowCanvas.addEventListener('mousemove', event => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY);        
    });
})

window.addEventListener('resize', event => {
    
    console.log("resize");
    
    var bounds = GlobalVariables.canvas.getBoundingClientRect();
    GlobalVariables.canvas.width = bounds.width;
    GlobalVariables.canvas.height = bounds.height; 

})

flowCanvas.addEventListener('mousedown', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.clickDown(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
    if(!clickHandledByMolecule){
        GlobalVariables.currentMolecule.backgroundClick();
    }
    
    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        hidemenu();
    }
    
})

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.doubleClick(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
    if (clickHandledByMolecule == false){
        showmenu(event);
    }
})

flowCanvas.addEventListener('mouseup', event => {
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);      
    });
})

window.addEventListener('keydown', event => {
    //every time the mouse button goes up
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.keyPress(event.key);      
    });
})


// Implementation

function init() {
    GlobalVariables.currentMolecule = new Molecule({
        x: 0, 
        y: 0, 
        topLevel: true, 
        name: "Maslow Create",
        atomType: "Molecule",
        uniqueID: GlobalVariables.generateUniqueID()
    });
    
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    GlobalVariables.c.clearRect(0, 0, GlobalVariables.canvas.width, GlobalVariables.canvas.height);
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.update();
    });
}

init()
animate()
