//import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight/2


// Event Listeners
let flowCanvas = document.getElementById('flow-canvas');
flowCanvas.addEventListener('contextmenu', showmenu);

flowCanvas.addEventListener('mousemove', event => {
    moleculesOnTheScreen.forEach(molecule => {
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
    
    moleculesOnTheScreen.forEach(molecule => {
        if (molecule.clickDown(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
})

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    moleculesOnTheScreen.forEach(molecule => {
        if (molecule.doubleClick(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
    if (clickHandledByMolecule == false){
        //createNewMolecule(event.clientX, event.clientY);
        showmenu(event);
    }
    
})

flowCanvas.addEventListener('mouseup', event => {
    //every time the mouse button goes up
    moleculesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);      
    });
})



// Objects

var AttachmentPoint = {
    
    defaultRadius: 8,
    expandedRadius: 14,
    radius: 8,
    type: "output",

    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        instance.x = instance.parentMolecule.x + instance.offsetX;
        instance.y = instance.parentMolecule.y + instance.offsetY;
        return instance;
    },
    
    draw: function() {
        
        c.beginPath();
        c.fillStyle = this.parentMolecule.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
        if (distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius){
            this.radius = this.expandedRadius;
        }
        else{
            this.radius = this.defaultRadius;
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
        
        moleculesOnTheScreen.forEach(molecule => {
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
    isMoving: false,
    
    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        input = AttachmentPoint.create({
            parentMolecule: instance, 
            offsetX: -1* instance.radius, 
            offsetY: 0,
            type: "input"
        });
        output = AttachmentPoint.create({
            parentMolecule: instance, 
            offsetX: 1* instance.radius, 
            offsetY: 0,
            type: "output"
        });
        instance.children = [];
        instance.children.push(input);
        instance.children.push(output);
        return instance;
    },
    
    draw: function() {
    
        this.inputX = this.x - this.radius
        this.outputX = this.x + this.radius
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        c.beginPath()
        c.fillStyle = this.color
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillText(this.name, this.x + this.radius, this.y-this.radius)
        c.fill()
        c.closePath()
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
            console.log("double click on a molecule");
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
    topLevel: false //a flag to signal if this node is the top level node
});

var Sphereoid = Atom.create({
    name: "Sphereoid",
    sphereRadius: 10,
    codeBlock: "some code to create a sphere"
});

var Cubeoid = Atom.create({
    name: "Cubeoid",
    xL: 10,
    yL: 10,
    zL: 10,
    codeBlock: "some code to create a sphere"
});

// Implementation

var availableTypes = [Molecule, Sphereoid, Cubeoid];

let moleculesOnTheScreen;
let menu;

function init() {
     moleculesOnTheScreen = []
     
    var typeToCreate = Math.floor(Math.random() * (availableTypes.length));
    var atom = availableTypes[typeToCreate].create({x: 500*Math.random(), y: 200*Math.random()});
    moleculesOnTheScreen.push(atom);
    
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

function createNewMolecule(x,y){
    
    var typeToCreate = Math.floor(Math.random() * (availableTypes.length));
    var molecule = availableTypes[typeToCreate].create({x: x, y: y});
    moleculesOnTheScreen.push(molecule);
}

function placeNewNode(ev){
    hidemenu();
    let clr = ev.target.id;
    
    
    availableTypes.forEach(type => {
        if (type.name === clr){
            var molecule = type.create({x: menu.x, y: menu.y});
            moleculesOnTheScreen.push(molecule);
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
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    
    
    //c.fillText('T', mouse.x, mouse.y)
    moleculesOnTheScreen.forEach(molecule => {
      molecule.update();
     });
}

init()
animate()
