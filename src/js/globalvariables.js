import Circle from './molecules/circle.js'
import Rectangle from './molecules/rectangle.js'
import ShrinkWrap from './molecules/shrinkwrap.js'
import Translate from './molecules/translate.js'
import RegularPolygon from './molecules/regularpolygon.js'
import Extrude from './molecules/extrude.js'
import Scale from './molecules/scale.js'
import Union from './molecules/union.js'
import Intersection from './molecules/intersection.js'
import Difference from './molecules/difference.js'
import Constant from './molecules/constant.js'
import Equation from './molecules/equation.js'
import Molecule from './molecules/molecule.js'
import Input from './molecules/input.js'
import Readme from './molecules/readme.js'
import BillOfMaterials from './molecules/BOM.js'
import Rotate from './molecules/rotate.js'
import Mirror from './molecules/mirror.js'
import GitHubMolecule from './molecules/githubmolecule.js'
import Output from './molecules/output.js'

import GitHubModule from './githubOauth'

class GlobalVariables{
    constructor(){
        this.canvas = null
        this.c = null
        
        this.availableTypes = {
            circle:             {creator: Circle, atomType: "Circle"},
            rectangle:          {creator: Rectangle, atomType: "Rectangle"},
            shirinkwrap:        {creator: ShrinkWrap, atomType: "ShrinkWrap"},
            translate:          {creator: Translate, atomType: "Translate"},
            regularPolygon:     {creator: RegularPolygon, atomType: "RegularPolygon"},
            extrude:            {creator: Extrude, atomType: "Extrude"},
            scale:              {creator: Scale, atomType: "Scale"},
            intersection:       {creator: Intersection, atomType: "Intersection"},
            difference:         {creator: Difference, atomType: "Difference"},
            costant:            {creator: Constant, atomType: "Constant"},
            equation:           {creator: Equation, atomType: "Equation"},
            molecule:           {creator: Molecule, atomType: "Molecule"},
            input:              {creator: Input, atomType: "Input"},
            readme:             {creator: Readme, atomType: "Readme"},
            billOfMaterials:    {creator: BillOfMaterials, atomType: "Bill Of Materials"},
            rotate:             {creator: Rotate, atomType: "Rotate"},
            mirror:             {creator: Mirror, atomType: "Mirror"},
            githubmolecule:     {creator: GitHubMolecule, atomType: "GitHubMolecule"},
            union:              {creator: Union, atomType: "Union"}
        }

        this.secretTypes = {
            output:        {creator: Output, atomType: "Output"}
        }


        this.currentMolecule;
        this.topLevelMolecule;
        
        this.runMode = false;
        
        this.sideBar = document.querySelector('.sideBar');
        
        this.gitHub = new GitHubModule();
    }
    
    generateUniqueID(){
        return Math.floor(Math.random()*900000) + 100000;
    }

    distBetweenPoints(x1, x2, y1, y2){
        var a2 = Math.pow(x1 - x2, 2);
        var b2 = Math.pow(y1 - y2, 2);
        var dist = Math.sqrt(a2 + b2);
        
        return dist;
    }
}

export default (new GlobalVariables);