(function() {
    'use strict';


    angular.module('BlurAdmin.pages.marketing')
        .controller('noticeCtrl', noticeCtrl);

    /** @ngInject */
    function noticeCtrl($scope,toastr,apiRequest,baUtil,modalsService) {
        $scope.smartTable = {
            pageSize: 10,
            searchContent: '',
            start:"",
            end:"",
        }; //设置每页默认条数
        $scope.removeContent=function(){
            $scope.smartTable.start='';
            $scope.smartTable.end='';
            $scope.smartTable.searchContent = '';
            $scope.getList($scope.tableState);
        }
        // 分页获取数据
        $scope.getList = function(tableState) {
            var pagination = tableState.pagination; //tableState为插件暴露属性
            $scope.tableState = tableState; //设置table外部搜索请求参数
            var start = pagination.start || 0; // 获取翻页开始行
            var number = pagination.number || 10; // 获取每页显示行数

            $scope.pageIndex = start / $scope.smartTable.pageSize + 1; //获取当前页面
            if (($scope.smartTable.start!="")||($scope.smartTable.end!="")) {
                if (($scope.smartTable.start!="")||($scope.smartTable.end!="")) {
                    var resVerify=baUtil.verifyTime($scope.smartTable.start,$scope.smartTable.end);
                    if(typeof resVerify!=='undefined'){
                        toastr.error(resVerify, '');
                        return ;
                    }
                }
            }
            $scope.isLoading = true; //默认为读取数据状态中
            var params ;
            if (!$scope.smartTable.searchContent) {
                params = {
                    page: $scope.pageIndex, //动态获取翻页页面index
                    size: $scope.smartTable.pageSize,
                    key:"",
                };
            } else {
                params = {
                    page: $scope.pageIndex, //动态获取翻页页面index
                    size: $scope.smartTable.pageSize,
                    key: $scope.smartTable.searchContent,
                };

                //监听搜索内容改变
                var watchSearchContent = $scope.$watch('smartTable.searchContent', function(newValue, oldValue, scope) {
                    console.log('watch')
                    // console.log('contentchange', newValue, oldValue);
                    if (newValue != oldValue) {
                        tableState.pagination.start = 0; //初始化从第一页显示
                    }
                });
            }
            if($scope.selected==4){
                delete params.status;
            }
            else{
                params.status=$scope.selected;
            }
            if($scope.smartTable.start!=""){
                params.startTime=$scope.smartTable.start+" "+"00:00:00";
            }
            if($scope.smartTable.end!=""){
                params.endTime=$scope.smartTable.end+" "+"00:00:00";
            }
            apiRequest.post('/admin/sysPush/sysPush-list', params, function(res) {
                $scope.tableData = res.data.list;
                $scope.datasTotalNum = res.data.total;
                tableState.pagination.numberOfPages = $scope.datasTotalNum % number == 0 ? parseInt($scope.datasTotalNum / number) : (parseInt($scope.datasTotalNum / number) + 1); //获取可翻页总页数
                $scope.isLoading = false; //服务器返回数据后显示
                $scope.itemFrom = start + 1; //页面显示行开始
                $scope.itemTo = (start + number) > $scope.datasTotalNum ? $scope.datasTotalNum : (start + number); //页面显示行结束
            });
        };

        $scope.showPushtarget=function(target){
            if(target.length>1){
                return "用户端、商家端";
            }
            if(target=="1"){
                return "商家端";
            }
            if(target=="2"){
                return "用户端";
            }
        }

        $scope.noticedetail = function(item) {
            $scope.modal = {
                content: item.pushContext,
                // picture:item.picture,
                title: "查看系统推送详情",
            };
            modalsService.normal('app/pages/marketing/notice/noticedetail.html','detailCtrl',$scope.modal,function(){});
        };
        $scope.del = function(id) {
            $scope.modal = {
                url: "/admin/sysPush/update-sysPushStatus",
                title: "确认信息",
                success: "删除成功",
                message: "您确定删除您选中的项吗？",
                params: {
                    id: id
                }
            };
            modalsService.callback($scope.modal,function(){
                $scope.getList($scope.tableState);
            });
        };
    }

})();
