(function() {
    angular.module("em.events").value("em.events.mock-event-list", [{
      title: "Chess tournament",
      date: "15.09.2016",
      descr: "Inputs and selects have so multiple controls can reside on the same line. Depending on your layout, additional custom",
      id : "1",
      type: "chees",
      imgURL : "badminton.jpg",
      isSubscribe : false

  }, {
      title: "Tennis tournament",
      date: "16.09.2016",
      descr: "Inputs and selects have so multiple controls can reside on the same line. Depending on your layout, additional custom",
      id : "2",
      type: "tennis",
      imgURL : "ocean.jpg",
      isSubscribe : false
  }, {
      title: "Film viewing",
      date: "17.09.2016",
      descr: "Inputs and selects have so multiple controls can reside on the same line. Depending on your layout, additional custom",
      id : "3",
      type: "film",
      imgURL : "picnic.jpg",
      isSubscribe : false

  }, 

]);
})();
