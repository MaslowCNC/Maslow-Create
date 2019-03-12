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
                
                //Try to re-establish the connectors in the parent molecule to get the ones that were missed before when this molecule had not yet been fully loaded
                this.parent.savedConnectors.forEach(connector => {
                    this.parent.placeConnector(JSON.parse(connector));
                });
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
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        //remove everything in the sideBar now
        while (sideBar.firstChild) {
            sideBar.removeChild(sideBar.firstChild);
        }
        
        //add the name as a title
        var name = document.createElement('h1');
        name.textContent = this.name;
        name.setAttribute("style","text-align:center;");
        sideBar.appendChild(name);
    }
}