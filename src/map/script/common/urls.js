/**
 * @file 存放php proxy的url和Jquery AJAX方法 
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import Commonfun from './commonfun';
import { loginOrg, loginUser, loginCompany, loginKey} from '@/utils/LoginContext';
import configs from '@/utils/config';
import {stringify} from 'qs';
var urls = {
    // 矩形区域检索entity
    boundsearchEntity: '//yingyan.baidu.com/api/v3/entity/boundsearch',
    // 获取track的distance
    getDistance: '//yingyan.baidu.com/api/v3/track/getdistance',
    // 获取track信息
    getTrack: '//yingyan.baidu.com/api/v3/track/gettrack',

    // 获取自定义字段列表
    columnsList: '//yingyan.baidu.com/api/v3/entity/listcolumn',
    // 经纬度解析
    getAddress: '//api.map.baidu.com/reverse_geocoding/v3/',
    // 通过新的search接口获取数据，包括所有entity、模糊搜索entity、在线entity、离线entity
    searchEntity: '//yingyan.baidu.com/api/v3/entity/search',
    // 获取track列表
    trackList: '//yingyan.baidu.com/api/v2/track/gethistory',
    // 获取停留点
    getstaypoint: '//yingyan.baidu.com/api/v2/analysis/staypoint',
    // 获取驾驶行为分析信息
    getBehaviorAnalysis: '//yingyan.baidu.com/api/v2/analysis/drivingbehavior',
    // 获取当前登录人及所属组织在当天可看到的entityName集合
    getEntityNames: '/iwms-facility/facility/deliverTask/page',
    // 获取当前轨迹的门店坐标集合
    getTrackStorePoint:'/iwms-facility/facility/deliverTask/getByShipBillNumber',
    /**
     * 获取当前登录人及所属组织在某天可看到的entityName集合
     *
     * @param {function} success 请求成功回调函数
     */
    query: function (url,params,success) {
        $.ajax({
            url: configs[API_ENV].API_SERVER + url,
            type: 'POST',
            contentType : "application/json;charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(params),
            success: success,
            headers: {'iwmsJwt': loginKey()}
        });
    },
    /**
     * 根据entityName查询某天任务，以此获取门店地址
     *
     * @param {function} success 请求成功回调函数
     */
    get: function (url,params,success) {
        $.ajax({
            url: configs[API_ENV].API_SERVER + url+'?'+stringify(params)+'&companyUuid='+loginCompany().uuid,
            type: 'GET',
            contentType : "application/json;charset=utf-8",
            dataType: 'json',
            success: success,
            headers: {'iwmsJwt': loginKey()}
        });
    },

    /**
     * JSONP
     *
     * @param {string} url 请求url
     * @param {object} params 请求参数
     * @param {function} callbakc 请求成功回调函数
     * @param {function} before 请求前函数
     */
    jsonp: function (url, params, callback, before) {
        var that = this;
        if (before) {
            before();
        }
        params.timeStamp = new Date().getTime();
        params.ak = "GQZvCcEOCVen9FMt2chOAGY6kbSDjoQY";
        params.service_id = "218391";
        url = url + '?';
        for (let i in params) {
            url = url + i + '=' + params[i] + '&';
        }
        var timeStamp = (Math.random() * 100000).toFixed(0);
        window['ck' + timeStamp] = callback || function () {};
        var completeUrl = url + '&callback=ck' + timeStamp;
        var script = document.createElement('script');
        script.src = completeUrl;
        script.id = 'jsonp';
        document.getElementsByTagName('head')[0].appendChild(script);
        script.onload = function (e) {
            $('#jsonp').remove();
        };
        script.onerror = function (e) {
            that.jsonp(url, params, callback, before)
        };
    }
}

export default urls;