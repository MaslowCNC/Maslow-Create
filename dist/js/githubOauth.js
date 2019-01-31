const octokit = new Octokit()
var popup = document.getElementById('projects-popup');
var currentRepoName = null;
var currentUser = null;

setInterval(saveProject, 30000); //Save the project regularly


function tryLogin(){
    
    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;
    document.getElementById('login-password').value = "";
        
    //try to login
    octokit.authenticate({
        type: 'basic',
        username: username,
        password: password
    })
    
    //test authentication
    
    octokit.users.getAuthenticated({}).then(result => {
        loginSucessfull();
    })
}

function loginSucessfull(){
    //Remove everything in the popup now
    while (popup.firstChild) {
        popup.removeChild(popup.firstChild);
    }
    
    //Add a title
    var titleDiv = document.createElement("DIV");
    titleDiv.setAttribute("style", "width: 100%");
    titleDiv.setAttribute("style", "padding: 30px");
    var title = document.createElement("H1");
    title.appendChild(document.createTextNode("Projects:"));
    titleDiv.appendChild(title);
    popup.appendChild(titleDiv);
    popup.appendChild(document.createElement("br"));
    
    var projectsSpaceDiv = document.createElement("DIV");
    projectsSpaceDiv.setAttribute("class", "float-left-div{");
    popup.appendChild(projectsSpaceDiv);
    
    
    //Add the create a new project button
    addProject("New Project");
    
    
    // octokit.repos.listTopics({owner: owner, repo: repoName}).then(topics => {
        // console.log(topics);
    // })
    
    //List all of the repos that a user is the onwer of
    octokit.repos.list({
      affiliation: 'owner',
    }).then(({data, headers, status}) => {
        data.forEach(repo => {
            
            //Check to see if this is a maslow create project
            octokit.repos.listTopics({
                owner: repo.owner.login, 
                repo: repo.name,
                headers: {
                    accept: 'application/vnd.github.mercy-preview+json'
                }
            }).then(data => {
                if(data.data.names.includes("maslowcreate")){
                    addProject(repo.name);
                }
            })
            
        });
    })
    
}

function addProject(projectName){
    //create a project element to display
    
    var project = document.createElement("DIV");
    
    var projectPicture = document.createElement("IMG");
    projectPicture.setAttribute("src", "testPicture.png");
    projectPicture.setAttribute("style", "width: 100%");
    projectPicture.setAttribute("style", "height: 100%");
    project.appendChild(projectPicture);
    
    var shortProjectName = document.createTextNode(projectName.substr(0,7)+"..");
    project.setAttribute("class", "project");
    project.setAttribute("id", projectName);
    project.appendChild(shortProjectName); 
    popup.appendChild(project); 
    
    document.getElementById(projectName).addEventListener('click', event => {
        projectClicked(projectName);
    })

}

function projectClicked(projectName){
    //runs when you click on one of the projects
    if(projectName == "New Project"){
        createNewProjectPopup();
    }
    else{
        loadProject(projectName);
    }
}

function createNewProjectPopup(){
    //Clear the popup and populate the fields we will need to create the new repo
    while (popup.firstChild) {
        popup.removeChild(popup.firstChild);
    }
    
    //Project name
    // <div class="form">
    var createNewProjectDiv = document.createElement("DIV");
    createNewProjectDiv.setAttribute("class", "form");
    
    //Add a title
    var header = document.createElement("H1");
    var title = document.createTextNode("Create a new project");
    header.appendChild(title);
    createNewProjectDiv.appendChild(header);
    
    //Create the form object
    var form = document.createElement("form");
    form.setAttribute("class", "login-form");
    createNewProjectDiv.appendChild(form);
    
    //Create the name field
    var name = document.createElement("input");
    name.setAttribute("id","project-name");
    name.setAttribute("type","text");
    name.setAttribute("placeholder","Project name");
    form.appendChild(name);
    
    //Add the description field
    var description = document.createElement("input");
    description.setAttribute("id", "project-description");
    description.setAttribute("type", "text");
    description.setAttribute("placeholder", "Project description");
    form.appendChild(description);
    
    //Add the button
    var createButton = document.createElement("button");
    createButton.setAttribute("type", "button");
    createButton.setAttribute("onclick", "createNewProject()");
    var buttonText = document.createTextNode("Create Project");
    createButton.appendChild(buttonText);
    form.appendChild(createButton);
    

    popup.appendChild(createNewProjectDiv);

}

