class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Shrink Wrap";
        this.atomType = "ShrinkWrap";
        this.defaultCodeBlock = "chain_hull([ ])";
        this.codeBlock = "";
        this.ioValues = [];
        
        this.setValues(values);
        
        if (typeof this.ioValues !== 'undefined'){
            console.log("loading IO values for shrinkwrap");
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO("input", ioValue.name, this, "geometry", "");
            });
        }
        
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
        var regex = /\[(.+)\]/gi;
        this.codeBlock = this.codeBlock.replace(regex, arrayOfChildrenString);
        
        //Check to see if any of the loaded ports have been connected to. If they have, remove them from the this.ioValues list 
        this.children.forEach(child => {
            this.ioValues.forEach(ioValue => {
                if (child.name == ioValue.name && child.connectors.length > 0){
                    this.ioValues.splice(this.ioValues.indexOf(ioValue),1); //Let's remove it from the ioValues list
                }
            });
        });
        
        //Add or delete ports as needed
        if(this.howManyInputPortsAvailable() == 0){ //We need to make a new port available
            this.addIO("input", "2D shape " + generateUniqueID(), this, "geometry", "");
        }
        if(this.howManyInputPortsAvailable() >= 2 && this.ioValues.length <= 1){  //We need to remove the empty port
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
        this.children.forEach(io => {
            if(io.type == "input" && io.connectors.length == 0 && this.howManyInputPortsAvailable() >= 2){
                this.removeIO("input", io.name, this);
            }
        });
    }
    
    serialize(savedObject){
        var thisAsObject = super.serialize(savedObject);
        
        var ioValues = [];
        this.children.forEach(io => {
            if (io.type == "input"){
                var saveIO = {
                    name: io.name,
                    ioValue: 10
                };
                ioValues.push(saveIO);
            }
        });
        
        ioValues.forEach(ioValue => {
            thisAsObject.ioValues.push(ioValue);
        });
        
        return thisAsObject;
        
    }
    
}