import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the regular polygon atom.
 */
export default class RegularPolygon extends Atom {

    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'number of sides', this, 'number', 6)
        this.addIO('input', 'diameter', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'RegularPolygon'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'RegularPolygon'

        // create the polygon code block
        this.updateValue()
        
        this.setValues(values)
    }


    /**
     * Draw the circle atom & icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        let radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        // polygon in progress - replace numbers with variables
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/3, yInPixels + radiusInPixels/1.7)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/3, yInPixels + radiusInPixels/1.7)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/1.5, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/2.5, yInPixels - radiusInPixels/1.7)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/2.5, yInPixels - radiusInPixels/1.7)
        GlobalVariables.c.lineTo(xInPixels- radiusInPixels/1.5, yInPixels )
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels/3, yInPixels + radiusInPixels/1.7)
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath();

    }
    
    /**
     * Create a new regular polygon in a worker thread.
     */ 
    updateValue(){
        try{
            
            const values = [this.findIOValue('diameter'), this.findIOValue('number of sides')]
            this.basicThreadValueProcessing(values, "circle")
        }catch(err){this.setAlert(err)}
    }  
}