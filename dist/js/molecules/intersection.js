var Intersection = Atom.create({
    name: "Intersection",
    atomType: "Intersection",
    defaultCodeBlock: "intersection(~geometry1~,~geometry2~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry1", instance, "geometry");
        instance.addIO("input", "geometry2", instance, "geometry");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});