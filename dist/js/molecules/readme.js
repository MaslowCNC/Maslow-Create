
class Readme extends Atom{
    constructor(values){
        super(values);
        
        this.codeBlock = "";
        this.atomType = "Readme";
        this.readmeText = "Readme text here";
        this.type = "readme";
        this.name = "README";
        this.radius = 20;
        
        this.setValues(values);
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar(); //call the super function
        
        this.createEditableValueListItem(valueList,this,"readmeText", "Notes", false);
        
    }
    
    draw() {
        
        super.draw(); //Super call to draw the rest
        
        //draw the two slashes on the node//
        c.strokeStyle = "#949294";
        c.lineWidth = 3;
        c.lineCap = "round";
        
        c.beginPath();
        c.moveTo(this.x - 11, this.y + 10);
        c.lineTo(this.x, this.y - 10);
        c.stroke();
        
        c.beginPath();
        c.moveTo(this.x, this.y + 10);
        c.lineTo(this.x + 11, this.y - 10);
        c.stroke();
    }
    
    setValue(newText) {
        this.readmeText = newText;
    }
    
    requestReadme(){
        //request any contributions from this atom to the readme
        
        return [this.readmeText];
    }
    
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values);
        
        valuesObj.readmeText = this.readmeText;
        
        return valuesObj;
        
    }
}
