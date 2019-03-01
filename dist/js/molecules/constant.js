class Constant extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("output", "number", this, "number", 10);
        
        this.codeBlock = "";
        this.type = "constant";
        this.name = "Constant";
        this.atomType = "Constant";
        this.height = 16;
        this.radius = 15;
        
        this.setValues(values);
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar(); //call the super function
        
        var output = this.children[0];
        
        createEditableValueListItem(valueList,output,"value", "Value", true);
        createEditableValueListItem(valueList,this,"name", "Name", false);
        
    }
    
    setValue(newName){
        //Called by the sidebar to set the name
        this.name = newName;
    }
    
    draw() {
        
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
}
