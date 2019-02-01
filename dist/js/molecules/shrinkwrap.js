var ShrinkWrap = Atom.create({
    name: "Shrink Wrap",
    atomType: "ShrinkWrap",
    defaultCodeBlock: "hull(~2D shape 1~,~2D shape 2~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "2D shape 1", instance, "geometry");
        instance.addIO("input", "2D shape 2", instance, "geometry");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});