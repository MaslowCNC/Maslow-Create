

import Menu from './js/menu'
import GlobalVariables from './js/globalvariables'
import Molecule from './js/molecules/molecule.js'
import GitHubMolecule from './js/molecules/githubmolecule.js'

GlobalVariables.canvas = document.querySelector('canvas')
GlobalVariables.c = GlobalVariables.canvas.getContext('2d')

GlobalVariables.canvas.width = innerWidth
GlobalVariables.canvas.height = innerHeight/2

let lowerHalfOfScreen = document.querySelector('.flex-parent');
lowerHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");
let upperHalfOfScreen = document.querySelector('#flow-canvas');
upperHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");

var url = window.location.href;
GlobalVariables.runMode = url.includes("run"); //Check if we are using the run mode based on url

// Event Listeners
let flowCanvas = document.getElementById('flow-canvas');

flowCanvas.addEventListener('mousemove', event => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY);        
    });
});

window.addEventListener('resize', event => {
    
    var bounds = GlobalVariables.canvas.getBoundingClientRect();
    GlobalVariables.canvas.width = bounds.width;
    GlobalVariables.canvas.height = bounds.height; 
    //reset screen parameters 
    lowerHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");
    upperHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");

    GlobalVariables.scaleFactorXY =  GlobalVariables.canvas.width/1000;
    GlobalVariables.scaleFactorR =  GlobalVariables.canvas.width/1200;

    });


flowCanvas.addEventListener('mousedown', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.some(molecule => {
        console.log(molecule);
        if (molecule.clickDown(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
            console.log("clicked");
            return true;
        }

    });
    
    if(!clickHandledByMolecule){
        GlobalVariables.currentMolecule.backgroundClick();
    }
    
    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        Menu.hidemenu();
    }
    
});

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.doubleClick(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
    if (clickHandledByMolecule == false){
        console.log("double click menu open not working in flowDraw.js");
        //showmenu(event);
    }
});

flowCanvas.addEventListener('mouseup', event => {
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);      
    });
});

window.addEventListener('keydown', event => {
    //every time the mouse button goes up
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.keyPress(event.key);      
    });
});


// Implementation

function init() {
    if(!GlobalVariables.runMode){ //If we are in CAD mode load an empty project as a placeholder
        GlobalVariables.currentMolecule = new Molecule({
            x: 0, 
            y: 0, 
            topLevel: true, 
            name: "Maslow Create",
            atomType: "Molecule",
            uniqueID: GlobalVariables.generateUniqueID()
        });
    }
    else{
        var ID = window.location.href.split('?')[1];
        //Have the current molecule load it
        if(typeof ID != undefined){
            GlobalVariables.currentMolecule = new GitHubMolecule({
                projectID: ID
            });
        }
    }
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
