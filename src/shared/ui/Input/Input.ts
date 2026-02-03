import Component from '@shared/lib/components/Component';
import InputTemp from './Input.hbs';
import type { TemplateDelegate } from 'handlebars';

interface InputProps extends Record<string, unknown> {
  id?: string | number;
  type: string;
  value: string;
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
    if (_oldProps.value !== _newProps.value) {
      const input = this.element?.querySelector(
        'input',
      ) as HTMLInputElement | null;

      if (input && input.value !== _newProps.value) {
        input.value = _newProps.value;
      }

      this.element!.classList.toggle('_filled', Boolean(_newProps.value));

      return false;
    }

    if (_oldProps.error !== _newProps.error) {
      this.element!.classList.toggle('_error', Boolean(_newProps.error));
      return true;
    }

    return false;
  }

  public override render(): TemplateDelegate {
    return InputTemp;
  }
}
