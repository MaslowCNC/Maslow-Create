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
         * This atom's height as drawn on the screen
         */
        this.height = 16
        /**
         * A flag to indicate if this constant should be evolved by genetic algorithms
         * @type {boolean}
         */
        this.evolve = false
        /**
         * Minimum value to be used when evolving constant
         * @type {float}
         */
        this.min = 0
        /**
         * Maximum value to be used when evolving constant
         * @type {float}
         */
        this.max = 20
        
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
        console.log("Updating value with value: ")
        console.log(this.value)
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
        
        this.createCheckbox(valueList,"Evolve",this.evolve,(event)=>{
            if(event.target.checked){
                this.evolve = true
                this.updateSidebar()
            } else{
                this.evolve = false
                this.updateSidebar()
            }
        })
        
        if(this.evolve){
            this.createEditableValueListItem(valueList,this,'min', 'Min', true)
            this.createEditableValueListItem(valueList,this,'max', 'Max', true)
        }
    }
    
    /**
     * Used to walk back out the tree generating a list of constants
     */ 
    walkBackForConstants(callback){
        //If this constant can evolve then add it to the target list
        if(this.evolve){
            callback(this)
        }
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
        
        valuesObj.evolve = this.evolve
        valuesObj.min = this.min
        valuesObj.max = this.max
        
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
        
        let pixelsX = GlobalVariables.widthToPixels(this.x)
        let pixelsY = GlobalVariables.heightToPixels(this.y)
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.rect(pixelsX - pixelsRadius, pixelsY - this.height/2, 2*pixelsRadius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, pixelsX + pixelsRadius, pixelsY-pixelsRadius)
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