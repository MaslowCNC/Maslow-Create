import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

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
         * A description of this atom
         * @type {string}
         */
        this.description = "Defines a mathematical constant."
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
        
        /**
         * The default value for the constant
         * @type {float}
         */
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
        this.value = this.output.getValue()  //We read from the output because it is set by the sidebar because constants have no inputs
        this.output.setValue(this.value)
        this.output.ready = true

        //Write to this's path just so that we know it has happened and don't load this again next time the project is opened
        try{
            const values = {op: "text", value:this.value, writePath: this.path }
            window.ask(values)
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * Starts propagation from this atom if it is not waiting for anything up stream.
     */ 
    beginPropagation(){
        //Check to see if a value already exists. Generate it if it doesn't.
        if(!GlobalVariables.availablePaths.includes(this.path)){
            //Triggers inputs with nothing connected to begin propagation
            this.updateValue()
        }
    }
    
    /**
     * Sets all the input and output values to match their associated atoms.
     */
    loadTree(){
        return this.value
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
     * Used to walk back out the tree generating a list of constants...used for evolving
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
     * Send the value of this atom to the 3D display. Used to display the number
     */ 
    sendToRender(){
        //Send code to jotcad to render
        try{
            const values = {op: "text", value:this.output.getValue(), writePath: this.path }
            const {answer} = window.ask(values)
                answer.then( () => {
                    GlobalVariables.writeToDisplay(this.path)
                })
        }
        catch(err){
            this.setAlert(err)
        }

    }
    
}