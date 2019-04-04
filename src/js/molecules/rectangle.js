import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Rectangle extends Atom {

    constructor(values){
        super(values)
        
        this.addIO("input", "x length", this, "number", 10);
        this.addIO("input", "y length", this, "number", 10);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Rectangle";
        this.atomType = "Rectangle";
        
        this.updateCodeBlock();
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        
        this.codeBlock = GlobalVariables.api.square([this.findIOValue("x length"),this.findIOValue("y length")]);
        
        super.updateCodeBlock();
    }
}