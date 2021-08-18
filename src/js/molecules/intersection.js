import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the intersection atom.
 */
export default class Intersection extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Intersection'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Intersection'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "The space shared by two shapes."
        
        this.setValues(values)
    }


    /**
     * Draw the rectangle atom & icon.
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
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/4, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/4, yInPixels - radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/4, yInPixels - radiusInPixels/2)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/4, yInPixels)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2, yInPixels)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2, yInPixels + radiusInPixels/2)
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.lineJoin = "round"
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

    }
    
    /**
     * Grab the input geometries and pass them to a worker thread for computation.
     */ 
    updateValue(){
        try{
            const path1 = this.findIOValue('geometry1')
            const path2 = this.findIOValue('geometry2')
            const values = { op: "intersection",readPath1: path1, readPath2: path2, writePath: this.path }
            
            this.basicThreadValueProcessing(values)
        }catch(err){this.setAlert(err)}
    }
}