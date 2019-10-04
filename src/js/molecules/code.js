import Atom from '../prototypes/atom.js'
import CodeMirror from 'codemirror'

/**
 * The Code molecule type adds support for executing arbirary jsxcad code.
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
         * The code contained within the atom stored as a string.
         * @type {string}
         */
        this.code = "//You can learn more about all of the available methods at https://jsxcad.js.org/app/UserGuide.html \n\n\nfunction main(Input1, Input2){\n  return Sphere(40)        //return must be geometry;\n}\n\nreturn main(Input1, Input2)"
        
        this.addIO("output", "geometry", this, "geometry", "")
        
        this.setValues(values)
        
        this.parseInputs()
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
            
            const values = [this.code, argumentsArray]
            
            this.basicThreadValueProcessing(values, "code")
        }catch(err){this.setAlert(err)}
    }
    
    parseInputs(){
        //Parse this.code for the line "\nmain(input1, input2....) and add those as inputs if needed
        var variables = /\(\s*([^)]+?)\s*\)/.exec(this.code)
        if (variables[1]) {
            variables = variables[1].split(/\s*,\s*/)
        }
        
        //Add any inputs which are needed
        for (var variable in variables){
            if(!this.inputs.some(input => input.Name === variables[variable])){
                this.addIO('input', variables[variable], this, 'geometry', null, true)
            }
        }
        
        //Remove any inputs which are not needed
        for (var input in this.inputs){
            if( !variables.includes(this.inputs[input].name) ){
                this.removeIO('input', this.inputs[input].name, this)
            }
        }
    }
    
    /**
     * Add a button to open the code editor to the side bar
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,"Edit Code",() => {
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