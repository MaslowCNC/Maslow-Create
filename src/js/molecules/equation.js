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
        this.updateValue()
        this.setValues(values) //Set values again to load input values which were saved
        
        
    }
    /**
     * Draw the Bill of material atom which has a BOM icon.
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
        this.height = pixelsRadius*1.2
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.rect(pixelsX - pixelsRadius*1.5, pixelsY - this.height/2, 2.5*pixelsRadius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, pixelsX + pixelsRadius, pixelsY-pixelsRadius)
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius/1.2}px Work Sans Bold`
        
        GlobalVariables.c.fillText('X + Y', pixelsX - pixelsRadius*1.3, pixelsY+this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    /**
     * Evaluate the equation adding and removing inputs as needed
     */ 
    updateValue(){
        try{
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
            
            if(this.inputs.every(x => x.ready)){
                
                //Substitute numbers into the string
                var substitutedEquation = this.currentEquation
                for (var key in this.inputs){
                    substitutedEquation = substitutedEquation.replace(this.inputs[key].name, this.findIOValue(this.inputs[key].name))
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