import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

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
        
        this.addIO('input', 'geometry', this, 'geometry', '', false, true)
        this.addIO('input', 'tag', this, 'string', 'Tag String')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Add Tag'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Tag'
        /**
         * This atom's height as drawn on the screen
         */
        this.height
        
        this.setValues(values)
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
        this.height= pixelsRadius
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius}px Work Sans Bold`
        GlobalVariables.c.fillText(String.fromCharCode(0x0023), GlobalVariables.widthToPixels(this.x- this.radius/3), GlobalVariables.heightToPixels(this.y)+this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
    }
    /**
     * Add a tag to the input geometry. The substance is not changed.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('tag')]
            this.basicThreadValueProcessing(values, "tag")
        }catch(err){this.setAlert(err)}
        super.updateValue()
    }
}