import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Mirror extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry", this, "geometry", "");
        this.addIO("input", "x", this, "number", 1);
        this.addIO("input", "y", this, "number", 1);
        this.addIO("input", "z", this, "number", 0);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Mirror";
        this.atomType = "Mirror";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        console.log("Api: ");
        console.log(GlobalVariables.api);
        this.codeBlock = GlobalVariables.api.sphere();
        
        super.updateCodeBlock();
    }
}