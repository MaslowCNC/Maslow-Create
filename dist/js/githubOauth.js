var github = null;

document.getElementById('github-button').addEventListener('click', function() {
	// Initialize with your OAuth.io app public key
	OAuth.initialize('BYP9iFpD7aTV9SDhnalvhZ4fwD8');
    // Use popup for oauth
    // Alternative is redirect
    OAuth.popup('github').then(github => {
    loginSucessfull(github);
    // console.log('github:', github);
    // Retrieves user data from oauth provider
    // Prompts 'welcome' message with User's email on successful login
    // #me() is a convenient method to retrieve user data without requiring you
    // to know which OAuth provider url to call
    // github.me().then(data => {
      // console.log('me data:', data);
      // alert('GitHub says your email is:' + data.email + ".\nView browser 'Console Log' for more details");
	  // });
    // Retrieves user data from OAuth provider by using #get() and
    // OAuth provider url
    // github.get('/user').then(data => {
      // console.log('self data:', data);
    // })
	});
})

const octokit = new Octokit()

octokit.authenticate({
  type: 'basic',
  username: '',
  password: ''
})

//List all of the repos that a user is the onwer of
octokit.repos.list({
  affiliation: 'owner',
}).then(({data, headers, status}) => {
    data.forEach(repo => {
        console.log(repo.name);
    });
})

//create a new repo
// octokit.repos.createForAuthenticatedUser({
    // name: "A test repo",
    // description: "A description of this test repo"
// });

function loginSucessfull(github){
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
    addProject(projectsSpaceDiv, ({name: "New Project"}), github);
    
    //look at all the users repos and see which ones we want to use
    github.get('/user/repos').then(repos => {
        repos.forEach(repo => {
            addProject(projectsSpaceDiv, repo, github);
        });
    })
    
}

function addProject(popup, repo, github){
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
        projectClicked(repo.name, github);
    })

}

function projectClicked(projectName, github){
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

