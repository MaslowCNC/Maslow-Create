import Atom from '../prototypes/atom.js'
import Connector from '../prototypes/connector.js'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'
import { extractBomTags } from '../BOM.js'

export default class Molecule extends Atom{

    constructor(values){
        
        super(values)
        
        this.nodesOnTheScreen = []
        this.inputs = []
        this.name = 'Molecule'
        this.atomType = 'Molecule'
        this.centerColor = '#949294'
        this.topLevel = false //a flag to signal if this node is the top level node
        
        this.setValues(values)
        
        //Add the molecule's output
        this.placeAtom({
            parentMolecule: this, 
            x: GlobalVariables.canvas.width - 50,
            y: GlobalVariables.canvas.height/2,
            parent: this,
            name: 'Output',
            atomType: 'Output'
        }, null, GlobalVariables.secretTypes)
        
        this.updateValue()
    }
    
    draw(){
        super.draw() //Super call to draw the rest
        
        //draw the circle in the middle
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.centerColor
        GlobalVariables.c.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2, false)
        GlobalVariables.c.closePath()
        GlobalVariables.c.fill()
        
    }
    
    doubleClick(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
        
        if (distFromClick < this.radius){
            GlobalVariables.currentMolecule = this //set this to be the currently displayed molecule
            clickProcessed = true
        }
        
        return clickProcessed 
    }
    
    backgroundClick(){
        
        this.selected = true
        this.updateSidebar()
        this.sendToRender()
    }
    
    updateValue(){
        this.processing = true
        this.clearAlert()
        
        //Grab values from the inputs and push them out to the input objects
        this.inputs.forEach(child => {
            if(child.type == 'input'){
                this.nodesOnTheScreen.forEach(atom => {
                    if(atom.atomType == 'Input' && child.name == atom.name){
                        atom.setOutput(child.getValue())
                    }
                })
            }
        })
        
        this.processing = false
    }
    
    propogate(){
        //Set the output nodes with type 'geometry' to be the generated code
        this.inputs.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.value)
            }
        })
        
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender()
        }
    }
    
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.initializeSideBar() 
        
        if(!this.topLevel){
            this.createButton(valueList,this,'Go To Parent',this.goToParentMolecule)
            
            this.createButton(valueList,this,'Export To GitHub', this.exportToGithub)
        }
        else{ //If we are the top level molecule and not in run mode
            this.createButton(valueList,this,'Load A Different Project',() => {
                GlobalVariables.gitHub.showProjectsToLoad()
            })
            
            this.createButton(valueList,this,'Share This Project',() => {
                GlobalVariables.gitHub.shareOpenedProject()
            })
            
            this.createButton(valueList,this,'GitHub',() => {
                GlobalVariables.gitHub.openGitHubPage()
            })
            
        }
        
        this.createButton(valueList,this,'Download STL',() => {
            const convertSTL = require('@jsxcad/convert-stl')
            convertSTL.toStla({}, this.value.toDisjointGeometry()).then( stlContent => {
                const blob = new Blob([stlContent], {type: 'text/plain;charset=utf-8'})
                saveAs(blob, this.name+'.stl')
            })
        })
        
        this.createButton(valueList,this,'Download SVG',() => {
            const convertSVG = require('@jsxcad/convert-svg')
            const crossSection = this.value.crossSection().toDisjointGeometry()
            convertSVG.toSvg({}, crossSection).then( contentSvg => {
                const blob = new Blob([contentSvg], {type: 'text/plain;charset=utf-8'})
                saveAs(blob, this.name+'.svg')
            })
        })
        
        this.createEditableValueListItem(valueList,this,'name', 'Name', false)
        
        if(this.uniqueID != GlobalVariables.currentMolecule.uniqueID){ //If we are not currently inside this molecule
            //Add options to set all of the inputs
            this.inputs.forEach(child => {
                if(child.type == 'input' && child.valueType != 'geometry'){
                    this.createEditableValueListItem(valueList,child,'value', child.name, true)
                }
            })
        }
        
                
        this.displaySimpleBOM(valueList)
        
        return valueList
        
    }
    
    displaySimpleBOM(list){
        var bomList = []
        try{
            bomList = extractBomTags(this.value)
        }catch(err){
            this.setAlert("Unable to read BOM")
        }
        
        if(bomList.length > 0){
        
            list.appendChild(document.createElement('br'))
            list.appendChild(document.createElement('br'))
            
            var div = document.createElement('h3')
            div.setAttribute('style','text-align:center;')
            list.appendChild(div)
            var valueText = document.createTextNode('Bill Of Materials')
            div.appendChild(valueText)
            
            var x = document.createElement('HR')
            list.appendChild(x)
            
            bomList.forEach(bomEntry => {
                this.createNonEditableValueListItem(list,bomEntry,'numberNeeded', bomEntry.BOMitemName, false)
            })
        }
    }

    goToParentMolecule(){
        //Go to the parent molecule if there is one
        
        GlobalVariables.currentMolecule.updateValue()
        
        if(!GlobalVariables.currentMolecule.topLevel){
            GlobalVariables.currentMolecule = GlobalVariables.currentMolecule.parent //set parent this to be the currently displayed molecule
        }
    }
    
    exportToGithub(self){
        //Export this molecule to github
        GlobalVariables.gitHub.exportCurrentMoleculeToGithub(self)
    }
    
    replaceThisMoleculeWithGithub(githubID){
        
        //If we are currently inside the molecule targeted for replacement, go up one
        if (GlobalVariables.currentMolecule.uniqueID == this.uniqueID){
            GlobalVariables.currentMolecule = this.parent
        }
        
        //Create a new github molecule in the same spot
        GlobalVariables.currentMolecule.placeAtom({
            x: this.x, 
            y: this.y, 
            parent: GlobalVariables.currentMolecule,
            name: this.name,
            atomType: 'GitHubMolecule',
            projectID: githubID,
            uniqueID: GlobalVariables.generateUniqueID()
        }, null, GlobalVariables.availableTypes)
        
        
        //Then delete the old molecule which has been replaced
        this.deleteNode()

    }
    
    requestReadme(){
        var generatedReadme = super.requestReadme()
        generatedReadme.push('## ' + this.name)
        
        var sortableAtomsList = this.nodesOnTheScreen
        sortableAtomsList.sort(function(a, b){return GlobalVariables.distBetweenPoints(a.x, 0, a.y, 0)-GlobalVariables.distBetweenPoints(b.x, 0, b.y, 0)})
        
        sortableAtomsList.forEach(molecule => {
            generatedReadme = generatedReadme.concat(molecule.requestReadme())
        })
        return generatedReadme
    }
    
    serialize(savedObject){
        //Save this molecule.
        
        //This one is a little confusing. Basically each molecule saves like an atom, but also creates a second object 
        //record of itself in the object "savedObject" object. If this is the topLevel molecule we need to create the 
        //savedObject object here to pass to lower levels.
        
        if(this.topLevel == true){
            //If this is the top level create a new blank project to save to FIXME: It would be cleaner if this function were just called with the object when called from the top level
            savedObject = {molecules: []}
        }
            
        var allAtoms = [] //An array of all the atoms containted in this molecule
        var allConnectors = [] //An array of all the connectors contained in this molelcule
        
        
        this.nodesOnTheScreen.forEach(atom => {
            //Store a represnetation of the atom
            allAtoms.push(atom.serialize(savedObject))
            //Store a representation of the atom's connectors
            atom.inputs.forEach(attachmentPoint => {
                if(attachmentPoint.type == 'output'){
                    attachmentPoint.connectors.forEach(connector => {
                        allConnectors.push(connector.serialize())
                    })
                }
            })
        })
        
        var thisAsObject = super.serialize(savedObject)
        thisAsObject.topLevel = this.topLevel
        thisAsObject.allAtoms = allAtoms
        thisAsObject.allConnectors = allConnectors
        thisAsObject.fileTypeVersion = 1
        
        //Add a JSON representation of this object to the file being saved
        savedObject.molecules.push(thisAsObject)
            
        if(this.topLevel == true){
            //If this is the top level, return the complete file to be saved
            return savedObject
        }
        else{
            //If not, return a placeholder for this molecule
            return super.serialize(savedObject)
        }
    }
        
    deserialize(moleculeList, moleculeID){
        //Find the target molecule in the list
        var moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID})[0]
            
        this.setValues(moleculeObject) //Grab the values of everything from the passed object
            
        //Place the atoms
        moleculeObject.allAtoms.forEach(atom => {
            this.placeAtom(atom, moleculeList, GlobalVariables.availableTypes)
        })
        //reload the molecule object to prevent persistence issues
        moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID})[0]
            
        //Place the connectors FIXME: This is being saved into the object twice now that we are saving everything from the main object so the variable name should be changed
        this.savedConnectors = moleculeObject.allConnectors //Save a copy of the connectors so we can use them later if we want
        this.savedConnectors.forEach(connector => {
            this.placeConnector(connector)
        })
        
        this.setValues([])//Call set values again with an empty list to trigger loading of IO values from memory

        this.updateValue()
    }
    
    placeAtom(newAtomObj, moleculeList, typesList){
        //Place the atom - note that types not listed in availableTypes will not be placed with no warning (ie go up one level)
        
        for(var key in typesList) {
            if (typesList[key].atomType == newAtomObj.atomType){
                newAtomObj.parent = this
                var atom = new typesList[key].creator(newAtomObj)
                
                //reassign the name of the Inputs to preserve linking
                if(atom.atomType == 'Input' && typeof newAtomObj.name !== 'undefined'){
                    atom.name = newAtomObj.name
                    atom.draw() //The poling happens in draw :roll_eyes:
                }

                //If this is a molecule, deserialize it
                if(atom.atomType == 'Molecule' && moleculeList != null){
                    atom.deserialize(moleculeList, atom.uniqueID)
                }
                
                this.nodesOnTheScreen.push(atom)
            }
        }
        
        if(newAtomObj.atomType == 'Output'){
            //re-asign output ID numbers if a new one is supposed to be placed
            this.nodesOnTheScreen.forEach(atom => {
                if(atom.atomType == 'Output'){
                    atom.setID(newAtomObj.uniqueID)
                }
            })
        }
    }
    
    placeConnector(connectorObj){
        var connector
        var cp1NotFound = true
        var cp2NotFound = true
        var ap2
        
        try{
            this.nodesOnTheScreen.forEach(atom => {
                //Find the output node
                if (atom.uniqueID == connectorObj.ap1ID){
                        connector = new Connector({
                            atomType: 'Connector',
                            attachmentPoint1: atom.output,
                            parentMolecule:  atom
                        })
                        cp1NotFound = false
                }
                //Find the input node
                if (atom.uniqueID == connectorObj.ap2ID){
                    atom.inputs.forEach(child => {
                        if(child.name == connectorObj.ap2Name && child.type == 'input' && child.connectors.length == 0){
                            cp2NotFound = false
                            ap2 = child
                        }
                    })
                }
            })
        }
        catch(err){
            console.warn('Unable to create connector')
        }
        
        if(cp1NotFound || cp2NotFound){
            console.warn('Unable to create connector')
            return
        }
        
        connector.attachmentPoint2 = ap2
        
        //Store the connector
        connector.attachmentPoint1.connectors.push(connector)
        connector.attachmentPoint2.connectors.push(connector)
        
        //Update the connection
        connector.propogate()
    }
}

