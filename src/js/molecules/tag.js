import Atom from '../prototypes/atom'

export default class Tag extends Atom{
    
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'tag', this, 'string', 'cutList')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Add Tag'
        this.atomType = 'Tag'
        
        this.setValues(values)
    }
    
    updateValue(){
        
        try{
            this.value = this.findIOValue('geometry').as(this.findIOValue('tag'))
            this.clearAlert()
        }catch(err){
            this.setAlert(err)
        }
        
        super.updateValue()
    }
}