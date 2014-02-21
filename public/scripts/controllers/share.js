angular.module('ammoApp')
  /*
  ========== ShareController ==========
  This controller is subordinate to FrameController. This is set as the controller when the url is anything 
  variables:

  methods:
    
  */
  .controller('ShareController', function($scope, $location, $routeParams, SearchService, QueueService) {
    //When the share ids match, then update view
    $scope.socket.on('updateView', function (data) {
      if (data.shareId === QueueService.queue.shareId) {
        $scope.refresh();
      }
    });
    $scope.refresh = function() {
      QueueService.getQueue($routeParams.id)
        .then(function(queue){ //Sets the scopes songs to the current q from qservice
          $scope.songs = queue.songs;
        });
    };
    
    $scope.clone = function() {
      console.log('inside clone');
        var shareLink = 'http://localhost/' + QueueService.queue.shareId;
        $('.twitter-share-button').attr({
          'data-url': shareLink,
          'data-text': "Hey, checkout this playlist I made!\n"
        }); //dynamically set the url

        //have to reset queue, or else server error
        var oldQueue = QueueService.queue;
        QueueService.queue = {
          currentSong: oldQueue.currentSong,
          listenId: null,
          shareId: null,
          songs: oldQueue.songs
        };
        $('#shareRequestModal').modal();
    };

    $scope.refresh();
  });