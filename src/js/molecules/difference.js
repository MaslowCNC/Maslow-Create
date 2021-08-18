import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the Difference atom.
 */ 
export default class Difference extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor (values){
        
        super(values)
        
        this.addIO('input', 'geometry2', this, 'geometry', '')
        this.addIO('input', 'geometry1', this, 'geometry', '')
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Difference'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Difference'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Subtracts shape two from shape one."
        
        this.setValues(values)
    }


    /**
     * Draw the code atom which has a code icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest
         
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/3), 0, Math.PI * 2, false)       
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
     * Pass the input values to the worker thread to do the actual processing.
     */ 
    updateValue(){
        try{
            const path1 = this.findIOValue('geometry1')
            const path2 = this.findIOValue('geometry2')
            const values = { op: "difference",readPath1: path1, readPath2: path2, writePath: this.path }
            
            this.basicThreadValueProcessing(values)
        }catch(err){this.setAlert(err)}
    }
}