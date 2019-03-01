class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("input", "2D shape 1", this, "geometry");
        this.addIO("input", "2D shape 2", this, "geometry");
        this.addIO("output", "geometry", this, "geometry");
        
        this.name = "Shrink Wrap";
        this.atomType = "ShrinkWrap";
        this.defaultCodeBlock = "hull(~2D shape 1~,~2D shape 2~)";
        this.codeBlock = "";
        
        this.setValues(values);
    }
}