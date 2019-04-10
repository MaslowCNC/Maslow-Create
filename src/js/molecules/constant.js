import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Constant extends Atom{
    
    constructor(values){
        super(values);
        
        this.codeBlock = "";
        this.type = "constant";
        this.name = "Constant";
        this.atomType = "Constant";
        this.height = 16;
        this.radius = 15;
        
        this.setValues(values);
        
        this.addIO("output", "number", this, "number", 10);
        
        if (typeof this.ioValues !== 'undefined') {
            this.ioValues.forEach(ioValue => { //for each saved value
                this.children.forEach(io => {  //Find the matching IO and set it to be the saved value
                    if(ioValue.name == io.name){
                        io.setValue(ioValue.ioValue);
                    }
                });
            });
        }
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar(); //call the super function
        
        var output = this.children[0];
        
        this.createEditableValueListItem(valueList,output,"value", "Value", true);
        this.createEditableValueListItem(valueList,this,"name", "Name", false);
        
    }
    
    setValue(newName){
        //Called by the sidebar to set the name
        this.name = newName;
    }
    
    serialize(values){
        //Save the IO value to the serial stream
        var valuesObj = super.serialize(values);
        
        valuesObj.ioValues = [{
            name: "number",
            ioValue: this.children[0].getValue()
        }];
        
        return valuesObj;
        
    }
    
    draw() {

        this.scaledX = GlobalVariables.scaleFactorXY * this.x;
        this.scaledY = GlobalVariables.scaleFactorXY * this.y;


        this.children.forEach(child => {
            child.draw();       
        });
        
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = this.color;
        GlobalVariables.c.rect(this.scaledX - this.radius, this.scaledY - this.height/2, 2*this.radius, this.height);
        GlobalVariables.c.textAlign = "start"; 
        GlobalVariables.c.fillText(this.name, this.scaledX + this.radius, this.scaledY-this.radius);
        GlobalVariables.c.fill();
        GlobalVariables.c.closePath();
    }
}
