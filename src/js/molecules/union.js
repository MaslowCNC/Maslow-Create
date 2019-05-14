import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Union extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Union'
        this.atomType = 'Union'
        
        this.setValues(values)
    }
    
    updateValue(){
        try{
            const values = [this.findIOValue('geometry1').toLazyGeometry().toGeometry(), this.findIOValue('geometry2').toLazyGeometry().toGeometry()]
            
            this.basicThreadValueProcessing(values, "union")
        }catch(err){this.setAlert(err)}
    }
    
}