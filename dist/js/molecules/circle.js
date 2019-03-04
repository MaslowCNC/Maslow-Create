class Circle extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.name = "Circle";
        this.atomType = "Circle";
        this.defaultCodeBlock = "circle({r: ~radius~, center: true, fn: 25})";
        this.codeBlock = "";
        
        this.addIO("input", "radius", this, "number", 10);
        this.addIO("input", "max segment size", this, "number", 1);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.setValues(values);
        
        //generate the correct codeblock for this atom on creation
        this.updateCodeBlock();
    }
    
    updateCodeBlock(){
        //Overwrite the normal update code block to update the number of segments also
        
        console.log("Sub update code block ran");
        console.log(this.defaultCodeBlock);
        
        var maximumSegmentSize = this.findIOValue("max segment size");
        var circumference  = 3.14*2*this.findIOValue("radius");
        
        console.log("circumference: " + circumference);
        
        var numberOfSegments = parseInt( circumference / maximumSegmentSize );
        
        console.log("Number of segments: " + numberOfSegments);
        
        var regex = /fn: (\d+)\}/gi;
        
        console.log("New default: ");
this.defaultCodeBlock = this.defaultCodeBlock.replace(regex, "fn: " + numberOfSegments + "}");
        console.log(this.defaultCodeBlock);
        
        super.updateCodeBlock();
        
    }
}