import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'

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
        
        const rawPath = GlobalVariables.gitHub.getAFileRawPath(this.fileName)
        
        try{
            const values = { op: "fromSVG", svgPath:rawPath, writePath: this.path }
            
            this.basicThreadValueProcessing(values)
        }catch(err){this.setAlert(err)}
        
        
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
                
                const toSend = {}
                
                //Delete the previous file if this one is a new one
                if(this.fileName != x.files[0].name){
                    //Make sure the file to delete actually exists before deleting it
                    let rawPath = GlobalVariables.gitHub.getAFileRawPath(this.fileName)
                    var http = new XMLHttpRequest()
                    http.open('HEAD', rawPath, false)
                    http.send()
                    if ( http.status!=404){
                        toSend[this.fileName] = null
                    }
                }
                
                this.fileName = x.files[0].name
                this.name = this.fileName
                
                const reader = new FileReader()
                reader.addEventListener('load', (event) => {
                    
                    
                    toSend[this.fileName] = event.target.result
                    
                    GlobalVariables.gitHub.uploadAFile(toSend).then(() => {
                        this.updateValue()
                        //Save the project to keep it in sync with the files uploaded to github
                        setTimeout(() => {GlobalVariables.gitHub.saveProject()}, 10000)
                    })
                })
                reader.readAsText(file)
            }
        }
    }
    
    /**
     * Add the file name to the object which is saved for this molecule
     */
    serialize(){
        var superSerialObject = super.serialize()
        
        //Write the current equation to the serialized object
        superSerialObject.fileName = this.fileName
        superSerialObject.name = this.name
        
        return superSerialObject
    }
}