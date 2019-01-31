var Sphere = Atom.create({
    name: "Sphere",
    atomType: "Sphereoid",
    sphereRadius: 10,
    defaultCodeBlock: "sphere({r: ~radius~, center: true, fn: 50})",
    codeBlock: "sphere({r: 10, center: true, fn: 50})",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        
        //generate the correct codeblock for this atom on creation
        instance.updateCodeBlock();
        
        return instance;
    }
});