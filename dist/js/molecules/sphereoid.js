var Sphereoid = Atom.create({
    name: "Sphereoid",
    atomType: "Sphereoid",
    sphereRadius: 10,
    defaultCodeBlock: "sphere({r: ~radius~, center: true})",
    codeBlock: "sphere({r: 3, center: true})",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance);
        instance.addIO("output", "geometry", instance);
        
        //update the code to display on this atom with the new values
        
        return instance;
    },
    
    updateCodeBlock: function(){
        //substitue the result from each input for the ~...~ section with it's name
        console.log("update code block");
        //find the value between ~...~
        var regex = /~.*~/;
        this.codeBlock = this.defaultCodeBlock.replace(regex, x => {return this.findIOValue(x);});
        
        console.log(this.codeBlock);
    }
});