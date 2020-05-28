import Atom from '../prototypes/atom.js'

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
            this.updateSidebar()
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
                    // Set the inputs to the prime candidate
                    this.population = this.population.sort((a, b) => parseFloat(b.fitness) - parseFloat(a.fitness))
                    this.individualIndex = 0
                    this.generation = 0
                    this.beginEvaluatingIndividual()
                    
                    this.updateSidebar()
                }
            }
        }
    }
    
    /**
     * Add a button to trigger the evolution process
     */ 
    updateSidebar(){
        
        
        
        if(this.evolutionInProcess){
            
            //Remove everything in the sidebar
            let sideBar = document.querySelector('.sideBar')
            while (sideBar.firstChild) {
                sideBar.removeChild(sideBar.firstChild)
            }
            
            //Generate the list
            var sbList = document.createElement('ul')
            sideBar.appendChild(sbList)
            sbList.setAttribute('class', 'sidebar-list')
            
            //Add text to the list element
            var listElement = document.createElement('LI')
            sbList.appendChild(listElement)
            
            var labelDiv = document.createElement('div')
            listElement.appendChild(labelDiv)
            var labelText = document.createTextNode("Evolving...Generation: " + this.generation)
            labelDiv.appendChild(labelText)
            labelDiv.setAttribute('class', 'sidebar-subitem label-item')
        }
        else{
            
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
        this.individualIndex = 0
        this.generation = 0
        
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
    
    breedTwo(A, B){
        const lengthOfGenome = A.genome.length
        
        var child = {
            fitness: null,
            genome: []
        }
        
        var geneIndex = 0
        while(geneIndex < lengthOfGenome){
            var newGene = {
                newValue: null,
                constantAtom: A.genome[geneIndex].constantAtom
            }
            
            if(Math.random() > 0.5){
                newGene.newValue = A.genome[geneIndex].newValue
            }else{
                newGene.newValue = B.genome[geneIndex].newValue
            }
            
            child.genome.push(newGene)
            
            geneIndex++
        }
        return child
    }
    
    /**
     * Breed the best performers in the population, cull the rest
     */ 
    breedAndCullPopulation(){
        this.population = this.population.sort((a, b) => parseFloat(b.fitness) - parseFloat(a.fitness))
        
        // Create a new population by taking the top 1/5th of the original population
        const keptPopulationNumber = Math.round(this.population.length / 5)
        
        const breeders = this.population.slice(0,keptPopulationNumber)
        
        //Generate a new population of individuals by breading from the last generation
        var newGeneration = []
        var index = 0
        while(index < this.population.length - keptPopulationNumber){
            const individualOneIndex = Math.round(Math.random()*(breeders.length-1))
            const individualTwoIndex = Math.round(Math.random()*(breeders.length-1))
            const newIndividual = this.breedTwo(breeders[individualOneIndex], breeders[individualTwoIndex])
            newGeneration.push(newIndividual)
            index = index + 1
        }
        
        this.population = breeders.concat(newGeneration)
        
        console.log("Generation: " + this.generation)
        console.log(this.population)
        this.population.forEach(individual => {
            console.log(individual.genome[0].newValue + " " + individual.genome[1].newValue)
        })
    }
    
    /**
     * Regenerate the list of constants we are evolving
     */ 
    updateConstantsList(){
        //Create an array of the inputs by walking up stream
        this.constantsToEvolve = []
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