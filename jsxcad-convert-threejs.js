import { toDisjointGeometry } from './jsxcad-geometry.js';

const toThreejsGeometry = (geometry, supertags) => {
  return geometry;
};

const toThreejsPage = async (
  geometry,
  { view, title = 'JSxCAD Viewer' } = {}
) => {
  const disjointGeometry = toDisjointGeometry(await geometry);
  const html = `
<html>
 <head>
  <title>${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
 </head>
 <body>
  <script type='module'>
    import { dataUrl } from 'https://gitcdn.xyz/cdn/jsxcad/JSxCAD/master/es6/jsxcad-ui-threejs.js';
    import { Shape } from 'https://gitcdn.xyz/cdn/jsxcad/JSxCAD/master/es6/jsxcad-api-v1-shape.js';

    const geometry = ${JSON.stringify(disjointGeometry)};

    const run = async () => {
      const { width = 1024, height = 1024, position = [0, 0, 100] } = {};
      const body = document.getElementsByTagName('body')[0];
      const url = await dataUrl(Shape.fromGeometry(geometry), {
        width,
        height,
        position,
      });
      const image = document.createElement('img');
      image.src = url;
      body.appendChild(image);
    };

    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        run();
      }
    };
  </script>
 </body>
</html>
`;
  return new TextEncoder('utf8').encode(html);
};

export { toThreejsGeometry, toThreejsPage };
