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
     * Super class the default update value function. This function computes the number of points to use for the circle and then calls the worker thread to create the circle.
     */ 
    updateValue(){
        try{
            const circumference  = 3.14*this.findIOValue('diameter')
            const numberOfSegments = Math.min(Math.max(parseInt( circumference / GlobalVariables.circleSegmentSize ),5), 100)
            
            const values = [this.findIOValue('diameter'), numberOfSegments]
            this.basicThreadValueProcessing(values, "circle")
        }catch(err){this.setAlert(err)}
    }
}