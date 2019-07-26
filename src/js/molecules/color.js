import Atom from '../prototypes/atom'

/**
 * This class creates the color atom which can be used to give a part a color.
 */
export default class Color extends Atom {
    
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
        this.name = 'Color'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Color'
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Applies a color tag to the object in a worker thread.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), "blue"]
            this.basicThreadValueProcessing(values, "color")
        }catch(err){this.setAlert(err)}
    }
}