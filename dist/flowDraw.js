//import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight/2

//put some content in the sidebar at launch
let sideBar = document.querySelector('.sideBar');
let lowerHalfOfScreen = document.querySelector('.flex-parent');
lowerHalfOfScreen.setAttribute("style","height:"+innerHeight/2.1+"px");

// Event Listeners
let flowCanvas = document.getElementById('flow-canvas');
flowCanvas.addEventListener('contextmenu', showmenu);

flowCanvas.addEventListener('mousemove', event => {
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY);        
    });
})

window.addEventListener('resize', event => {
    
    console.log("resize");
    
    var bounds = canvas.getBoundingClientRect();
    canvas.width = bounds.width;
    canvas.height = bounds.height; 

})

flowCanvas.addEventListener('mousedown', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.clickDown(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
    if(!clickHandledByMolecule){
        currentMolecule.updateIO();
        currentMolecule.updateSidebar();
        currentMolecule.backgroundClick();
    }
    
    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        hidemenu();
    }
    
})

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
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
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);      
    });
})

window.addEventListener('keydown', event => {
    //every time the mouse button goes up
    
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.keyPress(event.key);      
    });
})


// Implementation

var availableTypes = [Sphereoid, Cube, Constant, Molecule, Input, Output, Readme, Translate];

let currentMolecule;
let menu;

function init() {
    currentMolecule = Molecule.create({x: 0, y: 0, topLevel: true, name: "Maslow Create"});
    
    menu = document.querySelector('.menu');
    menu.classList.add('off');
    
    //Add the search bar to the list item
    
    availableTypes.forEach(type => {
        var newElement = document.createElement("LI");
        var text = document.createTextNode(type.name);
        newElement.setAttribute("class", "menu-item");
        newElement.setAttribute("id", type.name);
        newElement.appendChild(text); 
        menu.appendChild(newElement); 
        
        document.getElementById(type.name).addEventListener('click', placeNewNode);
    }); 
}

function distBetweenPoints(x1, x2, y1, y2){
    var a2 = Math.pow(x1 - x2, 2);
    var b2 = Math.pow(y1 - y2, 2);
    var dist = Math.sqrt(a2 + b2);
    
    return dist;
}

function createEditableValueListItem(list,object,key, label, resultShouldBeNumber){
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
    valueTextDiv.setAttribute("id", label);
    
    
    document.getElementById(label).addEventListener('focusout', event => {
        var valueInBox = document.getElementById(label).textContent;
        if(resultShouldBeNumber){
            valueInBox = parseFloat(valueInBox);
        }
        object.setValue(valueInBox);
        //object.updateSidebar();
    });
    
    //prevent the return key from being used when editing a value
    document.getElementById(label).addEventListener('keypress', function(evt) {
        if (evt.which === 13) {
            evt.preventDefault();
            document.getElementById(label).blur();  //shift focus away if someone presses enter
        }
    });

}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    //c.fillText('T', mouse.x, mouse.y)
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.update();
    });
}

init()
animate()
