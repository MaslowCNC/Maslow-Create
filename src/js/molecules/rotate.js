import Atom from '../prototypes/atom'

/**
 * This class creates the rotate atom.
 */
export default class Rotate extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'x-axis degrees', this, 'number', 0)
        this.addIO('input', 'y-axis degrees', this, 'number', 0)
        this.addIO('input', 'z-axis degrees', this, 'number', 0)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Rotate'
        this.atomType = 'Rotate'
        
        this.setValues(values)
    }
    
    /**
     * Pass the input shape to a worker thread to compute the rotation
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry').toLazyGeometry().toGeometry(), this.findIOValue('x-axis degrees'), this.findIOValue('y-axis degrees'), this.findIOValue('z-axis degrees')]
            this.basicThreadValueProcessing(values, "rotate")
        }catch(err){this.setAlert(err)}
    }
}