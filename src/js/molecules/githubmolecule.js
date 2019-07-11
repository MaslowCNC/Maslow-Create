import Molecule from '../molecules/molecule'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the GitHubMolecule atom.
 */
export default class GitHubMolecule extends Molecule {
    
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
        this.name = 'Github Molecule'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'GitHubMolecule'
        /**
         * A flag to signal if this node is the top level node
         * @type {boolean}
         */
        this.topLevel = false
        /**
         * The color for the whole in the center of the drawing...probably doesn't need to be in this scope
         * @type {string}
         */
        this.centerColor = 'black'
        
        this.setValues(values)
    }
    
    /**
     * This replaces the default Molecule double click behavior to prevent you from being able to double click into a github molecule
     * @param {number} x - The x coordinate of the click
     * @param {number} y - The y coordinate of the click
     */ 
    doubleClick(x,y){
        var clickProcessed = false
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
        if (distFromClick < this.radius){
            clickProcessed = true
        }
        
        return clickProcessed 
    }
    
    /**
     * Loads a project into this GitHub molecule from github based on the passed github ID. This function is async and execution time depends on project complexity, and network speed.
     * @param {number} id - The GitHub project ID for the project to be loaded.
     */ 
    async loadProjectByID(id){
        
        //Get the repo by ID
        const result = await GlobalVariables.gitHub.getProjectByID(id, this.topLevel)
        //content will be base64 encoded
        let rawFile = atob(result.data.content)
        let moleculesList =  JSON.parse(rawFile).molecules
        
        //Preserve values which will be overwritten by the de-serialize process. We only want to keep them if this is not the top level atom
        var preservedValues
        if(this.topLevel){
            preservedValues = {atomType: this.atomType, topLevel: this.topLevel}
        }
        else{
            preservedValues = {uniqueID: this.uniqueID, x: this.x, y: this.y, atomType: this.atomType, topLevel: this.topLevel, ioValues: this.ioValues}
        }
        var promsie = this.deserialize(moleculesList, moleculesList.filter((molecule) => { return molecule.topLevel == true })[0].uniqueID)
        
        this.setValues(preservedValues)
        
        return promsie
    }
    
    /**
     * Save the project information to be loaded. This should use super.serialize() to maintain a connection with Molecule, but it doesn't...should be fixed
     */ 
    serialize(){
        
        var ioValues = []
        this.inputs.forEach(io => {
            if (typeof io.getValue() == 'number'){
                var saveIO = {
                    name: io.name,
                    ioValue: io.getValue()
                }
                ioValues.push(saveIO)
            }
        })
        
        //Return a placeholder for this molecule
        var object = {
            atomType: this.atomType,
            name: this.name,
            x: this.x,
            y: this.y,
            uniqueID: this.uniqueID,
            projectID: this.projectID,
            ioValues: ioValues
        }
        
        return object
    }
    
}