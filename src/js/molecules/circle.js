import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

export default class Circle extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.name = 'Circle'
        this.atomType = 'Circle'
        
        this.addIO('input', 'radius', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }
    
    updateValue(){
        try{
            const circumference  = 3.14*2*this.findIOValue('radius')
            const numberOfSegments = Math.max(parseInt( circumference / GlobalVariables.circleSegmentSize ),5)
            
            const values = [this.findIOValue('radius'), numberOfSegments]
            this.basicThreadValueProcessing(values, "circle")
        }catch(err){this.setAlert(err)}
    }
}