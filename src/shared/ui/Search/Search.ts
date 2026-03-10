import Component, {
  type ComponentEvents,
  type ComponentProps,
} from '@shared/lib/components/Component';
import SearchTmp from './Search.hbs';
import type { TemplateDelegate } from 'handlebars';

interface SearchProps extends ComponentProps {
  placeholder?: string;
  value?: string;
  events?: ComponentEvents;
}

class Search extends Component<SearchProps> {
  constructor(props: SearchProps = {}) {
    super('div', {
      ...props,
      attrs: {
        role: 'search',
        class: 'search',
      },
      placeholder: props.placeholder ?? 'Search',
      value: props.value ?? '',
      events: props.events ?? {},
    });
  }

  public override render(): TemplateDelegate {
    return SearchTmp;
  }
}

export default Search;
