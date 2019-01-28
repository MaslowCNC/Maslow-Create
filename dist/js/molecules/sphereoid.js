var Sphereoid = Atom.create({
    name: "Sphereoid",
    atomType: "Sphereoid",
    sphereRadius: 10,
    codeBlock: "sphere({r: 30, center: true})",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});