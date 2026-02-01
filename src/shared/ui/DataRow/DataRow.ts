import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import DataRowTemp from './DataRow.hbs';

interface DataRowProps extends Record<string, unknown> {
  name: string;
  value: string;
}

export default class DataRow extends Component<DataRowProps> {
  constructor(props: DataRowProps) {
    super('li', {
      ...props,
      attrs: {
        class: 'data-row',
      },
    });
  }

  public override render(): TemplateDelegate {
    return DataRowTemp;
  }
}
