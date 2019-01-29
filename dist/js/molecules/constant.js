var Constant = Atom.create({
    codeBlock: "",
    type: "constant",
    name: "Constant",
    atomType: "Constant",
    height: 16,
    radius: 15,
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("output", "number", instance, "number");
        return instance;
    },
    updateSidebar: function(){
        //updates the sidebar to display information about this node
        
        var valueList = Atom.updateSidebar.call(this); //call the super function
        
        var output = this.children[0];
        
        createEditableValueListItem(valueList,output,"value", "Value", true);
        createEditableValueListItem(valueList,this,"name", "Name", false);
        
    },
    draw: function() {
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        c.beginPath();
        c.fillStyle = this.color;
        c.rect(this.x - this.radius, this.y - this.height/2, 2*this.radius, this.height);
        c.textAlign = "start"; 
        c.fillText(this.name, this.x + this.radius, this.y-this.radius);
        c.fill();
        c.closePath();
    }
});
