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
        this.defaultCodeBlock = "square([~x length~,~y length~])";
        this.codeBlock = "";
        
        //generate the correct codeblock for this atom on creation
        this.updateCodeBlock();
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        //Overwrite the normal update code block to update the number of segments also
        
        this.codeBlock = GlobalVariables.api.square([this.findIOValue("x length"),this.findIOValue("y length")]);
        
        super.updateCodeBlock();
    }
}