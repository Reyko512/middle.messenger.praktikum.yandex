import Component, { type ComponentProps } from '@shared/lib/components/Component';

import ModalTemp from './Modal.hbs';

import type { TemplateDelegate } from 'handlebars';
import { Router } from '@shared/lib/router/router';

interface ModalProps extends ComponentProps {
  Content: Component<ComponentProps>;
}

export default class Modal extends Component<ModalProps> {
  constructor(props: ModalProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'modal-background',
      },
      events: {
        click: (e: Event) => {
          if (e.target === e.currentTarget) {
            Router.__instance.back();
          }
        },
      },
    });
  }

  public override render(): TemplateDelegate {
    return ModalTemp;
  }
}
