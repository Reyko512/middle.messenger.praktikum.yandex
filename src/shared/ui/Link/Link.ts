import Component from '@shared/lib/components/Component';
import LinkTemp from './Link.hbs';

class Link extends Component<{ href: string; text: string }> {
  override render() {
    return this.compile(LinkTemp, {
      href: this.props.href,
      text: this.props.text,
    });
  }
}

export default Link;
