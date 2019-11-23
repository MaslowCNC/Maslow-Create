import Atom from '../prototypes/atom'

/**
 * This class creates the circle atom.
 */
export default class Union extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Union'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Union'
        
        this.setValues(values)
    }
    
    /**
     * Pass the input geometries to a worker thread to compute their union.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry1'), this.findIOValue('geometry2')]
            
            this.basicThreadValueProcessing(values, "union")
        }catch(err){this.setAlert(err)}
    }
    
}