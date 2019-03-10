class RegularPolygon extends Atom {

    constructor(values){
        super(values)
        
        this.addIO("input", "number of sides", this, "number", 6);
        this.addIO("input", "radius", this, "number", 10);
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "RegularPolygon";
        this.atomType = "RegularPolygon";

        this.defaultCodeBlock = this.computeCodeBlock();
        this.codeBlock = ""
        
        //generate the correct codeblock for this atom on creation
        this.updateCodeBlock();
        
        this.setValues(values);
    }

    computeCodeBlock() {
        let polygon = []
        for(let i = 0; i < this.findIOValue("number of sides"); i++) {
            var angle = i * 2 * Math.PI / this.findIOValue("number of sides") - Math.PI / 2;
            polygon.push([
                this.findIOValue("radius") * Math.cos(angle),
                this.findIOValue("radius") * Math.sin(angle)
            ])
        }

        return "polygon(" + JSON.stringify(polygon) + ")";
    }    
}A