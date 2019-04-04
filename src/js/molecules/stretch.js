import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Stretch extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry", this, "geometry", "");
        this.addIO("input", "x", this, "number", 1);
        this.addIO("input", "y", this, "number", 1);
        this.addIO("input", "z", this, "number", 1);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Stretch";
        this.atomType = "Stretch";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        
        this.codeBlock = this.findIOValue("geometry").scale([this.findIOValue("x"),this.findIOValue("y"),this.findIOValue("z")]);
        
        super.updateCodeBlock();
    }
}