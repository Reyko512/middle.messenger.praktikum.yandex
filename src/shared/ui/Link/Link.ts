import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
interface ILinkProps extends Record<string, unknown> {
  href: string;
  text: string;
  className?: string;
}
class Link extends Component<ILinkProps> {
  constructor(props: ILinkProps) {
    super('a', {
      ...props,
      attrs: {
        href: props.href ?? '#',
        class: props.className ? `link ${props.className}` : 'link',
      },
    });
  }

  render() {
    const { text } = this.props;
    return _template(text);
  }
}

export default Link;
