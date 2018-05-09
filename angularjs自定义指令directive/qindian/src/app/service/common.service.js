angular.module('starter.services')
.service('verify', ['$timeout', '$window', function($timeout, $window) {
    this.verified = function(verifing) {
        var ver = false;
        for (var i = 0; i < verifing.length; i++) {
            ver = this[verifing[i].fname](verifing[i].content, verifing[i].tip);
            if (!ver) {
                break;
            }
        }
        return ver;
    };

    this.tooltip = function(message) {
        var scrolldiv = angular.element(document.querySelector('.view-container'));
        var objtip;
        objtip = angular.element(document.querySelector('.tooltip'));
        objtip.remove();
        scrolldiv.append('<p class="tooltip">' + message + '</p>');
        objtip = angular.element(document.querySelector('.tooltip'));
        objtip.css('top', $window.outerHeight / 2 + 'px');
        $timeout(function() {
            objtip.remove();
        }, 1500);
    };

    //验证手机号
    this.mobile = function(phone, tip) {
        var reg = '^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$';
        if (!phone.match(reg)) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };
    //不为空
    this.isEmpty = function(content, tip) {
        if (content === '' || content === null || content === undefined) {
            if (content === 0) {
                return true;
            } else {
                this.tooltip(tip);
                return false;
            }
        } else {

            return true;
        }
    };
    this.isUnstrictEmpty = function(content, tip) {
        if (content.length === 0) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //指定长度
    this.appointMaxLength = function(content, length) {
        if (content.length <= length) {
            return true;
        } else {
            return false;
        }
    };

    this.appointMinLength = function(content, length) {
        if (content.length >= length) {
            return true;
        } else {
            return false;
        }
    };

    //仅限汉字
    this.onlyChinese = function(content, tip) {
        var reg = '^[\u2E80-\u9FFF]+$';
        if (!content.match(reg)) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //仅限数字
    this.onlyNum = function(content, tip) {
        var reg = new RegExp('^[0-9]*$');
        if (!reg.test(content)) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //判断日期格式是否小于当前日期
    this.datejudge = function(selDay, tip) {
        var nowTemp = new Date();
        var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
        if (selDay > nowDay) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //判断内容是否一样
    this.isSame = function(content, tip) {
        var con = content.split(';');
        if (con[1] === con[0]) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //邮箱
    this.isEmail = function(email, tip) {
        var reg = new RegExp('^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$');
        if (!reg.test(email)) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //qq号可以为手机号，邮箱，QQ号
    this.isQQ = function(qq, tip) {
        var reg1 = new RegExp('^[0-9]*$');
        var reg2 = new RegExp('^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$');
        if (reg1.test(qq) && reg2.test(qq)) {
            return true;
        } else {
            this.tooltip(tip);
            return false;
        }
    };

    //金额，可接收正整数,也可接收正浮点数，两位小数
    this.isMoney = function(content, tip) {
        var reg = new RegExp('^(([1-9]*)|([0]{1}))?((\.)?([0-9]{1,2}))?$');
        if (!reg.test(content) || content <= 0) {
            this.tooltip(tip);
            return false;
        } else {
            return true;
        }
    };

    //指定范围 content +'; 1-100'
    this.region = function(content, tip) {
        var con = content.split(';');
        var middle = +con[0],
            min = +con[1].split('-')[0],
            max = +con[1].split('-')[1];
        if (middle >= min && middle <= max) {
            return true;
        } else {
            this.tooltip(tip);
            return false;
        }
    };

    //至少一个不为空
    this.allEmpty = function(content, tip) {
        var con = content.split(';');
        console.log(con);
        var verifed = false;
        for (var i = 0; i < con.length; i++) {
            if (con[i] && con[i] !== 'null' && con[i] !== 'undefined' && con[i] !== 0) {
                console.log(con[i]);
                verifed = true;
                break;
            } else {
                verifed = false;
            }
        }
        if (!verifed) {
            this.tooltip(tip);
        }
        return verifed;
    };

}])

//文件操作，  上传图片到leancloud
.service('filesOpr', ['verify', '$ionicLoading', function(verify, $ionicLoading) {
    this.isInit = false;

    this.init = function() {
        var APP_ID = 'hQc4jr4JJBsQILySvkGDamdi-gzGzoHsz';	//对应leancloud 上的appId
        var APP_KEY = 'mY9eg3n8rb8stFwfTTEaz9Ur'; 	//对应leancloud 上的appKey
        if (this.isInit) {
            return;

        } else {
            AV.initialize({
                appId: APP_ID,
                appKey: APP_KEY
            });
            this.isInit = true;
        }
    };

    this.fileUpload = function(file, success, error) {
        this.init();
        var name = 'fsplus-web.png';
        $ionicLoading.show({
            template: '<div class="loader"></div>'
        });
        var avFile = new AV.File(name, file);
        avFile.save().then(function(data) {
            var url = data.url();
            $ionicLoading.hide();
            success(url);
        }, function(err) {
            console.log(err);
            if (error) {
                error(err);
                $ionicLoading.hide();
            }
        });
    };

}])

//城市列表
.service('CityPicker', function() {
    this.cityList = [{
        "name": "北京",
        "sub": [{
            "name": "东城区"
        }, {
            "name": "西城区"
        }, {
            "name": "崇文区"
        }, {
            "name": "宣武区"
        }, {
            "name": "朝阳区"
        }, {
            "name": "海淀区"
        }, {
            "name": "丰台区"
        }, {
            "name": "石景山区"
        }, {
            "name": "房山区"
        }, {
            "name": "通州区"
        }, {
            "name": "顺义区"
        }, {
            "name": "昌平区"
        }, {
            "name": "大兴区"
        }, {
            "name": "怀柔区"
        }, {
            "name": "平谷区"
        }, {
            "name": "门头沟区"
        }, {
            "name": "密云县"
        }, {
            "name": "延庆县"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "广东",
        "sub": [{
            "name": "广州",
        }, {
            "name": "深圳",
        }, {
            "name": "珠海",
        }, {
            "name": "汕头",
        }, {
            "name": "韶关",
        }, {
            "name": "佛山",
        }, {
            "name": "江门",
        }, {
            "name": "湛江",
        }, {
            "name": "茂名",
        }, {
            "name": "肇庆",
        }, {
            "name": "惠州",
        }, {
            "name": "梅州",
        }, {
            "name": "汕尾",
        }, {
            "name": "河源",
        }, {
            "name": "阳江",
        }, {
            "name": "清远",
        }, {
            "name": "东莞",
        }, {
            "name": "中山",
        }, {
            "name": "潮州",
        }, {
            "name": "揭阳",
        }, {
            "name": "云浮",
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "上海",
        "sub": [{
            "name": "黄浦区"
        }, {
            "name": "卢湾区"
        }, {
            "name": "徐汇区"
        }, {
            "name": "长宁区"
        }, {
            "name": "静安区"
        }, {
            "name": "普陀区"
        }, {
            "name": "闸北区"
        }, {
            "name": "虹口区"
        }, {
            "name": "杨浦区"
        }, {
            "name": "宝山区"
        }, {
            "name": "闵行区"
        }, {
            "name": "嘉定区"
        }, {
            "name": "松江区"
        }, {
            "name": "金山区"
        }, {
            "name": "青浦区"
        }, {
            "name": "南汇区"
        }, {
            "name": "奉贤区"
        }, {
            "name": "浦东新区"
        }, {
            "name": "崇明县"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "天津",
        "sub": [{
            "name": "和平区"
        }, {
            "name": "河东区"
        }, {
            "name": "河西区"
        }, {
            "name": "南开区"
        }, {
            "name": "河北区"
        }, {
            "name": "红桥区"
        }, {
            "name": "塘沽区"
        }, {
            "name": "汉沽区"
        }, {
            "name": "大港区"
        }, {
            "name": "东丽区"
        }, {
            "name": "西青区"
        }, {
            "name": "北辰区"
        }, {
            "name": "津南区"
        }, {
            "name": "武清区"
        }, {
            "name": "宝坻区"
        }, {
            "name": "静海县"
        }, {
            "name": "宁河县"
        }, {
            "name": "蓟县"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "重庆",
        "sub": [{
            "name": "渝中区"
        }, {
            "name": "大渡口区"
        }, {
            "name": "江北区"
        }, {
            "name": "南岸区"
        }, {
            "name": "北碚区"
        }, {
            "name": "渝北区"
        }, {
            "name": "巴南区"
        }, {
            "name": "长寿区"
        }, {
            "name": "双桥区"
        }, {
            "name": "沙坪坝区"
        }, {
            "name": "万盛区"
        }, {
            "name": "万州区"
        }, {
            "name": "涪陵区"
        }, {
            "name": "黔江区"
        }, {
            "name": "永川区"
        }, {
            "name": "合川区"
        }, {
            "name": "江津区"
        }, {
            "name": "九龙坡区"
        }, {
            "name": "南川区"
        }, {
            "name": "綦江县"
        }, {
            "name": "潼南县"
        }, {
            "name": "荣昌县"
        }, {
            "name": "璧山县"
        }, {
            "name": "大足县"
        }, {
            "name": "铜梁县"
        }, {
            "name": "梁平县"
        }, {
            "name": "开县"
        }, {
            "name": "忠县"
        }, {
            "name": "城口县"
        }, {
            "name": "垫江县"
        }, {
            "name": "武隆县"
        }, {
            "name": "丰都县"
        }, {
            "name": "奉节县"
        }, {
            "name": "云阳县"
        }, {
            "name": "巫溪县"
        }, {
            "name": "巫山县"
        }, {
            "name": "石柱土家族自治县"
        }, {
            "name": "秀山土家族苗族自治县"
        }, {
            "name": "酉阳土家族苗族自治县"
        }, {
            "name": "彭水苗族土家族自治县"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "辽宁",
        "sub": [{
            "name": "沈阳",
        }, {
            "name": "大连",
        }, {
            "name": "鞍山",
        }, {
            "name": "抚顺",
        }, {
            "name": "本溪",
        }, {
            "name": "丹东",
        }, {
            "name": "锦州",
        }, {
            "name": "营口",
        }, {
            "name": "阜新",
        }, {
            "name": "辽阳",
        }, {
            "name": "盘锦",
        }, {
            "name": "铁岭",
        }, {
            "name": "朝阳",
        }, {
            "name": "葫芦岛",
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "江苏",
        "sub": [{
            "name": "南京",
        }, {
            "name": "苏州",
        }, {
            "name": "无锡",
        }, {
            "name": "常州",
        }, {
            "name": "镇江",
        }, {
            "name": "南通",
        }, {
            "name": "泰州",
        }, {
            "name": "扬州"
        }, {
            "name": "盐城"
        }, {
            "name": "连云港"
        }, {
            "name": "徐州"
        }, {
            "name": "淮安"
        }, {
            "name": "宿迁"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "湖北",
        "sub": [{
            "name": "武汉"
        }, {
            "name": "黄石"
        }, {
            "name": "十堰"
        }, {
            "name": "荆州"
        }, {
            "name": "宜昌"
        }, {
            "name": "襄樊"
        }, {
            "name": "鄂州"
        }, {
            "name": "荆门"
        }, {
            "name": "孝感"
        }, {
            "name": "黄冈"
        }, {
            "name": "咸宁"
        }, {
            "name": "随州"
        }, {
            "name": "恩施土家族苗族自治州"
        }, {
            "name": "仙桃"
        }, {
            "name": "天门"
        }, {
            "name": "潜江"
        }, {
            "name": "神农架林区"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "四川",
        "sub": [{
            "name": "成都"
        }, {
            "name": "自贡"
        }, {
            "name": "攀枝花"
        }, {
            "name": "泸州"
        }, {
            "name": "德阳"
        }, {
            "name": "绵阳"
        }, {
            "name": "广元"
        }, {
            "name": "遂宁"
        }, {
            "name": "内江"
        }, {
            "name": "乐山"
        }, {
            "name": "南充"
        }, {
            "name": "眉山"
        }, {
            "name": "宜宾"
        }, {
            "name": "广安"
        }, {
            "name": "达州"
        }, {
            "name": "雅安"
        }, {
            "name": "巴中"
        }, {
            "name": "资阳"
        }, {
            "name": "阿坝藏族羌族自治州"
        }, {
            "name": "甘孜藏族自治州"
        }, {
            "name": "凉山彝族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "陕西",
        "sub": [{
            "name": "西安"
        }, {
            "name": "铜川"
        }, {
            "name": "宝鸡"
        }, {
            "name": "咸阳"
        }, {
            "name": "渭南"
        }, {
            "name": "延安"
        }, {
            "name": "汉中"
        }, {
            "name": "榆林"
        }, {
            "name": "安康"
        }, {
            "name": "商洛"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "河北",
        "sub": [{
            "name": "石家庄"
        }, {
            "name": "唐山"
        }, {
            "name": "秦皇岛"
        }, {
            "name": "邯郸"
        }, {
            "name": "邢台"
        }, {
            "name": "保定"
        }, {
            "name": "张家口"
        }, {
            "name": "承德"
        }, {
            "name": "沧州"
        }, {
            "name": "廊坊"
        }, {
            "name": "衡水"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "山西",
        "sub": [{
            "name": "太原"
        }, {
            "name": "大同"
        }, {
            "name": "阳泉"
        }, {
            "name": "长治"
        }, {
            "name": "晋城"
        }, {
            "name": "朔州"
        }, {
            "name": "晋中"
        }, {
            "name": "运城"
        }, {
            "name": "忻州"
        }, {
            "name": "临汾"
        }, {
            "name": "吕梁"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "河南",
        "sub": [{
            "name": "郑州"
        }, {
            "name": "开封"
        }, {
            "name": "洛阳"
        }, {
            "name": "平顶山"
        }, {
            "name": "安阳"
        }, {
            "name": "鹤壁"
        }, {
            "name": "新乡"
        }, {
            "name": "焦作"
        }, {
            "name": "濮阳"
        }, {
            "name": "许昌"
        }, {
            "name": "漯河"
        }, {
            "name": "三门峡"
        }, {
            "name": "南阳"
        }, {
            "name": "商丘"
        }, {
            "name": "信阳"
        }, {
            "name": "周口"
        }, {
            "name": "驻马店"
        }, {
            "name": "焦作"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "吉林",
        "sub": [{
            "name": "长春"
        }, {
            "name": "吉林"
        }, {
            "name": "四平"
        }, {
            "name": "辽源"
        }, {
            "name": "通化"
        }, {
            "name": "白山"
        }, {
            "name": "松原"
        }, {
            "name": "白城"
        }, {
            "name": "延边朝鲜族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "黑龙江",
        "sub": [{
            "name": "哈尔滨"
        }, {
            "name": "齐齐哈尔"
        }, {
            "name": "鹤岗"
        }, {
            "name": "双鸭山"
        }, {
            "name": "鸡西"
        }, {
            "name": "大庆"
        }, {
            "name": "伊春"
        }, {
            "name": "牡丹江"
        }, {
            "name": "佳木斯"
        }, {
            "name": "七台河"
        }, {
            "name": "黑河"
        }, {
            "name": "绥化"
        }, {
            "name": "大兴安岭地区"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "内蒙古",
        "sub": [{
            "name": "呼和浩特"
        }, {
            "name": "包头"
        }, {
            "name": "乌海"
        }, {
            "name": "赤峰"
        }, {
            "name": "通辽"
        }, {
            "name": "鄂尔多斯"
        }, {
            "name": "呼伦贝尔"
        }, {
            "name": "巴彦淖尔"
        }, {
            "name": "乌兰察布"
        }, {
            "name": "锡林郭勒盟"
        }, {
            "name": "兴安盟"
        }, {
            "name": "阿拉善盟"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "山东",
        "sub": [{
            "name": "济南"
        }, {
            "name": "青岛"
        }, {
            "name": "淄博"
        }, {
            "name": "枣庄"
        }, {
            "name": "东营"
        }, {
            "name": "烟台"
        }, {
            "name": "潍坊"
        }, {
            "name": "济宁"
        }, {
            "name": "泰安"
        }, {
            "name": "威海"
        }, {
            "name": "日照"
        }, {
            "name": "莱芜"
        }, {
            "name": "临沂"
        }, {
            "name": "德州"
        }, {
            "name": "聊城"
        }, {
            "name": "滨州"
        }, {
            "name": "菏泽"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "安徽",
        "sub": [{
            "name": "合肥"
        }, {
            "name": "芜湖"
        }, {
            "name": "蚌埠"
        }, {
            "name": "淮南"
        }, {
            "name": "马鞍山"
        }, {
            "name": "淮北"
        }, {
            "name": "铜陵"
        }, {
            "name": "安庆"
        }, {
            "name": "黄山"
        }, {
            "name": "滁州"
        }, {
            "name": "阜阳"
        }, {
            "name": "宿州"
        }, {
            "name": "巢湖"
        }, {
            "name": "六安"
        }, {
            "name": "亳州"
        }, {
            "name": "池州"
        }, {
            "name": "宣城"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "浙江",
        "sub": [{
            "name": "杭州"
        }, {
            "name": "宁波"
        }, {
            "name": "温州"
        }, {
            "name": "嘉兴"
        }, {
            "name": "湖州"
        }, {
            "name": "绍兴"
        }, {
            "name": "金华"
        }, {
            "name": "衢州"
        }, {
            "name": "舟山"
        }, {
            "name": "台州"
        }, {
            "name": "丽水"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "福建",
        "sub": [{
            "name": "福州"
        }, {
            "name": "厦门"
        }, {
            "name": "莆田"
        }, {
            "name": "三明"
        }, {
            "name": "泉州"
        }, {
            "name": "漳州"
        }, {
            "name": "南平"
        }, {
            "name": "龙岩"
        }, {
            "name": "宁德"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "湖南",
        "sub": [{
            "name": "长沙"
        }, {
            "name": "株洲"
        }, {
            "name": "湘潭"
        }, {
            "name": "衡阳"
        }, {
            "name": "邵阳"
        }, {
            "name": "岳阳"
        }, {
            "name": "常德"
        }, {
            "name": "张家界"
        }, {
            "name": "益阳"
        }, {
            "name": "郴州"
        }, {
            "name": "永州"
        }, {
            "name": "怀化"
        }, {
            "name": "娄底"
        }, {
            "name": "湘西土家族苗族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "广西",
        "sub": [{
            "name": "南宁"
        }, {
            "name": "柳州"
        }, {
            "name": "桂林"
        }, {
            "name": "梧州"
        }, {
            "name": "北海"
        }, {
            "name": "防城港"
        }, {
            "name": "钦州"
        }, {
            "name": "贵港"
        }, {
            "name": "玉林"
        }, {
            "name": "百色"
        }, {
            "name": "贺州"
        }, {
            "name": "河池"
        }, {
            "name": "来宾"
        }, {
            "name": "崇左"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "江西",
        "sub": [{
            "name": "南昌"
        }, {
            "name": "景德镇"
        }, {
            "name": "萍乡"
        }, {
            "name": "九江"
        }, {
            "name": "新余"
        }, {
            "name": "鹰潭"
        }, {
            "name": "赣州"
        }, {
            "name": "吉安"
        }, {
            "name": "宜春"
        }, {
            "name": "抚州"
        }, {
            "name": "上饶"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "贵州",
        "sub": [{
            "name": "贵阳"
        }, {
            "name": "六盘水"
        }, {
            "name": "遵义"
        }, {
            "name": "安顺"
        }, {
            "name": "铜仁地区"
        }, {
            "name": "毕节地区"
        }, {
            "name": "黔西南布依族苗族自治州"
        }, {
            "name": "黔东南苗族侗族自治州"
        }, {
            "name": "黔南布依族苗族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "云南",
        "sub": [{
            "name": "昆明"
        }, {
            "name": "曲靖"
        }, {
            "name": "玉溪"
        }, {
            "name": "保山"
        }, {
            "name": "昭通"
        }, {
            "name": "丽江"
        }, {
            "name": "普洱"
        }, {
            "name": "临沧"
        }, {
            "name": "德宏傣族景颇族自治州"
        }, {
            "name": "怒江傈僳族自治州"
        }, {
            "name": "迪庆藏族自治州"
        }, {
            "name": "大理白族自治州"
        }, {
            "name": "楚雄彝族自治州"
        }, {
            "name": "红河哈尼族彝族自治州"
        }, {
            "name": "文山壮族苗族自治州"
        }, {
            "name": "西双版纳傣族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "西藏",
        "sub": [{
            "name": "拉萨"
        }, {
            "name": "那曲地区"
        }, {
            "name": "昌都地区"
        }, {
            "name": "林芝地区"
        }, {
            "name": "山南地区"
        }, {
            "name": "日喀则地区"
        }, {
            "name": "阿里地区"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "海南",
        "sub": [{
            "name": "海口"
        }, {
            "name": "三亚"
        }, {
            "name": "五指山"
        }, {
            "name": "琼海"
        }, {
            "name": "儋州"
        }, {
            "name": "文昌"
        }, {
            "name": "万宁"
        }, {
            "name": "东方"
        }, {
            "name": "澄迈县"
        }, {
            "name": "定安县"
        }, {
            "name": "屯昌县"
        }, {
            "name": "临高县"
        }, {
            "name": "白沙黎族自治县"
        }, {
            "name": "昌江黎族自治县"
        }, {
            "name": "乐东黎族自治县"
        }, {
            "name": "陵水黎族自治县"
        }, {
            "name": "保亭黎族苗族自治县"
        }, {
            "name": "琼中黎族苗族自治县"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "甘肃",
        "sub": [{
            "name": "兰州"
        }, {
            "name": "嘉峪关"
        }, {
            "name": "金昌"
        }, {
            "name": "白银"
        }, {
            "name": "天水"
        }, {
            "name": "武威"
        }, {
            "name": "酒泉"
        }, {
            "name": "张掖"
        }, {
            "name": "庆阳"
        }, {
            "name": "平凉"
        }, {
            "name": "定西"
        }, {
            "name": "陇南"
        }, {
            "name": "临夏回族自治州"
        }, {
            "name": "甘南藏族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "宁夏",
        "sub": [{
            "name": "银川"
        }, {
            "name": "石嘴山"
        }, {
            "name": "吴忠"
        }, {
            "name": "固原"
        }, {
            "name": "中卫"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "青海",
        "sub": [{
            "name": "西宁"
        }, {
            "name": "海东地区"
        }, {
            "name": "海北藏族自治州"
        }, {
            "name": "海南藏族自治州"
        }, {
            "name": "黄南藏族自治州"
        }, {
            "name": "果洛藏族自治州"
        }, {
            "name": "玉树藏族自治州"
        }, {
            "name": "海西蒙古族藏族自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "新疆",
        "sub": [{
            "name": "乌鲁木齐"
        }, {
            "name": "克拉玛依"
        }, {
            "name": "吐鲁番地区"
        }, {
            "name": "哈密地区"
        }, {
            "name": "和田地区"
        }, {
            "name": "阿克苏地区"
        }, {
            "name": "喀什地区"
        }, {
            "name": "克孜勒苏柯尔克孜自治州"
        }, {
            "name": "巴音郭楞蒙古自治州"
        }, {
            "name": "昌吉回族自治州"
        }, {
            "name": "博尔塔拉蒙古自治州"
        }, {
            "name": "石河子"
        }, {
            "name": "阿拉尔"
        }, {
            "name": "图木舒克"
        }, {
            "name": "五家渠"
        }, {
            "name": "伊犁哈萨克自治州"
        }, {
            "name": "其他"
        }],
        "type": 1,
        "show": false
    }, {
        "name": "香港",
        "sub": [{
            "name": "中西区"
        }, {
            "name": "湾仔区"
        }, {
            "name": "东区"
        }, {
            "name": "南区"
        }, {
            "name": "深水埗区"
        }, {
            "name": "油尖旺区"
        }, {
            "name": "九龙城区"
        }, {
            "name": "黄大仙区"
        }, {
            "name": "观塘区"
        }, {
            "name": "北区"
        }, {
            "name": "大埔区"
        }, {
            "name": "沙田区"
        }, {
            "name": "西贡区"
        }, {
            "name": "元朗区"
        }, {
            "name": "屯门区"
        }, {
            "name": "荃湾区"
        }, {
            "name": "葵青区"
        }, {
            "name": "离岛区"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "澳门",
        "sub": [{
            "name": "花地玛堂区"
        }, {
            "name": "圣安多尼堂区"
        }, {
            "name": "大堂区"
        }, {
            "name": "望德堂区"
        }, {
            "name": "风顺堂区"
        }, {
            "name": "嘉模堂区"
        }, {
            "name": "圣方济各堂区"
        }, {
            "name": "路凼"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "台湾",
        "sub": [{
            "name": "台北市"
        }, {
            "name": "高雄市"
        }, {
            "name": "台北县"
        }, {
            "name": "桃园县"
        }, {
            "name": "新竹县"
        }, {
            "name": "苗栗县"
        }, {
            "name": "台中县"
        }, {
            "name": "彰化县"
        }, {
            "name": "南投县"
        }, {
            "name": "云林县"
        }, {
            "name": "嘉义县"
        }, {
            "name": "台南县"
        }, {
            "name": "高雄县"
        }, {
            "name": "屏东县"
        }, {
            "name": "宜兰县"
        }, {
            "name": "花莲县"
        }, {
            "name": "台东县"
        }, {
            "name": "澎湖县"
        }, {
            "name": "基隆市"
        }, {
            "name": "新竹市"
        }, {
            "name": "台中市"
        }, {
            "name": "嘉义市"
        }, {
            "name": "台南市"
        }, {
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }, {
        "name": "海外",
        "sub": [{
            "name": "其他"
        }],
        "type": 0,
        "show": false
    }];
})

;
