import Component from '@shared/lib/components/Component';
import FileInputTemp from './FileInput.hbs';
import type { TemplateDelegate } from 'handlebars';

interface FileInputProps extends Record<string, unknown> {
  id: string | number;
  name: string | number;
  value?: string;
}

export default class FileInput extends Component<FileInputProps> {
  constructor(props: FileInputProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'file-input',
      },
    });
  }
  public override render(): TemplateDelegate {
    return FileInputTemp;
  }
}
