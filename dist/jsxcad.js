import { askService } from './jsxcad-sys.js';
import { buildMeshes, orbitDisplay } from './jsxcad-ui-threejs.js';


//Setup worker
const agent = async ({ ask, question }) => {
  if (question.ask) {
    const { identifier, options } = question.ask;
    return askSys(identifier, options);
  }
};
        
const serviceSpec = {
  webWorker: './maslowWorker.js',
  agent,
  workerType: 'module',
};

const ask = async (question, context) =>
    askService(serviceSpec, question, context);


//Add 3d view
orbitDisplay({}, document.getElementById("threeJSDisplay")).then(result=>{
    window.updateDisplay = result.updateGeometry
});


//Test some things
ask({ evaluate: "md`hello`", key: "rectangle", x:5, y:5, writePath: "atomGeometry/test" }).then( status => {
    ask({ evaluate: "md`hello`", key: "extrude", distance:5, readPath: "atomGeometry/test", writePath: "atomGeometry/test2", }).then( status => {
        var thingReturned = ask({ evaluate: "md`hello`", key: "display", readPath: "atomGeometry/test2" }).then( thingReturned => {
            console.log("Returned: ")
            console.log(thingReturned)
            
            window.updateDisplay(thingReturned);
        })
    })
})
