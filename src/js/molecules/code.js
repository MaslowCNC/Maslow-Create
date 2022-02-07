import Atom from '../prototypes/atom.js'
import CodeMirror from 'codemirror'
import GlobalVariables from '../globalvariables'

/**
 * The Code molecule type adds support for executing arbitrary jsxcad code.
 */
export default class Code extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = "Code"
        /**
         * This atom's name
         * @type {string}
         */
        this.atomType = "Code"
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Defines a JSxCAD code block."
        /**
         * The code contained within the atom stored as a string.
         * @type {string}
         */
        this.code = "//You can learn more about all of the available methods at https://jsxcad.js.org/app/UserGuide.html \n//Inputs:[Input1, Input2];\n\n\nreturn Orb(10)"
        
        this.addIO("output", "geometry", this, "geometry", "")
        
        this.setValues(values)
        
        this.parseInputs(false)
    }

    /**
     * Draw the code atom which has a code icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.font = `${GlobalVariables.widthToPixels(this.radius)}px Work Sans Bold`
        GlobalVariables.c.fillText('</>', GlobalVariables.widthToPixels(this.x - (this.radius/1.5)), GlobalVariables.heightToPixels(this.y + (this.radius*1.5)))
    }
    
    /**
     * Begin propagation from this code atom if it has no inputs or if none of the inputs are connected. 
     */ 
    beginPropagation(){
        //If there are no inputs
        if(this.inputs.length == 0){
            this.updateValue()
        }

        //If none of the inputs are connected
        var connectedInput = false
        this.inputs.forEach(input => {
            if(input.connectors.length > 0){
                connectedInput = true
            }
        })
        if(!connectedInput){
            this.updateValue()
        }
    }

    /**
     * Grab the code as a text string and execute it. 
     */ 
    updateValue(){
        try{
            this.parseInputs()
            
            var argumentsArray = {}
            this.inputs.forEach(input => {
                argumentsArray[input.name] = input.value
            })
            
            const values = { op: "code", code: this.code, paths: argumentsArray, writePath: this.path }
            this.basicThreadValueProcessing(values)
            
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * This function reads the string of inputs the user specifies and adds them to the atom.
     */ 
    parseInputs(ready = true){
        //Parse this.code for the line "\nmain(input1, input2....) and add those as inputs if needed
        var variables = /Inputs:\[\s*([^)]+?)\s*\]/.exec(this.code)
        
        if(variables){
            if (variables[1]) {
                variables = variables[1].split(/\s*,\s*/)
            }
            
            //Add any inputs which are needed
            for (var variable in variables){
                if(!this.inputs.some(input => input.Name === variables[variable])){
                    this.addIO('input', variables[variable], this, 'geometry', null, ready)
                }
            }
            
            //Remove any inputs which are not needed
            for (var input in this.inputs){
                if( !variables.includes(this.inputs[input].name) ){
                    this.removeIO('input', this.inputs[input].name, this)
                }
            }
        }
    }
    
    /**
     * Edit the atom's code when it is double clicked
     * @param {number} x - The X coordinate of the click
     * @param {number} y - The Y coordinate of the click
     */ 
    doubleClick(x,y){
        //returns true if something was done with the click
        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, xInPixels, y, yInPixels)
        
        if (distFromClick < this.radius){
            this.editCode()
            clickProcessed = true
        }
        
        return clickProcessed 
    }
    
    /**
     * Called to trigger editing the code atom
     */ 
    editCode(){
        //Remove everything in the popup now
        const popup = document.getElementById('projects-popup')
        while (popup.firstChild) {
            popup.removeChild(popup.firstChild)
        }
        
        popup.classList.remove('off')

        //Add a title
        var codeMirror = CodeMirror(popup, {
            value: this.code,
            mode:  "javascript",
            lineNumbers: true,
            gutter: true,
            lineWrapping: true
        })
        
        var form = document.createElement("form")
        popup.appendChild(form)
        var button = document.createElement("button")
        button.setAttribute("type", "button")
        button.appendChild(document.createTextNode("Save Code"))
        button.addEventListener("click", () => {
            this.code = codeMirror.getDoc().getValue('\n')
            this.updateValue()
            popup.classList.add('off')
        })
        form.appendChild(button)
    }
    
    /**
     * Add a button to open the code editor to the side bar
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,"Edit Code",() => {
            this.editCode()
        })
    }
    
    /**
     * Save the input code to be loaded next time
     */ 
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.code = this.code
        
        return valuesObj
        
    }
}