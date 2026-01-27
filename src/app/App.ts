import Component from '@shared/lib/components/Component';
import { Chats } from '@pages/Chats';
class App extends Component {
  constructor() {
    super({
      tagName: '',
      template: ``,
      children: {},
    });
  }

  protected override render(context: { [x: string]: unknown }): string {
    return super.render(context);
  }

  private currentPage: Component | null = Chats;

  public showPage(pageComponent: Component) {
    if(this.currentPage){
        this.currentPage.
    }
    this.children['page'] = pageComponent;
    this.render(this.props);
  }
}

export default new App();
