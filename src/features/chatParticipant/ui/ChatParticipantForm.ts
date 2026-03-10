import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import { FormController } from '@shared/lib/form/formController';
import type { Input } from '@shared/ui/Input';
import ChatParticipantFormTemplate from './ChatParticipantForm.hbs';
import {
  chatParticipantFields,
  setChatParticipantValidationRules,
  type ChatParticipantAction,
  type ChatParticipantSubmitPayload,
} from '../model/chatParticipantForm';

interface ChatParticipantFormProps extends ComponentProps {
  inputs: Input[];
  error: string;
  onSubmit: (payload: ChatParticipantSubmitPayload) => Promise<void> | void;
}

export default class ChatParticipantForm extends Component<ChatParticipantFormProps> {
  private readonly controller: FormController<typeof chatParticipantFields>;
  private action: ChatParticipantAction = 'add';

  constructor(props: Pick<ChatParticipantFormProps, 'error' | 'onSubmit'>) {
    const controller = new FormController(chatParticipantFields);
    controller.addRules(setChatParticipantValidationRules);

    super('form', {
      attrs: {
        class: 'chat-settings__form',
        action: '#',
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          const button = target.closest('[data-action]');

          if (!(button instanceof HTMLButtonElement)) {
            return;
          }

          this.action =
            button.dataset['action'] === 'remove' ? 'remove' : 'add';
        },
        submit: (event: Event) => {
          event.preventDefault();
          void this.submit();
        },
      },
      inputs: controller.inputs,
      error: props.error,
      onSubmit: props.onSubmit,
    });

    this.controller = controller;
  }

  private async submit() {
    try {
      await this.controller.submit((values) =>
        this.props.onSubmit({
          ...values,
          action: this.action,
        }),
      );
      this.controller.clear();
      this.action = 'add';
      this.setProps({
        error: '',
      });
    } catch {
      return;
    }
  }

  public override render(): TemplateDelegate {
    return ChatParticipantFormTemplate;
  }
}
