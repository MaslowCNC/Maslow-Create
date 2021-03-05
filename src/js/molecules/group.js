import Atom from '../prototypes/atom.js'
import { addOrDeletePorts } from '../alwaysOneFreeInput.js'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the group atom instance.
 */
export default class Group extends Atom{
    /**
    * Creates a new group atom.
    * @param {object} values - An object of values. Each of these values will be applied to the resulting atom.
    */
    constructor(values){
        super(values)
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Group'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Group'
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
        
        //This loads any inputs which this atom had when last saved.
        if (typeof this.ioValues !== 'undefined'){
            this.ioValues.forEach(ioValue => { //for each saved value
                this.addIO('input', ioValue.name, this, 'geometry', '')
            })
        }
    }
    
    /**
     * Add or delete ports as needed in addition to the normal begin propogation stuff
     */ 
    beginPropagation(){
        
        addOrDeletePorts(this)  //Add or remove ports as needed
        
        super.beginPropagation()
    }
    
    /**
     * Draw the group icon
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
        const radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/2, yInPixels + radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2, yInPixels + radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2, yInPixels + radiusInPixels/2)
        //GlobalVariables.c.fill()
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
        GlobalVariables.c.beginPath()
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/4, yInPixels - radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/4, yInPixels - radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/4, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/4, yInPixels - radiusInPixels/2)

        //GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.lineJoin = "round"
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

    }

    /**
    * Super class the default update value function. This function computes creates an array of all of the input values and then passes that array to a worker thread to create the group.
    */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            try{
                var inputValues = []
                this.inputs.forEach( io => {
                    if(io.connectors.length > 0 && io.type == 'input'){
                        inputValues.push(io.getValue())
                    }
                })
                
                const values = { key: "group",paths: inputValues, writePath: this.path }
                
                this.basicThreadValueProcessing(values, "group")
                this.clearAlert()
            }catch(err){this.setAlert(err)}
            
            //Delete or add ports as needed
            addOrDeletePorts(this)
        }
    }
    
    /**
    * Super class the default serialize function to save the inputs since this atom has variable numbers of inputs.
    */ 
    serialize(savedObject){
        var thisAsObject = super.serialize(savedObject)
        
        var ioValues = []
        this.inputs.forEach(io => {
            if (io.connectors.length > 0){
                var saveIO = {
                    name: io.name,
                    ioValue: 10
                }
                ioValues.push(saveIO)
            }
        })
        
        thisAsObject.ioValues = ioValues
        
        return thisAsObject
    }
}