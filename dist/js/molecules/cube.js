var Cube = Atom.create({
    name: "Cube",
    atomType: "Cube",
    defaultCodeBlock: "cube({size: ~size~, center: true})",
    codeBlock: "cube({size: 10, center: true})",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "size", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});