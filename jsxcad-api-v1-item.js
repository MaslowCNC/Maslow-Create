import { taggedItem, assemble, visit, rewrite, update, getItems, getLeafs } from './jsxcad-geometry.js';
import Shape from './jsxcad-api-v1-shape.js';
import { emit } from './jsxcad-sys.js';

// Constructs an item from the designator.
const Item = (id = '', ...shapes) =>
  Shape.fromGeometry(
    taggedItem(
      { tags: [`item/${id}`] },
      assemble(...shapes.map((shape) => shape.toGeometry()))
    )
  );

// Turns the current shape into an item.
const itemMethod = function (id) {
  return Item(id, this);
};

Shape.prototype.item = itemMethod;

const bom = (shape) => {
  const bom = [];
  visit(shape.toKeptGeometry(), (geometry, descend) => {
    if (geometry.type === 'item' && geometry.tags) {
      bom.push(
        geometry.tags
          .filter((tag) => tag.startsWith('item/'))
          .map((tag) => tag.substring(5))
      );
    }
    descend();
  });
  return bom;
};

const bomMethod = function () {
  return bom(this);
};
Shape.prototype.bom = bomMethod;

const bomViewMethod = function () {
  const counts = new Map();
  for (const ids of this.bom()) {
    for (const id of ids) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }
  const md = [];
  md.push(``);
  md.push(`| Item | Count |`);
  md.push(`| ---- | ----- |`);
  for (const [id, count] of counts) {
    md.push(`| ${id} | ${count} |`);
  }
  md.push(``);

  emit({ md: md.join('\n') });
  return this;
};
Shape.prototype.bomView = bomViewMethod;

const inItems = (shape, op = (_) => _) => {
  const rewritten = rewrite(shape.toKeptGeometry(), (geometry, descend) => {
    if (geometry.item) {
      // Operate on the interior of the items.
      const item = op(Shape.fromGeometry(geometry.item));
      // Reassemble as an item equivalent to the original.
      return update(geometry, { item: item.toGeometry() });
    } else {
      return descend();
    }
  });
  return Shape.fromGeometry(rewritten);
};

const inItemsMethod = function (...args) {
  return inItems(this, ...args);
};
Shape.prototype.inItems = inItemsMethod;

inItems.signature = 'inItems(shape:Shape, op:function) -> Shapes';
inItemsMethod.signature = 'Shape -> inItems(op:function) -> Shapes';

const items = (shape, op = (_) => _) => {
  const items = [];
  for (const item of getItems(shape.toKeptGeometry())) {
    items.push(op(Shape.fromGeometry(item)));
  }
  return items;
};

const itemsMethod = function (...args) {
  return items(this, ...args);
};
Shape.prototype.items = itemsMethod;

items.signature = 'items(shape:Shape, op:function) -> Shapes';
itemsMethod.signature = 'Shape -> items(op:function) -> Shapes';

const leafs = (shape, op = (_) => _) => {
  const leafs = [];
  for (const leaf of getLeafs(shape.toKeptGeometry())) {
    leafs.push(op(Shape.fromGeometry(leaf)));
  }
  return leafs;
};

const leafsMethod = function (...args) {
  return leafs(this, ...args);
};
Shape.prototype.leafs = leafsMethod;

const api = {
  Item,
  bom,
  inItems,
  items,
  leafs,
};

export default api;
export { Item, bom, inItems, items, leafs };
