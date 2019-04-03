import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Difference extends Atom{
    
    constructor (values){
        
        super(values);
        
        this.addIO("input", "geometry1", this, "geometry", "");
        this.addIO("input", "geometry2", this, "geometry", "");
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Difference";
        this.atomType = "Difference";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        //Overwrite the normal update code block to update the number of segments also
        
        // this.codeBlock = this.findIOValue("geometry").extrude({ height: 1 })
        this.codeBlock = GlobalVariables.api.difference(this.findIOValue("geometry1"), this.findIOValue("geometry2"));
        
        super.updateCodeBlock();
    }
}