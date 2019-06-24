import Atom from '../prototypes/atom'

/**
 * This class creates the Extrude atom.
 */
export default class Extrude extends Atom{
    
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
        this.name = 'Extrude'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Extrude'
        
        this.addIO('input', 'geometry' , this, 'geometry', '')
        this.addIO('input', 'height'   , this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }
    /**
     * Pass the input shape to the worker thread to compute the extruded shape.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry').toLazyGeometry().toGeometry(), this.findIOValue('height')]
            
            this.basicThreadValueProcessing(values, "extrude")
        }catch(err){this.setAlert(err)}
    }
}