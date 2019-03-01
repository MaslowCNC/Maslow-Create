class Rectangle extends Atom {

    constructor(values){
        super(values)
        
        this.addIO("input", "length", this, "number");
        this.addIO("input", "width", this, "number");
        this.addIO("output", "geometry", this, "geometry");
        
        this.name = "Rectangle";
        this.atomType = "Rectangle";
        this.defaultCodeBlock = "square([~length~,~width~])";
        this.codeBlock = "";
        
        //generate the correct codeblock for this atom on creation
        this.updateCodeBlock();
        
        this.setValues(values);
    }
}