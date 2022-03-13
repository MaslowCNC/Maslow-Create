import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables'

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
         * A description of this atom
         * @type {string}
         */
        this.description = "Defines a new genetic algorithm which will simulate evolution to maximize the fitness function using the input population size and number of generations. Only constants which are upstream of this atom with evolve checked will be changed."
        
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
         * Top fitness value for the current generation
         * @type {float}
         */
        this.topFitness = 0
        
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
     * Draw the code atom which has a code icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest
         

        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
        const radiusInPixels = GlobalVariables.widthToPixels(this.radius)
      
       
        GlobalVariables.c.beginPath()
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x - this.radius/5), 
            GlobalVariables.heightToPixels(this.y), 
            GlobalVariables.widthToPixels(this.radius/2), Math.PI *3.4, Math.PI * 2.7, false) 
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x + this.radius/5), 
            GlobalVariables.heightToPixels(this.y ), 
            GlobalVariables.widthToPixels(this.radius/2), Math.PI *3.6, Math.PI * 2.3, true) 
        GlobalVariables.c.stroke() 
        GlobalVariables.c.closePath()  

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/3, yInPixels )
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/3, yInPixels )
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/3, yInPixels - radiusInPixels/5 )
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/3, yInPixels - radiusInPixels/5)
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/3, yInPixels + radiusInPixels/5 )
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/3, yInPixels + radiusInPixels/5)
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()



    }
    
    /**
     * Generate a layered outline of the part where the tool will cut
     */ 
    updateValue(){
        this.decreaseToProcessCountByOne()
        if(this.evolutionInProcess){
            this.updateSidebar()
            /**
             * Atom is processing
            * @type {boolean}
             */
            this.processing = true
            //Store the result from this individual in it's fitness value
            this.population[this.individualIndex].fitness = this.findIOValue('fitness function')
            
            //Evaluate the next individual
            this.individualIndex = this.individualIndex + 1
            if(this.individualIndex < this.findIOValue('population size')){
                //Evaluate the next individual by updating all of the inputs
                this.beginEvaluatingIndividual()
            }
            else{
                this.generation = this.generation + 1
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
            var labelText = document.createTextNode("Evolving...Generation: " + this.generation + "    Best Fitness Value: " + this.topFitness)
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
        this.topFitness = 0
        
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
    
    /**
     * Take two individuals and breed them to form a new individual with a mix of their genes and mutations
     */ 
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
            
            
            const maxVal         = A.genome[geneIndex].constantAtom.max
            const minVal         = A.genome[geneIndex].constantAtom.min
            const mutationAmount = 0.1*(maxVal-minVal)*(Math.random()-.5) //Mutate by at most +-.5%
            
            var newGeneVal = null
            if(Math.random() > 0.5){
                newGeneVal = A.genome[geneIndex].newValue+mutationAmount
            }else{
                newGeneVal = B.genome[geneIndex].newValue+mutationAmount
            }
            
            //Constrain to within bounds
            newGene.newValue = Math.min(Math.max(newGeneVal, minVal), maxVal)
            
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
        
        this.topFitness = this.population[0].fitness
        
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