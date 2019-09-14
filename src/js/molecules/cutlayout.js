import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'

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
        
        this.setValues(values)
    }
    
    /**
     * Extracts all of the elements with the cutList tag, centers each one, generates a .svg file from each one, then lays out all the .svg files on a sheet
     */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            console.log("Would do something with cutlayout here")
        }
    }
    
}
