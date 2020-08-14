import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the Equation atom.
 */
export default class Equation extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('output', 'result', this, 'number', 0)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Equation'
        
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Equation'
        
        /**
         * Evaluate the equation adding and removing inputs as needed
         */ 
        this.value = 0
        
        /**
         * This atom's height as drawn on the screen
         */
        this.height
        /**
         * The index number of the currently selected option
         * @type {number}
         */
        this.currentEquation = "x + y"
        
        this.setValues(values)
        this.addAndRemoveInputs()
        this.setValues(values) //Set values again to load input values which were saved
        
        
    }
    /**
     * Draw the Bill of material atom which has a BOM icon.
     */ 
    draw() {
        
        super.draw("rect")
        
        let pixelsX = GlobalVariables.widthToPixels(this.x)
        let pixelsY = GlobalVariables.heightToPixels(this.y)
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        /**
        * Relates height to radius
        * @type {number}
        */
        this.height = pixelsRadius

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius/1.5}px Work Sans Bold`
        
        GlobalVariables.c.fillText('X + Y', pixelsX - pixelsRadius/1.2, pixelsY+this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    addAndRemoveInputs(){
        //Find all the letters in this equation
        var re = /[a-zA-Z]/g
        const variables = this.currentEquation.match(re)
        
        //Remove any inputs which are not needed
        const deleteExtraInputs = () => {
            this.inputs.forEach( input => {
                if( !variables.includes(input.name) ){
                    this.removeIO('input', input.name, this)
                    deleteExtraInputs() //This needs to be called recursively to make sure all the inputs are deleted
                }
            })
        }
        deleteExtraInputs()
        
        //Add any inputs which are needed
        for (var variable in variables){
            if(!this.inputs.some(input => input.Name === variables[variable])){
                this.addIO('input', variables[variable], this, 'number', 1)
            }
        }
    }
    
    /**
     * Evaluate the equation adding and removing inputs as needed
     */ 
    updateValue(name){
        try{
            
            this.addAndRemoveInputs()
            
            if(this.inputs.every(x => x.ready)){
                
                super.updateValue()
                //Substitute numbers into the string
                var substitutedEquation = this.currentEquation
                
                //Find all the letters in this equation
                var re = /[a-zA-Z]/g
                const variables = this.currentEquation.match(re)
                for (var variable in variables){
                    for (var i= 0; i<this.inputs.length; i++){
                        if (this.inputs[i].name == variables[variable]) {
                            substitutedEquation = substitutedEquation.replace(this.inputs[i].name, this.findIOValue(this.inputs[i].name))
                        }
                    }
                }
                //Evaluate the equation
                this.value = GlobalVariables.limitedEvaluate(substitutedEquation)
                
                this.output.setValue(this.value)
                this.output.ready = true
            }
        }catch(err){
            console.warn(err)
            this.setAlert(err)
        }
    }
    
    /**
     * Add the equation choice to the object which is saved for this molecule
     */
    serialize(){
        var superSerialObject = super.serialize(null)
        
        //Write the current equation to the serialized object
        superSerialObject.currentEquation = this.currentEquation
        
        return superSerialObject
    }
    
    /**
     * Add a dropdown to choose the equation type to the sidebar.
     */
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.updateSidebar()
        
        this.createEditableValueListItem(valueList,this,"currentEquation", "output=", false, (newEquation)=>{this.setEquation(newEquation)})
        
    }
    
    /**
     * Set the current equation to be a new value.
     */
    setEquation(newEquation){
        this.currentEquation = newEquation.trim() //remove leading and trailing whitespace
        this.updateValue()
    }
}