import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Rotate extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.addIO("input", "geometry", this, "geometry", "");
        this.addIO("input", "x-axis degrees", this, "number", 0);
        this.addIO("input", "y-axis degrees", this, "number", 0);
        this.addIO("input", "z-axis degrees", this, "number", 0);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Rotate";
        this.atomType = "Rotate";
        this.defaultCodeBlock = "rotate([~x-axis degrees~,~y-axis degrees~,~z-axis degrees~],~geometry~)";
        this.codeBlock = "";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        
        this.codeBlock = GlobalVariables.api.rotate([this.findIOValue("x-axis degrees"), this.findIOValue("y-axis degrees"), this.findIOValue("z-axis degrees")], this.findIOValue("geometry"));
        
        super.updateCodeBlock();
    }
}