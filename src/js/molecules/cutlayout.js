import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
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
     * Draw the cutlayout icon
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
        const radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/2, yInPixels + radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2, yInPixels + radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2, yInPixels + radiusInPixels/2)
        //GlobalVariables.c.fill()
        GlobalVariables.c.setLineDash([3, 3])
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
        GlobalVariables.c.beginPath()
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/4, yInPixels - radiusInPixels/1.7)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/4, yInPixels - radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/4, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/4, yInPixels - radiusInPixels/1.7)

        //GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.lineJoin = "round"
        GlobalVariables.c.stroke()
        GlobalVariables.c.setLineDash([])
        GlobalVariables.c.closePath()

    }
    /**
    * Pass the input geometry to a worker function to compute the translation.
    */ 
    updateValue(){
        this.decreaseToProcessCountByOne()
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('Spacing')]
            
            this.basicThreadValueProcessing(values, "layout")
        }catch(err){
            this.setAlert(err)
        }
    }
}
