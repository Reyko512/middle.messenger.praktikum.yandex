import templator from '@shared/lib/components/Templator';
import Component, { type ComponentProps } from '@shared/lib/components/Component';
import { Router } from '@shared/lib/router/router';
interface ILinkProps extends ComponentProps {
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
    return templator(text);
  }
}

export default Link;
