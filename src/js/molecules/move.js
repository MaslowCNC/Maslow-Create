import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the move atom.
 */
export default class Move extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'geometry', this, 'geometry', '', false, true)
        this.addIO('input', 'xDist', this, 'number', 0)
        this.addIO('input', 'yDist', this, 'number', 0)
        this.addIO('input', 'zDist', this, 'number', 0)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Move'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Move'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Moves a shape laterally in X, Y, Z."
        
        this.setValues(values)
    }
    
    /**
     * Draw the move icon.
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
                var x = this.findIOValue('xDist')
                var y = this.findIOValue('yDist')
                var z = this.findIOValue('zDist')
                const values = { key: "move", x:x, y:y, z:z, readPath: inputPath, writePath: this.path }
                
                this.basicThreadValueProcessing(values)
            }catch(err){this.setAlert(err)}
        }
    }
}