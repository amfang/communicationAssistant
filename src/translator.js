/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * -- Updated From language-translator-nodejs/demo.js
 */
'use strict';

var modelList = [];
var pageDomain = '';
var sourceList = [];
var sourceLangSelect = 'Choose Language';
var sourceLangSelect2 = 'Choose Language'; //添加第二次翻译使用的源
var langAbbrevList = [];
var nmtValue  = '2018-05-01';

// Lang Service - Start - This set send request for lang service to detect language
// setup timer value for function
var typingTimer; //timer identifier
var typingTimer2; //timer identifier 添加第二次翻译使用的定时器
var doneTypingInterval = 1000; //time in ms, 1 second

// 添加已经输入内容缓存，对已经处理的就不再处理了
var lastTextContent = '';
var lastTextContent1 = '';
var lastTextContent2 = '';

/* -------------------------------- Functions start from here ---------------------------------------- */

// user is "finished typing," send for service request
function doneTyping() {
  console.log('done typing - ' + $('#home2 textarea').val() + ' SourceLangSelect ' + sourceLangSelect.toLowerCase());
  // if option selected for dropdown is detect or choose language then send request for service to get lang-id
  if (((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) && (parseInt($('#home2 textarea').val().length) > 0)) {
    // Create call for AJAX and to get Lang-Id for text
    var restAPICall = {
      type: 'POST',
      url: '/api/identify',
      headers: {
        'X-Watson-Technology-Preview': nmtValue
      },
      data: {
        text: $('#home2 textarea').val()
      },
      async: true
    };
    //dropdownMenu1
    //var oldSrcLang = $('#dropdownMenuInput').html();
    var oldSrcLang = $('#dropdownMenu1').html();
    //$('#dropdownMenuInput').html('detecting language...');
    $('#dropdownMenu1').html('detecting language...');
    $.ajax(restAPICall)
      .done(function (data) {
        //console.log(data + "  data " + langAbbrevList[data]);
        var langIdentified = false;
        //console.log("detected language code is " + data);
        data = data.languages[0].language;
        var dataLangName = exports.getLanguageName(data);
        //console.log("detected language as " + dataLangName);
        $.each(sourceList, function (index, value) {
          //console.log(value.source + ' source value ' +  exports.getLanguageName(data));
          if (value.source == dataLangName) {
            langIdentified = true;
          }
        });

        if (langIdentified) {
          //console.log('lang identified');
          // If souce lang is same as identified land then add in dropdown Input menu
          //dropdownMenu1
          //$('#dropdownMenuInput').html('').html(dataLangName + ' <span class="caret"></span>');
          $('#dropdownMenu1').html('').html(dataLangName + ' <span class="caret"></span>');
        } else {
          //console.log('lang not identified');
          //dropdownMenu1
          //$('#dropdownMenuInput').html('').html(dataLangName + ': not supported for this domain <span class="caret"></span>');
          $('#dropdownMenu1').html('').html(dataLangName + ': not supported for this domain <span class="caret"></span>');
        }
        // update outputDropDown only when the detected source changed
        //dropdownMenu1
        //if (oldSrcLang != $('#dropdownMenuInput').html())
        if (oldSrcLang != $('#dropdownMenu1').html())
          updateOutputDropdownMenu();
        getTranslation();
      })
      .always(function () {
        getTranslation();
      })
      .fail(function (jqXHR, statustext, errorthrown) {
        //dropdownMenu1
        //$('#dropdownMenuInput').html(oldSrcLang);
        $('#dropdownMenu1').html(oldSrcLang);
        console.log(statustext + errorthrown);
      });
  } else {
    //console.log('gettranslation  not in if');
    getTranslation();
  }
}
function doneTyping2() {
  console.log('done typing - ' + $('#homeOutput textarea').val() + ' SourceLangSelect2 ' + sourceLangSelect2.toLowerCase());
  // if option selected for dropdown is detect or choose language then send request for service to get lang-id
  if (((sourceLangSelect2.toLowerCase() === 'detect language') || (sourceLangSelect2.toLowerCase() === 'choose language')) && (parseInt($('#homeOutput textarea').val().length) > 0)) {
    // Create call for AJAX and to get Lang-Id for text
    var restAPICall = {
      type: 'POST',
      url: '/api/identify',
      headers: {
        'X-Watson-Technology-Preview': nmtValue
      },
      data: {
        text: $('#homeOutput textarea').val()
      },
      async: true
    };
    //dropdownMenu1
    //var oldSrcLang = $('#dropdownMenuInput').html();
    var oldSrcLang = $('#dropdownMenuOutput').html();
    //$('#dropdownMenuInput').html('detecting language...');
    $('#dropdownMenuOutput').html('detecting language...');
    $.ajax(restAPICall)
      .done(function (data) {
        //console.log(data + "  data " + langAbbrevList[data]);
        var langIdentified = false;
        //console.log("detected language code is " + data);
        data = data.languages[0].language;
        var dataLangName = exports.getLanguageName(data);
        //console.log("detected language as " + dataLangName);
        $.each(sourceList, function (index, value) {
          //console.log(value.source + ' source value ' +  exports.getLanguageName(data));
          if (value.source == dataLangName) {
            langIdentified = true;
          }
        });

        if (langIdentified) {
          //console.log('lang identified');
          // If souce lang is same as identified land then add in dropdown Input menu
          //dropdownMenu1
          //$('#dropdownMenuInput').html('').html(dataLangName + ' <span class="caret"></span>');
          $('#dropdownMenuOutput').html('').html(dataLangName + ' <span class="caret"></span>');
        } else {
          //console.log('lang not identified');
          //dropdownMenu1
          //$('#dropdownMenuInput').html('').html(dataLangName + ': not supported for this domain <span class="caret"></span>');
          $('#dropdownMenuOutput').html('').html(dataLangName + ': not supported for this domain <span class="caret"></span>');
        }
        // update outputDropDown only when the detected source changed
        //dropdownMenu1
        //if (oldSrcLang != $('#dropdownMenuInput').html())
        if (oldSrcLang != $('#dropdownMenuOutput').html())
          updateOutputDropdownMenu2();
        getTranslation2();
      })
      .always(function () {
        getTranslation2();
      })
      .fail(function (jqXHR, statustext, errorthrown) {
        //dropdownMenu1
        //$('#dropdownMenuInput').html(oldSrcLang);
        $('#dropdownMenuOutput').html(oldSrcLang);
        console.log(statustext + errorthrown);
      });
  } else {
    //console.log('gettranslation  not in if');
    getTranslation2();
  }
}

// get Language Name from abbreviation
exports.getLanguageName = function (langAbbrev) {
//function getLanguageName(langAbbrev) {
  // the /models endpoint doesn't include names, and the /identifiable_languages endpoint doesn't include Egyptian Arabic
  // so it's hard-coded for now
  if (langAbbrev === 'arz') {
    return 'Egyptian Arabic';
  }
  if (langAbbrev === 'zht') {
    return 'Traditional Chinese';
  }
  if (langAbbrev === 'ca') {
    return 'Catalan';
  }
  var test = langAbbrevList;
  for (var i = 0; i < test.length; i++) {
    //console.log ('length ' + langAbbrev.length);
    var langString = (langAbbrev.length == 2) ? test[i].language.substring(0, 2) : test[i].language;
    //console.log(langString + '   ggg   ' + langAbbrev);
    if (langString == langAbbrev) {
      //console.log('   return   ' + test[i].name);
      return test[i].name;
    }
  }
  return langAbbrev;
};

// get abbreviation of language from Name
exports.getLanguageCode = function (langName) {
//function getLanguageCode(langName) {
  // the /models endpoint doesn't include names, and the /identifiable_languages endpoint doesn't include Egyptian Arabic and Catalan
  // so it's hard-coded for now
  if (langName === 'Egyptian Arabic') {
    return 'arz';
  }
  if (langName === 'Catalan') {
    return 'ca';
  }
  var test = langAbbrevList;
  for (var i = 0; i < test.length; i++) {
    //console.log(test[i].name + '  dd   '+ langName);
    if (test[i].name == langName) {
      return test[i].language;
    }
  }
  return langName;
};

// 取消
// Fill in dropdown menu
function fillInDropdown(ulName) {
  console.log("fillInDropdown:"+ulName);
  $.each(sourceList, function (index, value) {
    var exists = false;
    // Look for source value in drop down list
    $('#' + ulName).find('a').each(function() {
      if ($(this).text() == value.source) {
        exists = true;
        return false;  // exit the loop when match is found
      }
    });
    // Create new list item if source value was not in select list
    if (!exists) {
      $('#' + ulName).append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.source + '</a></li>');
    }
    else {
      console.log(value.source,'source lang already exist in li list');
    }
  });
}

