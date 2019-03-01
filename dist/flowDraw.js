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
    union:         {creator: Union, atomType: "Union"}
}

var secretTypes = {
    uponelevelbtn: {creator: UpOneLevelBtn, atomType: "UpOneLevelBtn"},
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
    
    //Add the search bar to the list item
    
    for(var key in availableTypes) {
        var newElement = document.createElement("LI");
        var instance = availableTypes[key];
        var text = document.createTextNode(instance.atomType);
        newElement.setAttribute("class", "menu-item");
        newElement.setAttribute("id", instance.atomType);
        newElement.appendChild(text); 
        menu.appendChild(newElement); 
        
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
    });
    
    //prevent the return key from being used when editing a value
    document.getElementById(label).addEventListener('keypress', function(evt) {
        if (evt.which === 13) {
            evt.preventDefault();
            document.getElementById(label).blur();  //shift focus away if someone presses enter
        }
    });

}

function createDropDown(list,parent,options,selectedOption){
    var listElement = document.createElement("LI");
    list.appendChild(listElement);
    
    
    //Div which contains the entire element
    var div = document.createElement("div");
    listElement.appendChild(div);
    div.setAttribute("class", "sidebar-item");
    
    //Left div which displays the label
    var labelDiv = document.createElement("div");
    div.appendChild(labelDiv);
    var labelText = document.createTextNode("z = ");
    labelDiv.appendChild(labelText);
    labelDiv.setAttribute("class", "sidebar-subitem");
    
    
    //Right div which is editable and displays the value
    var valueTextDiv = document.createElement("div");
    div.appendChild(valueTextDiv);
    var dropDown = document.createElement("select");
    options.forEach(option => {
        var op = new Option();
        op.value = options.findIndex(thisOption => thisOption === option);
        op.text = option;
        dropDown.options.add(op);
    });
    valueTextDiv.appendChild(dropDown);
    valueTextDiv.setAttribute("class", "sidebar-subitem");
    
    console.log("Set to: " + selectedOption);
    dropDown.selectedIndex = selectedOption; //display the current selection
    
    dropDown.addEventListener(
        'change',
        function() { parent.changeEquation(dropDown.value); },
        false
    );
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
