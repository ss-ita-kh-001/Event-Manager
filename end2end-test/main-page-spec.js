var baseUrl = 'http://localhost:5000/';
describe('main page', function() {
    beforeEach(function() {
        browser.get("/");
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Event Manager');
    });
    it('events list should be displayed', function(){
        var eventList = element.all(by.repeater('eventItem in latestEvents'));
        expect(eventList.isDisplayed()).toBeTruthy();
    });
    it("should change URL on events link click in navigation menu", function() {
        var redirectEvents = element(by.linkText('Events'));
        redirectEvents.click();
        expect(browser.getCurrentUrl()).toEqual(baseUrl +"events");
    });
    it("should change URL on register link click", function() {
        var redirectRegister = element(by.linkText('Register'));
        redirectRegister.click();
        expect(browser.getCurrentUrl()).toEqual(baseUrl + "register");
    });
    it("should change URL on login link click", function() {
        var redirectLogin = element(by.linkText('Login'));
        redirectLogin.click();
        expect(browser.getCurrentUrl()).toEqual(baseUrl + "login");
    });
    it("show  upcoming events on main page", function() {
        var upcomingEvents = element.all(by.repeater('eventItem in nextEvents'));
        expect(upcomingEvents.isDisplayed()).toBeTruthy();
    });
    it("are upcoming events on main page clickable", function() {
        var upcomingEvents = element.all(by.repeater('eventItem in nextEvents'));
        var EC = protractor.ExpectedConditions;
        expect(EC.elementToBeClickable($(upcomingEvents)), 5000).toBeTruthy();
    });
    it("are upcoming events on main page clickable", function() {
        var leatestEvents = element.all(by.repeater('eventItem in latestEvents'));
        var EC = protractor.ExpectedConditions;
        expect(EC.elementToBeClickable($(leatestEvents)), 5000).toBeTruthy();
    });

});
