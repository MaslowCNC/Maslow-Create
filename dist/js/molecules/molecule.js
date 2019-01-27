var Molecule = Atom.create({
    children: [], 
    name: "Molecule",
    atomType: "Molecule",
    topLevel: false, //a flag to signal if this node is the top level node
    
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.nodesOnTheScreen = [];
        
        if (!instance.topLevel){
            goUpOneLevel = UpOneLevelBtn.create({
                parentMolecule: instance, 
                x: 50,
                y: 50
            });
            instance.nodesOnTheScreen.push(goUpOneLevel);
        }
        return instance;
    },
    
    draw: function(){
        Atom.draw.call(this); //Super call to draw the rest
        
        //draw the circle in the middle
        c.beginPath();
        c.fillStyle = "#949294";
        c.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2, false);
        c.closePath();
        c.fill();
        
    },
    
    updateIO: function(){
        
        this.children = [];
        
        this.nodesOnTheScreen.forEach(node => {
            
            if(node.type == "input"){
                this.addIO("input", node.name, this);
            }
            if(node.type == "output"){
                this.addIO("output", node.name, this);
            }
        });
    },
    
    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            currentMolecule = this; //set this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
});


var UpOneLevelBtn = Atom.create({
    name: "Go Up One Level",
    children: [],
    color: '#F3EFEF',
    defaultColor: '#F3EFEF',
    selectedColor: '#F3EFEF',
    radius: 30,
    
    create: function(values){
        var instance = Atom.create.call(this, values);
        return instance;
    },
    
    draw: function() {
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        
        c.fillStyle = this.color;
        
        c.textAlign = "start"; 
        c.fillText(this.name, this.x, this.y-(this.radius-5));

        var shaftWidth = 7;
        
        c.beginPath();
        c.moveTo(this.x, this.y - this.radius/2);
        c.lineTo(this.x + this.radius/2, this.y);
        c.lineTo(this.x + shaftWidth, this.y);
        c.lineTo(this.x + shaftWidth, this.y + this.radius/2);
        c.lineTo(this.x - shaftWidth, this.y + this.radius/2);
        c.lineTo(this.x - shaftWidth, this.y);
        c.lineTo(this.x - this.radius/2, this.y);
        c.fill();
        c.closePath();

    },
    
    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        var clickProcessed = false;
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            this.parentMolecule.updateIO(); //updates the IO shown on the parent molecule
            currentMolecule = this.parentMolecule.parent; //set parent this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
});