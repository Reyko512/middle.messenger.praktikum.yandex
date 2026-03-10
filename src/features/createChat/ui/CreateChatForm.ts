import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import { FormController } from '@shared/lib/form/formController';
import type { Input } from '@shared/ui/Input';
import CreateChatFormTemplate from './CreateChatForm.hbs';
import {
  createChatFields,
  setCreateChatValidationRules,
  type CreateChatFormValues,
} from '../model/createChatForm';

interface CreateChatFormProps extends ComponentProps {
  inputs: Input[];
  error: string;
  onSubmit: (values: CreateChatFormValues) => Promise<void> | void;
}

export default class CreateChatForm extends Component<CreateChatFormProps> {
  private readonly controller: FormController<typeof createChatFields>;

  constructor(props: Pick<CreateChatFormProps, 'error' | 'onSubmit'>) {
    const controller = new FormController(createChatFields);
    controller.addRules(setCreateChatValidationRules);

    super('form', {
      attrs: {
        class: 'chat-utils__create',
        action: '#',
      },
      events: {
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
      await this.controller.submit((values) => this.props.onSubmit(values));
      this.controller.clear();
      this.setProps({
        error: '',
      });
    } catch {
      return;
    }
  }

  public override render(): TemplateDelegate {
    return CreateChatFormTemplate;
  }
}
