import { askService, setupFilesystem } from './jsxcad-sys.js';
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

window.ask = async (question, context) =>
    askService(serviceSpec, question, context);


//Add 3d view //With axis does not work right now. Needs to be changed in jsxcad-ui-threejs
orbitDisplay({view: {fit: false}, withAxes: true, withGrid: true}, document.getElementById('viewerContext')).then(result=>{
    window.updateDisplay = result.updateGeometry
});

setupFilesystem({ fileBase: 'maslow' });

//Test some things
window.ask({key: "rectangle", x:5, y:5, writePath: "atomGeometry/test" }) //This just establishes the worker


// .then( status => {
    // window.ask({ evaluate: "md`hello`", key: "extrude", distance:5, readPath: "atomGeometry/test", writePath: "atomGeometry/test2" }).then( status => {
        // var thingReturned = window.ask({ evaluate: "md`hello`", key: "display", readPath: "atomGeometry/test2" }).then( thingReturned => {
            // window.updateDisplay(thingReturned);
        // })
    // })
// })
