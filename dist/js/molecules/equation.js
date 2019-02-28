var Equation = Atom.create({
    name: "Equation",
    atomType: "Equation",
    defaultCodeBlock: "",
    codeBlock: "",
    equationOptions: ["x+y", "x-y", "x*y", "cos(x)", "sin(x)", "x^y"],
    currentEquation: 0,
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "x", instance, "number");
        instance.addIO("input", "y", instance, "number");
        instance.addIO("output", "z", instance, "number");
        
        return instance;
    },
    
    updateCodeBlock: function(){
        //A super classed version of the update codeblock default function which computes the equation values
        var x = this.findIOValue("x");
        var y = this.findIOValue("y");
        
        var z;
        switch(this.currentEquation){
            case 0:
                z = x+y;
                break;
            case 1:
                z = x-y;
                break;
            case 2:
                z = x*y;
                break;
            case 3:
                z = Math.cos(x);
                break;
            case 4:
                z = Math.sin(x);
                break;
            case 5:
                z = Math.pow(x,y);
                break;
            default:
                console.log("no options found");
                console.log(this.currentEquation);
        }
        
        console.log("x: " + x + " y: " + y + " z: " + z);
        
        //Set the output to be the generated value
        this.children.forEach(child => {
            if(child.type == 'output'){
                child.setValue(z);
            }
        });
    },
    
    changeEquation: function(newValue){
        this.currentEquation = parseInt(newValue);
        this.updateCodeBlock();
    },
    
    updateSidebar: function(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = Atom.updateSidebar.call(this); //call the super function
        
        createDropDown(valueList, this, this.equationOptions, this.currentEquation);
        
    } 
});