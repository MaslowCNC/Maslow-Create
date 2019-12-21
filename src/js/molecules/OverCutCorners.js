import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the OverCutCorners atom.
 */
export default class OverCutCorners extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Over Cut Corners'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'OverCutCorners'
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        this.addIO('input', 'diameter', this, 'number', 10)
        
        this.setValues(values)
    }
    
    /**
     * Call the worker thread to over cut the corners of the part
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('diameter')]
            this.basicThreadValueProcessing(values, "Over Cut Inside Corners")
        }catch(err){this.setAlert(err)}
    }
}