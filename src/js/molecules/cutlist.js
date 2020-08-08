import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the Add To Cutlist atom.
 */
export default class CutList extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '', false, true)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Add To Cutlist'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'cutList'
        
        this.setValues(values)
        /** 
         * This atom's radius as displayed on the screen is 1/65 width
         * @type {number}
         */
        this.radius = 1/65
        /**
         * This atom's height as drawn on the screen
         */
        this.height
    }
    /**
     * Draw the constant which is more rectangular than the regular shape.
     */ 
    draw() {
        
        super.draw("rect")
        
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        /**
        * Relates height to radius
        * @type {number}
        */
        this.height = pixelsRadius/1.3
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius}px Work Sans Bold`
        GlobalVariables.c.fillText(String.fromCharCode(0x2702)+' -', GlobalVariables.widthToPixels(this.x- this.radius/1.5), GlobalVariables.heightToPixels(this.y)+this.height/2)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
    }
    
    /**
     * Add a tag to the input geometry. The substance is not changed.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), "cutList"]
            this.basicThreadValueProcessing(values, "specify")
        }catch(err){this.setAlert(err)}
        super.updateValue()
    }
}