import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'


export default class BillOfMaterials extends Atom{
    constructor(values){
        super(values);
        
        this.codeBlock = "";
        this.atomType = "Bill Of Materials";
        this.type = "billOfMaterials";
        this.name = "Bill Of Materials";
        this.radius = 20;
        
        this.setValues(values);
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar(); //call the super function
        
        
    }
    
    draw() {
        
        super.draw(); //Super call to draw the rest
        
        
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = "#949294";
        GlobalVariables.c.font = "30px Work Sans Bold";
        GlobalVariables.c.fillText('B', this.x - (this.radius/2.2), this.y + (this.radius/2.1));
        GlobalVariables.c.fill();
        GlobalVariables.c.closePath();
        
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
