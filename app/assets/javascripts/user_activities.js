
window.scrooge.controller('UserActivitiesCtrl', ['$scope', '$rootScope', 'ActivityService', function($scope, $rootScope, ActivityService){
    $scope.days = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    $scope.month = moment().month() + 1;
    $scope.year = moment().year(); 
    
    $scope.getDay = function(date){
        return $scope.days[moment(date).day()];
    }
    
    $scope.filter = function(){
        loadActivities();
    }

    $scope.edit = function(id){
         $rootScope.$broadcast('activity:edit', id);
    }   

    $scope.delete = function(id){
        if (window.confirm('Sicuro?')){
            ActivityService.delete(id, function(){
                $scope.activities = _.reject($scope.activities, function(a){ return a.id == id; })
                $rootScope.$broadcast('activity:updated', -1);
            });
        }
    }

    if ($scope.month !== undefined && $scope.year !== undefined && $scope.user !== undefined){
        ActivityService.getActivities($scope.month, $scope.year, $scope.user, function(result){
            $scope.activities = result;
        });
    }

    function loadActivities(){
        ActivityService.getUserActivities($scope.month, $scope.year, $scope.user, function(result){
            $scope.activities = result;
        });
    }

    $rootScope.$on('activity:updated', function(event, id) {
        loadActivities();
    });

    setTimeout(function(){loadActivities();}, 0);
}]);

window.scrooge.controller('UserActivityCtrl', ['$scope', '$rootScope', 'ActivityService', function($scope, $rootScope, ActivityService){
        
    ActivityService.getJobOrders(function(result){
        $scope.jobOrders = result;
    });

    $scope.$watch('activity.job_order_id', function(jobOrderId){
        if (jobOrderId !== undefined){
            ActivityService.getJobOrderActivities(jobOrderId, function(result){
                $scope.jobOrderActivities = result;
            });    
        }
    });


    $rootScope.$on('activity:edit', function(event, id) {
        ActivityService.getUserActivity(id, function(activity){
            // HACK: to resolve date issue
            activity.date = moment(activity.date, 'YYYY-MM-DD').format('DD-MM-YYYY');
            $scope.activity = activity;
        });
    });

    $rootScope.$on('activity:new', function(event, id) {
        $scope.activity = {date: moment().format('DD-MM-YYYY')};
    });

    $scope.save = function(){
        ActivityService.save($scope.activity, function(result){
            $rootScope.$broadcast('activity:updated', result.id);
        });
    }
}]);

window.scrooge.controller('RightPanelCtrl', ['$scope', '$rootScope', 'ActivityService', function($scope, $rootScope, ActivityService){
    $scope.newActivity = function(){
        $rootScope.$broadcast('activity:new');
    }

    function updateStats(){
        ActivityService.getStats(moment().year(), moment().month(), function(stats){
            $scope.todayHours = stats.today_hours;
            $scope.yestardayHours = stats.yesterday_hours;
        });    
    }

    $rootScope.$on('activity:updated', function(event, id) {
        updateStats();
    });

    updateStats();

}]);


window.scrooge.
  directive('bDatepicker', function(){
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function($scope, element, attrs, controller) {
        var updateModel = function(ev) {
          element.datepicker('hide');
          element.blur();
          return $scope.$apply(function() {
            return controller.$setViewValue(moment(ev.date).format('YYYY-MM-DD'));
          });
        };

        if (controller != null) {
          controller.$render = function() {
            element.datepicker('setValue', controller.$viewValue);
            return controller.$viewValue;
          };
        }
        return attrs.$observe('bDatepicker', function(value) {
          return element.datepicker({format: 'dd-mm-yyyy'}).on('changeDate', updateModel);
        });
      }
    };
  });

// TODO: hack.
var rowStyle = 'nobg';

window.scrooge.directive('rowColor', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            attrs.$observe('rowColor', function(value) {
                var preAct = scope.activities[value - 1];
                var act = scope.activities[value];
                if (preAct != undefined && act.date != preAct.date){
                    act.rowStyle = (preAct.rowStyle == "nobg"? "lightbg":"nobg");
                } else{
                    if (preAct == undefined){
                        act.rowStyle = 'nobg';
                    } else{
                        act.rowStyle = preAct.rowStyle;
                    }
                }

                element.attr('class', act.rowStyle);
            });

        }
    };
})


