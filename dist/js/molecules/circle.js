class Circle extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.name = "Circle";
        this.atomType = "Circle";
        this.defaultCodeBlock = "circle({r: ~radius~, center: true, fn: 75})";
        this.codeBlock = "";
        
        this.addIO("input", "radius", this, "number");
        this.addIO("output", "geometry", this, "geometry");
        
        this.setValues(values);
        
        //generate the correct codeblock for this atom on creation
        this.updateCodeBlock();
    }
}