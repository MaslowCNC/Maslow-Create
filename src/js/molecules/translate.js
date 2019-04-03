import Atom from '../prototypes/atom'

export default class Translate extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("input", "geometry", this, "geometry", "");
        this.addIO("input", "xDist", this, "number", 0);
        this.addIO("input", "yDist", this, "number", 0);
        this.addIO("input", "zDist", this, "number", 0);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Translate";
        this.atomType = "Translate";
        this.defaultCodeBlock = "~geometry~.translate([~xDist~, ~yDist~, ~zDist~])";
        this.codeBlock = "";
        
        this.setValues(values);
    }
    
    updateCodeBlock(){
        //Overwrite the normal update code block to update the number of segments also
        
        // this.codeBlock = this.findIOValue("geometry").extrude({ height: 1 })
        this.codeBlock = this.findIOValue("geometry").translate([this.findIOValue("xDist"), this.findIOValue("yDist"), this.findIOValue("zDist")])
        
        super.updateCodeBlock();
    }
}