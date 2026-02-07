import Handlebars from 'handlebars/runtime';
import type Button from '@shared/ui/Button/Button.hbs';

export default function registerComponents(...components: Record<string, typeof Button>[]) {
  for (const componentsObj of components) {
    for (const [name, Component] of Object.entries(componentsObj)) {
      Handlebars.registerPartial(name, Component);
    }
  }
}
