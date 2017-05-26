var testType = function(target, type) {
    return Object.prototype.toString.call(target).match(type) !== null
}
var $ = function(selector) {
    var eles = document.querySelectorAll(selector);
    var len = eles.length;
    if (len > 0) {
        return eles.length > 1 ? eles : eles[0];
    }
    return null
}
var on = function(eles, type, fn) {
    if (eles.length) {
        for (var i = 0; i < eles.length; i++) {
            eles[i].addEventListener(type, fn, false);
        }
        return;
    }
    eles.addEventListener(type, fn, false);
}
var off = function(eles, type, fn) {
    if (eles.length) {
        for (var i = 0; i < eles.length; i++) {
            eles[i].removeEventListener(type, fn, false);
        }
        return;
    }
    eles.removeEventListener(type, fn, false);
}

function Lemon() {
    this.curPan = 'log-console'; // 当前面板
    this.eleStyle = {}; // console
    this.inputLog = []; // 前几次的try it out 输入
    this.xhrDetail = {}; // xhr详情存储
    this.init();
}
Lemon.prototype = {
    init: function() {
        this.bindEvent()
    },
    // 绑定事件
    bindEvent: function() {
        this.replaceNativeLog(); // 替换原生log
        this.replaceHttpRequest(); // 替换XMLHttpRequest
        this.selectListener(); // 切换log面板
        this.clearListener(); // console面板清空
        this.getCookiesListener(); // 获取cookie
        this.getLocalListener(); // 获取localStorage
        this.getSessionListener(); // 获取sessionStorage
        this.getStyleListener(); // 获取样式
        this.getCssListener(); // 获取静态资源[css]
        this.getJsListener(); // 获取静态资源[js]
        this.togglePannal(); // 隐藏或显示控制台
        this.detailClose(); // 关闭详情面板
        this.tryItOut(); // 输出js功能
    },
    // 表格开始字符串
    tableBegin: function(keyName, valName, keyWidth, valWidth) {
        return '<table class="w-all">\
                <col width="' + keyWidth + '%">\
                <col width="' + valWidth + '%">\
                <thead>\
                  <th>' + keyName + '</th>\
                  <th>' + valName + '</th>\
                </thead>\
                <tbody>';
    },
    // 表格结束字符串
    tableEnd: function() {
        return '</tbody></table>';
    },
    // 关闭详情面板
    detailClose: function() {
        on($('#log-container .log-detail-close'), 'click', function() {
            this.classList.add('hide');
            $('#log-container .log-detail').classList.add('hide');
            $('#log-container .log-detail').innerHTML = '';
        })
    },
    // 隐藏显示控制台
    togglePannal: function() {
        on($('.log-container .log-switch'), 'click', function(e) {
            $('.log-container .log-pannal').classList.toggle('hide')
        })
    },
    // 切换面板
    selectListener: function() {
        var that = this;
        var pannals = $('.log-pannal-log>li');
        var select = $('.log-pannal-btn>li');

        // 计算按钮栏长度
        var total = [].reduce.call(select, function(cur, next) {
            return cur + parseFloat(getComputedStyle(next).width) + 11;
        }, 1);
        $('.log-pannal-btn').style.width = total + 'px';

        on(select, 'click', function() {
            for (var i = 0; i < pannals.length; i++) {
                pannals[i].classList.add('hide');
                select[i].classList.remove('fff-b');
            }
            that.curPan = this.id;
            $('#' + that.curPan + '-pan').classList.remove('hide');
            this.classList.add('fff-b');

            var bottomBtn = $('.log-pannal-bottom>li');
            for (var k = 0; k < bottomBtn.length; k++) {
                if (bottomBtn[k].dataset.type == that.curPan) {
                    bottomBtn[k].classList.remove('hide')
                } else {
                    bottomBtn[k].classList.add('hide')
                }
            }
        })
    },
    // 清空console面板
    clearListener: function() {
        var that = this;
        on($('#log-clear'), 'click', function() {
            $('#log-console-pan').innerHTML = '';
        })
    },
    // 渲染log面板
    renderLog: function(data) {
        var className = 'c-black';
        switch (data.type) {
            case 'warn':
                className = 'c-orange'
                break;
            case 'error':
                className = 'c-red'
                break;
            case 'info':
                className = 'c-blue'
        }
        var el = document.createElement('p');
        if (data.log instanceof Error) { // 捕获错误
            el.innerHTML = data.log.name + ' : ' + data.log.message;
        } else { // 是否对象
            el.innerHTML = typeof data.log == 'object' ?
                '<pre><code>' + JSON.stringify(data.log, false, 2) + '</code></pre>' :
                '<pre><code>' + data.log + '</code></pre>';
        }
        el.className = className;
        $('#log-console-pan').appendChild(el);
        $('#log-console-pan').scrollTop = $('#log-console-pan').scrollHeight;
    },
    // 处理xhr
    replaceHttpRequest: function() {
        var that = this;
        on($('#log-xhr-pan'), 'click', function(e) {
            var t = e.target;
            if (t.tagName == 'TD') {
                t = e.target.parentNode
            } else if (!/^xhr/.test(t.id)) {
                return
            };
            var data = that.xhrDetail[t.id]
            var str = that.tableBegin('prop', 'value', 40, 60);
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    str += '<tr><td>' + prop + '</tb><td>' + data[prop] + '</td></tr>';
                }
            }
            str += that.tableEnd();
            $('#log-container .log-detail').innerHTML = str;
            $('#log-container .log-detail').classList.remove('hide');
            $('#log-container .log-detail-close').classList.remove('hide');
        })

        window._XMLHttpRequest = window.XMLHttpRequest;

        function XMLHttpRequest() {
            var err = 'Uncaught TypeError: Failed to construct "XMLHttpRequest": Please use the "new" operator, this DOM object constructor cannot be called as a function.';
            if (!(this instanceof XMLHttpRequest)) {
                console.error(err);
                throw new Error(err);
            }
            var xhr = new window._XMLHttpRequest;
            // 存储数据
            xhr.__lemon_data__ = {};
            // 状态
            xhr.addEventListener('readystatechange', function() {
                if (this.readyState == this.DONE) {
                    var reg = /(^2\d{2})$|304/;
                    var color = 'c-red';
                    if (reg.test(this.status)) {
                        color = 'c-green';
                    } else {
                        console.error(this.__lemon_data__.method.toUpperCase() + '     ' + this.__lemon_data__.requestUrl + '     ' + this.status)
                    }
                    // 取几个常用的
                    ['responseURL', 'responseType', 'responseText', 'timeout', 'responseXML', 'withCredentials']
                    .forEach(function(prop) {
                        xhr.__lemon_data__[prop] = xhr[prop]
                    })
                    // 取响应头
                    var temp = this.getAllResponseHeaders().split('\n');
                    temp.forEach(function(str) {
                        var prop = str.split(':');
                        prop[0].trim() ? xhr.__lemon_data__[prop[0]] = prop[1] : null;
                    })
                    var id = 'xhr' + Date.now();
                    that.xhrDetail[id] = this.__lemon_data__;
                    var str = '<tr id="' + id + '"><td>' + this.__lemon_data__.requestUrl + '</tb><td class="' + color + '">' + this.status + ' ' + this.statusText + '</td></tr>';
                    $('#log-xhr-pan tbody').innerHTML += str;
                }
            });
            // 请求方式
            xhr._open = xhr.open;
            xhr.open = function() {
                var props = ['method', 'requestUrl', 'async', 'username', 'password'];
                for (var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    arguments[i] !== undefined ? xhr.__lemon_data__[prop] = arguments[i] : null;
                }
                return this._open.apply(this, arguments)
            }
            // 请求头
            xhr._setRequestHeader = xhr.setRequestHeader;
            xhr.setRequestHeader = function(key, val) {
                xhr.__lemon_data__[key] = val;
                return xhr._setRequestHeader(key, val);
            }
            // 请求体
            xhr._send = xhr.send;
            xhr.send = function(data) {
                var log = typeof data === 'object' ?
                    JSON.stringify(data) :
                    data;
                xhr.__lemon_data__.body = log || null;

                return xhr._send(data)
            }
            return xhr;
        }

        XMLHttpRequest.prototype = window._XMLHttpRequest.prototype;
        window.XMLHttpRequest = XMLHttpRequest;
    },
    // 处理console
    replaceNativeLog: function() {
        var that = this;
        window._console = {};
        ['log', 'error', 'warn', 'info', 'dir'].forEach(function(type) {
            window._console[type] = window.console[type];
            window.console[type] = function(log) {
                that.renderLog({
                    type: type,
                    log: log
                });
                try {
                    return window._console[type](log);
                } catch (e) {}
            }
        })
    },
    // 获取样式
    getStyleListener: function() {
        var that = this;
        // TODO 拼接表格减少dom
        function event(e) {
            var t = e.target;
            var flag = false;
            do { // 不可点选控制台
                if (t.id === 'log-container') return;
            } while (t = t.parentNode)

            var style = getComputedStyle(e.target);
            that.eleStyle = style;
            var str = '<tr><td>tagName</tb><td>' + e.target.tagName.toLowerCase() + '</td></tr>';
            ['width', 'height', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'display', 'opacity', 'zIndex', 'position', 'top', 'bottom', 'left', 'right', 'float', 'font-size', 'font-weight', 'border', 'lineHeight', 'overflow']
            .forEach(function(prop) {
                str += '<tr><td>' + prop + '</tb><td>' + style[prop] + '</td></tr>';
            })
            $('#log-style-pan tbody').innerHTML = str
        }
        on($('#log-style-enter'), 'click', function() {
            if (document.__lemonGetStyle__) return;
            document.__lemonGetStyle__ = true;
            on(document.documentElement || document.body, 'click', event)
        })
        on($('#log-style-leave'), 'click', function() {
            off(document.documentElement || document.body, 'click', event)
        })
        on($('#log-style-detail'), 'click', function() {
            var str = that.tableBegin('prop', 'value', 40, 60);
            for (var prop in that.eleStyle) {
                if (that.eleStyle.hasOwnProperty(prop) && isNaN(prop * 1) && prop !== 'cssText') {
                    str += '<tr><td>' + prop + '</tb><td>' + that.eleStyle[prop] + '</td></tr>';
                }
            }
            str += that.tableEnd();
            $('#log-container .log-detail').innerHTML = str;
            $('#log-container .log-detail').classList.remove('hide');
            $('#log-container .log-detail-close').classList.remove('hide');
        })
    },
    // 获取cookie
    getCookiesListener: function() {
        on($('#log-cookie'), 'click', function() {
            if (document.cookie === '') return;
            var arr = document.cookie.split('; ');
            var str = '';
            arr.forEach(function(item) {
                var kv = item.split('=');
                str += '<tr><td>' + kv[0] + '</tb><td>' + kv[1] + '</td></tr>';
            })
            $('#log-cookie-pan tbody').innerHTML = str
        })
    },
    // 获取session
    getSessionListener: function() {
        on($('#log-session'), 'click', function() {
            if (sessionStorage.length == 0) return;
            var str = '';
            for (var i = 0; i < sessionStorage.length; i++) {
                var k = sessionStorage.key(i)
                str += '<tr><td>' + k + '</tb><td>' + sessionStorage.getItem(k) + '</td></tr>';
            }
            $('#log-session-pan tbody').innerHTML = str
        })
    },
    // 获取localstorage
    getLocalListener: function() {
        on($('#log-local'), 'click', function() {
            if (localStorage.length == 0) return;
            var str = '';
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i)
                str += '<tr><td>' + k + '</tb><td>' + localStorage.getItem(k) + '</td></tr>';
            }
            $('#log-local-pan tbody').innerHTML = str
        })
    },
    // 获取静态资源[css]
    getCssListener: function() {
        on($('#log-css'), 'click', function() {

        })
    },
    // 获取静态资源[js]
    getJsListener: function() {
        on($('#log-js'), 'click', function() {

        })
    },
    // try it out
    tryItOut: function() {
        var that = this;
        var logIndex = 0;
        on($('#log-try-input'), 'keyup', function(e) {
            var code = e.target.value;
            if (e.keyCode == 13) {
                if (code.trim() === '') return;
                logIndex = 0;
                that.inputLog.push(code);

                var script = document.createElement('script');
                script.async = false;
                script.type = "text/javascript";
                script.innerHTML = 'try{' + code.replace(/(^|[^.])log\(/g, ' console.log(') + ' }catch(e){if(e.message !=="Illegal invocation"){alert(e.message)}}'; // 移动浏览器使用try会报非法调用,暂无解决方法
                document.body.appendChild(script);

                setTimeout(function() {
                    document.body.removeChild(script);
                })
                e.target.value = '';
                return;
            }
            if (e.keyCode == 38) { // up
                if (logIndex >= that.inputLog.length) return;
                logIndex++;
            } else if (e.keyCode == 40) { // down
                logIndex--;
            } else {
                return
            }
            var val = that.inputLog[that.inputLog.length - logIndex]
            if (val !== undefined) {
                e.target.value = val;
            } else {
                logIndex = 0;
                e.target.value = '';
            }
        })
    }
}
new Lemon();
