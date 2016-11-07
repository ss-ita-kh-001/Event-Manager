describe('results page', function() {
    beforeEach(function() {
        browser.get("/results"); 
    });

    it('players list should be displayed in table', function(){
        var playersList = element.all(by.repeater('player in playersList'));
        expect(playersList.isDisplayed()).toBeTruthy();
    });
});
