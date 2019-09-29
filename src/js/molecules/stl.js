import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

/**
 * This class creates the stl atom which lets you download a .stl file.
 */
export default class Stl extends Atom {
    
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
        this.name = 'Stl'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Stl'
        
        /**
         * This atom's value. Contains the value of the input geometry, not the stl
         * @type {string}
         */
        this.value = null
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Set the value to be the input geometry, then call super updateValue()
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            try{
                this.value = this.findIOValue('geometry')
            }catch(err){this.setAlert(err)}
            super.updateValue()
        }
    }
    
    /**
     * Create a button to download the .stl file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createButton(list, this, "Download STL", ()=>{this.downloadStl()})
    }
    
    /**
     * The function which is called when you press the download button.
     */ 
    downloadStl(){
        const values = [this.value]
        
        const computeValue = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        
        computeValue(values, "stl").then(result => {
            if (result != -1 ){
                const blob = new Blob([result], {type: 'text/plain;charset=utf-8'})
                saveAs(blob, GlobalVariables.topLevelMolecule.name+'.stl')
            }else{
                this.setAlert("Unable to compute")
            }
        })
    }
}