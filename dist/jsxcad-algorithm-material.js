const standardMaterialDefinitions = {
  'material:aluminium': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.8,
      map: 'https://jsxcad.js.org/texture/aluminium.png',
    },
  },
  'material:basic': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
    },
  },
  'material:brass': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.8,
      map: 'https://jsxcad.js.org/texture/brass.png',
    },
  },
  'material:brick': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/brick.png',
    },
  },
  'material:cardboard': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/cardboard.png',
    },
  },
  'material:circuit': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/circuit.png',
    },
  },
  'material:color': {
    threejsMaterial: {
      reflectivity: 0.1,
      emissiveIntensity: 0.25,
    },
  },
  'material:copper': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.8,
      map: 'https://jsxcad.js.org/texture/copper.png',
    },
  },
  'material:ghost': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/rock.png',
    },
  },
  'material:glass': {
    threejsMaterial: {
      opacity: 0.5,
      transparent: true,
      metalness: 0.0,
      depthWrite: false,
    },
  },
  'material:grass': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/grass.png',
    },
  },
  'material:leaves': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/leaves.png',
    },
  },
  'material:metal': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.8,
    },
  },
  'material:paper': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/paper.png',
    },
  },
  'material:plastic': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/plastic.png',
    },
  },
  'material:rock': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/rock.png',
    },
  },
  'material:steel': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.8,
      map: 'https://jsxcad.js.org/texture/sheet-metal.png',
    },
  },
  'material:transparent': {
    threejsMaterial: {
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
    },
  },
  'material:water': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/water.png',
    },
  },
  'material:wood': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.5,
      map: 'https://jsxcad.js.org/texture/wood.png',
    },
  },
  'material:wet-glass': {
    threejsMaterial: {
      opacity: 0.5,
      transparent: true,
      metalness: 0.0,
      clearCoat: 1,
      clearCoatRoughness: 0,
      map: 'https://jsxcad.js.org/texture/wet-glass.png',
      depthWrite: false,
    },
  },
  'material:zinc-steel': {
    threejsMaterial: {
      metalness: 0.0,
      roughness: 0.5,
      reflectivity: 0.8,
      map: 'https://jsxcad.js.org/texture/zinc-steel.png',
    },
  },
};

// FIX: Apply normalizations here.
const toTagFromName = (name) => {
  return `material:${name}`;
};

const toTagsFromName = (name) => [toTagFromName(name)];

const toThreejsMaterialFromTags = (
  tags = [],
  customDefinitions = {},
  otherwise
) => {
  for (const tag of tags) {
    if (tag.startsWith('image:')) {
      const map = tag.substring(6);
      return {
        reflectivity: 0.1,
        emissiveIntensity: 0.25,
        map,
      };
    } else if (tag.startsWith('material:')) {
      for (const definitions of [
        standardMaterialDefinitions,
        customDefinitions,
      ]) {
        const definition = definitions[tag];
        if (definition && definition.threejsMaterial) {
          return definition.threejsMaterial;
        }
      }
    }
  }
  return otherwise;
};

export { toTagsFromName, toThreejsMaterialFromTags };
