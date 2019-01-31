var Cylinder = Atom.create({
    name: "Cylinder",
    atomType: "Cylinder",
    defaultCodeBlock: "cylinder({r: ~radius~, h: ~height~, center: true})",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance, "number");
        instance.addIO("input", "height", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        
        //generate the correct codeblock for this atom on creation
        instance.updateCodeBlock();
        
        return instance;
    }
});