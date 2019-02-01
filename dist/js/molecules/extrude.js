var Extrude = Atom.create({
    name: "Extrude",
    atomType: "Extrude",
    defaultCodeBlock: "linear_extrude({ height: ~height~ }, ~geometry~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry" , instance, "geometry");
        instance.addIO("input", "height"   , instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});