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
     // */ 
    // doubleClick(x,y){
    // var clickProcessed = false
    // var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
    // if (distFromClick < this.radius){
    // clickProcessed = true
    // }
    // return clickProcessed 
    // }
    
    /**
     * Loads a project into this GitHub molecule from github based on the passed github ID. This function is async and execution time depends on project complexity, and network speed.
     * @param {number} id - The GitHub project ID for the project to be loaded.
     */ 
    async loadProjectByID(id){
        
        //Get the repo by ID
        const result = await GlobalVariables.gitHub.getProjectByID(id, this.topLevel)
        
        //Store values that we want to overwrite in the loaded version
        var valuesToOverwriteInLoadedVersion
        if(this.topLevel){
            valuesToOverwriteInLoadedVersion = {atomType: this.atomType, topLevel: this.topLevel}
        }
        else{
            valuesToOverwriteInLoadedVersion = {uniqueID: this.uniqueID, x: this.x, y: this.y, atomType: this.atomType, topLevel: this.topLevel}
        }
        const promsie =  this.deserialize(result, valuesToOverwriteInLoadedVersion).then( () => {
            this.setValues(valuesToOverwriteInLoadedVersion)
        })
        return promsie
    }
    
    /**
     * Reload this github molecule from github
     */
    reloadMolecule(){
        
        //Delete everything currently inside...Make a copy to prevent index issues
        const copyOfNodesOnTheScreen = [...this.nodesOnTheScreen]
        copyOfNodesOnTheScreen.forEach(node => {
            node.deleteNode()
        })
        
        //Deleting nodes background clicks on the host molecule so we want to bring the focus back to this atom by deslecting the top level molecule...a bit of a hack
        GlobalVariables.topLevelMolecule.selected = false
        
        //Re-serialize this molecule
        this.loadProjectByID(this.projectID).then( ()=> {
            this.beginPropagation()
        })
        this.updateSidebar()
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
        
        //Tell every atom inside this molecule to begin Propagation
        this.nodesOnTheScreen.forEach(node => {
            node.beginPropagation()
        })
    }
    
    /**
     * Updates sidebar with buttons for user in runMode
     */
    updateSidebar(){
        const list = super.updateSidebar()
        
        if(this.topLevel){
            this.runModeSidebarAdditions.forEach(sideBarFunction => {
                sideBarFunction(list)
            })
            
            this.createButton(list, this, "Bill Of Materials", ()=>{
                GlobalVariables.gitHub.openBillOfMaterialsPage()
            })
            this.createButton(list, this, "Fork", ()=>{
                GlobalVariables.gitHub.forkByID(this.projectID)
            })
            this.createButton(list, this, "Star", ()=>{
                GlobalVariables.gitHub.starProject(this.projectID)
            })
        }
        else{
            this.createButton(list, this, "Reload", ()=>{this.reloadMolecule()})
        }
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