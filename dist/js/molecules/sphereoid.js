var Sphereoid = Atom.create({
    name: "Sphereoid",
    atomType: "Sphereoid",
    sphereRadius: 10,
    codeBlock: "some code to create a sphere",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});