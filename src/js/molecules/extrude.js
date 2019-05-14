import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

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
        this.processing = true
        
        const computeValue = async () => {
            try{
                const values = [this.findIOValue('geometry').toLazyGeometry().toGeometry(), this.findIOValue('height')]
                return await GlobalVariables.ask({values: values, key: "extrude"})
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
        
        // try{
        // this.clearAlert()
        // this.value = .extrude({ height:  })
        // }
        // catch(err){
        // this.setAlert(err)
        // }
    }
}