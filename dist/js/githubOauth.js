const octokit = new Octokit()


//create a new repo
// octokit.repos.createForAuthenticatedUser({
    // name: "A test repo",
    // description: "A description of this test repo"
// });

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
    var popup = document.getElementById('projects-popup');
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
    addProject(projectsSpaceDiv, ({name: "New Project"}));
    
    
    //List all of the repos that a user is the onwer of
    octokit.repos.list({
      affiliation: 'owner',
    }).then(({data, headers, status}) => {
        data.forEach(repo => {
            addProject(projectsSpaceDiv, repo);
        });
    })
    
}

function addProject(popup, repo){
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
    console.log("project clicked:");
    console.log(projectName);
    
    if(projectName == "New Project"){
        console.log("create new project");
        
    }
    else{
        console.log("Load project: " + projectName);
    }
}

function loadProject(repo){
    
}

