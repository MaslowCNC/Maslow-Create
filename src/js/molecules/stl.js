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
         * This atom's height as drawn on the screen
         */
        this.height
        
        /**
         * This atom's value. Contains the value of the input geometry, not the stl
         * @type {string}
         */
        this.value = null
        
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Draw the svg atom which has a SVG icon.
     */ 
    draw() {
        
        super.draw("rect")
        
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        /**
        * Relates height to radius
        * @type {number}
        */
        this.height = pixelsRadius * 1.5
    
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius/1.2}px Work Sans`
        GlobalVariables.c.fillText('Stl', GlobalVariables.widthToPixels(this.x- this.radius/1.5), GlobalVariables.heightToPixels(this.y)+this.height/6)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    /**
     * Set the value to be the input geometry, then call super updateValue()
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry')]
            this.basicThreadValueProcessing(values, "stl")
        }catch(err){this.setAlert(err)}
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
        const blob = new Blob(this.value, {type: 'text/plain;charset=utf-8'})
        saveAs(blob, GlobalVariables.topLevelMolecule.name+'.stl')
    }
}