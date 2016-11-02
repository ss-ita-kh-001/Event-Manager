describe('main page', function() {
    it('should have a title', function() {
        browser.get('https://ita-event-manager.herokuapp.com/');

        expect(browser.getTitle()).toEqual('Event Manager');
    });
});