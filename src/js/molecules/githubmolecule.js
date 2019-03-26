import Molecule from '../molecules/molecule'
import GlobalVariables from '../globalvariables'

export default class GitHubMolecule extends Molecule {
    
    constructor(values){
        super(values);
        
        
        this.name = "Github Molecule";
        this.atomType = "GitHubMolecule";
        this.topLevel = false; //a flag to signal if this node is the top level node
        this.centerColor = "black";
        this.projectID = 0;
        
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
        GlobalVariables.gitHub.octokit.request('GET /repositories/:id', {id}).then(result => {
            
            //Find out the owners info;
            
            var user     = result.data.owner.login;
            var repoName = result.data.name;
            
            //Get the file contents
            
            GlobalVariables.gitHub.octokit.repos.getContents({
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
                if(typeof this.parent !== 'undefined'){
                    this.parent.savedConnectors.forEach(connector => {
                        this.parent.placeConnector(JSON.parse(connector));
                    });
                }
                
                GlobalVariables.currentMolecule.backgroundClick();
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
    
    updateCodeBlock(){
        super.updateCodeBlock();
        if(this.name != "Molecule"){ //This is a total hack to slow things down by checking to see if the name has been loaded because min.js can't handle calls right away
            this.backgroundClick();
        }
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var sideBar = document.querySelector('.sideBar');
        
        //remove everything in the sideBar now
        while (sideBar.firstChild) {
            sideBar.removeChild(sideBar.firstChild);
        }
        
        var valueList = document.createElement("ul");
        sideBar.appendChild(valueList);
        valueList.setAttribute("class", "sidebar-list");
        
        //add the name as a title
        var name = document.createElement('h1');
        name.textContent = this.name;
        name.setAttribute("style","text-align:center;");
        valueList.appendChild(name);
        
        //Add options to set all of the inputs
        this.children.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                this.createEditableValueListItem(valueList,child,"value", child.name, true);
            }
        });
        
        if(GlobalVariables.runMode){ //If the molecule is displaying in run mode
            this.createButton(valueList,this,"Create A Copy",(e) => {
               GlobalVariables.gitHub.forkByID(this.projectID);
            });
            
            this.createButton(valueList,this,"Your Projects",(e) => {
               window.location.href = '/';
            });
        }
        
        this.createBOM(valueList,this,this.BOMlist);
    }
}