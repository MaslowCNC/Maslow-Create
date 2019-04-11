import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Code extends Atom {
    
    constructor(values){
        
        super(values);
        
        this.name = "Code";
        this.atomType = "Code";
        this.code = "//Add an input\nthis.addIO('input', 'geometry', this, 'geometry', 10);\n\n//Read back from the input\nthis.findIOValue('radius');\n\n//Set the output\nthis.codeBlock = sphere(10);";
        
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.setValues(values);
        
        //generate the correct codeblock for this atom on creation
        this.updateCodeBlock();
    }
    
    updateCodeBlock(){
        //This should pull and run the code in the editor
        console.log("updating code block");
        
        const code = new Function('$',
                                  `const { ${Object.keys(GlobalVariables.api).join(', ')} } = $;\n\n` + 
                                  this.code);
        console.log("Code: " + code);
        const result = code(GlobalVariables.api);
        
        console.log("result");
        console.log(result);
        
        super.updateCodeBlock();
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
                this.updateCodeBlock();
                popup.classList.add('off');
            });
            form.appendChild(button);
        });
    }
}