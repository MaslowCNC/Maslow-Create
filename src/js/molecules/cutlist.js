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
        this.height;
    }
    /**
     * Draw the constant which is more rectangular than the regular shape.
     */ 
    draw() {
        
        //Set colors
        if(this.processing){
            GlobalVariables.c.fillStyle = 'blue'
        }
        else if(this.selected){
            GlobalVariables.c.fillStyle = this.selectedColor
            GlobalVariables.c.strokeStyle = this.defaultColor
            /**
             * This background color
             * @type {string}
             */
            this.color = this.selectedColor
            /**
             * This atoms accent color
             * @type {string}
             */
            this.strokeColor = this.defaultColor
        }
        else{
            GlobalVariables.c.fillStyle = this.defaultColor
            GlobalVariables.c.strokeStyle = this.selectedColor
            this.color = this.defaultColor
            this.strokeColor = this.selectedColor
        }
        
        this.inputs.forEach(input => {
            input.draw()       
        })
        if(this.output){
            this.output.draw()
        }
        
        let pixelsX = GlobalVariables.widthToPixels(this.x)
        let pixelsY = GlobalVariables.heightToPixels(this.y)
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
         this.height = pixelsRadius/1.3
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.rect(pixelsX - pixelsRadius, pixelsY - this.height/2, 2*pixelsRadius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, pixelsX + pixelsRadius, pixelsY-pixelsRadius)
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius}px Work Sans Bold`
        GlobalVariables.c.fillText(' - - -', GlobalVariables.widthToPixels(this.x- this.radius), GlobalVariables.heightToPixels(this.y)+this.height/3)
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