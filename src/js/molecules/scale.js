import Atom from '../prototypes/atom'

export default class Scale extends Atom{
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry", this, "geometry", "");
        this.addIO("input", "multiple", this, "number", 10);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Scale";
        this.atomType = "Scale";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        
        this.codeBlock = this.findIOValue("geometry").scale(this.findIOValue("multiple"));
        
        super.updateCodeBlock();
    }
}