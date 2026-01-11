import Handlebars from 'handlebars/runtime';

export default function registerComponents(...components) {
  for (const componentsObj of components) {
    for (const [name, Component] of Object.entries(componentsObj)) {
      Handlebars.registerPartial(name, Component);
    }
  }
}
