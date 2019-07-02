import Atom from '../prototypes/atom'

/**
 * This class creates the stretch atom.
 */
export default class Stretch extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'x', this, 'number', 1)
        this.addIO('input', 'y', this, 'number', 1)
        this.addIO('input', 'z', this, 'number', 1)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Stretch'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Stretch'
        
        this.setValues(values)
    }
    
    /**
     * Pass the input geometry to a worker thread to compute the stretch
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('x'),this.findIOValue('y'),this.findIOValue('z')]
            
            this.basicThreadValueProcessing(values, "stretch")
        }catch(err){this.setAlert(err)}
    }
}