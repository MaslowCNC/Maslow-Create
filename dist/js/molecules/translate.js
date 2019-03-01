class Translate extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("input", "geometry", this, "geometry");
        this.addIO("input", "xDist", this, "number");
        this.addIO("input", "yDist", this, "number");
        this.addIO("input", "zDist", this, "number");
        this.addIO("output", "geometry", this, "geometry");
        
        this.name = "Translate";
        this.atomType = "Translate";
        this.defaultCodeBlock = "~geometry~.translate([~xDist~, ~yDist~, ~zDist~])";
        this.codeBlock = "";
        
        for(var key in values) {
            this[key] = values[key];
        }
    }
}