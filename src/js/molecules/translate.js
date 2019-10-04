import Atom from '../prototypes/atom'

/**
 * This class creates the translate atom.
 */
export default class Translate extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'xDist', this, 'number', 0)
        this.addIO('input', 'yDist', this, 'number', 0)
        this.addIO('input', 'zDist', this, 'number', 0)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Translate'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Translate'
        
        this.setValues(values)
    }
    
    /**
     * Pass the input geometry to a worker function to compute the translation.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('xDist'), this.findIOValue('yDist'), this.findIOValue('zDist')]
            
            this.basicThreadValueProcessing(values, "translate")
        }catch(err){this.setAlert(err)}
    }
}