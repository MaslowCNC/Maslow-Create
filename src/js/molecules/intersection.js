import Atom from '../prototypes/atom'

/**
 * This class creates the intersection atom.
 */
export default class Intersection extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Intersection'
        this.atomType = 'Intersection'
        
        this.setValues(values)
    }
    
    /**
     * Grab the input geometries and pass them to a worker thread for computation.
     */ 
    updateValue(){
        
        try{
            const values = [this.findIOValue('geometry1').toLazyGeometry().toGeometry(), this.findIOValue('geometry2').toLazyGeometry().toGeometry()]
            
            this.basicThreadValueProcessing(values, "intersection")
        }catch(err){this.setAlert(err)}
    }
}