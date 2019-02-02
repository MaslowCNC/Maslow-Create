var Mirror = Atom.create({
    name: "Mirror",
    atomType: "Mirror",
    defaultCodeBlock: "mirror([~x~,~y~,~z~], ~geometry~)",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "geometry", instance, "geometry");
        instance.addIO("input", "x", instance, "geometry");
        instance.addIO("input", "y", instance, "geometry");
        instance.addIO("input", "z", instance, "geometry");
        instance.addIO("output", "geometry", instance, "geometry");
        return instance;
    }
});