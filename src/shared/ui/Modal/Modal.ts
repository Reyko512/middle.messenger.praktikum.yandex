import Component from '@shared/lib/components/Component';

import ModalTemp from './Modal.hbs';

import type { TemplateDelegate } from 'handlebars';

interface ModalProps extends Record<string, unknown> {
  Content: Component;
}

export default class Modal extends Component<ModalProps> {
  constructor(props: ModalProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'modal-background',
      },
    });
  }

  public override render(): TemplateDelegate {
    return ModalTemp;
  }
}
