import Atom from '../prototypes/atom'

export default class Extrude extends Atom{
    
    constructor(values){
        
        super(values)
        
        this.name = 'Extrude'
        this.atomType = 'Extrude'
        
        this.addIO('input', 'geometry' , this, 'geometry', '')
        this.addIO('input', 'height'   , this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }
    
    updateValue(){
        
        try{
            this.clearAlert()
            this.value = this.findIOValue('geometry').extrude({ height: this.findIOValue('height') })
        }
        catch(err){
            this.setAlert(err)
        }
        
        super.updateValue()
    }
}