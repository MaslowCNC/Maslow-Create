import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the rectangle atom.
 */
export default class Rectangle extends Atom {

    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        this.addIO('input', 'x length', this, 'number', 10)
        this.addIO('input', 'y length', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Rectangle'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Rectangle'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Creates a new rectangle."
        
        this.setValues(values)
    }

    /**
     * Starts propagation from this atom if it is not waiting for anything up stream.
     */ 
    beginPropagation(){
        
        //Check to see if a value already exists. Generate it if it doesn't. Only do this for circles and rectangles
        if(!GlobalVariables.availablePaths.includes(this.path)){
            //Triggers inputs with nothing connected to begin propagation
            this.inputs.forEach(input => {
                input.beginPropagation()
            })
        }
    }

    /**
     * Draw the rectangle atom & icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest

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
     * Create a new rectangle in a worker thread.
     */ 
    updateValue(){
        try{
            var xVal = this.findIOValue('x length')
            var yVal = this.findIOValue('y length')
            const values = {op: "rectangle", x: xVal, y:yVal, writePath: this.path }
            this.basicThreadValueProcessing(values)
        }catch(err){this.setAlert(err)}
    }
}