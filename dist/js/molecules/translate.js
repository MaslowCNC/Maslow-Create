var Translate = Atom.create({
    name: "Translate",
    atomType: "Translate",
    defaultCodeBlock: "~geometry~.translate([~xDist~, ~yDist~, ~zDist~])",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry", instance);
        instance.addIO("input", "xDist", instance);
        instance.addIO("input", "yDist", instance);
        instance.addIO("input", "zDist", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});