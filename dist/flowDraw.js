//import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight/2


// Event Listeners
let flowCanvas = document.getElementById('flow-canvas');
flowCanvas.addEventListener('contextmenu', showmenu);

flowCanvas.addEventListener('mousemove', event => {
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY);        
    });
})

flowCanvas.addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})

flowCanvas.addEventListener('mousedown', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.clickDown(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
})

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    currentMolecule.nodesOnTheScreen.forEach(molecule => {
        console.log(molecule);
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



// Objects

var AttachmentPoint = {
    
    defaultRadius: 8,
    expandedRadius: 14,
    radius: 8,
    
    hoverDetectRadius: 8,
    hoverOffsetX: 0,
    hoverOffsetY: 30,
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    offsetX: 0,
    offsetY: 0,
    showHoverText: false,
    
    type: "output",

    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        instance.offsetX = instance.defaultOffsetX;
        instance.offsetY = instance.defaultOffsetY;
        instance.x = instance.parentMolecule.x + instance.offsetX;
        instance.y = instance.parentMolecule.y + instance.offsetY;
        return instance;
    },
    
    draw: function() {
        
        c.beginPath();
        c.fillStyle = this.parentMolecule.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        if (this.showHoverText){
            if(this.type == "input"){
                c.textAlign = "end";
                c.fillText(this.name, this.x - (this.radius + 3), this.y+2)
            }
            else{
                c.textAlign = "start"; 
                c.fillText(this.name, this.x + (this.radius + 3), this.y+2)
            }
        }
        c.fill();
        c.closePath();
    },

    clickDown: function(x,y){
        if(distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius && this.type == 'output'){
            
            var connector = Connector.create({
                parentMolecule: this.parentMolecule, 
                attachmentPoint1: this
            });
            this.parentMolecule.children.push(connector);
            return true; //indicate that the click was handled by this object
        }
        else{
            return false; //indicate that the click was not handled by this object
        }
    },

    clickUp: function(x,y){
        
    },

    clickMove: function(x,y){
        //expand if touched by mouse
        
        var distFromCursor = distBetweenPoints (this.x, x, this.y, y);
        
        //If we are hovering over the attachment point, indicate that by making it big
        if (distFromCursor < this.defaultRadius){
            this.radius = this.expandedRadius;
        }
        else{
            this.radius = this.defaultRadius;
        }
        
        
        //If we are close to the attachment point move it to it's hover location to make it accessable
        if (distFromCursor < this.hoverDetectRadius){
            this.offsetX = this.hoverOffsetX;
            this.offsetY = this.hoverOffsetY;
            this.showHoverText = true;
            this.hoverDetectRadius = this.defaultRadius + distBetweenPoints (this.defaultOffsetX, this.hoverOffsetX, this.defaultOffsetY, this.hoverOffsetY); 
        }
        else{
            this.offsetX = this.defaultOffsetX;
            this.offsetY = this.defaultOffsetY;
            this.showHoverText = false;
            this.hoverDetectRadius = this.defaultRadius;
        }
    },

    wasConnectionMade: function(x,y){
        //this function returns itself if the cordinates passed in are within itself
        if (distBetweenPoints(this.x, x, this.y, y) < this.radius){
            return this;
        }
        else{
            return false;
        }
    },

    update: function() {
        this.x = this.parentMolecule.x + this.offsetX;
        this.y = this.parentMolecule.y + this.offsetY;
        this.draw()
    }

}

var Connector =  {
    
    isMoving: true,
    color: 'black',

    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        
        instance.startX = instance.parentMolecule.outputX;
        instance.startY = instance.parentMolecule.y;
        
        return instance;
    },
    
    draw: function() {
        
        c.beginPath()
        c.fillStyle = this.color
        c.globalCompositeOperation = 'destination-over'; //draw under other elements
        c.moveTo(this.startX, this.startY)
        c.bezierCurveTo(this.startX + 100, this.startY, this.endX - 100, this.endY, this.endX, this.endY);
        c.stroke()
        c.globalCompositeOperation = 'source-over'; //switch back to drawing on top
    },

    clickDown: function(x,y){
        
    },

    clickUp: function(x,y){
        
        var connectionNode = false;
        
        currentMolecule.nodesOnTheScreen.forEach(molecule => {
            molecule.children.forEach(child => {
                if(child.wasConnectionMade(x,y)){
                    connectionNode = child.wasConnectionMade(x,y);
                }
            });
        });
        
        if(this.isMoving){
            if (connectionNode && connectionNode.type === "input"){
                this.attachmentPoint2 = connectionNode;
            }
            else{
                //remove this connector from the stack
                this.parentMolecule.children.pop();
            }
        }
        
        this.isMoving = false;
        
    },

    clickMove: function(x,y){
        if (this.isMoving == true){
            this.endX = x;
            this.endY = y;
        }
    },

    update: function() {
        this.startX = this.attachmentPoint1.x
        this.startY = this.attachmentPoint1.y
        if (this.attachmentPoint2){  //check to see if the attachment point is defined
            this.endX = this.attachmentPoint2.x;
            this.endY = this.attachmentPoint2.y;
        }
        this.draw()
    },

    wasConnectionMade: function(x,y){
        return false;
    }

}

