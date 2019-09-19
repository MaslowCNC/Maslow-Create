import Atom from '../prototypes/atom.js'
import { addOrDeletePorts } from '../alwaysOneFreeInput.js'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the Assembly atom instance.
 */
export default class Assembly extends Atom{
    /**
    * Creates a new assembly atom.
    * @param {object} values - An object of values. Each of these values will be applied to the resulting atom.
    */
    constructor(values){
        super(values)
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Assembly'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Assembly'
        /**
         * A list of all of the inputs to this molecule. May be loaded when the molecule is created.
         * @type {array}
         */
        this.ioValues = []
        /**
         * A flag to determine if cutaway geometry is removed.
         * @type {boolean}
         */
        this.removeCutawayGeometry = true
        
        this.setValues(values)
        
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO('input', ioValue.name, this, 'geometry', '')
            })
        }
    }
    
    /**
    * Super class the default update value function. This function computes creates an array of all of the input values and then passes that array to a worker thread to create the assembly.
    */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            try{
                var inputs = []
                this.inputs.forEach( io => {
                    if(io.connectors.length > 0 && io.type == 'input'){
                        inputs.push(io.getValue())
                    }
                })
                const mappedInputs = inputs.map(x => {
                    return x
                })
                
                const values = [mappedInputs, this.removeCutawayGeometry]
                
                this.basicThreadValueProcessing(values, "assemble")
                this.clearAlert()
            }catch(err){this.setAlert(err)}
            
            //Delete or add ports as needed
            addOrDeletePorts(this)
        }
    }
    
    /**
    * Updates the side bar to add check boxes to turn on and off different elements.
    */
    updateSidebar(){
        var sideBar = super.updateSidebar()
        
        this.inputs.forEach(input => {
            if(input.connectors.length != 0){
                
                var shouldThisBeChecked = true
                if(input.getValue().tags){  //Check to see if this part is currently being cut away
                    if(input.getValue().tags.indexOf("user/cutAway") > -1){
                        shouldThisBeChecked = false
                    }
                }
                
                this.createCheckbox(sideBar,input.name,shouldThisBeChecked,(event)=>{
                    var updatedValue = input.getValue()
                    
                    if(!event.target.checked){ //If the box has just been unchecked
                        if(updatedValue.tags){
                            updatedValue.tags.push("user/cutAway")
                        }
                        else{
                            updatedValue.tags = ["user/cutAway"]
                        }
                        input.setValue(updatedValue)
                    }
                    else{
                        var index = updatedValue.tags.indexOf("user/cutAway")
                        if (index > -1) {
                            updatedValue.tags.splice(index, 1)
                        }
                        input.setValue(updatedValue)
                    }
                })
            }
        })
        
        //Add a checkbox for deciding if the cutaway geometry should be kept
        this.createCheckbox(sideBar,"Remove Cutaway Geometry", this.removeCutawayGeometry,(event)=>{
            
            if(!event.target.checked){ //If the box has just been unchecked
                this.removeCutawayGeometry = false
                this.updateValue()
            }
            else{
                this.removeCutawayGeometry = true
                this.updateValue()
            }
        })
    }
    
    /**
    * Super class the default serialize function to save the inputs since this atom has variable numbers of inputs.
    */ 
    serialize(savedObject){
        var thisAsObject = super.serialize(savedObject)
        
        thisAsObject.removeCutawayGeometry = this.removeCutawayGeometry
        
        var ioValues = []
        this.inputs.forEach(io => {
            if (io.type == 'input'){
                var saveIO = {
                    name: io.name,
                    ioValue: 10
                }
                ioValues.push(saveIO)
            }
        })
        
        ioValues.forEach(ioValue => {
            thisAsObject.ioValues.push(ioValue)
        })
        
        return thisAsObject
        
    }
    
}