import Atom from '../prototypes/atom'

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
        
        //Set the default
        this.value = 10
        
        this.setValues(values)
        
        this.addIO('output', 'number', this, 'number', 10)
        
        this.decreaseToProcessCountByOne()  //Since there is nothing upstream this needs to be removed from the list here
        
        //This is done wrong. We should not be saving the value in the io values
        if (typeof this.ioValues == 'object') {
            this.value = this.ioValues[0].ioValue
            this.output.value = this.value
        }
        
    }
    
    /**
     * Draw the Bill of material atom which has a BOM icon.
     */ 
    draw() {
        
        super.draw("rect")
        
    }
    
    /**
     * Set's the output value and shows the atom output on the 3D view.
     */ 
    updateValue(){
        this.value = this.output.getValue()  //We read from the output because it is set by the sidebar for confusing reasons
        this.displayAndPropogate()
    }
    
    /**
     * Starts propagation from this constant.
     */ 
    beginPropagation(){
        this.output.setValue(this.value)
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
    
}