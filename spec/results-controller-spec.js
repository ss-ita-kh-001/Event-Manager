describe("Result Controller Test", function () {

    var mockScope = {};
    var controller;
    var mockGames = {data:[]};
    var mockPlayers = {data:[]};
    var mockGamesForUser = {data:[]};

    beforeEach(angular.mock.module("em"));

    beforeEach(module(function($provide) {
        $provide.value('mockGames.data', [{id:20,date:"2016-10-15T18:00:00.000Z",
            place:"kharkiv",title:"Crossfit",desc:"Hard"},
            {id:21,date:"2016-10-10T18:00:00.000Z",
                place:"lviv",title:"Skipping",desc:"Jump"},
            {id:23,date:"2016-10-25T18:00:00.000Z",
                place:"lviv",title:"Game",desc:"NewGame"}]);
        $provide.value('mockPlayers.data',[{id:1,full_name:"Robert Baratheon",password:"REBEL",
                          email:"rebel@westeros.we",role:"admin",avatar:null,reset_password_token:null,
                          reset_password_expires:null},
                          {id:2,full_name:"Cersei Lannister",password:"IHAVENICEBROTHER",
                           email:"the_mad_queen@westeros.we",role:"user",avatar:null,reset_password_token:null,
                           reset_password_expires:null},{id:3,full_name:"Ned Stark",password:"WINTERISCOMMING",
                           email:"the_hand_of_king@westeros.we",role:"user",avatar:null,reset_password_token:null,
                           reset_password_expires:null}]);
        $provide.value('mockGamesForUser.data',[{id:20,date:"2016-10-15T18:00:00.000Z",place:"kharkiv",
                          title:"Crossfit",desc:"Hard"},{id:21,date:"2016-10-10T18:00:00.000Z",
                          place:"lviv",title:"Skipping",desc:"Jump"}])
    }));

    beforeEach(angular.mock.inject(function ($controller, $rootScope) {
        mockScope = $rootScope.$new();

        controller = $controller("em.result-table.chessResultController", {
            $scope: mockScope,
            games : mockGames,
            players : mockPlayers,
            gamesForUsers : mockGamesForUser
        });
    }));
    it('Current user exist on controller initialisation', function(){
        expect(mockScope.currentUser).toBeDefined();
    });
    it('Get players array on controller initialization', function(){
        expect(mockScope.allPlayers).toBeDefined();
    });
    it('New game result on controller initialization', function () {
        expect(mockScope.newGameRes).toBeDefined();
    });
    it('Define selected player on controller initialization', function () {
        expect(mockScope.userResults.selectedPlayer).toBeDefined();
    });
    it('Define participants list on controller initialization',function () {
        expect(mockScope.participantsList).toBeDefined();
    });
    it('Define players list on controller initialization',function () {
        expect(mockScope.playersList).toBeDefined();
    });
    it('Define list of games on controller initialization',function () {
        expect(mockScope.gamesList).toBeDefined();
    });
    
});
