class Rotate extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.addIO("input", "geometry", this, "geometry");
        this.addIO("input", "x-axis degrees", this, "number");
        this.addIO("input", "y-axis degrees", this, "number");
        this.addIO("input", "z-axis degrees", this, "number");
        this.addIO("output", "geometry", this, "geometry");
        
        this.name = "Rotate";
        this.atomType = "Rotate";
        this.defaultCodeBlock = "rotate([~x-axis degrees~,~y-axis degrees~,~z-axis degrees~],~geometry~)";
        this.codeBlock = "";
    }
}