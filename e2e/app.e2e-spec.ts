import { NouvelairPage } from './app.po';

describe('nouvelair App', () => {
  let page: NouvelairPage;

  beforeEach(() => {
    page = new NouvelairPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
