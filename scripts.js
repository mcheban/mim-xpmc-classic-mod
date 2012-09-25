/*
IEView script for highlighting images, videos and flashes
Author chebs
Ver. 0.3.6
*/
var DEBUG = false;
var objectID = 0;
var DEFAULT_FLASH_WIDTH = '425';
var DEFAULT_FLASH_HEIGHT = '335';
var BUTTON_IMAGE = '<input id="button_%id%" type="button" onclick="showImage(\'%id%\',\'%src%\');" title="%title%" class="button btn_img"/>';
var BUTTON_YOUTUBE_VIDEO = '<input id="button_%id%" type="button" onclick="showYoutubeVideo(\'%id%\',\'%vid%\');" title="%title%" class="button btn_video"/>';
var BUTTON_YAPLAKAL_VIDEO = '<input id="button_%id%" type="button" onclick="showYaplakalVideo(\'%id%\',\'%url%\');" title="%title%" class="button btn_video"/>';
var BUTTON_GOOGLE_VIDEO = '<input id="button_%id%" type="button" onclick="showGoogleVideo(\'%id%\',\'%vid%\');" title="%title%" class="button btn_video"/>';
var BUTTON_FLASH = '<input id="button_%id%" type="button" onclick="showFlash(\'%id%\',\'%src%\');" title="%title%" class="button btn_flash"/>';
var OBJ_CONTAINER = '<span id="cntr_%id%" style="display: none;"></span>';
var SPAN = '<span id="%id%" style="display: none;"></span>';
var IMAGE = '<img id="%id%" src="%src%" title="%src%" onclick="hideObject(\'%id%\');" class="image" onload="imageLoaded(\'%id%\')"/>';
var HINT = '<span id="hint_%id%" class="hint"><input type="button" onclick="removeObject(\'%id%\')" class="button btn_remove">%text%</span>';
var FLASH = '<object id="%id%" width="%width%" height="%height%" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie" value="%movie%"></param><param name="wmode" value="transparent"></param><param name="flashvars" value="%flashvars%"/><param name="allowScriptAccess" value="always"/><embed src="%movie%" flashvars="%flashvars%" type="application/x-shockwave-flash" wmode="transparent" width="%width%" height="%height%" pluginspage="http://www.macromedia.com/go/getflashplayer"></embed></object>';
var YOUTUBE_VIDEO = FLASH.replace(/%movie%/g, 'https://www.youtube.com/v/%vid%&rel=0').replace(/%width%/g, DEFAULT_FLASH_WIDTH).replace(/%height%/g, DEFAULT_FLASH_HEIGHT);
var GOOGLE_VIDEO = FLASH.replace(/%movie%/g, 'http://video.google.com/googleplayer.swf?docId=-%vid%').replace(/%width%/g, DEFAULT_FLASH_WIDTH).replace(/%height%/g, DEFAULT_FLASH_HEIGHT);
var YAPLAKAL_VIDEO = FLASH.replace(/%movie%/g, 'http://www.yapfiles.ru/static/play.swf').replace(/%flashvars%/g, 'st=%vid%').replace(/%width%/g, '500').replace(/%height%/g, '375');
var BUTTON_INC_SIZE = '<input type="button" value="+" onclick="increaseSize(\'%id%\');" class="button btn_inc">';
var BUTTON_DEC_SIZE = '<input type="button" value="-" onclick="decreaseSize(\'%id%\');" class="button btn_dec">';
var timeouts = {processTimeout: 500,
                resolveTimeout: 4000,
                connectTimeout: 4000,
                sendTimeout: 5000,
                receiveTimeout: 5000};

var ENTITIES = ['&quot;','&lt;','&gt;'];