function createNewProject(){
    
    //Get name and description
    var name = document.getElementById('project-name').value;
    var description = document.getElementById('project-description').value;
    
    //Load a blank project
    currentMolecule = Molecule.create({
        x: 0, 
        y: 0, 
        topLevel: true, 
        name: name,
        atomType: "Molecule",
        uniqueID: generateUniqueID()
    });
    
    //Create a new repo
    octokit.repos.createForAuthenticatedUser({
        name: name,
        description: description
    }).then(result => {
        //Once we have created the new repo we need to create a file within it to store the project in
        currentRepoName = result.data.name;
        currentUser = result.data.owner.login;
        var path = "project.maslowcreate";
        var content = window.btoa("init"); // create a file with just the word "init" in it and base64 encode it
        octokit.repos.createFile({
            owner: currentUser,
            repo: currentRepoName,
            path: path,
            message: "initialize repo", 
            content: content
        })
        
        //Update the project topics
        octokit.repos.replaceTopics({
            owner: currentUser,
            repo: currentRepoName,
            names: ["maslowcreate"],
            headers: {
                accept: 'application/vnd.github.mercy-preview+json'
            }
        })
    });
    
    
    //Clear and hide the popup
    while (popup.firstChild) {
        popup.removeChild(popup.firstChild);
    }
    popup.classList.add('off');
    
    
}

function saveProject(){
    //Save the current project into the github repo
    console.log("Work saved");
    
    if(currentRepoName != null){
        
        var path = "project.maslowcreate";
        var content = window.btoa(CircularJSON.stringify(currentMolecule, null, 4)); //Convert the currentRepo object to a JSON string and then convert it to base64 encoding
        
        //Get the SHA for the file
        octokit.repos.getContents({
            owner: currentUser,
            repo: currentRepoName,
            path: path
        }).then(result => {
            var sha = result.data.sha
            
            //Save the repo to the file
            octokit.repos.updateFile({
                owner: currentUser,
                repo: currentRepoName,
                path: path,
                message: "autosave", 
                content: content,
                sha: sha
            })
        })
    }
}

function loadProject(projectName){
    
    octokit.repos.getContents({
        owner: 'barboursmith',
        repo: projectName,
        path: 'project.maslowcreate'
    })
    .then(result => {
        //content will be base64 encoded
        let jsonContent = CircularJSON.parse(atob(result.data.content));
        
        applyInheritance(jsonContent);
        
        //
        
        currentMolecule = jsonContent;
 
        console.log("molecule loaded");
        console.log(currentMolecule);
        
        //Clear and hide the popup
        while (popup.firstChild) {
            popup.removeChild(popup.firstChild);
        }
        popup.classList.add('off');
    })
    
}

function applyInheritance(object){
    //Takes an object and if it has an atomType attribute it is given the inheritance of that attribute
    
    var listOfPrototypes = availableTypes.concat([AttachmentPoint, Connector]); //add to the list of available prototypes
    
    //If the object has an atomType property implying that it is an atom and should have inheritance
    if('atomType' in object){
        console.log("Atom type found");
        listOfPrototypes.forEach(thisPrototype => {
            if (object.atomType == thisPrototype.atomType){
                console.log("Recognized type: " + thisPrototype.atomType); 
                Object.setPrototypeOf(object, thisPrototype)  //Give it it's inheritance
            }
        }); 
    }
    
    //If the atom contains a list of displayed nodes which might need their inheritance applied
    if('nodesOnTheScreen' in object){
        console.log("Nodes on the screen found");
        object.nodesOnTheScreen.forEach(node => {applyInheritance(node)});
    }
    
    //If the atom contains a list of children which might need their inheritance applied
    if('connectors' in object){
        console.log("connectors found");
        object.connectors.forEach(connector => {applyInheritance(connector)});
    }
    
    //If the atom contains a list of connectors which might need their inheritance applied
    if('children' in object){
        console.log("Nodes on the screen found");
        object.children.forEach(child => {applyInheritance(child)});
    }
}

function populateMolecule(json){
    
    thisMolecule = Molecule.create({
        x: json.x, 
        y: json.y, 
        topLevel: json.topLevel, 
        name: json.name,
        atomType: "Molecule"
    });
    
    json.nodesOnTheScreen.forEach(atom => {
        
        availableTypes.forEach(type => {
            if (type.name === atom.atomType){
                
                var thisAtom = type.create({
                    x: atom.x, 
                    y: atom.y, 
                    parent: thisMolecule,
                    name: atom.name,
                    atomType: atom.atomType,
                    uniqueID: atom.uniqueID
                });
                
                thisMolecule.nodesOnTheScreen.push(thisAtom);
            }
        }); 
    });
    
    return thisMolecule;
}


