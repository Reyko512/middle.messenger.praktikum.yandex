import Component from '@shared/lib/components/Component';
import InputTemp from './Input.hbs';
import type { TemplateDelegate } from 'handlebars';

interface InputProps extends Record<string, unknown> {
  id: string | number;
  type: string;
  value: '';
  name: string;
  error?: string;
  autocomplete?: string;
  className?: string;
  events?: Record<string, EventListener>;
}

export default class Input extends Component<InputProps> {
  constructor(props: InputProps) {
    super('div', {
      ...props,
      attrs: {
        class: props.className ? `input ${props.className}` : 'input',
      },
      events: props.events ?? {},
    });
  }

  public override componentDidUpdate(
    _oldProps: InputProps,
    _newProps: InputProps,
  ): boolean {
    if (_oldProps.value === _newProps.value) {
      this.props.className = _newProps.value.length ? '_filled' : '';
    }

    return true;
  }

  public override render(): TemplateDelegate {
    return InputTemp;
  }
}
