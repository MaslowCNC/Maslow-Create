import Atom from '../prototypes/atom.js'
//import GlobalVariables from '../globalvariables.js'

/**
 * The Cut Layout atom extracts a copy of each shape on the cutlist and places them optimally on a cut sheet.
 */
export default class CutLayout extends Atom{
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Cut Layout'
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'cutLayout'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Cut Layout'
        
        this.addIO('input', 'geometry', this, 'geometry', null)

        this.addIO('input', 'Spacing', this, 'number', 5)
        //this.addIO('input', 'Sheet Width', this, 'number', 50)
        //this.addIO('input', 'Sheet Length', this, 'number', 50)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }

    /**
    * Pass the input geometry to a worker function to compute the translation.
    */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('Spacing')]
            
            this.basicThreadValueProcessing(values, "layout")
        }catch(err){
            this.setAlert(err)
        }
    }
}
