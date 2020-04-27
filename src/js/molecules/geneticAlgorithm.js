import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'

/**
 * This class creates the Genetic Algorithm atom.
 */
export default class GeneticAlgorithm extends Atom {
    
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
        this.name = 'Genetic Algorithm'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Genetic Algorithm'
        
        this.addIO('input', 'fitness function', this, 'number', 0)
        this.addIO('input', 'population size', this, 'number', 50)
        this.addIO('input', 'number of generations', this, 'number', 10)
        
        this.setValues(values)
        
        this.updateValue()
    }
    
    /**
     * Generate a layered outline of the part where the tool will cut
     */ 
    updateValue(){
        console.log("GE input has updated");
    }
    
    /**
     * Add a button to download the generated gcode
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,'Evolve',() => {
            console.log("Would begin GE")
        })
    }
    
}