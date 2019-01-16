
var Readme = Atom.create({
    codeBlock: "",
    readmeText: "Readme text here",
    type: "readme",
    name: "README",
    radius: 20,
    updateSidebar: function(){
        //updates the sidebar to display information about this node
        
        var valueList = Atom.updateSidebar.call(this); //call the super function
        
        createEditableValueListItem(valueList,this,"readmeText", "Notes", false);
        
    },
    draw: function() {
        
        Atom.draw.call(this); //Super call to draw the rest
        
        //draw the two slashes on the node//
        c.strokeStyle = "#949294";
        c.lineWidth = 3;
        c.lineCap = "round";
        
        c.beginPath();
        c.moveTo(this.x - 11, this.y + 10);
        c.lineTo(this.x, this.y - 10);
        c.stroke();
        
        c.beginPath();
        c.moveTo(this.x, this.y + 10);
        c.lineTo(this.x + 11, this.y - 10);
        c.stroke();
    }
});
