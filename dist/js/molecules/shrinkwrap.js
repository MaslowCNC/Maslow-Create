class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Shrink Wrap";
        this.atomType = "ShrinkWrap";
        this.defaultCodeBlock = "chain_hull([~2D shape 1~,~2D shape 2~])";
        this.codeBlock = "";
        
        this.setValues(values);
        
        this.updateCodeBlock();
    }
    
    updateCodeBlock(){
        super.updateCodeBlock();
        
        console.log(this.howManyInputPortsAvailable() + " ports available");
        
        if(this.howManyInputPortsAvailable() == 0){ //We need to make a new port available
            this.addIO("input", "2D shape " + generateUniqueID(), this, "geometry", "");
        }
        if(this.howManyInputPortsAvailable() >= 2){  //We need to remove the empty port
            this.deleteEmptyPort();
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