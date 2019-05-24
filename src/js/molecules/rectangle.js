import Atom from '../prototypes/atom'

export default class Rectangle extends Atom {

    constructor(values){
        super(values)
        
        this.addIO('input', 'x length', this, 'number', 10)
        this.addIO('input', 'y length', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Rectangle'
        this.atomType = 'Rectangle'
        
        this.setValues(values)
    }
    
    updateValue(){
        try{
            const values = [this.findIOValue('x length'),this.findIOValue('y length')]
            this.basicThreadValueProcessing(values, "rectangle")
        }catch(err){this.setAlert(err)}
    }
}