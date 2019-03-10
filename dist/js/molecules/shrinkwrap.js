class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Shrink Wrap";
        this.atomType = "ShrinkWrap";
        this.defaultCodeBlock = "chain_hull({closed: false}, [ ])";
        this.codeBlock = "";
        this.ioValues = [];
        this.closedSelection = 0;
        
        this.setValues(values);
        
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO("input", ioValue.name, this, "geometry", "");
            });
        }
        
        this.updateCodeBlock();
    }
    
    updateCodeBlock(){
        
        this.codeBlock = this.defaultCodeBlock;
        
        //Generate the code block string
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
        
        //Add the text for open or closed
        var endString;
        if(this.closedSelection == 0){ //closed
            endString = "chain_hull({closed: true}";
        }
        else{
            endString = "chain_hull({closed: false}";
        }
        
        var regex = /^.+?\{(.+?)\}/gi;
        this.codeBlock = this.codeBlock.replace(regex, endString);
        
        //Shrink wrap it one more time if we have solid selected
        if(this.closedSelection == 2){
            this.codeBlock = "chain_hull({closed: true}, [" + this.codeBlock + "])"
        }
        
        //Set the output nodes with name 'geometry' to be the generated code
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.codeBlock);
            }
        });
        
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender();
        }
        
        //Delete or add ports as needed
        
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
        
        //Write the selection for if the chain is closed
        superSerialObject.closedSelection = this.closedSelection;
        
        return thisAsObject;
        
    }
    
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.updateSidebar();
        
        this.createDropDown(valueList, this, ["Closed", "Open", "Solid"], this.closedSelection, "End:");
        
    } 
    
    changeEquation(newValue){
        this.closedSelection = parseInt(newValue);
        this.updateCodeBlock();
    }
}