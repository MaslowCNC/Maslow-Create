class Scale extends Atom{
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry", this, "geometry");
        this.addIO("input", "multiple", this, "number");
        this.addIO("output", "geometry", this, "geometry");
        
        this.name = "Scale";
        this.atomType = "Scale";
        this.defaultCodeBlock = "~geometry~.scale(~multiple~)";
        this.codeBlock = "";
    }
}