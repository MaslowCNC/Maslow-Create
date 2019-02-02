var Rotate = Atom.create({
    name: "Rotate",
    atomType: "Rotate",
    defaultCodeBlock: "rotate([~x-axis degrees~,~y-axis degrees~,~z-axis degrees~],~geometry~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry", instance, "geometry");
        instance.addIO("input", "x-axis degrees", instance, "number");
        instance.addIO("input", "y-axis degrees", instance, "number");
        instance.addIO("input", "z-axis degrees", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});