// 更新Translator 输出语言选择 - 需要和Speech-to-text关联
function updateOutputDropdownMenu() {
  console.log("updateOutputDropdownMenu :"+sourceList.length);
  var exists;
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
    }
  }
  //console.log(sourceLangSelect);

  $('#ulTargetLang').html('');
  $('#dropdownMenuOutput').html('').html('Choose Language <span class="caret"></span>');

  // Update output dropdown menu with target language
  $.each(sourceList, function (index, value) {
    //console.log("value.source:"+value.source);
    //console.log("#dropdownMenu1.text:"+$.trim($('#dropdownMenu1').text()));
    //dropdownMenu1
    //if (value.source == $.trim($('#dropdownMenuInput').text())) {
    //if (value.source == $.trim($('#dropdownMenu1').text())) {
    if (value.source == sourceLangSelect) {
      exists = false;
      // Look for target value in drop down list
      $('#ulTargetLang').find('a').each(function() {
        if ($(this).text() == value.target) {
          exists = true;
          return false;  // exit the loop when match is found
        }
      });
      // Create new list item if source value was not in select list
      if (!exists) {
        $('#ulTargetLang').append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.target + '</a></li>');
      }
      else {
        console.log(value.target,'target lang already exist in li list');
      }
    }
  });

  if ($('#ulTargetLang li').length == 1) {
    $('#dropdownMenuOutput').html('').html($($('#ulTargetLang a')).text() + '<span class="caret"></span>');
  }
}
function updateOutputDropdownMenu2() {
  var exists;
  $('#ulTargetLang2').html('');
  $('#dropdownMenuOutput2').html('').html('Choose Language <span class="caret"></span>');
  sourceLangSelect2 = $.trim($('#dropdownMenuOutput').text());
  console.log("updateOutputDropdownMenu2 sourceList length:"+sourceList.length + " --- " + sourceLangSelect2);
  // Update output dropdown menu with target language
  $.each(sourceList, function (index, value) {
    //dropdownMenu1
    //if (value.source == $.trim($('#dropdownMenuInput').text())) {
    if (value.source == $.trim($('#dropdownMenuOutput').text())) {
      exists = false;
      // Look for target value in drop down list
      $('#ulTargetLang2').find('a').each(function() {
        if ($(this).text() == value.target) {
          exists = true;
          return false;  // exit the loop when match is found
        }
      });
      // Create new list item if source value was not in select list
      if (!exists) {
        $('#ulTargetLang2').append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.target + '</a></li>');
      }
      else {
        console.log(value.target,'target lang already exist in li list');
      }
    }
  });

  if ($('#ulTargetLang2 li').length == 1) {
    $('#dropdownMenuOutput2').html('').html($($('#ulTargetLang2 a')).text() + '<span class="caret"></span>');
  }
}

