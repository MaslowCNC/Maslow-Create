import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Code extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.name = "Code";
        this.atomType = "Code";
        this.code = "//Add an input\nThis.addIO('input', 'input name', This, 'geometry', 10);\n\n//Read back from the input\nThis.findIOValue('radius');\n\n//Set the output\nThis.value = 10;";
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.setValues(values);
        
        //generate the correct codeblock for this atom on creation
        this.updateValue();
    }
    
    updateValue(){
        //This should pull and run the code in the editor
        
        //reset the IOs to the default state
        
        const code = new Function('$',
                                  `const { ${Object.keys({...GlobalVariables.api, ...{This: this}}).join(', ')} } = $;\n\n` + 
                                  this.code);
        try{
            const result = code({...GlobalVariables.api, ...{This: this}});
        }catch(err){
            console.log(err);
        }
        
        super.updateValue();
    }
    
    updateSidebar(){
        var valueList =  super.updateSidebar(); 
        
        this.createButton(valueList,this,"Edit Code",(e) => {
            //Remove everything in the popup now
            const popup = document.getElementById('projects-popup');
            while (popup.firstChild) {
                popup.removeChild(popup.firstChild);
            }
            
            popup.classList.remove('off');
            popup.setAttribute("style", "text-align: center");

            
             //Add a title
            
            var codeMirror = CodeMirror(popup, {
                value: this.code,
                mode:  "javascript",
                lineNumbers: true,
                gutter: true,
                lineWrapping: true
            });
            
            var form = document.createElement("form");
            popup.appendChild(form);
            var button = document.createElement("button");
            button.setAttribute("type", "button");
            button.appendChild(document.createTextNode("Save Code"));
            button.addEventListener("click", (e) => {
                this.code = codeMirror.getDoc().getValue('\n');
                this.updateValue();
                popup.classList.add('off');
            });
            form.appendChild(button);
        });
    }
    
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values);
        
        valuesObj.code = this.code;
        
        return valuesObj;
        
    }
}