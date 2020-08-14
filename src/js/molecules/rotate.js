import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the rotate atom.
 */
export default class Rotate extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '', false, true)
        this.addIO('input', 'x-axis degrees', this, 'number', 0)
        this.addIO('input', 'y-axis degrees', this, 'number', 0)
        this.addIO('input', 'z-axis degrees', this, 'number', 0)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Rotate'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Rotate'
        
        this.setValues(values)
    }

    /**
     * Draw the circle atom & icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.ellipse(GlobalVariables.widthToPixels(this.x), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/1.5), GlobalVariables.widthToPixels(this.radius/2.3), Math.PI / 4,  0, Math.PI * 2)  
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()

        

    }
  
    /**
     * Pass the input shape to a worker thread to compute the rotation
     */ 
    updateValue(){
        this.decreaseToProcessCountByOne()
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('x-axis degrees'), this.findIOValue('y-axis degrees'), this.findIOValue('z-axis degrees')]
            this.basicThreadValueProcessing(values, "rotate")
        }catch(err){this.setAlert(err)}
    }
}