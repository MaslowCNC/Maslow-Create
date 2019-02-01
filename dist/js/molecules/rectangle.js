var Rectangle = Atom.create({
    name: "Rectangle",
    atomType: "Rectangle",
    defaultCodeBlock: "square([~length~,~width~])",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "length", instance, "number");
        instance.addIO("input", "width", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        
        //generate the correct codeblock for this atom on creation
        instance.updateCodeBlock();
        
        return instance;
    }
});