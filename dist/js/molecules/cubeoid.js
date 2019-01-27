
var Cubeoid = Atom.create({
    name: "Cubeoid",
    atomType: "Cubeoid",
    xL: 10,
    yL: 10,
    zL: 10,
    codeBlock: "some code to create a sphere",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "L", instance);
        instance.addIO("input", "W", instance);
        instance.addIO("input", "H", instance);
        instance.addIO("output", "geometry", instance);
        return instance;
    }
});