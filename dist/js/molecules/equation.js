class Equation extends Atom {
    
    constructor(values){
        super(values);
        
        this.addIO("input", "x", this, "number", 0);
        this.addIO("input", "y", this, "number", 0);
        this.addIO("output", "z", this, "number", 0);
        
        this.name = "Equation";
        this.atomType = "Equation";
        this.defaultCodeBlock = "";
        this.codeBlock = "";
        this.equationOptions = ["x+y", "x-y", "x*y", "x/y", "cos(x)", "sin(x)", "x^y"];
        this.currentEquation = 0;
        
        this.setValues(values);
        
    }
    
    serialize(savedObject){
        var superSerialObject = super.serialize(null);
        
        //Write the current equation to the serialized object
        superSerialObject.currentEquation = this.currentEquation;
        
        return superSerialObject;
    }
    
    updateCodeBlock(){
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
                z = x/y;
                break;
            case 4:
                z = Math.cos(x);
                break;
            case 5:
                z = Math.sin(x);
                break;
            case 6:
                z = Math.pow(x,y);
                break;
            default:
                console.log("no options found");
                console.log(this.currentEquation);
        }
        
        //Set the output to be the generated value
        this.children.forEach(child => {
            if(child.type == 'output'){
                child.setValue(z);
            }
        });
    }
    
    changeEquation(newValue){
        this.currentEquation = parseInt(newValue);
        this.updateCodeBlock();
    }
    
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.updateSidebar();
        
        this.createDropDown(valueList, this, this.equationOptions, this.currentEquation);
        
    } 
}