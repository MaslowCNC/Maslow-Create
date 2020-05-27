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
        if(this.evolutionInProcess){
            this.processing = true
            //Store the result from this individual in it's fitness value
            this.population[this.individualIndex].fitness = this.findIOValue('fitness function')
            
            //Evaluate the next individual
            this.individualIndex ++
            if(this.individualIndex < this.findIOValue('population size')){
                //Evaluate the next individual by updating all of the inputs
                this.beginEvaluatingIndividual()
            }
            else{
                this.generation++
                if(this.generation < this.findIOValue('number of generations')){
                    // Generate a new generation from the existing generation and start the process over
                    this.breedAndCullPopulation()
                    this.individualIndex = 0
                    this.beginEvaluatingIndividual()
                }
                else{
                    this.evolutionInProcess = false
                    this.processing = false
                    console.log("Finished with evolution")
                    console.log(this.population)
                    // Set the inputs to the prime candidate
                    this.population = this.population.sort((a, b) => parseFloat(b.fitness) - parseFloat(a.fitness))
                    this.individualIndex = 0
                    this.generation = 0
                    this.beginEvaluatingIndividual()
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
        const randomVal = Math.random() * (max - min) + min
        return randomVal
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
    
    mutate(gene){
        const maxVal = gene.constantAtom.max
        const minVal = gene.constantAtom.min
        
        const amountToMutate = .05*(maxVal - minVal)
        
        gene.newValue = Math.min(Math.max(gene.newValue + 5*(Math.random()-0.5), minVal), maxVal)
        
        return gene
    }
    
    breedIndividuals(individualA, individualB){
        var newIndividual = {
            genome: [],
            fitness: null
        }
        individualA.genome.forEach((gene, index) =>{
            if(Math.random() > .5){
                //Use gene from individual A 
                newIndividual.genome[index] = this.mutate(individualA.genome[index])
            }
            else{
                //Use gene from individual B mutated
                newIndividual.genome[index] = this.mutate(individualB.genome[index])
            }
        })
        
        return newIndividual
    }
    
    breedAndCullPopulation(){
        this.population = this.population.sort((a, b) => parseFloat(b.fitness) - parseFloat(a.fitness))
        
        console.log("Sorted population")
        this.population.forEach(individual => {
            console.log(individual.genome[0].newValue)
        })
        
        // Create a new population by taking the top 1/5th of the original population
        const keptPopulationNumber = Math.round(this.population.length / 5)
        
        var newPopulation = this.population.slice(0,keptPopulationNumber)
        
        // Breed them to fill out the population to full size
        var i = keptPopulationNumber
        while(i < this.population.length){
            // Breed two random individuals from the top 1/5th of the list
            const individualOneIndex = Math.round(Math.random()*keptPopulationNumber)
            const individualTwoIndex = Math.round(Math.random()*keptPopulationNumber)
            newPopulation.push(this.breedIndividuals(this.population[individualOneIndex], this.population[individualTwoIndex]))
            i++
        }
        
        console.log("After breeding")
        newPopulation.forEach(individual => {
            console.log(individual.genome[0].newValue)
        })
        
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