import Atom from '../prototypes/atom'

/**
 * This class creates the cutAway molecule.
 */
export default class CutAway extends Atom {
    
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
        this.name = 'Cut Away'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'CutAway'
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }
    
    /**
     * Super class the default update value function. 
     */ 
    updateValue(){
        try{
            this.basicThreadValueProcessing([this.findIOValue('geometry')], "drop")
        }catch(err){this.setAlert(err)}
    }
}