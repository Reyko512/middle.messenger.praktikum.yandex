import Component, { type ComponentProps } from '@shared/lib/components/Component';
import SendMessageTemp from './SendMessageForm.hbs';
import type { TemplateDelegate } from 'handlebars';
import { FileInput } from '@shared/ui/FileInput';
import { MessageInput } from '@shared/ui/MessageInput';
import { ButtonSend } from '@shared/ui/ButtonSend';

export interface SendMessageSubmitPayload {
  file: File | null;
  message: string;
}

interface SendMessageFormProps extends ComponentProps {
  FileInput: FileInput;
  MessageInput: MessageInput;
  ButtonSend: ButtonSend;
  error: string;
  onSubmit: (payload: SendMessageSubmitPayload) => Promise<void> | void;
}

export default class SendMessageForm extends Component<SendMessageFormProps> {
  private attachedFile: File | null = null;
  private isSubmitting = false;
  private message = '';

  constructor(props: Pick<SendMessageFormProps, 'error' | 'onSubmit'>) {
    super('form', {
      attrs: {
        class: 'send-message-form',
        action: '#',
      },
      events: {
        submit: (event: Event) => {
          event.preventDefault();
          void this.submit();
        },
      },
      onSubmit: props.onSubmit,
      error: props.error,
      FileInput: new FileInput({
        name: 'attach-file',
        id: 'attach-file',
        accept: '*/*',
        selectedFileName: '',
        title: 'Attach file',
        events: {
          change: (event: Event) => {
            const element = event.target as HTMLInputElement;
            const nextFile = element.files?.[0] ?? null;
            this.attachedFile = nextFile;

            const fileInput = this.children['FileInput'] as FileInput;
            fileInput.setProps({
              selectedFileName: nextFile?.name ?? '',
            });
          },
        },
      }),
      MessageInput: new MessageInput({
        placeholder: 'Write a message...',
        value: '',
        events: {
          input: (event: Event) => {
            const element = event.target as HTMLTextAreaElement;
            this.message = element.value;
            const inputComponent = this.children['MessageInput'] as MessageInput;
            inputComponent.setProps({
              value: element.value,
            });
          },
          keydown: (event: KeyboardEvent) => {
            if (event.key !== 'Enter' || event.shiftKey) {
              return;
            }

            event.preventDefault();
            void this.submit();
          },
        },
      }),
      ButtonSend: new ButtonSend({}),
    });
  }

  private clearForm() {
    this.message = '';
    this.attachedFile = null;

    const input = this.children['MessageInput'] as MessageInput;
    input.setProps({
      value: '',
    });

    const fileInput = this.children['FileInput'] as FileInput;
    fileInput.clearSelection();
  }

  private async submit() {
    if (this.isSubmitting) {
      return;
    }

    const hasMessage = this.message.trim().length > 0;
    if (!hasMessage && !this.attachedFile) {
      this.setProps({
        error: 'Add a message or file',
      });
      return;
    }

    this.isSubmitting = true;

    try {
      await this.props.onSubmit({
        file: this.attachedFile,
        message: hasMessage ? this.message : '',
      });

      this.clearForm();

      this.setProps({
        error: '',
      });
    } catch {
      return;
    } finally {
      this.isSubmitting = false;
    }
  }

  public override render(): TemplateDelegate {
    return SendMessageTemp;
  }
}
