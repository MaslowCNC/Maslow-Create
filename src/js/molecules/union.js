import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Union extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry1", this, "geometry", "");
        this.addIO("input", "geometry2", this, "geometry", "");
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Union";
        this.atomType = "Union";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        
        try{
            this.codeBlock = GlobalVariables.api.union(this.findIOValue("geometry1"), this.findIOValue("geometry2"));
        }catch(err){}
        
        super.updateCodeBlock();
    }
    
}