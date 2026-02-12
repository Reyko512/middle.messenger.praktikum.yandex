import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import { Router } from '@shared/lib/router/router';
interface ILinkProps extends Record<string, unknown> {
  href: string;
  text: string;
  className?: string;
}

class Link extends Component<ILinkProps> {
  constructor(props: ILinkProps) {
    const router = new Router('#app');
    super('a', {
      ...props,
      attrs: {
        href: props.href ?? '#',
        class: props.className ? `link ${props.className}` : 'link',
      },

      events: {
        click: (e: MouseEvent) => {
          e.preventDefault();
          router.go(props.href);
        },
      },
    });
  }

  render() {
    const { text } = this.props;
    return _template(text);
  }
}

export default Link;
