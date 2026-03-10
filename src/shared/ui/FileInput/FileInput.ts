import Component, {
  type ComponentEvents,
  type ComponentProps,
} from '@shared/lib/components/Component';
import FileInputTemp from './FileInput.hbs';
import type { TemplateDelegate } from 'handlebars';

interface FileInputProps extends ComponentProps {
  id: string | number;
  name: string | number;
  accept?: string;
  selectedFileName?: string;
  title?: string;
  value?: string;
  events?: ComponentEvents;
}

export default class FileInput extends Component<FileInputProps> {
  constructor(props: FileInputProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'file-input',
      },
      events: props.events ?? {},
    });
  }

  public clearSelection() {
    const input = this.element?.querySelector('input[type="file"]');

    if (input instanceof HTMLInputElement) {
      input.value = '';
    }

    this.setProps({
      selectedFileName: '',
    });
  }

  public override render(): TemplateDelegate {
    return FileInputTemp;
  }
}
