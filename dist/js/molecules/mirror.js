var Mirror = Atom.create({
    name: "Mirror",
    atomType: "Mirror",
    defaultCodeBlock: "mirror([~x~,~y~,~z~], ~geometry~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry", instance, "geometry");
        instance.addIO("input", "x", instance, "number");
        instance.addIO("input", "y", instance, "number");
        instance.addIO("input", "z", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});