import Molecule from '../molecules/molecule'
import GlobalVariables from '../globalvariables'

export default class GitHubMolecule extends Molecule {
    
    constructor(values){
        super(values)

        this.name = 'Github Molecule'
        this.atomType = 'GitHubMolecule'
        this.topLevel = false //a flag to signal if this node is the top level node
        this.centerColor = 'black'
        this.projectID = 0
        
        this.setValues(values)
    }
    
    doubleClick(x,y){
        // Prevent you from being able to double click into a github molecule
        
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
        
        if (distFromClick < this.radius){
            clickProcessed = true
        }
        
        return clickProcessed 
    }
    
    async loadProjectByID(id){
        
        //Get the repo by ID
        const result = await GlobalVariables.gitHub.getProjectByID(id)
        //content will be base64 encoded
        let rawFile = atob(result.data.content)
        let moleculesList =  JSON.parse(rawFile).molecules
        
        //Preserve values which will be overwritten by the de-serialize process
        var preservedValues = {uniqueID: this.uniqueID, x: this.x, y: this.y, atomType: this.atomType, topLevel: this.topLevel, ioValues: this.ioValues}
        this.deserialize(moleculesList, moleculesList.filter((molecule) => { return molecule.topLevel == true })[0].uniqueID)
        
        this.setValues(preservedValues)
        
        //Try to re-establish the connectors in the parent molecule to get the ones that were missed before when this molecule had not yet been fully loaded
        if(typeof this.parent !== 'undefined'){
            this.parent.savedConnectors.forEach(connector => {
                this.parent.placeConnector(connector)
            })
        }
    }
    
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