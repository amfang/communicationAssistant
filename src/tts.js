/**
 * Created by jackyfang on 2018/9/11.
 */
'use strict';

var getModelId = require('./translator').getModelId;
var getLanguageName = require('./translator').getLanguageName;
var getLanguageCode = require('./translator').getLanguageCode;
var dataLangName = "";
var nmtValue  = '2018-05-01';

exports.initTTS = function () {
  var timesOfClick = 0; // 输入内容标识
  console.log("initTTS: " + timesOfClick);
  
  function getCookie(c_name) {
    if(document.cookie.length > 0) {
      console.log("cookie:"+document.cookie);
      var c_start = document.cookie.indexOf(c_name + "=");
      if(c_start != -1) {
        c_start = c_start + c_name.length + 1;
        var c_end = document.cookie.indexOf(";", c_start);
        if(c_end == -1) c_end = document.cookie.length;
        return unescape(document.cookie.substring(c_start,c_end));
      }
    }
    return "";
  }
  function getCookie1(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      console.log("cookie1:"+document.cookie);
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  //通过“回车”提交信息
  $('#homeInput').keydown(function(e) {

    //if (e.which == 13) {
    if ((e.keyCode === 13) && $.trim(this.value).length >0) {
      //输入内容标识
      timesOfClick = timesOfClick + 1;

      var sourceLangSelect = "";
      var sourceLangVoice = "";

      var translatorModels = require('./data/models.json').models;
      //console.log("translatorModels length:"+translatorModels.length+" -- "+translatorModels);

      //设置语音输入类型对应translator类型
      //var valueCompare = "";
      var selectedSTTName = $.trim($('#dropdownMenu1').text());
      //console.log("对应1："+selectedSTTName);
      selectedSTTName = selectedSTTName.substring(0, selectedSTTName.indexOf("(") - 1) + ".";
      //console.log("对应2："+selectedSTTName);
      for (var i = 0; i < translatorModels.length; i++) {
        //console.log(translatorModels[i]);
        //console.log("对应："+selectedSTTName + " -- " + translatorModels[i].description + " -- " + translatorModels[i].translator);
        if (selectedSTTName == translatorModels[i].description) {
          sourceLangSelect = translatorModels[i].translator;
          sourceLangVoice = translatorModels[i].voice;
        }
      }

      // 声音语言不支持
      if(sourceLangVoice.length == 0){
        if($('#inputDescription').html() == 'Inputs Auto Detecting...'){
          $('#inputDescription').html($('#inputDescription').html() + 'Voice not support, voice in English');
        }
        sourceLangSelect = "English";
        sourceLangVoice = "en-US_LisaVoice";
      }else{
        $('#inputDescription').html('Inputs Auto Detecting...');
      }

      var contentDiv = '<div name="input_info" class="input_info">'+this.value+'<span name="audio_progress" class="progress_bar" style="width: 0%;"></span></div>';
      var audioDiv = '<span class="audio_icon">' +
        '<audio src="" name="media" width="1" height="1"></audio>' +
        '<span name="audio_area" class="db audio_area">' +
        '<span class="audio_wrp db">' +
        '<span class="audio_play_area">' +
        '<i class="icon_audio_default"></i>' +
        '<i class="icon_audio_playing"></i>' +
        '</span></span>' +
        '<span class="voice_identification" name="voice_identification" title="This is testing">English</span>' +
        '</span></span>'

      var section = document.createElement('section');
      section.className = 'user';
      section.innerHTML =  contentDiv + audioDiv;

      $('#resultsText').append(section);

      //设置对话条目以及语音播放，并返回当前对象
      var obj = voiceAudio({
        sectionNo: timesOfClick - 1,
        autoplay: false,
        src: "",
      });

      var inputText = this.value;
      console.log("csrftoken: "+getCookie("csrftoken"));
      console.log("csrftoken1: "+getCookie1("csrftoken"));

      //检测输入文字语言
      var languageIdentifyCall = {
        type: 'POST',
        url: '/api/identify',
        headers: {
          'X-Watson-Technology-Preview': nmtValue
        },
        data: {
          text: inputText
        },
        async: true
      };

      $.ajax(languageIdentifyCall)
        .done(function (data) {
          //console.log(data + "  data " + langAbbrevList[data]);
          var langIdentified = false;
          //console.log("detected language code is " + data);
          data = data.languages[0].language;
          dataLangName = getLanguageName(data);
          console.log("dataLangName: " + dataLangName);
          //voice_identification
          obj.voice_identification.innerText = sourceLangSelect;
          obj.input_info = inputText;

          //判断输入语言和输出需要的语言
          if(dataLangName != sourceLangSelect){
            // 目标和源都不是English，需要转换2次
            if(dataLangName != "English" && sourceLangSelect != "English"){
              //Translator到English
              var textContent = inputText;
              console.log("textContent: "+textContent);

              // get model_id from domain, source and target
              var pageDomain = "general";
              var source = getLanguageCode(dataLangName);
              var target = "en";
              var model_id = getModelId(pageDomain, source, target);
              console.log(' --- source-' + source + '  target-' + target + '   textContent-' + textContent);
              if (pageDomain && source && target && textContent && model_id) {
                console.log('source-' + source + '  target-' + target + '   textContent-' + textContent);

                // Create call for AJAX and to populate REST API tab
                var callData = {
                  model_id: model_id,
                  text: textContent
                };

                var restAPICall = {
                  type: 'POST',
                  url: '/api/translate',
                  data: callData,
                  dataType: 'json',
                  headers: {
                    'X-WDC-PL-OPT-OUT': $('input:radio[name=serRadio]:radio:checked').val(),
                    'X-Watson-Technology-Preview': nmtValue
                  },
                  async: true
                };

                $.ajax(restAPICall)
                  .done(function (data) {
                    var textContent = data['translations'][0]['translation'];

                    // English Translator到sourceLangSelect
                    console.log("textContent: "+textContent);

                    // get model_id from domain, source and target
                    var pageDomain = "general";
                    var source = "en";
                    var target = getLanguageCode(sourceLangSelect);
                    var model_id = getModelId(pageDomain, source, target);
                    console.log(' --- source-' + source + '  target-' + target + '   textContent-' + textContent);
                    if (pageDomain && source && target && textContent && model_id) {
                      console.log('source-' + source + '  target-' + target + '   textContent-' + textContent);

                      // Create call for AJAX and to populate REST API tab
                      var callData = {
                        model_id: model_id,
                        text: textContent
                      };

                      var restAPICall = {
                        type: 'POST',
                        url: '/api/translate',
                        data: callData,
                        dataType: 'json',
                        headers: {
                          'X-WDC-PL-OPT-OUT': $('input:radio[name=serRadio]:radio:checked').val(),
                          'X-Watson-Technology-Preview': nmtValue
                        },
                        async: true
                      };

                      $.ajax(restAPICall)
                        .done(function (data) {
                          var translatedValue = data['translations'][0]['translation'];
                          obj.translated_info = translatedValue;

                          // 转换为目标语音
                          //var serverUrl = "http://127.0.0.1:3006/api/synthesize?";
                          var serverUrl = "/api/synthesize?";
                          var params = "text=" + translatedValue + "&voice=" + sourceLangVoice + "&download=true";
                          fetch(serverUrl+params).then(function(response) {
                            if (response.ok) {
                              response.blob().then(function(blob) {
                                var url = window.URL.createObjectURL(blob);
                                obj.Audio.setAttribute('src', url);
                                obj.audio_area.classList.remove("hidden");
                                console.log(url);
                                obj.Audio.setAttribute('type', 'audio/ogg;codecs=opus');
                              });
                            } else {
                              response.json().then(function(json) {
                                console.log("error: "+JSON.stringify(json));
                              });
                            }
                          });
                        })
                        .fail(function (jqXHR, statustext, errorthrown) {
                          $('#homeOutput2 textarea').val('translation error');
                          console.log(statustext + errorthrown);
                        });
                    } else {
                      console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
                    }
                  })
                  .fail(function (jqXHR, statustext, errorthrown) {
                    $('#homeOutput2 textarea').val('translation error');
                    console.log(statustext + errorthrown);
                  });
              } else {
                console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
              }
            }else{

              var textContent = inputText;

              // English 和其他语言相互 Translator
              console.log("textContent: "+textContent);
              var pageDomain = "general";
              var source = "";
              var target = "";
              if(dataLangName == "English"){
                source = "en";
              }else{
                source = getLanguageCode(dataLangName);
              }
              if(sourceLangSelect == "English"){
                target = "en";
              }else{
                target = getLanguageCode(sourceLangSelect);
              }

              // get model_id from domain, source and target
              var model_id = getModelId(pageDomain, source, target);
              console.log(' --- source-' + source + '  target-' + target + '   textContent-' + textContent);
              if (pageDomain && source && target && textContent && model_id) {
                console.log('source-' + source + '  target-' + target + '   textContent-' + textContent);

                // Create call for AJAX and to populate REST API tab
                var callData = {
                  model_id: model_id,
                  text: textContent
                };

                var restAPICall = {
                  type: 'POST',
                  url: '/api/translate',
                  data: callData,
                  dataType: 'json',
                  headers: {
                    'X-WDC-PL-OPT-OUT': $('input:radio[name=serRadio]:radio:checked').val(),
                    'X-Watson-Technology-Preview': nmtValue
                  },
                  async: true
                };

                $.ajax(restAPICall)
                  .done(function (data) {
                    var translatedValue = data['translations'][0]['translation'];
                    obj.translated_info = translatedValue;

                    // 转换为目标语音
                    //var serverUrl = "http://127.0.0.1:3006/api/synthesize?";
                    var serverUrl = "/api/synthesize?";
                    var params = "text=" + translatedValue + "&voice=" + sourceLangVoice + "&download=true";
                    fetch(serverUrl+params).then(function(response) {
                      if (response.ok) {
                        response.blob().then(function(blob) {
                          var url = window.URL.createObjectURL(blob);
                          obj.Audio.setAttribute('src', url);
                          obj.audio_area.classList.remove("hidden");
                          console.log(url);
                          obj.Audio.setAttribute('type', 'audio/ogg;codecs=opus');
                        });
                      } else {
                        response.json().then(function(json) {
                          console.log("error: "+JSON.stringify(json));
                        });
                      }
                    });
                  })
                  .fail(function (jqXHR, statustext, errorthrown) {
                    $('#homeOutput2 textarea').val('translation error');
                    console.log(statustext + errorthrown);
                  });
              } else {
                console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
              }
            }
            //如果输入/输出相同时,直接进行语音转换
          }else{
            var translatedValue = inputText;
            obj.translated_info = translatedValue;

            // 转换为目标语音
            //var serverUrl = "http://127.0.0.1:3006/api/synthesize?";
            var serverUrl = "/api/synthesize?";
            var params = "text=" + translatedValue + "&voice=" + sourceLangVoice + "&download=true";
            fetch(serverUrl+params).then(function(response) {
              if (response.ok) {
                response.blob().then(function(blob) {
                  var url = window.URL.createObjectURL(blob);
                  obj.Audio.setAttribute('src', url);
                  obj.audio_area.classList.remove("hidden");
                  console.log(url);
                  obj.Audio.setAttribute('type', 'audio/ogg;codecs=opus');
                });
              } else {
                response.json().then(function(json) {
                  console.log("error: "+JSON.stringify(json));
                });
              }
            });
          }

        })
        .fail(function (jqXHR, statustext, errorthrown) {
          console.log(statustext + errorthrown);
        });

      this.value = "";
    }
  });

  /*
  if (window.event.keyCode==13)
    window.event.keyCode=0; //这样就取消回车键了
  */

  function voiceAudio(options) {

    var defaultoptions = {
      sectionNo: 0,
      autoplay: false,
      src: '',
    };

    var settings = $.extend(true, defaultoptions, options);
    var input_info = "";
    var translated_info = "";

    //设置对象
    var userElement = $('#resultsText');
    var sectionElement = userElement.children('.user')[settings.sectionNo];
    //console.log(userElement.find('#media'));
    var Audio = userElement.find('[name="media"]')[settings.sectionNo];
    var audio_area = userElement.find('[name="audio_area"]')[settings.sectionNo];
    var audio_progress = userElement.find('[name="audio_progress"]')[settings.sectionNo];
    var voice_identification = userElement.find('[name="voice_identification"]')[settings.sectionNo];
    var input_info_span = userElement.find('[name="input_info"]')[settings.sectionNo];
    //console.log("currentObj:"+Audio);
    var currentObj = {
      Audio: Audio,
      audio_area: audio_area,
      audio_progress: audio_progress,
      voice_identification: voice_identification,
      input_info_span: input_info_span,
      input_info: input_info,
      translated_info: translated_info,
      currentState: 'pause',
      time: null,
      settings: settings,
    }

    //console.log("currentObj:"+currentObj.Audio);
    //console.log("audio_area: "+currentObj.audio_area);

    init(currentObj);

    return currentObj;
  }

  function init(currentObj) {
    var obj = currentObj;
    //console.log(currentObj);

    obj.audio_area.classList.add("hidden");

    obj.audio_area.onclick = function() {
      //console.log("audio_area.click");
      play(obj);
    };

    // 设置src - 放到Watson 返回处理
    // if(obj.settings.src !== ''){
    //   //console.log("Audio: "+obj.Audio);
    //   obj.Audio.src = obj.settings.src;
    // }

    //console.log("sectionNo: "+obj.settings.sectionNo);
    //console.log("autoplay: "+obj.settings.autoplay);

    // 设置自动播放
    if(obj.settings.autoplay){
      //console.log("autoplay");
      play(obj);
    }
  }

  function play(obj) {
    //console.log("play");
    obj.input_info_span.childNodes[0].textContent = obj.translated_info;
    if (obj.Audio.currentState === "play") {
      pause(obj);
      return;
    }
    obj.Audio.play();
    clearInterval(obj.timer);
    obj.timer = setInterval(run.bind(obj), 50);
    obj.currentState = "play";
    //console.log(obj.audio_area);
    obj.audio_area.classList.add('playing');
  }

  function pause(obj) {
    obj.Audio.pause();
    obj.Audio.currentState = "pause";
    clearInterval(obj.timer);
    obj.audio_area.classList.remove('playing');
    obj.input_info_span.childNodes[0].textContent = obj.input_info;
  }

  function stop(){

  }
  //正在播放
  function run() {
    //console.log(this.audio_progress);
    animateProgressBarPosition(this);
    if (this.Audio.ended) {
      pause(this);
    }
  }
  //进度条
  function animateProgressBarPosition(obj) {
    var percentage = (obj.Audio.currentTime * 100 / obj.Audio.duration) + '%';
    //console.log(percentage);
    if (percentage == "NaN%") {
      percentage = 0 + '%';
    }
    var styles = 'width: ' + percentage;
    obj.audio_progress.style.cssText = styles;
    //console.log(obj.audio_progress.style.cssText);
  }
}
