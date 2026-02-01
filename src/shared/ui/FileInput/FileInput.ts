import Component from '@shared/lib/components/Component';
import FileInputTemp from './FileInput.hbs';
import type { TemplateDelegate } from 'handlebars';

interface FileInputProps {
  id: string | number;
  name: string | number;
  value?: string;
}

export default class FileInput extends Component {
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
