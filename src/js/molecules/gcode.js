import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

/**
 * This class creates the circle atom.
 */
export default class Gcode extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Gcode'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Gcode'
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('input', 'tool size', this, 'number', 6.35)
        this.addIO('input', 'passes', this, 'number', 6)
        this.addIO('input', 'speed', this, 'number', 500)
        this.addIO('input', 'tabs', this, 'string', "true")
        
        this.addIO('output', 'gcode', this, 'geometry', '')
        
        this.setValues(values)
        
        this.updateValue()
    }
    
    /**
     * Generate a layered outline of the part where the tool will cut
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('tool size'), this.findIOValue('passes'), this.findIOValue('speed'), this.findIOValue('tabs')]
            this.basicThreadValueProcessing(values, "stackedOutline")
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * Add a button to download the generated gcode
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,'Download Gcode',() => {
            const blob = new Blob([this.value], {type: 'text/plain;charset=utf-8'})
            saveAs(blob, GlobalVariables.topLevelMolecule.name+'.nc')
        })
    }
    
}