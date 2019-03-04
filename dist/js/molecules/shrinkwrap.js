class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Shrink Wrap";
        this.atomType = "ShrinkWrap";
        this.defaultCodeBlock = "chain_hull([ ])";
        this.codeBlock = "";
        
        this.setValues(values);
        
        this.updateCodeBlock();
    }
    
    updateCodeBlock(){
        super.updateCodeBlock();
        
        var arrayOfChildrenString = "[ ";
        var numberOfElements = 0;
        this.children.forEach(io => {
            if(io.type == "input"){
                if(numberOfElements > 0){
                    arrayOfChildrenString = arrayOfChildrenString + ", ";
                }
                numberOfElements += 1;
                arrayOfChildrenString = arrayOfChildrenString + io.getValue();
            }
        });
        arrayOfChildrenString = arrayOfChildrenString + "]";
        
        //Insert the generated string into the code block
        console.log("String: ");
        console.log(arrayOfChildrenString);
        
        var regex = /\[(.+)\]/gi;
        this.codeBlock = this.codeBlock.replace(regex, arrayOfChildrenString);
        
        console.log("Updated Code Block: ");
        console.log(this.codeBlock);
        
        if(this.howManyInputPortsAvailable() == 0){ //We need to make a new port available
            this.addIO("input", "2D shape " + generateUniqueID(), this, "geometry", "");
        }
        if(this.howManyInputPortsAvailable() >= 2){  //We need to remove the empty port
            this.deleteEmptyPort();
            this.updateCodeBlock();
        }
    }
    
    howManyInputPortsAvailable(){
        var portsAvailable = 0;
        this.children.forEach(io => {
            if(io.type == "input" && io.connectors.length == 0){   //if this port is available
                portsAvailable = portsAvailable + 1;  //Add one to the count
            }
        });
        return portsAvailable
    }
    
    deleteEmptyPort(){
        console.log("delete empty port ran");
        this.children.forEach(io => {
            if(io.type == "input" && io.connectors.length == 0 && this.howManyInputPortsAvailable() >= 2){
                this.removeIO("input", io.name, this);
                console.log("removing a port");
            }
        });
    }
    
}