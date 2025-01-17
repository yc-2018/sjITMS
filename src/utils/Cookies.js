import { Base64 } from './Md5';

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = "user_" + cname + "=" + Base64.encode(escape(cvalue)) + "; " + expires;
}

//获取cookie
export function getCookie(cname) {
    var name = "user_" + cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) {
            var cnameValue = unescape(c.substring(name.length, c.length));
            return Base64.decode(cnameValue);
        }
    }
    return "";
}

//清除cookie  
export function clearCookie(cname) {
    var name = "user_" + cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) {
            setCookie(cname, c.substring(name.length, c.length), -1);
        }
    }
}