import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class RegularPolygon extends Atom {

    constructor(values){
        super(values)
        
        this.addIO("input", "number of sides", this, "number", 6);
        this.addIO("input", "radius", this, "number", 10);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "RegularPolygon";
        this.atomType = "RegularPolygon";

        // create the polygon code block
        this.updateValue();
        
        this.setValues(values);
    }

    updateValue(){
        this.value = GlobalVariables.api.circle({r: this.findIOValue("radius"), center: true, fn: this.findIOValue("number of sides")});
        
        super.updateValue();
    }  
}