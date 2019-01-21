const octokit = new Octokit()
var popup = document.getElementById('projects-popup');


function tryLogin(){
    console.log("trying to log in");
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
    //clear the login popup
    console.log("logged in");
    
    //remove everything in the popup now
    
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
    addProject(({name: "New Project"}));
    
    
    //List all of the repos that a user is the onwer of
    octokit.repos.list({
      affiliation: 'owner',
    }).then(({data, headers, status}) => {
        data.forEach(repo => {
            addProject(repo);
        });
    })
    
}

function addProject(repo){
    //create a project element to display
    
    var project = document.createElement("DIV");
    
    var projectPicture = document.createElement("IMG");
    projectPicture.setAttribute("src", "testPicture.png");
    projectPicture.setAttribute("style", "width: 100%");
    projectPicture.setAttribute("style", "height: 100%");
    project.appendChild(projectPicture);
    
    var projectName = document.createTextNode(repo.name.substr(0,7)+"..");
    project.setAttribute("class", "project");
    project.setAttribute("id", repo.name);
    project.appendChild(projectName); 
    popup.appendChild(project); 
    
    document.getElementById(repo.name).addEventListener('click', event => {
        projectClicked(repo.name);
    })

}

function projectClicked(projectName){
    //runs when you click on one of the projects
    if(projectName == "New Project"){
        createNewProjectPopup();
    }
    else{
        console.log("Load project: " + projectName);
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
    console.log("new project should be created now");
    
    //Get name and description
    var name = document.getElementById('project-name').value;
    var description = document.getElementById('project-description').value;
    
    //Create a new repo
    octokit.repos.createForAuthenticatedUser({
        name: name,
        description: description
    });
    
    //Clear the popup
    while (popup.firstChild) {
        popup.removeChild(popup.firstChild);
    }
    
    //Save a blank project to the repo
    
    //Load the project we just created
}



        