var DrawingNode = {
    x: 0,
    y:  0,
    radius: 20,
    defaultColor: '#F3EFEF',
    selectedColor: 'green',
    color: '#F3EFEF',
    name: "name",
    parentMolecule: null,
    isMoving: false,
    
    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        
        instance.children = [];
        return instance;
    },
    
    draw: function() {
    
        this.inputX = this.x - this.radius
        this.outputX = this.x + this.radius
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.textAlign = "start"; 
        c.fillText(this.name, this.x + this.radius, this.y-this.radius);
        c.fill();
        c.closePath();
    },
    
    addIO: function(type, name, target){
        
        //compute the baseline offset from parent node
        var offset;
        if (type == "input"){
            offset = -1* target.radius;
        }
        else{
            offset = target.radius;
        }
        
        //compute hover offset from parent node
        //find the number of elements of the same type already in the array 
        var numberOfSameTypeIO = target.children.filter(child => child.type == type).length;
        //multiply that number by an offset to find the new x offset
        var hoverOffsetComputed = numberOfSameTypeIO * -30;
        
        input = AttachmentPoint.create({
            parentMolecule: target, 
            defaultOffsetX: offset, 
            defaultOffsetY: 0,
            hoverOffsetX: offset,
            hoverOffsetY: hoverOffsetComputed,
            type: type,
            name: name
        });
        target.children.push(input);
    },
    
    clickDown: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            this.color = this.selectedColor;
            this.isMoving = true;
            clickProcessed = true;
        }
        else{
            this.color = this.defaultColor;
        }
        
        this.children.forEach(child => {
            if(child.clickDown(x,y) == true){
                clickProcessed = true;
            }
        });
        
        return clickProcessed; 
    },

    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            console.log("double click on a node");
            clickProcessed = true;
        }
        
        return clickProcessed; 
    },

    clickUp: function(x,y){
        this.isMoving = false;
        
        this.children.forEach(child => {
            child.clickUp(x,y);     
        });
    },

    clickMove: function(x,y){
        if (this.isMoving == true){
            this.x = x;
            this.y = y;
        }
        
        this.children.forEach(child => {
            child.clickMove(x,y);       
        });
    },

    update: function() {
        
        this.children.forEach(child => {
            child.update();     
        });
        
        this.draw()
    }
}

var Atom = DrawingNode.create({
    codeBlock: ""
});

var Molecule = DrawingNode.create({
    children: [], 
    name: "Molecule",
    topLevel: false, //a flag to signal if this node is the top level node
    
    create: function(values){
        var instance = DrawingNode.create.call(this, values);
        instance.nodesOnTheScreen = [];
        
        if (!instance.topLevel){
            goUpOneLevel = UpOneLevelBtn.create({
                parentMolecule: instance, 
                x: 100,
                y: 100
            });
            instance.nodesOnTheScreen.push(goUpOneLevel);
        }
        return instance;
    },
    
    draw: function(){
        DrawingNode.draw.call(this); //Super call to draw the rest
        
        //draw the circle in the middle
        c.beginPath();
        c.fillStyle = "#949294";
        c.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2, false);
        c.closePath();
        c.fill();
        
    },
    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            console.log("double click on a molecule");
            currentMolecule = this; //set this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
});

var UpOneLevelBtn = DrawingNode.create({
    name: "Go Up One Level",
    children: [],
    color: "blue",
    defaultColor: 'blue',
    selectedColor: 'blue',
    radius: 30,
    
    create: function(values){
        var instance = DrawingNode.create.call(this, values);
        return instance;
    },
    
    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        var clickProcessed = false;
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            console.log("double click on a go up");
            console.log(this.parentMolecule.topLevel);
            console.log(this.parentMolecule.parent);
            currentMolecule = this.parentMolecule.parent; //set parent this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
});

var Sphereoid = Atom.create({
    name: "Sphereoid",
    sphereRadius: 10,
    codeBlock: "some code to create a sphere",
    create: function(values){
        var instance = DrawingNode.create.call(this, values);
        instance.addIO("input", "radius", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});

var Cubeoid = Atom.create({
    name: "Cubeoid",
    xL: 10,
    yL: 10,
    zL: 10,
    codeBlock: "some code to create a sphere",
    create: function(values){
        var instance = DrawingNode.create.call(this, values);
        instance.addIO("input", "L", instance);
        instance.addIO("input", "W", instance);
        instance.addIO("input", "H", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});

// Implementation

var availableTypes = [Molecule, Sphereoid, Cubeoid];

let currentMolecule;
let menu;

function init() {
    currentMolecule = Molecule.create({x: 0, y: 0, topLevel: true});
     
    var typeToCreate = Math.floor(Math.random() * (availableTypes.length));
    var atom = availableTypes[typeToCreate].create({x: 500*Math.random(), y: 200*Math.random()});
    currentMolecule.nodesOnTheScreen.push(atom);
    
    menu = document.querySelector('.menu');
    menu.classList.add('off');
    menu.addEventListener('mouseleave', hidemenu);
    
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

function createNewMolecule(x,y, parent){
    
    var typeToCreate = Math.floor(Math.random() * (availableTypes.length));
    var molecule = availableTypes[typeToCreate].create({x: x, y: y});
    currentMolecule.nodesOnTheScreen.push(molecule);
}

function placeNewNode(ev){
    hidemenu();
    let clr = ev.target.id;
    
    
    availableTypes.forEach(type => {
        if (type.name === clr){
            if (type.name === 'Molecule'){
                var molecule = type.create({x: menu.x, y: menu.y, parent: currentMolecule});
            }
            else{
                var molecule = type.create({x: menu.x, y: menu.y});
            }
            currentMolecule.nodesOnTheScreen.push(molecule);
        }
    });
    
}

function showmenu(ev){
    //stop the real right click menu
    ev.preventDefault(); 
    //show the custom menu
    menu.style.top = `${ev.clientY - 20}px`;
    menu.style.left = `${ev.clientX - 20}px`;
    menu.x = ev.clientX;
    menu.y = ev.clientY;
    menu.classList.remove('off');
}

function hidemenu(ev){
    menu.classList.add('off');
    menu.style.top = '-200%';
    menu.style.left = '-200%';
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
