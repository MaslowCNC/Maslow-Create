import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the circle atom.
 */
export default class Circle extends Atom {
    
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
        this.name = 'Circle'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Circle'
        
        this.addIO('input', 'diameter', this, 'number', 10)
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }

    /**
     * Starts propagation from this atom if it is not waiting for anything up stream.
     */ 
    beginPropagation(){
        
        //Check to see if a value already exists. Generate it if it doesn't. Only do this for circles and rectangles
        const values = {key: "getHash", readPath: this.path }
        window.ask(values).then(result => {
            result.answer.then( hash => {
                console.log(hash)
                if(hash == undefined){
                    //Triggers inputs with nothing connected to begin propagation
                    this.inputs.forEach(input => {
                        console.log("Circle beginning propagation");
                        input.beginPropagation()
                    })
                }
            })
        })
    }

    /**
     * Draw the circle atom & icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/2), 0, Math.PI * 2, false)
        //GlobalVariables.c.fill()
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath() 
    }
    
    /**
     * Super class the default update value function. This function computes the number of points to use for the circle and then calls the worker thread to create the circle.
     */ 
    updateValue(){
        try{
            const circumference  = 3.14*this.findIOValue('diameter')
            const numberOfSegments = Math.min(Math.max(parseInt( circumference / GlobalVariables.circleSegmentSize ),5), 100)
            
            var diameter = this.findIOValue('diameter')
            const values = {key: "circle", diameter: diameter, numSegments:numberOfSegments, writePath: this.path }
            this.basicThreadValueProcessing(values)
        }catch(err){this.setAlert(err)}
    }
}