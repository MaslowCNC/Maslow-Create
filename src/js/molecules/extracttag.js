import Atom from '../prototypes/atom.js'

/**
 * The cut away tag adds a tag to a part indicating that it should be cut away from the rest of the model in the next assembly. Essentially it creates a negitive version of itself.
 */
export default class ExtractTag extends Atom{
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Extract Tag'
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'extractTag'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Extract Tag'
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('input', 'tag', this, 'string', 'Tag String')
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Adds the cutAway tag to the part
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            try{
                const values = [this.findIOValue('geometry'), this.findIOValue('tag')]
                this.basicThreadValueProcessing(values, "extractTag")
                this.clearAlert()
            }catch(err){this.setAlert(err)}
            super.updateValue()
        }
    }
    
}