// 语音转换成文字后进行翻译
// Send request to translate service if input-output and textarea have values
function getTranslation() {
  var pageDomain = 'general';
  var source = '';
  var target = '';
  var textContent = '';

  /*
   if ($('input:radio[name=\'group1\']').is(':checked')) {
   pageDomain = $('input:radio[name=group1]:checked').val();
   }
   */

  //dropdownMenu1
  /*
   if (($('#dropdownMenuInput').text()).toLowerCase().indexOf('choose language') < 0) {
   source = getLanguageCode($.trim($('#dropdownMenuInput').text()));
   }*/
  if (($('#dropdownMenu1').text()).toLowerCase().indexOf('choose language') < 0) {
    //source = getLanguageCode($.trim($('#dropdownMenu1').text()));
    source = exports.getLanguageCode(sourceLangSelect);
  }
  // 缺省
  //source = getLanguageCode("Japanese");

  if (($('#dropdownMenuOutput').text()).toLowerCase().indexOf('choose language') < 0) {
    target = exports.getLanguageCode($.trim($('#dropdownMenuOutput').text()));
  }

  // 获取语音输入转换的文字 - textarea改为div
  if ((parseInt($('#home2 textarea').val().length) > 0)) {
    textContent = $('#home2 textarea').val();
  }
  /*
  //$('#resultsText').html()
  var currentTextContent = $('#home2 textarea').val();
  console.log("lastTextContent: " + lastTextContent + " -- currentTextContent: " + currentTextContent);
  var startPos = currentTextContent.indexOf(lastTextContent);
  if (startPos < 0){
    startPos = 0;
  }else{
    startPos = lastTextContent.length;
  }
  console.log("startPos: " + startPos + " -- lastTextContent: " + lastTextContent);
  if ((parseInt(currentTextContent.length) > 0)) {
    textContent = currentTextContent.substring(startPos, currentTextContent.length);
    console.log("textContent: "+textContent);
  }
  lastTextContent = currentTextContent;
  console.log("lastTextContent: " + lastTextContent);
  */
  /*
   if ((parseInt($('#resultsText').html().length) > 0)) {
   textContent = $('#resultsText').html();
   }
   */
  console.log("textContent: "+textContent);

  // get model_id from domain, source and target
  var model_id = exports.getModelId(pageDomain, source, target);
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

    $('#profile textarea').val(JSON.stringify(callData, null, 2));
    //lastTextContent1 = $('#homeOutput textarea').val();
    //var tmpOutputStr = lastTextContent1 + ' ...Translating...';
    //$('#homeOutput textarea').val(tmpOutputStr);
    $('#homeOutput textarea').val('translating...');

    $.ajax(restAPICall)
      .done(function (data) {
        console.log("tmpOutputStr: "+$('#homeOutput textarea').val());
        //$('#homeOutput textarea').val(lastTextContent1 + data['translations'][0]['translation']);
        $('#homeOutput textarea').val(data['translations'][0]['translation']);
        console.log("tmpOutputStr updated: "+$('#homeOutput textarea').val());
        $('#profile2 textarea').val(JSON.stringify(data, null, 2));

        var elementTranscript = $('#homeOutput textarea').get(0);
        elementTranscript.scrollTop = elementTranscript.scrollHeight;

        console.log("data['translations'][0]['translation']: "+data['translations'][0]['translation']);
        //开始第二次翻译
        console.log("开始第二次翻译:"+$('#homeOutput textarea').val());
        // if textarea is empty the reset value of textarea
        if (parseInt($('#homeOutput textarea').val().length) <= 0) {
          $('#homeOutput2 textarea').val('');
          $('#profile textarea').val('');
          $('#profile2 textarea').val('');

          //这里要进行分析修改
          if ((sourceLangSelect2.toLowerCase() === 'detect language') || (sourceLangSelect2.toLowerCase() === 'choose language')) {
            //dropdownMenu1
            //$('#dropdownMenuInput').html('Choose Language <span class="caret"></span>');
            $('#dropdownMenuOutput').html('Choose Language <span class="caret"></span>');
            $('#dropdownMenuOutput2').html('Choose Language <span class="caret"></span>');
          }
        }
        clearTimeout(typingTimer2);
        typingTimer2 = setTimeout(doneTyping2, doneTypingInterval);
      })
      .fail(function (jqXHR, statustext, errorthrown) {
        $('#homeOutput textarea').val('translation error');
        console.log(statustext + errorthrown);
      });
  } else {
    console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
  }

} // get Translation end here
function getTranslation2() {
  var pageDomain = 'general';
  var source = '';
  var target = '';
  var textContent = '';

  /*
   if ($('input:radio[name=\'group1\']').is(':checked')) {
   pageDomain = $('input:radio[name=group1]:checked').val();
   }
   */

  //dropdownMenu1
  /*
   if (($('#dropdownMenuInput').text()).toLowerCase().indexOf('choose language') < 0) {
   source = getLanguageCode($.trim($('#dropdownMenuInput').text()));
   }*/
  if (($('#dropdownMenuOutput').text()).toLowerCase().indexOf('choose language') < 0) {
    //source = getLanguageCode($.trim($('#dropdownMenu1').text()));
    source = exports.getLanguageCode(sourceLangSelect2);
  }
  // 缺省
  //source = getLanguageCode("Japanese");

  if (($('#dropdownMenuOutput2').text()).toLowerCase().indexOf('choose language') < 0) {
    target = exports.getLanguageCode($.trim($('#dropdownMenuOutput2').text()));
  }

  // 获取语音输入转换的文字 - textarea改为div
  if ((parseInt($('#homeOutput textarea').val().length) > 0)) {
    textContent = $('#homeOutput textarea').val();
  }

  /*
  //$('#resultsText').html()
  var currentTextContent = $('#homeOutput textarea').val();
  console.log("lastTextContent1: " + lastTextContent1 + " -- currentTextContent: " + currentTextContent);
  var startPos = currentTextContent.indexOf(lastTextContent1);
  if (startPos < 0){
    startPos = 0;
  }else{
    startPos = lastTextContent1.length;
  }
  console.log("startPos: " + startPos + " -- lastTextContent1: " + lastTextContent1);
  if ((parseInt(currentTextContent.length) > 0)) {
    textContent = currentTextContent.substring(startPos, currentTextContent.length);
    console.log("textContent: "+textContent);
  }

  //处理出现translating不能去除
  if (textContent.trim() == '...Translating...') {
    textContent = '';
    $('#homeOutput textarea').val(lastTextContent1);
  }
  */

  console.log("textContent: "+textContent);

  // get model_id from domain, source and target
  var model_id = exports.getModelId(pageDomain, source, target);
  console.log(' --- source-' + source + '  target-' + target + '   textContent-' + textContent);
  if (pageDomain && source && target && textContent && model_id) {
    console.log('source-' + source + '  target-' + target + '   textContent-' + textContent);

    //lastTextContent1 = currentTextContent;
    //console.log("lastTextContent1: " + lastTextContent1);
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

    $('#profile textarea').val(JSON.stringify(callData, null, 2));
    $('#homeOutput2 textarea').val('translating...');
    /*
    lastTextContent2 = $('#homeOutput2 textarea').val();
    var tmpOutputStr = lastTextContent2 + ' ...Translating...';
    $('#homeOutput2 textarea').val(tmpOutputStr);
    */

    $.ajax(restAPICall)
      .done(function (data) {
        console.log("tmpOutputStr: "+$('#homeOutput2 textarea').val());
        //$('#homeOutput2 textarea').val(lastTextContent2 + data['translations'][0]['translation']);
        $('#homeOutput2 textarea').val(data['translations'][0]['translation']);
        console.log("tmpOutputStr updated: "+$('#homeOutput2 textarea').val());
        $('#profile2 textarea').val(JSON.stringify(data, null, 2));
        //完成第二次翻译
        console.log("完成第二次翻译:"+$('#homeOutput2 textarea').val());
        var elementTranscript = $('#homeOutput2 textarea').get(0);
        elementTranscript.scrollTop = elementTranscript.scrollHeight;
      })
      .fail(function (jqXHR, statustext, errorthrown) {
        $('#homeOutput2 textarea').val('translation error');
        console.log(statustext + errorthrown);
      });
  } else {
    console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
  }

} // get Translation end here

