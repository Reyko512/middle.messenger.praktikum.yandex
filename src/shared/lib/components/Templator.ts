import { compile } from 'handlebars';

export default function templator(template: string) {
  return compile(template);
}
