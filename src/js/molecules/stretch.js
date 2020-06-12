import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the stretch atom.
 */
export default class Stretch extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '', false, true)
        this.addIO('input', 'x', this, 'number', 1)
        this.addIO('input', 'y', this, 'number', 1)
        this.addIO('input', 'z', this, 'number', 1)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Stretch'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Stretch'
        
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
        GlobalVariables.widthToPixels(this.radius/2.6), GlobalVariables.widthToPixels(this.radius/2.6), 0, Math.PI * 2, false)  
        GlobalVariables.c.fill() 
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.ellipse(GlobalVariables.widthToPixels(this.x), 
        GlobalVariables.heightToPixels(this.y), 
        GlobalVariables.widthToPixels(this.radius/1.5), GlobalVariables.widthToPixels(this.radius/2.3), 0, Math.PI * 2, false)  
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()

        
    }
    
    /**
     * Pass the input geometry to a worker thread to compute the stretch
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('x'),this.findIOValue('y'),this.findIOValue('z')]
            
            this.basicThreadValueProcessing(values, "stretch")
        }catch(err){this.setAlert(err)}
    }
}