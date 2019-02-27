
var Output = Atom.create({
    defaultCodeBlock: "~number or geometry~",
    codeBlock: "",
    type: "output",
    name: "Output",
    atomType: "Output",
    height: 16,
    radius: 15,
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "number or geometry", instance, "geometry");
        
        //Add a new output to the current molecule
        instance.parent.addIO("output", "Geometry", instance.parent, "geometry");
        
        return instance;
    },
    
    setID: function(newID){
        this.uniqueID = newID;
    },
    
    draw: function() {
        
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
});