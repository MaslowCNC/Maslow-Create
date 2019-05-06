import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import { addOrDeletePorts } from '../alwaysOneFreeInput.js'

export default class ShrinkWrap extends Atom{
    
    constructor(values){
        super(values)
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Shrink Wrap'
        this.atomType = 'ShrinkWrap'
        this.ioValues = []
        this.closedSelection = 0
        this.addedIO = false
        
        this.setValues(values)
        
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO('input', ioValue.name, this, 'geometry', '')
            })
        }
        
        this.updateValue()
    }
    
    updateValue(){
        
        var inputs = []
        this.children.forEach( io => {
            if(io.connectors.length > 0 && io.type == 'input'){
                inputs.push(io.getValue())
            }
        })
        
        if(inputs.length > 0){
            this.value = GlobalVariables.api.hull.apply(null, inputs)
        }
        
        //Set the output nodes with name 'geometry' to be the generated output
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.value)
            }
        })
        
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender()
        }
        
        //Delete or add ports as needed
        addOrDeletePorts(this)
    }
    
    
    serialize(savedObject){
        var thisAsObject = super.serialize(savedObject)
        
        var ioValues = []
        this.children.forEach(io => {
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
        
        //Write the selection for if the chain is closed
        thisAsObject.closedSelection = this.closedSelection
        
        return thisAsObject
        
    }
    
}