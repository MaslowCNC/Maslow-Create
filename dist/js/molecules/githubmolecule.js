class GitHubMolecule extends Molecule {
    
    constructor(values){
        super(values);
        
        
        this.name = "Github Molecule";
        this.atomType = "GitHubMolecule";
        this.topLevel = false; //a flag to signal if this node is the top level node
        this.centerColor = "black";
        this.projectID = 173269838;
        
        this.setValues(values);
        
        var moleculesList = loadProjectByID(this.projectID);
        console.log(moleculesList);
        
    }
    
    doubleClick(x,y){
        //Prevent you from being able to double click into a github molecule
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
    
}