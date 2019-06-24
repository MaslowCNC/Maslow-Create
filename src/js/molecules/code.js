import Atom from '../prototypes/atom.js'
import CodeMirror from 'codemirror'
import GlobalVariables from '../globalvariables.js'

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
        
        this.name = "Code"
        this.atomType = "Code"
        this.code = "//Add an input\nThis.addIO('input', 'input name', This, 'geometry', 10);\n\n//Read back from the input\nThis.findIOValue('radius');\n\n//Set the output\nThis.value = 10;"
        
        this.addIO("output", "geometry", this, "geometry", "")
        
        this.setValues(values)
        
        //generate the correct codeblock for this atom on creation
        this.updateValue()
    }
    
    /**
     * Grab the code as a text string and execute it. This really needs to be moved to a worker for security.
     */ 
    updateValue(){
        //This should pull and run the code in the editor
        
        //reset the IOs to the default state
        const code = new Function('$',
            `const { ${Object.keys({...GlobalVariables.api, ...{This: this}}).join(', ')} } = $;\n\n` + 
                                  this.code)
        try{
            code({...GlobalVariables.api, ...{This: this}})
        }catch(err){
            console.warn(err)
        }
        
        super.updateValue()
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
            popup.setAttribute("style", "text-align: center")

            
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
     * Save the input code
     */ 
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.code = this.code
        
        return valuesObj
        
    }
}