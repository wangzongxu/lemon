;(function(){
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
  var getStaticSource = function(url,suc,err) {
    if(/^file/.test(url)){ // 网页是本地运行
        err && err({
            statusText: 'can not views local file',
            status: ''
        });
        return;
    }
    var xhr = new window._XMLHttpRequest;
    xhr.open('get',url,false);
    xhr.onreadystatechange = function(){
      if(this.readyState == this.DONE){
        if(/(^2\d{2})$|304/.test(this.status)){
          suc && suc(this.responseText)
        }else{
          err && err(this);
        }
      }
    }
    xhr.send();
  }
  var random = function(){
    return (Math.random() + '').substr(2)
  }
  var hasBlob = (function() {
    return !!window.Blob
  })();
  function Lemon() {
      if(!/Mobile/.test(navigator.userAgent)){
        console.warn('Lemon must run on a mobile platform');
        return;
      };
      this.curPan = 'log-console'; // 当前面板
      this.eleStyle = {}; // console
      this.inputLog = []; // 前几次的try it out 输入
      this.xhrDetail = {}; // xhr详情存储
      this.staticSource = {} // 存储静态资源
      this.init();
  }
  Lemon.prototype = {
      init: function() {
          this.appendDom();
          this.appendStyle();
          this.bindEvent()
      },
      // 插入dom
      appendDom: function() {
        var dom = '<div id="log-container" class="log-container">\
          <a class="log-switch" href="javascript:;">lemon</a>\
          <div class="log-pannal pos-r">\
            <span class="log-detail-close hide">×</span>\
            <div class="log-detail hide"></div>\
            <div class="log-pannal-btn-par">\
              <ul class="log-pannal-btn clearfix">\
                <li id="log-console" class="fff-b"><a href="javascript:;">Console</a></li>\
                <li id="log-style"><a href="javascript:;">Style</a></li>\
                <li id="log-cookie"><a href="javascript:;">Cookie</a></li>\
                <li id="log-storage"><a href="javascript:;">Storage</a></li>\
                <li id="log-xhr"><a href="javascript:;">Xhr</a></li>\
                <li id="log-static"><a href="javascript:;">Static</a></li>\
                <li id="log-ua"><a href="javascript:;">UA</a></li>\
                <li id="log-about"><a href="javascript:;">About</a></li>\
              </ul>\
            </div>\
            <ul class="log-pannal-log">\
              <li id="log-console-pan"></li>\
              <li id="log-style-pan"></li>\
              <li id="log-cookie-pan" class="hide"></li>\
              <li id="log-storage-pan" class="hide"></li>\
              <li id="log-xhr-pan" class="hide"></li>\
              <li id="log-static-pan" class="hide"></li>\
              <li id="log-ua-pan" class="hide"></li>\
              <li id="log-about-pan" class="hide">意见和建议请到：<a style="text-decoration: underline!important;" href="https://github.com/wangzongxu/lemon/issues">ISSUES</a><br/>邮箱：308929264@qq.com</li>\
            </ul>\
            <ul class="log-pannal-bottom">\
              <li id="log-clear" class="w-20-p" data-type="log-console">\
                <a href="javascript:;">Clear</a>\
              </li>\
              <li class="p-0 w-80" data-type="log-console">\
                <input id="log-try-input" class="try-input" type="text" placeholder="  Use console.log() to output" value="">\
              </li>\
              <li id="log-style-enter" class="hide" data-type="log-style">\
                <a href="javascript:;">Enter</a>\
              </li>\
              <li id="log-style-leave" class="hide" data-type="log-style">\
                <a href="javascript:;">Leave</a>\
              </li>\
              <li id="log-style-detail" class="hide" data-type="log-style">\
                <a href="javascript:;">Detail</a>\
              </li>\
              <li id="log-storage-local" class="hide" data-type="log-storage">\
                <a href="javascript:;">local</a>\
              </li>\
              <li id="log-storage-session" class="hide" data-type="log-storage">\
                <a href="javascript:;">session</a>\
              </li>\
              <li id="log-static-css" class="hide" data-type="log-static">\
                <a href="javascript:;">Css</a>\
              </li>\
              <li id="log-static-js" class="hide" data-type="log-static">\
                <a href="javascript:;">Js</a>\
              </li>\
              <li id="log-static-img" class="hide" data-type="log-static">\
                <a href="javascript:;">Image</a>\
              </li>\
            </ul>\
          </div>\
        </div>';
        $('body').innerHTML += dom;
      },
      // 插入样式
      appendStyle: function() {
        var container = $('#log-container');
        var style = document.createElement('style');
        style.setAttribute('scoped',true);
        style.textContent = ".log-container .fff-b{  background: #fff!important}.log-container table td,.log-container table th{  border-bottom: 1px solid #CCC}.log-container .w-80{  width: 80%!important}.log-container .w-20-p{  width: calc(20% - 12px)!important}.log-container .p-0{  padding: 0!important}.log-container .w-all{  width: 100%}.log-container .log-algin-center{  position: absolute;  left: 0;  top: 0;  right: 0;  bottom: 0;  margin: auto}.log-container .clearfix:after{  display: block;  content: '';  clear: both;  width: 0;  height: 0;}.log-container .pos-r{  position: relative;}.log-container .pos-a{  position: absolute;}.log-container .c-red{  color: red!important}.log-container .c-orange{  color: orange!important}.log-container .c-green{  color: green!important}.log-container .c-blue{  color: blue!important}.log-container.hide,.log-container .hide{  display: none;}.log-action{  outline: 1px solid #FF9800!important;  background:rgba(255, 152, 0, 0.18)!important;}.log-container *{  margin: 0;  padding: 0;  font-size: 13px;  text-align: initial;  background: initial;  box-sizing: content-box;  border: initial;}.log-container table td,.log-container table th{  border-right: 1px solid #CCC}.log-container .log-pannal{  z-index: 9999998;  position: fixed;  transition: all 0.2s linear 0s;  -webkit-transition: all 0.2s linear 0s;  bottom: 0;  left: 0;  height: 40%;  min-height: 270px;  background: #fff;  width: 100%;}.log-container .log-pannal.height-0{  min-height: 0;  height: 0}.log-container ul,.log-container li{  list-style: none}.log-container .text-hide{  white-space: nowrap;  overflow: hidden;  text-overflow: ellipsis;}.log-container a,.log-container a:hover,.log-container a:target,.log-container a:visited,.log-container a:link{  text-decoration: none;  -webkit-tap-highlight-color: rgba(0,0,0,0);  tap-highlight-color: rgba(0,0,0,0);　-webkit-tap-highlight-color: transparent;  tap-highlight-color: transparent;  color:#333;}.log-container .log-pannal .log-pannal-btn,.log-container .log-pannal .log-pannal-bottom{  overflow: auto;  width: 100%;  height: 40px;  background: #F3F3F3;  border-top:1px solid #CCC;  border-bottom:1px solid #CCC;}.log-container .log-pannal .log-pannal-btn>li,.log-container .log-pannal .log-pannal-bottom>li{  float: left;  height: 100%;  line-height: 40px;  text-align: center;  padding: 0 5px;  border-right: 1px solid #CCC;  background: #F3F3F3;}.log-container .log-pannal-btn-par{  width: 100%;  overflow: auto;}.log-container .log-pannal-btn-par::scrollbar {    display: none;}.log-container .log-pannal-btn-par::-webkit-scrollbar {    display: none;}.log-container .log-pannal .log-pannal-btn{  width: 150%;  min-width: 100%;}.log-container .log-pannal .log-pannal-log{  overflow: hidden;  width: 100%;  height: calc(100% - 82px);}.log-container .log-pannal .log-detail{  overflow: auto;  /*word-wrap: break-word;*/  width: 100%;  height: 100%;  border-top: 1px solid #CCC;  background: #fff}.log-container .log-detail-close{  position: absolute;  top: 10px;  right: 10px;  line-height: 30px;  height: 30px;  font-size: 30px;  cursor:pointer}.log-container .log-pannal .log-pannal-log>li{  width: 100%;  height: 100%;  word-wrap: break-word;  overflow: auto;}.log-container .log-pannal .log-pannal-log>li#log-console-pan>p{  border-bottom: 1px solid #CCC;  line-height: 22px;  word-wrap: break-word;  overflow: auto;}.log-container .log-pannal-bottom>li .try-input{  width: calc(100vw - 45px);  height: 100%;  border:none;}.log-container .log-pannal-bottom>li>a:active{  color: #fff!important;}.log-container .log-switch{  -webkit-user-select:none;  user-select:none;  position: fixed;  display: block;  z-index: 9999999;  border-radius:10% 50% 10% 50%;  left: 80%;  top: 85%;  min-width: 40px;  width: 45px;  height: 45px;  line-height: 45px;  font-weight: bold;  background: rgb(253,228,143);  background: -webkit-linear-gradient(left top,rgb(253,228,143),rgb(246,193,52));  background: linear-gradient(left top,rgb(253,228,143),rgb(246,193,52));  box-shadow: #333 5px 5px 33px -5px;  text-align: center;}.log-container .log-switch.active{  background: rgb(176, 233, 108)!important;  box-shadow: rgb(145, 215, 63) 5px 5px 33px -5px;}";
        container.insertBefore(style, container.firstElementChild);
      },
      // 绑定事件
      bindEvent: function() {
          this.replaceNativeLog(); // 替换原生log
          this.replaceNativeError(); // 处理Error
          this.replaceHttpRequest(); // 替换XMLHttpRequest
          this.selectListener(); // 切换log面板
          this.clearListener(); // console面板清空
          this.getCookiesListener(); // 获取cookie
          this.getStorageListener(); // 获取Storage
          this.getStyleListener(); // 获取样式
          this.getStaticListener(); // 获取静态资源
          this.getUaListener(); // 获取UA
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
          on($('#log-container .log-detail-close'), 'touchend', function() {
              this.classList.add('hide');
              $('#log-container .log-detail').classList.add('hide');
              $('#log-container .log-detail').innerHTML = '';
          })
      },
      // 隐藏显示控制台
      togglePannal: function() {
          var _switch = $('.log-container .log-switch');
          var pannal = $('.log-container .log-pannal');
          var moved = false; // 是否移动了
          var movement = {
            mx: null,
            my: null
          }
          function move(e){
            if(e.changedTouches.length ==0)return;
            _switch.style.top = (e.changedTouches[0].clientY - movement.my) + 'px';
            _switch.style.left = (e.changedTouches[0].clientX - movement.mx) + 'px';
            moved = true;
          }
          function up(e){
            off(document.documentElement || document.body, 'touchmove', move);
            off(document.documentElement || document.body, 'touchend', up);
          }

          on(_switch, 'touchstart', function(e) {
            this.classList.add('active');
            if(e.touches.length ==0)return;
            e.preventDefault();
            movement.mx = e.touches[0].clientX - this.offsetLeft;
            movement.my = e.touches[0].clientY - this.offsetTop;
            on(document.documentElement || document.body, 'touchmove', move)
            on(document.documentElement || document.body, 'touchend', up)
          })

          on(_switch, 'touchend', function(e) {
            this.classList.remove('active');
            if(!moved){
              pannal.classList.toggle('height-0');
            }
            moved = false;
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

          on(select, 'touchend', function() {
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
          on($('#log-clear'), 'touchend', function() {
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
          $('#log-xhr-pan').innerHTML = this.tableBegin('URL','Status', 60, 40) + this.tableEnd();
          on($('#log-xhr-pan tbody'), 'touchend', function(e) {
              var t = e.target;
              if (t.tagName == 'TD') {
                  t = e.target.parentNode
              }
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
                      ['responseURL', 'responseType', 'timeout', 'withCredentials']
                      .forEach(function(prop) {
                          xhr.__lemon_data__[prop] = testType(xhr[prop], 'undefined') ? '' : xhr[prop];
                      })
                      // 单独处理responseText:如果返回为blob时 该属性获取会报错
                      try{
                        if(hasBlob && xhr.responseType == 'blob' && window.FileReader){
                          var r = new FileReader();
                          r.readAsText(xhr.response);
                          r.onload = function() {
                            xhr.__lemon_data__.responseText = r.result;
                          };
                          r.onerror = function(e) {
                            xhr.__lemon_data__.responseText = 'Error in FileReader :' + e;
                          };
                        }else{
                          xhr.__lemon_data__.responseText = xhr.responseText;
                        }
                      }catch(e){
                        xhr.__lemon_data__.responseText = '[ ' + xhr.responseType + ' ]';
                      }

                      // 取响应头
                      var temp = this.getAllResponseHeaders().split('\n');
                      temp.forEach(function(str) {
                          var prop = str.split(':');
                          prop[0].trim() ? xhr.__lemon_data__[prop[0]] = prop[1] : null;
                      })
                      var id = 'xhr' + random();
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
                try{ // TODO:meizu和某些浏览器会执行两次 第二次报报非法调用 原因不明
                    return window._console[type](log);
                }catch(e){}
              }
          })
      },
      // 处理Error
      replaceNativeError: function(){
        window.onerror = function (errorMsg, url, line, column, errorObj) {
            if(/Illegal invocation/i.test(errorMsg))return; // TODO:有些移动端浏览器报错
                console.error('Error: ' + errorMsg + ' Script: ' + (url || 'unknown') + ' Line: ' + line + ' Column: ' + column);
            }
      },
      // 获取样式
      getStyleListener: function() {
          var that = this;
          var canTouch = false; // 是否可触摸，已经是进入状态 不可触摸
          var curEle = null; // 当前查看的元素
          var toast = true; // 提示
          $('#log-style-pan').innerHTML = that.tableBegin('prop','value', 40, 60) + that.tableEnd();
          function event(e) {
              var t = e.target;
              var flag = false;
              do { // 不可点选控制台
                  if (t.id === 'log-container') return;
              } while (t = t.parentNode);
              e.target.classList.add('log-action');
              if(e.target != curEle){
                curEle ? curEle.classList.remove('log-action') : null;
                curEle = e.target;
              }

              var style = getComputedStyle(e.target);
              that.eleStyle = style;
              var str = '<tr><td>tagName</tb><td>' + e.target.tagName.toLowerCase() + '</td></tr>';
              ['width', 'height', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'display', 'opacity', 'zIndex', 'position', 'top', 'bottom', 'left', 'right', 'float', 'font-size', 'font-weight', 'border', 'lineHeight', 'overflow']
              .forEach(function(prop) {
                  str += '<tr><td>' + prop + '</tb><td>' + style[prop] + '</td></tr>';
              })
              $('#log-style-pan tbody').innerHTML = str
          }
          on($('#log-style-enter'), 'touchend', function() {
              if (canTouch) return;
              canTouch = true;
              if(toast){
                alert('Touch elements to watch computedStyle');
                toast = false;
              }
              on(document.documentElement || document.body, 'touchend', event)
          })
          on($('#log-style-leave'), 'touchend', function() {
              off(document.documentElement || document.body, 'touchend', event);
              curEle ? curEle.classList.remove('log-action') : null;
              canTouch = false;
          })
          on($('#log-style-detail'), 'touchend', function() {
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
        $('#log-cookie-pan').innerHTML = this.tableBegin('key','value', 40, 60) + this.tableEnd();
          on($('#log-cookie'), 'touchend', function() {
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
      // 获取storage
      getStorageListener: function() {
          $('#log-storage-pan').innerHTML = this.tableBegin('key','value', 40, 60) + this.tableEnd();
          // session
          on($('#log-storage-session'), 'touchend', function() {
              if (sessionStorage.length == 0) return;
              var str = '';
              for (var i = 0; i < sessionStorage.length; i++) {
                  var k = sessionStorage.key(i)
                  str += '<tr><td>' + k + '</tb><td>' + sessionStorage.getItem(k) + '</td></tr>';
              }
              $('#log-storage-pan tbody').innerHTML = str
          });
          // local
          on($('#log-storage-local'), 'touchend', function() {
              if (localStorage.length == 0) return;
              var str = '';
              for (var i = 0; i < localStorage.length; i++) {
                  var k = localStorage.key(i)
                  str += '<tr><td>' + k + '</tb><td>' + localStorage.getItem(k) + '</td></tr>';
              }
              $('#log-storage-pan tbody').innerHTML = str
          });
      },
      // 获取静态资源
      getStaticListener: function() {
        var that = this;
        $('#log-static-pan').innerHTML = that.tableBegin('file','url', 40, 60) + that.tableEnd();
        on($('#log-static-pan tbody'), 'touchend', function(e){
          var t = e.target;
          if(t.tagName == 'TD'){
            t = e.target.parentNode
          }
          var data = that.staticSource[t.id];
          var str = '';
          if(/^img/.test(data.id)){ // img
            str += '<img style="max-height:80%" class="log-algin-center" src="'+ data.url +'" alt="'+ data.name +'">';
          }else{ // js or css
            str += '<pre><code>';
            if(data.url == 'inline'){
            str += data.textContent.replace(/</g,'&lt;');// 防止渲染dom字符串
            }else{
                getStaticSource(data.url,function(txt){
                str += txt.replace(/</g,'&lt;');
                },function(err){
                str += '<p style="color:#CCC;font-size:30px;line-height:100px;text-align:center">'+ err.statusText + ' ' + err.status +'</p>';
                })
            }
            str += '</code></pre>'
          }
          $('#log-container .log-detail').innerHTML = str;
          $('#log-container .log-detail').classList.remove('hide');
          $('#log-container .log-detail-close').classList.remove('hide');
        })
        on($('#log-static-css'), 'touchend', function() {
          that.staticSource = {};
          var str = '';
          // handle tag link
          var links = $('link');
          links = links.length ? links : [links];
          for(var i=0;i<links.length;i++){
            var link = links[i];
            if(link.rel=='stylesheet' && link.href.trim()!=''){
              var name = /\/([^\/]+?\.css)/.exec(link.href);
              var linkObj = {
                name: name ? name[1] : ' ',
                url: link.href,
                id: 'css' + random()
              };
              str += '<tr id='+linkObj.id+' ><td>' + linkObj.name + '</tb><td>' + linkObj.url + '</td></tr>';
              that.staticSource[linkObj.id] = linkObj;
            }
          }
          // handle tag style
          var styles = $('style');
          styles = styles.length ? styles : [styles];
          for(var i=0;i<styles.length;i++){
            var style = styles[i];
            if(style.textContent.trim() != ''){ // inline
              var styleObj = {
                name: '&lt;style&gt;...&lt;/style&gt;',
                url: 'inline',
                textContent: style.textContent,
                id: 'css' + random()
              };
              str += '<tr id='+styleObj.id+' ><td>' + styleObj.name + '</tb><td>' + styleObj.url + '</td></tr>';
              that.staticSource[styleObj.id] = styleObj;
            }
          }
          $('#log-static-pan tbody').innerHTML = str;
        });

        on($('#log-static-js'), 'touchend', function() {
          that.staticSource = {};
          var str = '';
          var scripts = $('script');
          scripts = scripts.length ? scripts : [scripts];
          for(var i=0;i<scripts.length;i++){
            var script = scripts[i];
            if(script.src.trim()!=''){ // outlink
              var name = /\/([^\/]+?\.js)/.exec(script.src);
              var srcJs = {
                name: name ? name[1] : ' ',
                url: script.src,
                id: 'js' + random()
              };
              str += '<tr id='+srcJs.id+' ><td>' + srcJs.name + '</tb><td>' + srcJs.url + '</td></tr>';
              that.staticSource[srcJs.id] = srcJs;
            } else if (script.textContent.trim() != ''){
              var inlineJs = {
                name: '&lt;script&gt;...&lt;/script&gt;',
                url: 'inline',
                textContent: script.textContent,
                id: 'js' + random()
              };
              str += '<tr id='+inlineJs.id+' ><td>' + inlineJs.name + '</tb><td>' + inlineJs.url + '</td></tr>';
              that.staticSource[inlineJs.id] = inlineJs;
            }
          }
          $('#log-static-pan tbody').innerHTML = str;
        });

        on($('#log-static-img'), 'touchend', function() {
          that.staticSource = {};
          var str = '';
          var imgs = $('img');
          imgs = imgs.length ? imgs : [imgs];
          for(var i=0;i<imgs.length;i++){
            var img = imgs[i];
            var name = /\/([^\/]+?\..{1,4}$)/.exec(img.src);
            var imgObj = {
              name: name ? name[1] : 'unknown',
              url: img.src,
              id: 'img' + random()
           };
           str += '<tr id='+imgObj.id+' ><td>' + imgObj.name + '</tb><td>' + imgObj.url + '</td></tr>';
           that.staticSource[imgObj.id] = imgObj;
          }

          $('#log-static-pan tbody').innerHTML = str;
        });
      },
      // 获取UA
      getUaListener: function() {
        $('#log-ua-pan').innerHTML = this.tableBegin('prop','value', 40, 60) + this.tableEnd();
        on($('#log-ua'), 'touchend', function() {
            var na = window.navigator;
            var str = '';
            for (var k in na) {
                if (typeof na[k] === 'string') {
                    str += '<tr><td>'+ k +'</td><td>'+ na[k] +'</td></tr>';
                }
            }
            $('#log-ua-pan tbody').innerHTML = str   
        });
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
                  script.innerHTML = 'try{' + code.replace(/(^|[^.])log\(/g, ' console.log(') + ' }catch(e){if(e.message !=="Illegal invocation"){console.error(e)}}'; // TODO:移动浏览器使用try会报非法调用,暂无解决方法
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
  try{
    new Lemon();
  }catch(e){
    alert(e)
  }
})();