var RE_STRIP_URL = /<a.+?href=(["'])(.*?)\1.*?>.*?<\/a>/gi;
var RE_STRIP_IMG = /<div[^<>]*?>\s*?<img.+?src="(.*?)".*?\/?>\s*?<\/div>/gmi;
var RE_URL = /((((file|gopher|news|nntp|telnet|http|ftp|https|ftps|sftp):\/\/)|(www\.))+(([a-z0-9._-]+(\.[a-z]{2,6})?)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]+)?(\/[a-zа-я0-9+()&%#!,_.\/?:;=@~\[\]-]*)?)/gmi;
var RE_IMAGE = /\b(http(s)?\:\/\/[a-z0-9-.]+(\.[a-z]{2,6})?(?:[a-zа-я0-9_+])+(\/[a-zа-я0-9+()&%#,_'.\/-~-]*)?\.(?:jpg|jpeg|gif|png|bmp)\b)/gi;
var RE_YOUTUBE_VIDEO = /\b(https?:\/\/(?:www\.)?youtube\.com\/(?:watch)?\?v=([a-z0-9_-]+)(&[^&]+)*)\b/gi;
var RE_YAPLAKAL_VIDEO = /\b(http:\/\/www.yapfiles.ru\/show\/\d+\/([a-z0-9]+)\.flv\.html)\b/gi;
var RE_YAPLAKAL_VIDEO_PAGE = /\[flash=\d+,\d+,http:\/\/www\.yapfiles\.ru\/static\/play\.swf\?st=([a-z0-9]+)(&[^&]+)*\]/gi;
var RE_YAPLAKAL_VIDEO = /\b(http:\/\/www.yapfiles.ru\/show\/\d+\/([a-z0-9]+)\.flv\.html)\b/gi;
var RE_YAPLAKAL_VIDEO_PAGE = /\[flash=\d+,\d+,http:\/\/www\.yapfiles\.ru\/static\/play\.swf\?st=([a-z0-9]+)(&[^&]+)*\]/gi;
var RE_GOOGLE_VIDEO = /\b(http:\/\/video\.google\.com\/googleplayer\.swf\?docId=-(\d+).*)\b/gi;
var RE_GOOGLE_VIDEO2 = /\b(http:\/\/video.google.com\/videoplay\?docid=-(\d+).*)\b/gi;
var RE_FLASH = /\b(http(s)?\:\/\/[a-z0-9-.]+(\.[a-z]{2,6})?(?:[a-zа-я0-9_+])+(\/[a-zа-я0-9+()&%#,_'.\/-~-]*)?\.swf)\b/gi;

function stripURL(text) {
    reset(RE_STRIP_URL);
    reset(RE_STRIP_IMG);
    var stripped = text.replace(RE_STRIP_URL, '$2');
    stripped = stripped.replace(RE_STRIP_IMG, '$1');
    return stripped;
}

function highlightURL(text) {
    reset(RE_URL);
    var highlighted = text.replace(RE_URL, '<a href="$1" title="$1">$1</a>');
    return highlighted;
}

function imageLoaded(id) {
    var image = document.getElementById(id);
    if(!image.loaded) {
        showInline(image);
        remove(document.getElementById('hint_' + id));
        image.loaded = true;
    }
}

function removeObject(id) {
    var cntr = document.getElementById('cntr_' + id);
    cntr.innerHTML = '';
    hide(cntr);
    showInline(document.getElementById('button_' + id));
}

function hideObject(id) {
    showInline(document.getElementById('button_' + id));
    hide(document.getElementById('cntr_' + id));
}

function showObject(id, html) {
    var container = document.getElementById('cntr_' + id);
    var obj = document.getElementById(id);
    if(obj == null) {
        container.innerHTML = html;
    }
    show(container);
    hide(document.getElementById('button_' + id));
}

function showImage(id, url) {
    showObject(id, HINT.replace(/%id%/g, id).replace(/%text%/g, '&#160;Loading <i>"' + decodeURI(url) + '"</i>...') 
               + IMAGE.replace(/%id%/g, id).replace(/%src%/g, url));
}

function showYoutubeVideo(id, vid) {
    showObject(id, BUTTON_INC_SIZE.replace(/%id%/g, id) + BUTTON_DEC_SIZE.replace(/%id%/g, id) + '&#160;'
               + HINT.replace(/%id%/g, id).replace(/%text%/g, '&#160;Close') + '<br/>'
               + YOUTUBE_VIDEO.replace(/%id%/g, id).replace(/%vid%/g, vid));
}

function showGoogleVideo(id, vid) {
    showObject(id, BUTTON_INC_SIZE.replace(/%id%/g, id) + BUTTON_DEC_SIZE.replace(/%id%/g, id) + '&#160;'
               + HINT.replace(/%id%/g, id).replace(/%text%/g, '&#160;Close') + '<br/>'
               + GOOGLE_VIDEO.replace(/%id%/g, id).replace(/%vid%/g, vid));
}

function showFlash(id, src) {
    showObject(id, BUTTON_INC_SIZE.replace(/%id%/g, id) + BUTTON_DEC_SIZE.replace(/%id%/g, id) + "&#160;"
               + HINT.replace(/%id%/g, id).replace(/%text%/g, '&#160;Close') + '<br/>'
               + FLASH.replace(/%id%/g, id).replace(/%movie%/g, src).replace(/%width%/g, DEFAULT_FLASH_WIDTH).replace(/%height%/g, DEFAULT_FLASH_HEIGHT) + '<br/>');
}


function getInputValue(text, inputId) {
    var matcher;
    var value;
    var reInput = new RegExp('(<input[^>]+id=\"' + inputId + '"[^>]*>)', 'gi');
    var reValue = /value=\"([^\"]+)\"/gi;
    var input = '';
    if((matcher = reInput.exec(text)) != null) {
        input = matcher[1];
    }
    if((matcher = reValue.exec(input)) != null) {
        value = matcher[1];
    }
    return value;
}

function showYaplakalVideo(id, src) {
    var data = getHttpContent(src);
    var matcher;
    var link = getInputValue(data, 'li_code');
    reset(RE_YAPLAKAL_VIDEO_PAGE);
    if((matcher = RE_YAPLAKAL_VIDEO_PAGE.exec(link)) != null) {
        showObject(id, HINT.replace(/%id%/g, id).replace(/%text%/g, '&#160;Close') + '<br/>'
               + YAPLAKAL_VIDEO.replace(/%id%/g, id).replace(/%vid%/g, matcher[1]));
    }
}

function GeneralLinkInfo(src) {
    this.id = null;
    this.src = src;
    this.known = false;
}

function ImageLinkInfo(src) {
    this.known = true;
    this.id = 'img_' + objectID++;
    this.src = src;
    this.html = BUTTON_IMAGE.replace(/%id%/g, this.id).replace(/%src%/g, src).replace(/%title%/g, src) 
                    + OBJ_CONTAINER.replace(/%id%/g, this.id);
}

function YoutubeLinkInfo(src, vid) {
    this.known = true;
    this.id = 'video_' + objectID++;
    this.src = src;
    this.html = BUTTON_YOUTUBE_VIDEO.replace(/%id%/g, this.id).replace(/%vid%/g, vid).replace(/%title%/g, src) 
                                + OBJ_CONTAINER.replace(/%id%/g, this.id);
}

function GoogleVideoLinkInfo(src, vid) {
    this.known = true;
    this.id = 'video_' + objectID++;
    this.src = src;
    this.html = BUTTON_GOOGLE_VIDEO.replace(/%id%/g, this.id).replace(/%vid%/g, vid).replace(/%title%/g, src) 
                                + OBJ_CONTAINER.replace(/%id%/g, this.id);
}

function YaplakalLinkInfo(src) {
    this.known = true;
    this.id = 'video_' + objectID++;
    this.src = src;
    this.html = BUTTON_YAPLAKAL_VIDEO.replace(/%id%/g, this.id).replace(/%url%/g, src).replace(/%title%/g, src) 
                                + OBJ_CONTAINER.replace(/%id%/g, this.id);
}

function FlashLinkInfo(src) {
    this.known = true;
    this.id = 'flash_' + objectID++;
    this.src = src;
    this.html = BUTTON_FLASH.replace(/%id%/g, this.id).replace(/%src%/g, src).replace(/%title%/g, src) 
                                + OBJ_CONTAINER.replace(/%id%/g, this.id);
}

function getLinkInfo(linkURL) {
    var matcher;
    reset(RE_IMAGE);
    if((matcher = RE_IMAGE.exec(linkURL)) != null) {
        return new ImageLinkInfo(matcher[1]);
    }
    
    reset(RE_YOUTUBE_VIDEO);
    if((matcher = RE_YOUTUBE_VIDEO.exec(linkURL)) != null) {
        return new YoutubeLinkInfo(matcher[1], matcher[2]);
    }
    
    reset(RE_GOOGLE_VIDEO);
    if((matcher = RE_GOOGLE_VIDEO.exec(linkURL)) != null) {
        return new GoogleVideoLinkInfo(matcher[1], matcher[2]);
    }
    
    reset(RE_GOOGLE_VIDEO2);
    if((matcher = RE_GOOGLE_VIDEO2.exec(linkURL)) != null) {
        return new GoogleVideoLinkInfo(matcher[1], matcher[2]);
    }
    
    reset(RE_YAPLAKAL_VIDEO);
    if((matcher = RE_YAPLAKAL_VIDEO.exec(linkURL)) != null) {
        return new YaplakalLinkInfo(matcher[1]);
    }
    
    reset(RE_FLASH);
    if((matcher = RE_FLASH.exec(linkURL)) != null) {
        return new FlashLinkInfo(matcher[1]);
    }
    return new GeneralLinkInfo(linkURL);
}

function unescapeSpec(str) {
    return str.replace(/%3a/ig, ':').replace(/%5c/ig, '\\').replace(/%2e/ig, '.').replace(/%5f/ig, '_').replace(/%22/ig, '&quot;').replace(/%3e/ig, '&gt;').replace(/%3c/ig, '&lt;');
}

function processMessage(text) {
    text = text.replace(/<br\/?>/g, ' <br> ');
    text = stripURL(text);
    //text = unescapeSpec(text);
    text = escapeEntities(text);
    text = highlightURL(text);
    text = unescapeEntities(text);

    document.write(text);
    try {
        processLinks();
    } catch(E) {
        if(DEBUG) {
            alert(E);
        }
    }
}

function processMsg(text) {
    text = text.replace(/<br\/?>/g, ' <br> ');
    console.log(text);
    text = unescapeSpec(text);
    text = stripURL(text);
    text = escapeEntities(text);
    text = highlightURL(text);
    text = unescapeEntities(text);

    return text;
}


function processLinks() {
    var linkElements = document.getElementsByTagName('a');
    for(var i in linkElements) {
        var linkElement = linkElements[i];
        if(linkElement.href) {
            if(!linkElement.processed) {
                processLinkAsync(linkElements[i]);
                linkElement.processed = true;
                linkElement.title = decodeURI(linkElement.href);
                linkElement.innerHTML=decodeURI(linkElement.href);
            }
        }
    }
}

function processLinkAsync(linkElement) {
    setTimeout(function() {
        processLink(linkElement);
    }, timeouts.processTimeout);
}

function insertButtonLink(linkElement, linkInfo, httpInfo) {
    var container = document.createElement('span');
    container.className = 'linkContainer';
    container.innerHTML = linkInfo.html;
    insertAfter(linkElement, container);
    linkElement.title = decodeURI(httpInfo.href) + '\n' + addCommas(httpInfo.length) + ' bytes';
    //scrollToEnd();
}

function processLink(linkElement) {
    var linkInfo = getLinkInfo(linkElement.href);
    var httpInfo = getHttpInfo(linkInfo.src);
    if(linkInfo.known) {
        if(httpInfo.length) {
            insertButtonLink(linkElement, linkInfo, httpInfo);
        }
    } else {
        if(httpInfo.type.indexOf('image/') == 0) {
            linkInfo = new ImageLinkInfo(httpInfo.href);
            insertButtonLink(linkElement, linkInfo, httpInfo);
        }
    }
}

function hide(elem) {
    elem.style.display='none';
}

function show(elem) {
    elem.style.display='block';
}

function showInline(elem) {
    elem.style.display='inline';
}

function remove(elem) {
    if(elem) {
        elem.parentNode.removeChild(elem);
    }
}

function ajax(url, success) {
    if (typeof XMLHttpRequest == "undefined") {
        XMLHttpRequest = function () {
            try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
              catch (e) {}
            try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
              catch (e) {}
            try { return new ActiveXObject("Msxml2.XMLHTTP"); }
              catch (e) {}
            //Microsoft.XMLHTTP points to Msxml2.XMLHTTP.3.0 and is redundant
            throw new Error("This browser does not support XMLHttpRequest.");
        };
    }

    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState === 4 && !!xmlhttp.responseText) {
            success(xmlhttp.responseText);
        }
    };
    xmlhttp.send(null);
}

function getHttpContent(url) {
    var content;
    try {
        if(typeof(ActiveXObject) != "undefined") {
            var request = new ActiveXObject("WinHttp.WinHttprequest.5.1");
            request.setTimeouts(timeouts.resolveTimeout, 
                                timeouts.connectTimeout, 
                                timeouts.sendTimeout, 
                                timeouts.receiveTimeout);
            request.open('GET', url, true);
            request.send(null);
            request.waitForResponse(5000);
            if(request.status == 200) {
                content = request.responseText;
            }
        }
    } catch(err) {
        if(DEBUG) {
            alert(err.message);
        }
    }
    return content;
}

function getHttpInfo(url) {
    var info = {href: url, length: "unknown", type: ""};
    try {
        if(typeof(ActiveXObject) != "undefined") {
            var request = new ActiveXObject("WinHttp.WinHttprequest.5.1");
            request.setTimeouts(timeouts.resolveTimeout, 
                                timeouts.connectTimeout, 
                                timeouts.sendTimeout, 
                                timeouts.receiveTimeout);
            request.open('HEAD', url, true);
            request.send(null);
            request.waitForResponse(5000);
            if(request.status == 200) {
                try {
                    info.length = request.getResponseHeader("Content-Length");
                } catch(e) { }
                try {
                    info.type = request.getResponseHeader("Content-Type");
                } catch(e) { }
            }
        }
    } catch(err) {
        if(DEBUG) {
            alert(err.message);
        }
    }
    return info;
}

function escapeEntities(text) {
    var escaped = text;
    for(var i in ENTITIES) {
        escaped = escaped.replace(new RegExp('('+ENTITIES[i]+')', 'g'), ' -$1- ');
    }
    return escaped;
}

function unescapeEntities(text) {
    var escaped = text;
    for(var i in ENTITIES) {
        escaped = escaped.replace(new RegExp(' -('+ENTITIES[i]+')- ', 'g'), '$1');
    }
    return escaped;
}

function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var re = /(\d+)(\d{3})/;
    while (re.test(x1)) {
        x1 = x1.replace(re, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
function scrollToEnd() {
    if (document.body) {
        document.body.scrollTop = document.body.scrollHeight;
    }
}

function increaseSize(id) {
    var video = document.getElementById(id);
    video.width = video.width * 1.1;
    video.height = video.height * 1.1;
    video.lastChild.width = video.width;
    video.lastChild.height = video.height;
}

function decreaseSize(id) {
    var video = document.getElementById(id);
    video.width = video.width * 0.9;
    video.height = video.height * 0.9;
    video.lastChild.width = video.width;
    video.lastChild.height = video.height;
}


function resizeImage(img) {
    var maxWidth = img.parentNode.offsetWidth;
    var newWidth = img.width > maxWidth ? maxWidth : 'auto';
    return newWidth;
}


function insertAfter(existingNode, newNode) {
    if (existingNode.nextSibling) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    } else {
        existingNode.parentNode.appendChild(newNode);
    }
}

function reset(re) {
    re.lastIndex=0;
}