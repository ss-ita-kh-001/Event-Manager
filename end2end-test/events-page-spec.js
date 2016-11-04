describe('events page', function() {
    beforeEach(function() {
        browser.get("/events");
    });

    it("show events list", function() {
        var events = element.all(by.repeater('eventItem in events'));
        expect(events.isDisplayed()).toBeTruthy();
    });
});
