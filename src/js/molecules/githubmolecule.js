import Molecule from '../molecules/molecule'
import GlobalVariables from '../globalvariables'

export default class GitHubMolecule extends Molecule {
    
    constructor(values){
        super(values)

        this.name = 'Github Molecule'
        this.atomType = 'GitHubMolecule'
        this.topLevel = false //a flag to signal if this node is the top level node
        this.centerColor = 'black'
        
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