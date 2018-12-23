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
	moleculesOnTheScreen.forEach(molecule => {
        molecule.clickDown(event.clientX,event.clientY);		
	});
})

addEventListener('mouseup', event => {
	//every time the mouse button goes up
	moleculesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);		
	});
})

// Objects

//Molecule
function Molecule(x, y) {
    this.x = x
    this.y = y
    this.radius = 20
	
	this.defaultSmallRadius = 8
	this.expandedSmallRadius = 14
	this.smallRadiusL = 8
	this.smallRadiusR = 8
	this.inputX = this.x - this.radius
	this.outputX = this.x + this.radius
	
	this.defaultColor = '#F3EFEF'
	this.selectedColor = 'green'
    this.color = this.defaultColor
	this.name = "sphereoid"
	this.isMoving = false;
}

Molecule.prototype.draw = function() {
	
	this.inputX = this.x - this.radius
	this.outputX = this.x + this.radius
	
    c.beginPath()
	c.fillStyle = this.color
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.arc(this.inputX, this.y, this.smallRadiusL, 0, Math.PI * 2, false)
    c.arc(this.outputX, this.y, this.smallRadiusR, 0, Math.PI * 2, false)
	c.fillText(this.name, this.x + this.radius, this.y-this.radius)
    c.fill()
    c.closePath()
}

Molecule.prototype.clickDown = function(x,y){
	
    var distFromClick = distBetweenPoints(x, this.x, y, this.y);
	
	if (distFromClick < this.radius){
		this.color = this.selectedColor;
		this.isMoving = true;
	}
	else if(distBetweenPoints (this.x + this.radius, x, this.y, y) < this.defaultSmallRadius | distBetweenPoints (this.x - this.radius, x, this.y, y) < this.defaultSmallRadius){
	    var connector = new Connector(this);
	    moleculesOnTheScreen.push(connector);
		console.log(moleculesOnTheScreen);
	}
	else{
		this.color = this.defaultColor;
	}
}

Molecule.prototype.clickUp = function(x,y){
	this.isMoving = false;

}

Molecule.prototype.clickMove = function(x,y){
	if (this.isMoving == true){
		this.x = x;
		this.y = y;
	}
	
	//check the right
	if (distBetweenPoints (this.x + this.radius, x, this.y, y) < this.defaultSmallRadius){
		this.smallRadiusR = this.expandedSmallRadius;
	}
	else{
		this.smallRadiusR = this.defaultSmallRadius;
	}
	
	if (distBetweenPoints (this.x - this.radius, x, this.y, y) < this.defaultSmallRadius){
		this.smallRadiusL = this.expandedSmallRadius;
	}
	else{
		this.smallRadiusL = this.defaultSmallRadius;
	}
}

Molecule.prototype.update = function() {
    this.draw()
}

//Connectors

function Connector(molecule1) {
    this.molecule1 = molecule1
	this.molecule2
	this.startX = this.molecule1.outputX
	this.startY = this.molecule1.y
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
    this.startX = this.molecule1.outputX
	this.startY = this.molecule1.y
	this.draw()
}

// Implementation
let moleculesOnTheScreen;
var molecule;
function init() {
    moleculesOnTheScreen = []

    for (let i = 0; i < 5; i++) {
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
