import Atom from '../prototypes/atom'

import GlobalVariables from '../globalvariables'
/**
 * This class creates the Extrude atom.
 */
export default class Extrude extends Atom{
    
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
        this.name = 'Extrude'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Extrude'
        
        this.addIO('input', 'geometry' , this, 'geometry', '', false, true)
        this.addIO('input', 'height'   , this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }

         /**
     * Draw the code atom which has a code icon.
     */ 
      draw(){

        super.draw() //Super call to draw the rest
         
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.rect(GlobalVariables.widthToPixels(this.x- this.radius/2), 
            GlobalVariables.heightToPixels(this.y + this.radius), 
            GlobalVariables.widthToPixels(this.radius), 
            GlobalVariables.widthToPixels(this.radius/3))       
        GlobalVariables.c.fill()
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath() 

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.rect(GlobalVariables.widthToPixels(this.x- this.radius/2), 
            GlobalVariables.heightToPixels(this.y- this.radius*2), 
            GlobalVariables.widthToPixels(this.radius), 
            GlobalVariables.widthToPixels(this.radius))       
        //GlobalVariables.c.fill()
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()  

    }
    /**
     * Pass the input shape to the worker thread to compute the extruded shape.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.findIOValue('height')]
            
            this.basicThreadValueProcessing(values, "extrude")
        }catch(err){this.setAlert(err)}
    }
}