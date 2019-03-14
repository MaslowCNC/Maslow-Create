import Atom from '../prototypes/atom'

export default class Extrude extends Atom{
    
    constructor(values){
        
        super(values);
        
        this.name = "Extrude";
        this.atomType = "Extrude";
        this.defaultCodeBlock = "linear_extrude({ height: ~height~ }, ~geometry~)";
        this.codeBlock = "";
        
        this.addIO("input", "geometry" , this, "geometry", "");
        this.addIO("input", "height"   , this, "number", 10);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.setValues(values);
    }
}