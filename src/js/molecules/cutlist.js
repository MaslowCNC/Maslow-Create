import Atom from '../prototypes/atom'

/**
 * This class creates the Add To Cutlist atom.
 */
export default class CutList extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '', false, true)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Add To Cutlist'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'cutList'
        
        this.setValues(values)
    }
    
    /**
     * Add a tag to the input geometry. The substance is not changed.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), "cutList"]
            this.basicThreadValueProcessing(values, "specify")
        }catch(err){this.setAlert(err)}
        super.updateValue()
    }
}