var Sphereoid = Atom.create({
    name: "Sphereoid",
    atomType: "Sphereoid",
    sphereRadius: 10,
    defaultCodeBlock: "sphere({r: ~radius~, center: true})",
    codeBlock: "sphere({r: 10, center: true})",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance);
        instance.addIO("output", "geometry", instance);
        
        //update the code to display on this atom with the new values
        
        return instance;
    }
});