import Atom from '../prototypes/atom'

/**
 * This class creates the Difference atom.
 */ 
export default class Difference extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor (values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Difference'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Difference'
        
        this.setValues(values)
    }
    /**
     * Pass the input values to the worker thread to do the actual processing.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry1').toLazyGeometry().toGeometry(), this.findIOValue('geometry2').toLazyGeometry().toGeometry()]
            
            this.basicThreadValueProcessing(values, "difference")
        }catch(err){this.setAlert(err)}
    }
}