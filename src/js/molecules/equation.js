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
        
        this.addIO('input', 'y', this, 'number', 0)
        this.addIO('input', 'x', this, 'number', 0)
        this.addIO('output', 'z', this, 'number', 0)
        
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
        this.currentEquation = 0
        
        this.setValues(values)
        
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
     * Check the selection of equation and then apply that to the inputs
     */
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            var x = this.findIOValue('x')
            var y = this.findIOValue('y')
            
            var z
            switch(this.currentEquation){
            case 0:
                z = x+y
                break
            case 1:
                z = x-y
                break
            case 2:
                z = x*y
                break
            case 3:
                z = x/y
                break
            case 4:
                z = Math.cos(x)
                break
            case 5:
                z = Math.sin(x)
                break
            case 6:
                z = Math.pow(x,y)
                break
            }
            
            //Set the output to be the generated value
            this.output.setValue(z)
        }
    }
    
    /**
     * Called when the equation drop down is changed. Grab the new value and then recompute.
     */
    changeEquation(newValue){
        this.currentEquation = parseInt(newValue)
        this.updateValue()
    }
    
    /**
     * Add a dropdown to choose the equation type to the sidebar.
     */
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.updateSidebar()
        
        this.createDropDown(valueList, this, this.equationOptions, this.currentEquation, 'z = ')
        
    } 
}