import Component from '@shared/lib/components/Component';
import SearchTmp from './Search.hbs';
import type { TemplateDelegate } from 'handlebars';

class Search extends Component {
  constructor() {
    super('div', {
      attrs: {
        role: 'search',
        class: 'search',
      },
      placeholder: 'Search',
    });
  }

  public override render(): TemplateDelegate {
    return SearchTmp;
  }
}

export default Search;
