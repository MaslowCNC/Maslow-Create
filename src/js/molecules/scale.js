import Atom from '../prototypes/atom'

export default class Scale extends Atom{
    
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'multiple', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Scale'
        this.atomType = 'Scale'
        
        this.setValues(values)
    }
    
    updateValue(){
        
        try{
            const values = [this.findIOValue('geometry').toLazyGeometry().toGeometry(), this.findIOValue('multiple')]
            this.basicThreadValueProcessing(values, "scale")
        }catch(err){this.setAlert(err)}
    }
}