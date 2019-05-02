import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Rotate extends Atom {
    
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
    
    updateValue(){
        
        try{
            this.value = GlobalVariables.api.rotate([this.findIOValue('x-axis degrees'), this.findIOValue('y-axis degrees'), this.findIOValue('z-axis degrees')], this.findIOValue('geometry'))
        }
        catch(err){
            console.warn("Error. Couldn't render")
        }
        
        super.updateValue()
    }
}