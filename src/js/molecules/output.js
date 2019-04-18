import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'


export default class Output extends Atom {
    
    constructor(values){
        super (values)
        
        //Add a new output to the current molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.addIO("output", "Geometry", this.parent, "geometry", "");
        }
        
        this.value = null;
        this.type = "output";
        this.name = "Output";
        this.atomType = "Output";
        this.height = 16;
        this.radius = 15;
        
        this.setValues(values);
        
        this.addIO("input", "number or geometry", this, "geometry", "");
    }
    
    updateValue(){
        
        this.value = this.findIOValue("number or geometry");
        this.parent.value = this.value;
        
        super.updateValue();
    }
    
    setID(newID){
        this.uniqueID = newID;
    }
    
    draw() {
        
        this.scaledX = GlobalVariables.scaleFactorXY * this.x;
        this.scaledY = GlobalVariables.scaleFactorXY * this.y;
        
        this.children.forEach(child => {
            child.draw();       
        });

        //fix on right edge of screen so it doesn't dissapear when window resizes
        this.x= GlobalVariables.canvas.width - 30;
        this.height= this.radius +2;
        
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = this.color;
        GlobalVariables.c.rect(this.x - this.radius, this.y - this.height/2, 2*this.radius, this.height);
        GlobalVariables.c.textAlign = "end"; 
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius);
        GlobalVariables.c.fill();
        GlobalVariables.c.closePath();
        
        GlobalVariables.c.beginPath();
        GlobalVariables.c.moveTo(this.x + this.radius, this.y - this.height/2);
        GlobalVariables.c.lineTo(this.x + this.radius + 10, this.y);
        GlobalVariables.c.lineTo(this.x + this.radius, this.y + this.height/2);
        GlobalVariables.c.fill();
    }
}