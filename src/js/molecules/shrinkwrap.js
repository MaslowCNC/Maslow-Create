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
        
        try{
            var inputs = []
            this.children.forEach( io => {
                if(io.connectors.length > 0 && io.type == 'input'){
                    inputs.push(io.getValue())
                }
            })
            const values = inputs.map(x => {
                return x.toLazyGeometry().toGeometry()
            })
            
            this.basicThreadValueProcessing(values, "hull")
        }catch(err){this.setAlert(err)}
        
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