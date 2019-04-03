import Atom from '../prototypes/atom'

export default class Extrude extends Atom{
    
    constructor(values){
        
        super(values);
        
        this.name = "Extrude";
        this.atomType = "Extrude";
        
        this.addIO("input", "geometry" , this, "geometry", "");
        this.addIO("input", "height"   , this, "number", 10);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        
        this.codeBlock = this.findIOValue("geometry").extrude({ height: 1 })
        
        super.updateCodeBlock();
    }
}