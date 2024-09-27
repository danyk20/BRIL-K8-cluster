import { ConfiguratorClientPage } from './app.po';

describe('configurator-client App', function() {
  let page: ConfiguratorClientPage;

  beforeEach(() => {
    page = new ConfiguratorClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
