import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Intersection extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Intersection'
        this.atomType = 'Intersection'
        
        this.setValues(values)
    }
    
    updateValue(){
        
        try{
            const values = [this.findIOValue('geometry1').toLazyGeometry().toGeometry(), this.findIOValue('geometry2').toLazyGeometry().toGeometry()]
            
            this.basicThreadValueProcessing(values, "intersection")
        }catch(err){this.setAlert(err)}
    }
}