import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import { addOrDeletePorts } from '../alwaysOneFreeInput.js'
import { createService } from '../lib/service.js';

export default class Assembly extends Atom{
    
    constructor(values){
        super(values)
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Assembly'
        this.atomType = 'Assembly'
        this.ioValues = []
        
        this.setValues(values)
        
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO('input', ioValue.name, this, 'geometry', '')
            })
        }
        
        this.updateValue()
    }
    
    updateValue(){
        this.processing = true
        
        var inputs = []
        this.children.forEach( io => {
            if(io.connectors.length > 0 && io.type == 'input'){
                inputs.push(io.getValue())
            }
        })
        
        const run = async () => {
            const agent = async ({ ask, question }) => `Secret ${question}`;
            const { ask } = await createService({ webWorker: './webworker.js', agent });
            const values = inputs.map(x => {
                console.log(GlobalVariables.api)
                return x.toLazyGeometry().toGeometry()
            })
           return await ask({values: values, key: "assemble"})
        }

        run().then(result => {
            console.log("Result: ")
            console.log(result)
            
            var output = GlobalVariables.api.Shape.fromGeometry(result)
            console.log("Output: ")
            console.log(output)
            
            this.value = output
        })
        
        
        // if(inputs.length > 0){
            // try{
                // this.clearAlert()
                // this.value = GlobalVariables.api.assemble(...inputs)
            // }catch(err){
                // this.setAlert(err)
            // }
        // }
        
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
        
        this.processing = false
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
        
        return thisAsObject
        
    }
    
}