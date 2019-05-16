import Atom from '../prototypes/atom'

export default class Circle extends Atom {
    
    constructor(values){
        
        super(values)
        
        this.name = 'Circle'
        this.atomType = 'Circle'
        
        this.addIO('input', 'radius', this, 'number', 10)
        this.addIO('input', 'max segment size', this, 'number', 1)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
        
        //generate the correct codeblock for this atom on creation
        this.updateValue()
    }
    
    updateValue(){
        //Overwrite the normal update code block to update the number of segments also
        try{
            const maximumSegmentSize = this.findIOValue('max segment size')
            const circumference  = 3.14*2*this.findIOValue('radius')
            const numberOfSegments = parseInt( circumference / maximumSegmentSize )
            
            const values = [this.findIOValue('radius'), numberOfSegments]
            this.basicThreadValueProcessing(values, "circle")
        }catch(err){this.setAlert(err)}
        
    }
}