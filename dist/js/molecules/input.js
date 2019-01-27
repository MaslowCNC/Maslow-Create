var Input = Atom.create({
    codeBlock: "",
    type: "input",
    atomType: "Input",
    name: "Input",
    height: 16,
    radius: 15,
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("output", "number or geometry", instance);
        
        return instance;
    },
    updateSidebar: function(){
        //updates the sidebar to display information about this node
        
        var valueList =  Atom.updateSidebar.call(this); //call the super function
        
        createEditableValueListItem(valueList,this,"name", "Name", false);
        
    },
    draw: function() {
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        
        c.fillStyle = this.color;
        
        c.textAlign = "start"; 
        c.fillText(this.name, this.x + this.radius, this.y-this.radius);

        
        c.beginPath();
        c.moveTo(this.x - this.radius, this.y - this.height/2);
        c.lineTo(this.x - this.radius + 10, this.y);
        c.lineTo(this.x - this.radius, this.y + this.height/2);
        c.lineTo(this.x + this.radius, this.y + this.height/2);
        c.lineTo(this.x + this.radius, this.y - this.height/2);
        c.fill();
        c.closePath();

    }
});
