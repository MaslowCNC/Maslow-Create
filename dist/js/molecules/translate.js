var Translate = Atom.create({
    name: "Translate",
    atomType: "Translate",
    defaultCodeBlock: "~geometry~.translate([~xDist~, ~yDist~, ~zDist~])",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry", instance, "geometry");
        instance.addIO("input", "xDist", instance, "number");
        instance.addIO("input", "yDist", instance, "number");
        instance.addIO("input", "zDist", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});