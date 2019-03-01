class Union extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.addIO("input", "geometry1", this, "geometry", "");
        this.addIO("input", "geometry2", this, "geometry", "");
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Union";
        this.atomType = "Union";
        this.defaultCodeBlock = "union(~geometry1~,~geometry2~)";
        this.codeBlock = "";
        
        this.setValues(values);
    }
}