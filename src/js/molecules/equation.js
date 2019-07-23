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
         * An array of all of the possible equation selections
         * @type {array of strings}
         */
        this.equationOptions = ['x+y', 'x-y', 'x*y', 'x/y', 'cos(x)', 'sin(x)', 'x^y']
        /**
         * The index number of the currently selected option
         * @type {number}
         */
        this.currentEquation = "x + y"
        
        this.setValues(values)
        
    }
    
    /**
     * Evaluate the equation adding and removing inputs as needed
     */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            
            //Find all the letters in this equation
            var re = /[a-zA-Z]/g;
            const variables = this.currentEquation.match(re);
            
            //Add any inputs which are needed
            for (var key in variables){
                if(!this.inputs.some(input => input.Name === variables[key])){
                    this.addIO('input', variables[key], this, 'number', 1)
                }
            }
            
            //Remove any inputs which are not needed
            for (var key in this.inputs){
                
                if( !variables.includes(this.inputs[key].name) ){
                    console.log("Deleting: ")
                    console.log(this.inputs[key].name)
                    this.removeIO('input', this.inputs[key].name, this)
                }
            }
            
            //Substitute numbers into the string
            
            //Evaluate the equation
            //console.log("Equation evaluates to: ")
            //console.log(eval(this.currentEquation))
            //this.value = eval(this.currentEquation)
            
            super.updateValue()
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
    
    setEquation(newEquation){
        this.currentEquation = newEquation
        this.updateValue()
    }
}