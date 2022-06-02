import { read } from './jsxcad-sys.js';

/*
 * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
var encode = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};

const encodeNotebook = async (notebook, { workspace, module }) => {
  const encoded = [];
  const seen = new Set();
  for (const note of notebook) {
    if (module && note.sourceLocation && note.sourceLocation.path !== module) {
      // Skip notes for other modules.
      continue;
    }
    if (seen.has(note.hash)) {
      // Deduplicate the notes.
      continue;
    }
    seen.add(note.hash);
    if (note.view) {
      // Make sure we have the view data loaded.
      const { path, data } = note;
      if (path && !data) {
        note.data = await read(path, { workspace });
      }
    }
    if (note.download) {
      const encodedEntries = [];
      for (const entry of note.download.entries) {
        let data = await entry.data;
        if (entry.path && !data) {
          data = await read(entry.path, { workspace });
        }
        if (data) {
          const encodedEntry = {
            ...entry,
            base64Data: encode(data.buffer),
          };
          delete encodedEntry.data;
          encodedEntries.push(encodedEntry);
        }
      }
      encoded.push({ download: { entries: encodedEntries } });
    } else {
      encoded.push(note);
    }
  }
  return encoded;
};

const toHtml = async (
  notebook,
  {
    view,
    title = 'JSxCAD Viewer',
    modulePath = 'https://gitcdn.link/cdn/jsxcad/JSxCAD/master/es6',
    module,
  } = {}
) => {
  const encodedNotebook = await encodeNotebook(notebook, { module });
  const html = `
<html>
 <head>
  <title>${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
  <style>
    div.book {
      height: 100%;
      overflow: scroll;
      margin-left: 20px;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      justify-content: flex-start;
    }

    div.note.card {
      border: 1px dashed crimson;
      margin: 4px 4px;
      padding: 4px 4px;
      display: inline-block;
      width: fit-content;
      height: fit-content;
    }

    .note.log {
      font-family: "Arial Black", Gadget, sans-serif;
      color: red
    }

    .note.view {
      border: 1px dashed dodgerblue;
      margin: 4px 4px;
      padding: 4px 4px;
    }

    .note.orbitView {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
    }

    button.note.download {
      border: 2px solid black;
      border-radius: 5px;
      background-color: white;
      margin: 4px 4px;
      padding: 10px 24px;
      font-size: 16px;
      cursor: pointer;
      border-color: #2196F3;
      color: dodgerblue
    }

    button.note.download:hover {
      background: #2196F3;
      color: white;
    }

    .note th,td {
      border: 1px solid dodgerblue;
      padding: 5px;
    }
  </style>
 </head>
 <body>
  <script type='module'>
    import { Shape } from '${modulePath}/jsxcad-api-shape.js';
    import { dataUrl } from '${modulePath}/jsxcad-ui-threejs.js';
    import { toDomElement } from '${modulePath}/jsxcad-ui-notebook.js';

    const notebook = ${JSON.stringify(encodedNotebook, null, 2)};

    const prepareViews = async (notebook) => {
      // Prepare the view urls in the browser.
      for (const note of notebook) {
        if (note.view && !note.url) {
          note.url = await dataUrl(Shape.fromGeometry(note.data), note.view);
        }
      }
      return notebook;
    }

    const run = async () => {
      const body = document.getElementsByTagName('body')[0];
      const bookElement = document.createElement('div');
      const notebookElement = await toDomElement(await prepareViews(notebook));
      bookElement.appendChild(notebookElement);
      body.appendChild(bookElement);
      bookElement.classList.add('book', 'notebook', 'loaded');
    };

    if (document.readyState === 'complete') {
      run();
    } else {
      document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
          run();
        }
      };
    }
  </script>
 </body>
</html>
`;
  return { html: new TextEncoder('utf8').encode(html), encodedNotebook };
};

export { toHtml };
