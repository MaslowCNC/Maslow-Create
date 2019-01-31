var ShrinkWrap = Atom.create({
    name: "Shrink Wrap",
    atomType: "ShrinkWrap",
    defaultCodeBlock: "hull(~geometry1~,~geometry2~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "2D shape", instance, "geometry");
        instance.addIO("input", "2D shape", instance, "geometry");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});