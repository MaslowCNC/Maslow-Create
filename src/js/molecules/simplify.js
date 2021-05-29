import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the Simplify atom.
 */
export default class Simplify extends Atom{
    
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
        this.name = 'Simplify'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Simplify'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Simplifies a shape"
        
        this.setValues(values)
    }
    
    /**
     * Draw the Simplify icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x+this.radius/5), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/2.5), 0, Math.PI * 2, false)       
        //GlobalVariables.c.fill()
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()  
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x-this.radius/5), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/2.5), 0, Math.PI * 2, false)       
        GlobalVariables.c.fill()
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()  
          

    }
    /**
     * Pass the input geometry to a worker function to compute the translation.
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            try{
                var inputPath = this.findIOValue('geometry')
                const values = { key: "simplify", readPath: inputPath, writePath: this.path }
                
                this.basicThreadValueProcessing(values)
            }catch(err){this.setAlert(err)}
        }
    }
}