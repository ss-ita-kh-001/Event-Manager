describe('events page', function() {
    beforeEach(function() {
        browser.get("/events");
    });

    it("show events list", function() {
        var events = element.all(by.repeater('eventItem in events'));
        expect(events.isDisplayed()).toBeTruthy();
    });

    // it("should redirect to particular event page on click on eventItem in event list", function() {
    //     element.all(by.repeater('eventItem in events')).each(function(element, index) {
    //         element[index].click()
    //     });
    //     var redirectElemPage = element[index].value.toString();
    //
    //     browser.setLocation(redirectElemPage);
    //
    //     expect(browser.getCurrentUrl()).toEqual("https://ita-event-manager.herokuapp.com/events/" + redirectElemPage);
    // });

});
