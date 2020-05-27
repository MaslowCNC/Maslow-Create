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
        
        /**
         * An array of constant objects which need to be evolved
         * @type {array}
         */
        this.constantsToEvolve = []
        
        /**
         * An array of objects representing the current population
         * @type {array}
         */
        this.population = []
        
        /**
         * Current individual being evaluated in this generation
         * @type {integer}
         */
        this.individualIndex = 0
         
        /**
         * Current generation
         * @type {integer}
         */
        this.generation = 0
        
        /**
         * A flag to indicate if evolution is in process
         * @type {boolean}
         */
        this.evolutionInProcess = false
        
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
        console.log("GE input has updated")
        console.log(this.findIOValue('fitness function'))
        
        if(this.evolutionInProcess){
            //Store the result from this individual in it's fitness value
            this.population[this.individualIndex].fitness = this.findIOValue('fitness function')
            
            //Evaluate the next individual
            this.individualIndex ++
            if(this.individualIndex < this.findIOValue('population size')){
                //Evaluate the next individual by updating all of the inputs
                this.beginEvaluatingIndividual()
            }
            else{
                console.log("One generation evaluated")
                console.log(this.population)
                this.evolutionInProcess = false
                this.generation++
                if(this.generation < this.findIOValue('number of generations')){
                    // Generate a new generation from the existing generation and start the process over
                    this.breedAndCullPopulation()
                    this.individual = 0
                }
                else{
                    console.log("Finished with evolution")
                    // Set the inputs to the prime candidate here
                }
                
            }
        }
    }
    
    /**
     * Add a button to trigger the evolution process
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,'Evolve',() => {
            console.log("Beginning GE")
            this.evolutionInProcess = true
            
            //Generate a list of all the constants to evolve
            this.updateConstantsList()
            
            //Generate a population from those constants
            this.initializePopulation()
            
            //Evaluate the first individual
            this.beginEvaluatingIndividual()
        })
    }
    
    /**
     * Trigger the process to evaluate the current individual
     */ 
    beginEvaluatingIndividual(){
        const individualToEvaluate = this.population[this.individualIndex]
        
        //Lock all the constants
        individualToEvaluate.genome.forEach(gene => {
            gene.constantAtom.output.waitOnComingInformation()
        })
        
        //Set all of their values
        individualToEvaluate.genome.forEach(gene => {
            gene.constantAtom.output.value = gene.newValue
        })
        
        //Trigger them to update
        individualToEvaluate.genome.forEach(gene => {
            gene.constantAtom.updateValue()
        })
    }
    
    /**
     * Generate a random number between min and max
     */ 
    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Generate an initial population
     */ 
    initializePopulation(){
        this.population = []
        
        var i = 0
        while(i < this.findIOValue('population size')){
            var genome = []
            this.constantsToEvolve.forEach(constant => {
                var gene = {
                    newValue: this.getRandomValue(constant.min, constant.max),
                    constantAtom: constant
                }
                genome.push(gene)
            })
            
            //Generate an individual with a random value for each input
            var individual = {
                genome: genome,
                fitness: null
            }
            this.population.push(individual)
            
            i++
        }
    }
    
    breedAndCullPopulation(){
        console.log("Would breed and cull here")
    }
    
    /**
     * Regenerate the list of constants we are evolving
     */ 
    updateConstantsList(){
        //Create an array of the inputs by walking up stream
        this.constants = []
        this.inputs.forEach(input => {
            input.connectors.forEach(connector => {
                connector.walkBackForConstants(constantObject => {this.addToConstantsList(constantObject)})
            })
        })
    }
    
    /**
     * Add a constant to the list. Used as a callback from passing up the tree.
     */ 
    addToConstantsList(constantObject){
        this.constantsToEvolve.push(constantObject)
    }
    
}