// accepts a lang or locale (e.g. en-US) and returns the lang (e.g. en)
function getLang(locale){
  // split/shift rather than substr to handle cases like arz where the language part is actually 3 letters
  return locale.split('-').shift().toLowerCase();
}

// Get model_id from domain, source , target
exports.getModelId = function (pageDomain, source, target) {
//function getModelId(pageDomain, source, target) {
  var modelId = '';
  console.log(' --- source-' + source + '  target-' + target);

  // Preferred: search for an exact lang/locale match (e.g. en-US to es-LA)
  for (var y in modelList) {
    if (modelList[y].hasOwnProperty('domain')) {
      var modelListDomain = modelList[y].domain.toString();
      if ((modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) && source === modelList[y].source && target === modelList[y].target) {
        modelId = modelList[y].model_id;
        return modelId;
      }
    }
  }

  // Fallback: search for a language-only match (e.g. en to es)
  source = getLang(source);
  target = getLang(target);
  for (var y2 in modelList) {
    if (modelList[y2].hasOwnProperty('domain')) {
      var modelListDomain2 = modelList[y2].domain.toString();
      if ((modelListDomain2.toLowerCase() === pageDomain.toString().toLowerCase()) && source === getLang(modelList[y2].source) && target === getLang(modelList[y2].target)) {
        modelId = modelList[y2].model_id;
        return modelId;
      }
    }
  }

  return modelId;
};

