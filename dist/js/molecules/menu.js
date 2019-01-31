
function placeNewNode(ev){
    hidemenu();
    let clr = ev.target.id;
    
    availableTypes.forEach(type => {
        if (type.name === clr){
            var molecule = type.create({
                x: menu.x, 
                y: menu.y, 
                parent: currentMolecule,
                name: type.name,
                atomType: type.name,
                uniqueID: generateUniqueID()
            });
            currentMolecule.nodesOnTheScreen.push(molecule);
        }
    }); 
}

function showmenu(ev){
    //stop the real right click menu
    ev.preventDefault(); 
    
    //make sure all elements are unhidden
    ul = document.getElementById("menuList");
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
        li[i].style.display = ""; //set each item to display
    }
    
    //show the menu
    menu.style.top = `${ev.clientY - 20}px`;
    menu.style.left = `${ev.clientX - 20}px`;
    menu.x = ev.clientX;
    menu.y = ev.clientY;
    menu.classList.remove('off');
}

function hidemenu(ev){
    menu.classList.add('off');
    menu.style.top = '-200%';
    menu.style.left = '-200%';
}

function searchMenu() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('menuInput');
  filter = input.value.toUpperCase();
  ul = document.getElementById("menuList");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i]; //this is the link part of the list item
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) { //if the entered string matches
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}
