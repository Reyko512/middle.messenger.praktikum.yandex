import Component, {
  type ComponentEvents,
  type ComponentProps,
} from '@shared/lib/components/Component';
import InputTemp from './Input.hbs';
import type { TemplateDelegate } from 'handlebars';

export interface InputProps extends ComponentProps {
  id?: string | number;
  type: string;
  value: string;
  name: string;
  label: string;
  error?: string;
  autocomplete?: string;
  className?: string;
  events?: ComponentEvents;
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
    oldProps: InputProps,
    newProps: InputProps,
  ): boolean {
    if (oldProps.value !== newProps.value) {
      const input = this.element?.querySelector('input');

      if (input instanceof HTMLInputElement && input.value !== newProps.value) {
        input.value = newProps.value;
      }

      this.element?.classList.toggle('_filled', Boolean(newProps.value));

      return false;
    }

    if (oldProps.error !== newProps.error) {
      this.element?.classList.toggle('_error', Boolean(newProps.error));
      return true;
    }

    return false;
  }

  public override render(): TemplateDelegate {
    return InputTemp;
  }
}