// 修改$('input:radio[name=group1]').click(function ()建立
// 设定Domain只能使用News，因为Conversational/Patent都不支持多语言
function newsDomain() {
  sourceList = [];
  pageDomain = "general"; // Domain为News

  // Reset all the values when domain is changed
  //$('#resetSpan').trigger('click');

  // Autodetect language option
  //dropdownMenuList
  //$('#ulSourceLang').append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
  //$('#dropdownMenuList').append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
  // Update language array based on domain

  for (var y in modelList) {
    var sourceVal = '';
    var targetVal = '';
    // if model has the domain property then add the language in dropdown list. Otherwise add 'news' domain to JSON model list
    if (!(modelList[y].hasOwnProperty('domain'))) {
      modelList[y].domain = 'general';
      console.log('no domain');
    }
    var modelListDomain = modelList[y].domain.toString();
    //console.log("modelListDomain: "+modelListDomain);
    //console.log(modelListDomain.toLowerCase() + ' DOMAIN ' + pageDomain.toString().toLowerCase() );
    if (modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) {
      sourceVal = exports.getLanguageName(modelList[y].source);
      targetVal = exports.getLanguageName(modelList[y].target);
      sourceList.push({
        source: sourceVal,
        target: targetVal
      });
      //console.log("source" + sourceVal + "target" + targetVal);
    }
  }

  console.log("modelList: "+modelList.length);
  console.log("sourceList: "+sourceList.length);
  // Sort by source then target ,so source languages are sorted in dropdown
  sourceList.sort(function(a,b) {
    return (a.source > b.source) ? 1 : ((b.source > a.source) ? -1 :
      ( a.target < b.target ? -1 : a.target > b.target ? 1 : 0));
  });

  // Update Input Dropdown Menu with Source Language
  //dropdownMenuList
  /*
   $('#ulSourceLang').html('');
   $('#ulSourceLang').append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
   $('#ulTargetLang').html('');
   fillInDropdown('ulSourceLang');
   */

  // 匹配下拉菜单
  //
  // 取消菜单更新
  //$('#dropdownMenuList').html('');
  //$('#dropdownMenuList').append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
  $('#ulTargetLang').html('');
  $('#ulTargetLang2').html('');
  //fillInDropdown('dropdownMenuList');
  // 初始化缺省输出语言
  updateOutputDropdownMenu();
  updateOutputDropdownMenu2();
}

