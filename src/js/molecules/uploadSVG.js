import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'

/**
 * This class creates an atom which supports uploading a .svg file
 */
export default class UploadSVG extends Atom {
    
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
        this.name = 'UploadSVG'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'UploadSVG'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Upload a .svg file and use it in your design."
        
        /** 
         * The name of the uploaded file
         * @type {string}
         */
        this.fileName = ""
        
        this.addIO('output', 'geometry', this, 'geometry', '')
        
        this.setValues(values)
    }
    
    /**
     * Draw the circle atom & icon.
     */ 
    draw(){

        super.draw() //Super call to draw the rest

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${GlobalVariables.widthToPixels(this.radius)}px Work Sans Bold`
        GlobalVariables.c.fillText('G', GlobalVariables.widthToPixels(this.x- this.radius/3), GlobalVariables.heightToPixels(this.y)+this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()

    }

    /**
     * Upload a new svg file
     */ 
    updateValue(){
        
        console.log("Update Value ran")
        console.log(this.fileName)
        
        GlobalVariables.gitHub.getAFile(this.fileName).then(result => {
            console.log("Read in upload SVG")
            console.log(result)
            
            try{
                var inputPath = this.findIOValue('geometry')
                const values = { key: "fromSVG", svgString:result, writePath: this.path }
                
                this.basicThreadValueProcessing(values)
            }catch(err){this.setAlert(err)}
            
        })
        
        
    }
    
    /**
     * Create a button to download the .stl file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createFileUpload(list, this, "Upload SVG", ()=>{this.uploadSvg()})
    }
    
    /**
     * The function which is called when you press the upload button
     */ 
    uploadSvg(){
        
        var x = document.getElementById("UploadSVG-button")
        if ('files' in x){
            if(x.files.length > 0){
                const file = x.files[0]
                
                //Delete the old file here if this is a re-upload
                
                this.fileName = x.files[0].name
                
                const reader = new FileReader()
                reader.addEventListener('load', (event) => {
                    GlobalVariables.gitHub.uploadAFile(this.fileName, event.target.result).then(result => {
                        console.log("Done in svg.js")
                        this.updateValue()
                    })
                })
                reader.readAsText(file)
            }
        }
        
        //Change the saved name
        
        //Upload the file to github
        
        //Run updateValue to import the file from GitHub
        
    }
    
}