import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the constant atom instance which can be used to define a numerical constant.
 */
export default class Constant extends Atom{
    
    /**
     * Creates a new constant atom.
     * @param {object} values - An object of values. Each of these values will be applied to the resulting atom.
     */ 
    constructor(values){
        super(values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'constant'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Constant'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Constant'
        /**
         * This atom's height as drawn on the screen...probably doesn't need to be in this scope
         * @type {string}
         */
        this.height = 16
        /**
         * This atom's radius as drawn on the screen...probably doesn't need to be in this scope
         * @type {string}
         */
        this.radius = 15
        
        this.setValues(values)
        
        this.addIO('output', 'number', this, 'number', 10)
        
        if (typeof this.ioValues == 'object') {
            this.output.setValue(this.ioValues[0].ioValue)
        }
    }
    
    /**
     * Set's the output value and shows the atom output on the 3D view.
     */ 
    updateValue(){
        this.displayAndPropogate()
    }
    
    /**
     * Add entries for name and value to the side bar. Note: I think that should happen automatically and this function can be deleted. Please test that future self.
     */ 
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar() //call the super function
        this.createEditableValueListItem(valueList,this,'name', 'Name', false)
        this.createEditableValueListItem(valueList,this.output,'value', 'Value', true)
    }
    
    /**
     * Add the value to be saved to the object saved for this molecule.
     */ 
    serialize(values){
        //Save the IO value to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.ioValues = [{
            name: 'number',
            ioValue: this.output.getValue()
        }]
        
        return valuesObj
        
    }
    
    /**
     * Draw the constant which is more rectangular than the regular shape.
     */ 
    draw() {
        
        //Set colors
        if(this.processing){
            GlobalVariables.c.fillStyle = 'blue'
        }
        else if(this.selected){
            GlobalVariables.c.fillStyle = this.selectedColor
            GlobalVariables.c.strokeStyle = this.defaultColor
            /**
             * This background color
             * @type {string}
             */
            this.color = this.selectedColor
            /**
             * This atoms accent color
             * @type {string}
             */
            this.strokeColor = this.defaultColor
        }
        else{
            GlobalVariables.c.fillStyle = this.defaultColor
            GlobalVariables.c.strokeStyle = this.selectedColor
            this.color = this.defaultColor
            this.strokeColor = this.selectedColor
        }
        
        this.inputs.forEach(input => {
            input.draw()       
        })
        if(this.output){
            this.output.draw()
        }
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.rect(this.x - this.radius, this.y - this.height/2, 2*this.radius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius)
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
    }
    
    /**
     * Overwrite the default displayAndPropogate()...why?
     */ 
    displayAndPropogate(){
        this.output.setValue(this.output.getValue())
    }
}