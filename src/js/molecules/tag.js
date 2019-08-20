import Atom from '../prototypes/atom'

/**
 * This class creates the tag atom.
 */
export default class Tag extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'tag', this, 'string', 'Tag String')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Add Tag'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Tag'
        
        this.setValues(values)
    }
    
    /**
     * Add a tag to the input geometry. The substance is not changed.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('tag')]
            this.basicThreadValueProcessing(values, "tag")
        }catch(err){this.setAlert(err)}
        super.updateValue()
    }
}