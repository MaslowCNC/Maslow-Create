export default class BOMEntry {
    constructor(){
        this.BOMitemName  = "name";
        this.numberNeeded = 0;
        this.costUSD      = 0;
        this.source       = "www.example.com";
        this.totalNeeded  = this.numberNeeded; //Scaled by the number of this instance
    }
}