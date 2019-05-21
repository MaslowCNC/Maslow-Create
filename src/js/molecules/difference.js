import Atom from '../prototypes/atom'

export default class Difference extends Atom{
    
    constructor (values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Difference'
        this.atomType = 'Difference'
        
        this.setValues(values)
    }
    
    updateValue(){
        try{
            const values = [this.findIOValue('geometry1').toLazyGeometry().toGeometry(), this.findIOValue('geometry2').toLazyGeometry().toGeometry()]
            
            this.basicThreadValueProcessing(values, "difference")
        }catch(err){this.setAlert(err)}
    }
}