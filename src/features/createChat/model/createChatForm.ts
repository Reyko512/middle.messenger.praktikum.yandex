import type { FormFieldConfig } from '@shared/lib/form/formController';
import type { FormValidator } from '@shared/lib/form/formValidator';
import { required } from '@shared/lib/form/validationRules';

type CreateChatFieldName = 'title';

export type CreateChatFormValues = Record<CreateChatFieldName, string>;

export const createChatFields = [
  {
    label: 'New chat title',
    id: 'create-chat-title',
    name: 'title',
    type: 'text',
    autocomplete: 'off',
    className: 'chat-utils__managed-input',
    value: '',
  },
] as const satisfies readonly FormFieldConfig<CreateChatFieldName>[];

export const setCreateChatValidationRules = (
  validator: FormValidator<CreateChatFormValues>,
) => {
  validator.addRule('title', required('Chat title is required'));
};
