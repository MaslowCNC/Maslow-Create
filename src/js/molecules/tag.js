import Atom from '../prototypes/atom'

export default class Tag extends Atom{
    
    constructor(values){
        super(values);
        
        this.addIO("input", "geometry", this, "geometry", "");
        this.addIO("input", "tag", this, "string", "cutList");
        this.addIO("output", "geometry", this, "geometry", "");
        
        this.name = "Add Tag";
        this.atomType = "Tag";
        
        this.setValues(values);
    }
    
    updateValue(){
        
        try{
            this.value = this.findIOValue("geometry").as(this.findIOValue("tag"))
        }catch(err){console.log("Unable to add tag")}
        
        super.updateValue();
    }
}