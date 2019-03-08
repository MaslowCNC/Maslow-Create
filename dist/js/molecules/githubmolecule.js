class GitHubMolecule extends Molecule {
    
    constructor(values){
        super(values);
        
        
        this.name = "Github Molecule";
        this.atomType = "GitHubMolecule";
        this.topLevel = false; //a flag to signal if this node is the top level node
        this.centerColor = "black";
        this.projectID = 174292302;
        
        this.setValues(values);
        
        this.loadProjectByID(this.projectID);
        
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
    
    loadProjectByID(id){
    //Get the repo by ID
        console.log("loading project by id");
        octokit.request('GET /repositories/:id', {id}).then(result => {
            
            //Find out the owners info;
            
            var user     = result.data.owner.login;
            var repoName = result.data.name;
            
            //Get the file contents
            
            octokit.repos.getContents({
                owner: user,
                repo: repoName,
                path: 'project.maslowcreate'
            }).then(result => {
                    
                //content will be base64 encoded
                let rawFile = atob(result.data.content);
                let moleculesList =  JSON.parse(rawFile).molecules;
                
                this.deserialize(moleculesList, moleculesList.filter((molecule) => { return molecule.topLevel == true; })[0].uniqueID);
                
                this.topLevel = false;
            });
        });
    }
    
    serialize(savedObject){
        
        //Return a placeholder for this molecule
        var object = {
            atomType: this.atomType,
            name: this.name,
            x: this.x,
            y: this.y,
            uniqueID: this.uniqueID,
            projectID: this.projectID
        }
        
        return object;
    }
    
}