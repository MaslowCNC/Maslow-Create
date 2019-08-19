import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

/**
 * This class creates the svg atom which lets you download a .svg file.
 */
export default class Svg extends Atom {
    
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
        this.name = 'Svg'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Svg'
        
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
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            try{
                this.value = this.findIOValue('geometry')
            }catch(err){this.setAlert(err)}
            super.updateValue()
        }
    }
    
    /**
     * Create a button to download the .svg file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createButton(list, this, "Download SVG", ()=>{this.downloadSvg()})
    }
    
    /**
     * The function which is called when you press the download button.
     */ 
    downloadSvg(){
        const values = [this.findIOValue('geometry')]
        
        const computeValue = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        
        computeValue(values, "svg").then(result => {
            if (result != -1 ){
                const blob = new Blob([result], {type: 'text/plain;charset=utf-8'})
                saveAs(blob, GlobalVariables.topLevelMolecule.name+'.svg')
            }else{
                this.setAlert("Unable to compute")
            }
        })
    }
}