import Atom from '../prototypes/atom.js'
import { addOrDeletePorts } from '../alwaysOneFreeInput.js'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the shrinkwrap atom. This behavior can also be called 'hull'
 */
export default class ShrinkWrap extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Shrink Wrap'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'ShrinkWrap'
        /**
         * A list of all of the inputs to this molecule. May be passed to the constructor and loaded.
         * @type {array}
         */
        this.ioValues = []
        /**
         * This was used when there was a drop down to select closed...may be deleted
         * @type {number}
         */
        this.closedSelection = 0
        /**
         * I believe this is no longer used alzatin - is that right?
         * @type {boolean}
         */
        this.addedIO = false
        
        this.setValues(values)
        
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO('input', ioValue.name, this, 'geometry', '')
            })
        }
        
        this.updateValue()
    }
    /**
     * Draw the translate icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x+this.radius/4), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/2.5), 0, Math.PI * 2, false)       
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()  
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x-this.radius/4), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/2.5), 0, Math.PI * 2, false)       
        GlobalVariables.c.fill() 
        GlobalVariables.c.closePath()  

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.rect(GlobalVariables.widthToPixels(this.x- this.radius/4), 
            GlobalVariables.heightToPixels(this.y- this.radius), 
            GlobalVariables.widthToPixels(this.radius/2), 
            GlobalVariables.widthToPixels(this.radius/2))       
        GlobalVariables.c.fill() 
        GlobalVariables.c.closePath() 
          

    }
    /**
     * Generates a list of all of the input shapes, then passees them to a worker thread to compute the hull
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            try{
                var inputsList = []
                this.inputs.forEach( io => {
                    if(io.connectors.length > 0){
                        inputsList.push(io.getValue())
                    }
                })
                const values = inputsList.map(x => {
                    return x
                })
                
                this.basicThreadValueProcessing(values, "hull")
            }catch(err){this.setAlert(err)}
            
            //Delete or add ports as needed
            addOrDeletePorts(this)
        }
    }
     
    /**
     * Add the names of the inputs to the saved object so that they can be loaded later
     */ 
    serialize(savedObject){
        var thisAsObject = super.serialize(savedObject)
        
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
        
        //Write the selection for if the chain is closed
        thisAsObject.closedSelection = this.closedSelection
        
        return thisAsObject
        
    }
    
}