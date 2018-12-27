import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
	
	moleculesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY);		
	});
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})

addEventListener('mousedown', event => {
	//every time the mouse button goes down
	
	var clickHandledByMolecule = false;
	
	moleculesOnTheScreen.forEach(molecule => {
        if (molecule.clickDown(event.clientX,event.clientY) == true){
			clickHandledByMolecule = true;
		}
	});
	
	if (clickHandledByMolecule == false){
		createNewMolecule(event.clientX, event.clientY);
	}
	
})

addEventListener('mouseup', event => {
	//every time the mouse button goes up
	moleculesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);		
	});
})

// Objects

//Molecule  *******************************************************************************************

function Molecule(x, y) {
    this.x = x
    this.y = y
    this.radius = 20
	
	this.defaultColor = '#F3EFEF'
	this.selectedColor = 'green'
    this.color = this.defaultColor
	this.name = "sphereoid"
	this.isMoving = false;
	
	this.children = [];
	
	this.input = new AttachmentPoint(this, -1* this.radius, 0);
	this.children.push(this.input);
	
	this.output = new AttachmentPoint(this, this.radius, 0);
	this.children.push(this.output);
}

Molecule.prototype.draw = function() {
	
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
}

Molecule.prototype.clickDown = function(x,y){
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
}

Molecule.prototype.clickUp = function(x,y){
	this.isMoving = false;
	
	this.children.forEach(child => {
        child.clickUp(x,y);		
	});
}

Molecule.prototype.clickMove = function(x,y){
	if (this.isMoving == true){
		this.x = x;
		this.y = y;
	}
	
	this.children.forEach(child => {
        child.clickMove(x,y);		
	});
}

Molecule.prototype.update = function() {
    
	this.children.forEach(child => {
        child.update();		
	});
	
	this.draw()
}

//Connectors   *****************************************************************************************

function Connector(parentMolecule, attachmentPoint1) {
    this.parentMolecule = parentMolecule
	this.attachmentPoint1 = attachmentPoint1;
	this.attachmentPoint2;
	this.startX = this.parentMolecule.outputX
	this.startY = this.parentMolecule.y
	this.endX
	this.endY
	this.isMoving = true;
	this.color = 'black';

}

Connector.prototype.draw = function() {
	
    c.beginPath()
	c.fillStyle = this.color
    c.moveTo(this.startX, this.startY)
	c.bezierCurveTo(this.startX + 100, this.startY, this.endX - 100, this.endY, this.endX, this.endY);
    c.stroke()
}

Connector.prototype.clickDown = function(x,y){
	
}

Connector.prototype.clickUp = function(x,y){
	
	var connectionNode = null;
	
	moleculesOnTheScreen.forEach(molecule => {
        molecule.children.forEach(child => {
			if(child.wasConnectionMade(x,y) instanceof AttachmentPoint){
				connectionNode = child.wasConnectionMade(x,y);
			}
		});
	});
	
	if(this.isMoving){
		if (connectionNode != null){
			this.attachmentPoint2 = connectionNode;
		}
		else{
			//remove this connector from the stack
			this.parentMolecule.children.pop();
		}
	}
	
	this.isMoving = false;
	
	//find what element is closest
}

Connector.prototype.clickMove = function(x,y){
	if (this.isMoving == true){
		this.endX = x;
		this.endY = y;
	}
}

Connector.prototype.update = function() {
    this.startX = this.attachmentPoint1.x
	this.startY = this.attachmentPoint1.y
	if (this.attachmentPoint2 instanceof AttachmentPoint){
		this.endX = this.attachmentPoint2.x;
		this.endY = this.attachmentPoint2.y;
	}
	this.draw()
}

Connector.prototype.wasConnectionMade = function(x,y){
	return false;
}

//Attachment Points   **********************************************************************************

function AttachmentPoint(parentMolecule, offsetX, offsetY) {
    this.parentMolecule = parentMolecule
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.x = this.parentMolecule.x + offsetX;
	this.y = this.parentMolecule.y + offsetY;
	this.defaultRadius = 8;
	this.expandedRadius = 14;
	this.radius = 8;
}

AttachmentPoint.prototype.draw = function() {
	
    c.beginPath()
	c.fillStyle = this.parentMolecule.color
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fill()
    c.closePath()
}

AttachmentPoint.prototype.clickDown = function(x,y){
	if(distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius){
	    var connector = new Connector(this.parentMolecule, this);
	    this.parentMolecule.children.push(connector);
		return true; //indicate that the click was handled by this object
	}
	else{
		return false; //indicate that the click was not handled by this object
	}
}

AttachmentPoint.prototype.clickUp = function(x,y){
	
}

AttachmentPoint.prototype.clickMove = function(x,y){
	//expand if touched by mouse
	if (distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius){
		this.radius = this.expandedRadius;
	}
	else{
		this.radius = this.defaultRadius;
	}
}

AttachmentPoint.prototype.wasConnectionMade = function(x,y){
	//this function returns itself if the cordinates passed in are within itself
	if (distBetweenPoints(this.x, x, this.y, y) < this.radius){
		return this;
	}
	else{
		return false;
	}
}

AttachmentPoint.prototype.update = function() {
	this.x = this.parentMolecule.x + this.offsetX;
	this.y = this.parentMolecule.y + this.offsetY;
	this.draw()
}


// Implementation
let moleculesOnTheScreen;
var molecule;
function init() {
    moleculesOnTheScreen = []

    for (let i = 0; i < 2; i++) {
        molecule = new Molecule(Math.random()*500,Math.random()*500);
	    moleculesOnTheScreen.push(molecule);
    }
}

function distBetweenPoints(x1, x2, y1, y2){
	var a2 = Math.pow(x1 - x2, 2);
    var b2 = Math.pow(y1 - y2, 2);
    var dist = Math.sqrt(a2 + b2);
	
	return dist;
}

function createNewMolecule(x,y){
	molecule = new Molecule(x,y);
	moleculesOnTheScreen.push(molecule);
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
