import Atom from '../prototypes/atom.js'
import Connector from '../prototypes/connector.js'
import GlobalVariables from '../globalvariables.js'
//import saveAs from '../lib/FileSaver.js'
import { extractBomTags } from '../BOM.js'

/**
 * This class creates the Molecule atom.
 */
export default class Molecule extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /** 
         * A list of all of the atoms within this Molecule which should be drawn on the screen.
         * @type {array}
         */
        this.nodesOnTheScreen = []
        /** 
         * An array of the molecules inputs. Is this not inherited from atom?
         * @type {array}
         */
        this.inputs = []
        /** 
         * This atom's type
         * @type {string}
         */
        this.name = 'Molecule'
        /** 
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Molecule'
        /** 
         * The color for the middle dot in the molecule
         * @type {string}
         */
        this.centerColor = '#949294'
        /** 
         * A flag to indicate if this molecule is the top level molecule.
         * @type {boolean}
         */
        this.topLevel = false
        /** 
         * A list of things which should be displayed on the the top level sideBar when in toplevel mode.
         * @type {array}
         */
        this.runModeSidebarAdditions = []
        
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
    }
    
    /**
     * Gives this molecule inputs with the same names as all of it's parent's inputs
     */ 
    copyInputsFromParent(){
        if(this.parent){
            this.parent.nodesOnTheScreen.forEach(node => {
                if(node.atomType == "Input"){
                    this.placeAtom({
                        parentMolecule: this,
                        y: node.y,
                        parent: this,
                        name: node.name,
                        atomType: 'Input'
                    }, null, GlobalVariables.availableTypes)
                }
            })
        } 
    }
    
    /**
     * Add the center dot to the molecule
     */ 
    draw(){
        super.draw() //Super call to draw the rest
        
        //draw the circle in the middle
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.centerColor
        GlobalVariables.c.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2, false)
        GlobalVariables.c.closePath()
        GlobalVariables.c.fill()
    }
    
    /**
     * Handle double clicks by replacing the molecule currently on the screen with this one, esentially diving into it.
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     */ 
    doubleClick(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
        
        if (distFromClick < this.radius){
            GlobalVariables.currentMolecule = this //set this to be the currently displayed molecule
            GlobalVariables.currentMolecule.backgroundClick()
            clickProcessed = true
        }
        
        return clickProcessed 
    }
    
    /**
     * Handle a background click (a click which doesn't land on one of the contained molecules) by deselecting everything and displaying a 3D rendering of this molecules output.
     */ 
    backgroundClick(){
        /**
         * Flag that the attom is now selected.
         */
        this.selected = true
        this.updateSidebar()
        this.sendToRender()
    }
    
    /**
     * Unselect this molecule
     */ 
    deselect(){
        this.selected = false
    }
    
    /**
     * Grab values from the inputs and push them out to the input atoms.
     */ 
    updateValue(){
        
        if(this.inputs.every(x => x.ready)){
            
            console.log(this.name + " should be processing")
            this.clearAlert()
            
            //Grab values from the inputs and push them out to the input objects
            this.inputs.forEach(moleculeInput => {
                this.nodesOnTheScreen.forEach(atom => {
                    if(atom.atomType == 'Input' && moleculeInput.name == atom.name){
                        if(atom.getOutput() != moleculeInput.getValue() && atom.output.connectors.length > 0){//Don't update the input if it hasn't changed
                            
                            this.processing = true
                            atom.updateValue()
                        }
                    }
                })
            })
        }
    }
    
    /**
     * Trigger the output to propogate.
     */ 
    propogate(){
        //Set the output nodes with type 'geometry' to be the generated code
        if(this.output){
            this.output.setValue(this.value)
        }
        
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender()
        }
    }
    
    /**
     * Walks through each of the atoms in this molecule and begins propogation from them if they have no inputs to wait for
     */ 
    beginPropogation(){
        //Run for this molecule
        super.beginPropogation()
        
        // Run for every atom in this molecule
        this.nodesOnTheScreen.forEach(node => {
            node.beginPropogation()
        })
    }
    
    /**
     * Updates the side bar to display options like 'go to parent' and 'load a different project'. What is displayed depends on if this atom is the top level, and if we are using run mode.
     */ 
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.initializeSideBar() 
        
        this.createEditableValueListItem(valueList,this,'name','Name', false)

        if(this.topLevel){
            //If we are the top level molecule 
            this.createSegmentSlider(valueList)

        }
        
        //removes 3d view menu on background click
        let viewerBar = document.querySelector('#viewer_bar')
        if(viewerBar && viewerBar.firstChild){
            while (viewerBar.firstChild) {
                viewerBar.removeChild(viewerBar.firstChild)
                viewerBar.setAttribute('style', 'background-color:none;')
            }
        }

        //Add options to set all of the inputs
        this.inputs.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                this.createEditableValueListItem(valueList,child,'value', child.name, true)
            }
        })
        
        this.displaySimpleBOM(valueList)
        
        return valueList
        
    }

    /**
     * Creates segment length slider and passes value to Global Variables
     */ 
    createSegmentSlider(valueList){
        //Creates value slider
        var rangeElement = document.createElement('input')
        //Div which contains the entire element
        var div = document.createElement('div')
        div.setAttribute('class', 'slider-container')
        valueList.appendChild(div)
        var rangeLabel = document.createElement('label')
        rangeLabel.textContent = "Display quality/Length of Segments"
        div.appendChild(rangeLabel)
        rangeLabel.appendChild(rangeElement)
        rangeElement.setAttribute('type', 'range')
        rangeElement.setAttribute('min', '.1')
        rangeElement.setAttribute('max', '10')
        rangeElement.setAttribute('step', '.3')
        rangeElement.setAttribute('class', 'slider')
        rangeElement.setAttribute('value', GlobalVariables.circleSegmentSize)
            
        var rangeValueLabel = document.createElement('ul')
        rangeValueLabel.innerHTML= '<li>Export</li><li>Draft</li> '
        rangeValueLabel.setAttribute('class', 'range-labels')
        rangeLabel.appendChild(rangeValueLabel)

        var rangeValue = document.createElement('p')
        rangeValue.textContent = rangeElement.value
        rangeLabel.appendChild(rangeValue)


        //on slider change send value to global variables
        rangeElement.oninput = function() {
            rangeValue.textContent = this.value
            GlobalVariables.circleSegmentSize = this.value
            
        }
        
        rangeElement.addEventListener('mouseup', () => {
            GlobalVariables.topLevelMolecule.refreshCircles()
        })
    }
    
    /**
     * Used to trigger all of the circle atoms within a molecule and all of the molecules within it to update their value. Used when the number of segments changes.
     */ 
    refreshCircles(){
        this.nodesOnTheScreen.forEach(atom => {
            if(atom.atomType == "Circle"){
                atom.updateValue()
            }
            else if(atom.atomType == "Molecule" || atom.atomType == "GitHubMolecule"){
                atom.refreshCircles()
            }
        })
    }
    
    /**
     * Creates a simple BOM list which cannot be edited. The generated element is added to the passed list.
     * @param {object} list - The HTML object to append the created element to.
     */ 
    displaySimpleBOM(list){
        
        if(this.value != null){
            try{
                extractBomTags(this.value).then(bomList => {
                    
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
                })
            }catch(err){
                this.setAlert("Unable to read BOM")
            }
        }
        
    }

    /**
     * Replace the currently displayed molecule with the parent of this molecule...moves the user up one level.
     */
    goToParentMolecule(){
        //Go to the parent molecule if there is one
        if(!GlobalVariables.currentMolecule.topLevel){
            GlobalVariables.currentMolecule = GlobalVariables.currentMolecule.parent //set parent this to be the currently displayed molecule
            GlobalVariables.currentMolecule.backgroundClick()
        }
    }
    
    /**
     * Check to see if any of this molecules children have contributions to make to the README file. Children closer to the top left will be applied first. TODO: No contribution should be made if it's just a title.
     */
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
    
    /**
     * Generates and returns a JSON represntation of this molecule and all of its children.
     * @param {object} savedObject - A JSON object to append the represntation of this atom to.
     */
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
            //Store a representation of the atom
            allAtoms.push(atom.serialize(savedObject))
            //Store a representation of the atom's connectors
            if(atom.output){
                atom.output.connectors.forEach(connector => {
                    allConnectors.push(connector.serialize())
                })
            }
        })
        
        var thisAsObject = super.serialize(savedObject)
        thisAsObject.topLevel = this.topLevel
        thisAsObject.allAtoms = allAtoms
        thisAsObject.allConnectors = allConnectors
        thisAsObject.fileTypeVersion = 1
        
        //Add a JSON representation of this object to the file being saved
        savedObject.molecules.push(thisAsObject)
        savedObject.circleSegmentSize = GlobalVariables.circleSegmentSize
            
        if(this.topLevel == true){
            //If this is the top level, return the complete file to be saved
            return savedObject
        }
        else{
            //If not, return a placeholder for this molecule
            return super.serialize(savedObject)
        }
    }
    
    /**
     * Load the children of this from a JSON represntation
     * @param {object} moleculeList - A list of all the atoms to be placed
     * @param {number} moleculeID - The uniqueID of the molecule from the list to be loaded
     */
    deserialize(moleculeList, moleculeID){
        //Find the target molecule in the list
        let promiseArray = []
        let moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID})[0]
            
        this.setValues(moleculeObject) //Grab the values of everything from the passed object
        //Place the atoms
        moleculeObject.allAtoms.forEach(atom => {
            const promise = this.placeAtom(atom, moleculeList, GlobalVariables.availableTypes, false)
            promiseArray.push(promise)
        })
        
        return Promise.all(promiseArray).then( ()=> {
            //Once all the atoms are placed we can finish
            
            //reload the molecule object to prevent persistence issues
            moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID})[0]
            //Place the connectors
            /**
             * A copy of the connectors attached to this molecule which can be reattached later. Should be redone.
             * @param {array}
             */
            this.savedConnectors = moleculeObject.allConnectors //Save a copy of the connectors so we can use them later if we want
            this.savedConnectors.forEach(connector => {
                this.placeConnector(connector)
            })
            
            this.setValues([])//Call set values again with an empty list to trigger loading of IO values from memory

            if(this.topLevel){
                console.log("Beginning unlock")
                this.backgroundClick()
                this.beginPropogation()
            }
        })
    }
    
    /**
     * Dump the stored copies of any geometry in this molecule to free up ram.
     */ 
    dumpBuffer(keepThisValue){
        
        //Preserve the output of this molecule if we need to keep using it
        if(!keepThisValue){
            super.dumpBuffer()
        }
        
        this.nodesOnTheScreen.forEach(atom => {
            atom.dumpBuffer()
        })
    }
    
    /**
     * Places a new atom inside the molecule
     * @param {object} newAtomObj - An object defining the new atom to be placed
     * @param {array} moleculeList - Only pased if we are placing an instance of Molecule.
     * @param {object} typesList - A dictionary of all of the available types with references to their constructors
     * @param {boolean} unlock - A flag to indicate if this atom should spawn in the unlocked state.
     */
    async placeAtom(newAtomObj, moleculeList, typesList, unlock){
        //Place the atom - note that types not listed in typesList will not be placed with no warning
        var promise = null
        
        for(var key in typesList) {
            if (typesList[key].atomType == newAtomObj.atomType){
                newAtomObj.parent = this
                var atom = new typesList[key].creator(newAtomObj)
                
                //reassign the name of the Inputs to preserve linking
                if(atom.atomType == 'Input' && typeof newAtomObj.name !== 'undefined'){
                    atom.name = newAtomObj.name
                    atom.draw() //The poling happens in draw :roll_eyes:
                }

                //If this is a molecule, de-serialize it
                if(atom.atomType == 'Molecule' && moleculeList != null){
                    promise = atom.deserialize(moleculeList, atom.uniqueID)
                }
                
                //If this is a github molecule load it from the web
                if(atom.atomType == 'GitHubMolecule'){
                    promise = atom.loadProjectByID(atom.projectID)
                }
                
                //Add the atom to the list to display
                this.nodesOnTheScreen.push(atom)
                
                if(unlock){
                    //Make it spawn ready to update right away
                    if(promise != null){
                        promise.then( ()=> {
                            atom.beginPropogation()
                        })
                    }
                    else{
                        atom.beginPropogation()
                    }
                    
                    //Fake a click on the newly placed atom
                    const downEvt = new MouseEvent('mousedown', {
                        clientX: atom.x,
                        clientY: atom.y
                    })
                    const upEvt = new MouseEvent('mouseup', {
                        clientX: atom.x,
                        clientY: atom.y
                    })
                    
                    document.getElementById('flow-canvas').dispatchEvent(downEvt)
                    document.getElementById('flow-canvas').dispatchEvent(upEvt)
                    
                    //Make this moleclue spawn with all of it's parent's inputs
                    if(atom.atomType == 'Molecule'){
                        atom.copyInputsFromParent()
                    }
                }
            }
        }
        return promise
    }
    
    /**
     * Places a new connector within the molecule
     * @param {object} connectorObj - An object represntation of the connector specifying its inputs and outputs.
     */
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
        //connector.propogate()
    }
    
    /**
     * Sends the output of this molecule to be displayed in the 3D view.
     */
    sendToRender(){
        super.sendToRender()
        if(this.value != null){
            if(this.topLevel){
                GlobalVariables.ask({values: [this.value], key: "bounding box"}).then(result => {
                    if (result != -1 ){
                        GlobalVariables.display.zoomCameraToFit(result)
                    }else{
                        console.warn("Unable to compute bounding box")
                    }
                })
            }
        }
    }
}