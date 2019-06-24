import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the tag atom.
 */
export default class Tag extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '')
        this.addIO('input', 'tag', this, 'string', 'cutList')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.name = 'Add Tag'
        this.atomType = 'Tag'
        
        this.setValues(values)
    }
    
    /**
     * Add a tag to the input geometry. The substance is not changed.
     */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            try{
                this.value = this.findIOValue('geometry').as(this.findIOValue('tag'))
                this.clearAlert()
            }catch(err){
                this.setAlert(err)
            }
            
            super.updateValue()
        }
    }
}