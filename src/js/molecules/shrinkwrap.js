import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Shrink Wrap";
        this.atomType = "ShrinkWrap";
        this.ioValues = [];
        this.closedSelection = 0;
        this.addedIO = false;
        
        this.setValues(values);
        
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO("input", ioValue.name, this, "geometry", "");
            });
        }
        
        this.updateValue();
    }
    
    updateValue(){
        
        var inputs = [];
        this.children.forEach( io => {
            if(io.connectors.length > 0 && io.type == "input"){
                inputs.push(io.getValue());
            }
        });
        
        if(inputs.length > 0){
            this.value = GlobalVariables.api.hull.apply(null, inputs);
        }
        
        //Set the output nodes with name 'geometry' to be the generated output
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.value);
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
            this.addIO("input", "2D shape " + GlobalVariables.generateUniqueID(), this, "geometry", "");
            this.addedIO = true;
        }
        if(this.howManyInputPortsAvailable() >= 2 && this.ioValues.length <= 1){  //We need to remove the empty port
            this.deleteEmptyPort();
            this.updateValue();
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
        thisAsObject.closedSelection = this.closedSelection;
        
        return thisAsObject;
        
    }
    
    changeEquation(newValue){
        this.closedSelection = parseInt(newValue);
        this.updateValue();
    }
}