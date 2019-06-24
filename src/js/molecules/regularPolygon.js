import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the regular polygon atom.
 */
export default class RegularPolygon extends Atom {

    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'number of sides', this, 'number', 6)
        this.addIO('input', 'radius', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'RegularPolygon'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'RegularPolygon'

        // create the polygon code block
        this.updateValue()
        
        this.setValues(values)
    }
    
    /**
     * Create a new regular polygon in a worker thread.
     */ 
    updateValue(){
        this.value = GlobalVariables.api.circle({r: this.findIOValue('radius'), center: true, fn: this.findIOValue('number of sides')})
        
        super.updateValue()
    }  
}