exports.actInputChange = function () {
  console.log("actInputChange:"+$('#home2 textarea').val());
  // if textarea is empty the reset value of textarea
  if (parseInt($('#home2 textarea').val().length) <= 0) {
    $('#homeOutput textarea').val('');
    $('#profile textarea').val('');
    $('#profile2 textarea').val('');

    //这里要进行分析修改
    if ((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) {
      //dropdownMenu1
      //$('#dropdownMenuInput').html('Choose Language <span class="caret"></span>');
      $('#dropdownMenu1').html('Choose Language <span class="caret"></span>');
      $('#dropdownMenuOutput').html('Choose Language <span class="caret"></span>');
    }
  }
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);

};

exports.initTranslator = function () {

  // Get list of Models after getting languages
  $.ajax({
    type: 'GET',
    url: '/api/models',
    headers: {
      'X-Watson-Technology-Preview': nmtValue
    },
    async: true
  })
    .done(function (data) {
      console.log(data + " response received");
      modelList = data.models;

      // Get list of languages
      $.ajax({
        type: 'GET',
        url: '/api/identifiable_languages',
        headers: {
          'X-Watson-Technology-Preview': nmtValue
        },
        async: true
      })
        .done(function (data) {
          console.log("demo.js identifiable",data);
          langAbbrevList = data.languages;

          // 设定Domain为News
          newsDomain();
          // select news option in domain and update dropdown with language selections
          //$('input:radio[name=group1]:nth(1)').prop('checked', true).trigger('click');
        });
    })
    .fail(function (jqXHR, statustext, errorthrown) {
      console.log(statustext + errorthrown);
    });

  //Input语言选择处理事物 - 需要和Speech-to-text关联
  //
  // Update dropdown Menu Input value with source lang selected
  //dropdownMenuList
  //$('#ulSourceLang').on('click', 'a', function (e) {
  $('#dropdownMenuList').on('click', 'a', function (e) {
    e.preventDefault();
    lastTextContent = "";
    lastTextContent1 = "";
    lastTextContent2 = "";
    sourceLangSelect = $.trim($(this).text());
    //console.log('click href ' + sourceLangSelect);
    //dropdownMenu1
    //$('#dropdownMenuInput').html('').html(sourceLangSelect + '<span class="caret"></span>');
    $('#dropdownMenu1').html('').html(sourceLangSelect + '<span class="caret"></span>');

    // if Choose lang or detect lang is selected again then send request for lang id service
    if (sourceLangSelect.toLowerCase().indexOf('language') >= 0) {
      if (parseInt($('#home2 textarea').val().length) > 0) {
        doneTyping();
      }
    }
    updateOutputDropdownMenu();
    getTranslation();
  });

  // Update dropdown Menu Output value with target lang selected
  $('#ulTargetLang').on('click', 'a', function (e) {
    e.preventDefault();
    lastTextContent = "";
    lastTextContent1 = "";
    lastTextContent2 = "";
    sourceLangSelect2 = $.trim($(this).text());
    //console.log('click href ' + $(this).text());
    $('#dropdownMenuOutput').html('').html($(this).text() + '<span class="caret"></span>');
    getTranslation();
    // if Choose lang or detect lang is selected again then send request for lang id service
    if (sourceLangSelect2.toLowerCase().indexOf('language') >= 0) {
      if (parseInt($('#homeOutput textarea').val().length) > 0) {
        doneTyping2();
      }
    }
    updateOutputDropdownMenu2();
    getTranslation2();
  });

  // Update dropdown Menu Output value with target lang selected
  $('#ulTargetLang2').on('click', 'a', function (e) {
    e.preventDefault();
    //翻译语言改变是重新进行全部翻译
    lastTextContent = "";
    lastTextContent1 = "";
    lastTextContent2 = "";
    $('#homeOutput2 textarea').val("");
    //console.log('click href ' + $(this).text());
    $('#dropdownMenuOutput2').html('').html($(this).text() + '<span class="caret"></span>');
    getTranslation2();
  });

  // 保持进行输入翻译功能
  // on keyup, start the countdown
  $('#home2 textarea').keyup(function () {
    // if textarea is empty the reset value of textarea
    if (parseInt($('#home2 textarea').val().length) <= 0) {
      $('#homeOutput textarea').val('');
      $('#profile textarea').val('');
      $('#profile2 textarea').val('');

      //这里要进行分析修改
      if ((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) {
        //dropdownMenu1
        //$('#dropdownMenuInput').html('Choose Language <span class="caret"></span>');
        $('#dropdownMenu1').html('Choose Language <span class="caret"></span>');
        $('#dropdownMenuOutput').html('Choose Language <span class="caret"></span>');
      }
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);

  });

  // on keydown, clear the countdown
  $('#home2 textarea').keydown(function () {
    clearTimeout(typingTimer);
  });

  $('#nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

};
