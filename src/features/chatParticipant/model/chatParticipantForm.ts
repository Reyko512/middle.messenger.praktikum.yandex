import type { FormFieldConfig } from '@shared/lib/form/formController';
import type { FormValidator } from '@shared/lib/form/formValidator';
import { login, required } from '@shared/lib/form/validationRules';

type ChatParticipantFieldName = 'login';

export type ChatParticipantAction = 'add' | 'remove';
export type ChatParticipantFormValues = Record<ChatParticipantFieldName, string>;

export interface ChatParticipantSubmitPayload extends ChatParticipantFormValues {
  action: ChatParticipantAction;
}

export const chatParticipantFields = [
  {
    label: 'User login',
    id: 'chat-participant-login',
    name: 'login',
    type: 'text',
    autocomplete: 'username',
    className: 'chat-settings__managed-input',
    value: '',
  },
] as const satisfies readonly FormFieldConfig<ChatParticipantFieldName>[];

export const setChatParticipantValidationRules = (
  validator: FormValidator<ChatParticipantFormValues>,
) => {
  validator.addRule('login', required(), login);
};
