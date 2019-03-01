class Mirror extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry", this, "geometry");
        this.addIO("input", "x", this, "number");
        this.addIO("input", "y", this, "number");
        this.addIO("input", "z", this, "number");
        this.addIO("output", "geometry", this, "geometry");
        
        this.name = "Mirror";
        this.atomType = "Mirror";
        this.defaultCodeBlock = "mirror([~x~,~y~,~z~], ~geometry~)";
        this.codeBlock = "";
        
        for(var key in values) {
            this[key] = values[key];
        }
    }
}