import { compile } from 'handlebars';

export default function _template(temp: unknown) {
  return compile(temp);
}
