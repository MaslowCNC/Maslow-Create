import Atom from '../prototypes/atom'

/**
 * This class creates the rectangle atom.
 */
export default class Rectangle extends Atom {

    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'x length', this, 'number', 10)
        this.addIO('input', 'y length', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Rectangle'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Rectangle'
        
        this.setValues(values)
    }
    
    /**
     * Create a new rectangle in a worker thread.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('x length'),this.findIOValue('y length')]
            this.basicThreadValueProcessing(values, "rectangle")
        }catch(err){this.setAlert(err)}
    }
}