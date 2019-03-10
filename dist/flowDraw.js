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

var availableTypes = {
    circle:        {creator: Circle, atomType: "Circle"},
    rectangle:     {creator: Rectangle, atomType: "Rectangle"},
    shirinkwrap:   {creator: ShrinkWrap, atomType: "ShrinkWrap"},
    translate:     {creator: Translate, atomType: "Translate"},
    regularPolygon:{creator: RegularPolygon, atomType: "RegularPolygon"},
    extrude:       {creator: Extrude, atomType: "Extrude"},
    scale:         {creator: Scale, atomType: "Scale"},
    intersection:  {creator: Intersection, atomType: "Intersection"},
    difference:    {creator: Difference, atomType: "Difference"},
    costant:       {creator: Constant, atomType: "Constant"},
    equation:      {creator: Equation, atomType: "Equation"},
    molecule:      {creator: Molecule, atomType: "Molecule"},
    input:         {creator: Input, atomType: "Input"},
    readme:        {creator: Readme, atomType: "Readme"},
    rotate:        {creator: Rotate, atomType: "Rotate"},
    mirror:        {creator: Mirror, atomType: "Mirror"},
    githubmolecule:{creator: GitHubMolecule, atomType: "GitHubMolecule"},
    union:         {creator: Union, atomType: "Union"}
}

var secretTypes = {
    output:        {creator: Output, atomType: "Output"}
}


let currentMolecule;
let topLevelMolecule;
let menu;

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
    
    for(var key in availableTypes) {
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

function generateUniqueID(){
    return Math.floor(Math.random()*900000) + 100000;
}

function distBetweenPoints(x1, x2, y1, y2){
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
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.update();
    });
}

init()
animate()
