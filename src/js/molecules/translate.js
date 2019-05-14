import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

export default class Translate extends Atom{
    
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'xDist', this, 'number', 0)
        this.addIO('input', 'yDist', this, 'number', 0)
        this.addIO('input', 'zDist', this, 'number', 0)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Translate'
        this.atomType = 'Translate'
        
        this.setValues(values)
    }
    
    updateValue(){
        this.processing = true
        
        const computeValue = async () => {
            try{
                const values = [this.findIOValue('geometry').toLazyGeometry().toGeometry(), this.findIOValue('xDist'), this.findIOValue('yDist'), this.findIOValue('zDist')]
                return await GlobalVariables.ask({values: values, key: "translate"})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        
        this.clearAlert()
        
        computeValue().then(result => {
            this.value = GlobalVariables.api.Shape.fromGeometry(result)
            this.processing = false
            super.updateValue()
        })
    }
}