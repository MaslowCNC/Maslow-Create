import Atom from '../prototypes/atom'

export default class Stretch extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'x', this, 'number', 1)
        this.addIO('input', 'y', this, 'number', 1)
        this.addIO('input', 'z', this, 'number', 1)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Stretch'
        this.atomType = 'Stretch'
        
        this.setValues(values)
    }
    
    updateValue(){
        try{
            const values = [this.findIOValue('geometry').toLazyGeometry().toGeometry(), this.findIOValue('x'),this.findIOValue('y'),this.findIOValue('z')]
            
            this.basicThreadValueProcessing(values, "stretch")
        }catch(err){this.setAlert(err)}
    }
}