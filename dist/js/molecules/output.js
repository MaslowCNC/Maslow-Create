
class Output extends Atom {
    
    constructor(values){
        super (values)
        
        this.addIO("input", "number or geometry", this, "geometry");
        
        //Add a new output to the current molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.addIO("output", "Geometry", this.parent, "geometry");
        }
        
        this.defaultCodeBlock = "~number or geometry~";
        this.codeBlock = "";
        this.type = "output";
        this.name = "Output";
        this.atomType = "Output";
        this.height = 16;
        this.radius = 15;
        
        this.setValues(values);
    }
    
    setID(newID){
        this.uniqueID = newID;
    }
    
    draw() {
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        c.beginPath();
        c.fillStyle = this.color;
        c.rect(this.x - this.radius, this.y - this.height/2, 2*this.radius, this.height);
        c.textAlign = "end"; 
        c.fillText(this.name, this.x + this.radius, this.y-this.radius);
        c.fill();
        c.closePath();
        
        c.beginPath();
        c.moveTo(this.x + this.radius, this.y - this.height/2);
        c.lineTo(this.x + this.radius + 10, this.y);
        c.lineTo(this.x + this.radius, this.y + this.height/2);
        c.fill();
    }
}