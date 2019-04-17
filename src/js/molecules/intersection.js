import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Intersection extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry1", this, "geometry", "");
        this.addIO("input", "geometry2", this, "geometry", "");
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Intersection";
        this.atomType = "Intersection";
        
        this.setValues(values);
    }
    
    updateValue(){
        
        try{
            this.value = GlobalVariables.api.intersection(this.findIOValue("geometry1"), this.findIOValue("geometry2"));
        }catch(err){}
        
        super.updateValue();
    }
}