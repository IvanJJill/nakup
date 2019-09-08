/**
 * Copyright 2018 Ivan Satsiuk ivanjjill@gmail.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var MEAL_SHEET = 'seznam';
var LIST_SHEET = 'nakup';

var PRICE_COL = 'cena';
var NAME_COL = 'nazev';

var TOTAL_STR = 'Celkem';

function send(email_addr, message){
  
  var list = getSpreadSheet(LIST_SHEET);

  var msg = composeHtmlMsg([['Nazev', 'Pocet', 'Cena']], list.getDataRange().getValues(), message );
  Logger.log(msg);
  
  GmailApp.sendEmail(email_addr,
                   "Nakup Autogen",
                    'nakup',
                   { htmlBody: msg});
   
}

function composeHtmlMsg(headers, values, message){
  
  if (values.length <= 1) {
    return '<p ' + getStyledText('Nic nekupuj...', 20) + '</p>';
  }
  
  var H1 = '<h1 '+ getStyledText('Nakup', 38) + '</h1>';
  var diky = '<h3 ' + getStyledText('Dik!', 20) +'</h3>';
  var ahoj = message ? message : 'Ahoj! Kup, prosim, tohle:';
  ahoj = '<p ' + getStyledText(ahoj, 20) +'</p>';
  
  var table_style = ' style="width: 400px; border: solid 1px #6699ff;\
    border-collapse: collapse;\
    border-spacing: 0;\
    font-family:\'Segoe UI\', Arial, sans-serif;"';
    
  var th_style = ' style="background-color: #ccddff;\
    border: solid 1px #6699ff;\
    color: #0059b3;\
    padding: 10px;\
    text-align: left;\
    font-family:\'Segoe UI\', Arial, sans-serif;"';
  
  var td_style = ' style="border: solid 1px #6699ff;\
    color: #333;\
    padding: 10px;\
    font-family:\'Segoe UI\', Arial, sans-serif;"';
  
  var message = '<!DOCTYPE html>\n<html>\n<head><base target="_top"></head>\n<body>\n' + H1 + ahoj +
    '<br><br>\n<table ' + table_style + ' >\n<thead><tr>';
  for (var h = 0; h < headers[0].length; h++){
    message += '<th' + th_style + '>' + headers[0][h] + '</th>\n';
  }
  message += '</tr></thead>\n';
  
  for(var c = 0; c < values.length; c++){
    if (values[c][0].toString().toLowerCase() == TOTAL_STR.toLowerCase()){
      message+='<thead><tr><th' + th_style + '>' + values[c][0] + '</th> <th' + th_style + '></th> <th' + th_style + '>' + values[c][2] + ',-</th></tr></thead>\n'
    } else {
      message+='<tr><td '+ td_style +'>' + values[c][0] + '</td><td'+ td_style +'>' + values[c][1] + '</td><td'+ td_style +'>' + values[c][2] + ',-</td></tr>\n';
    }
  }
  return message + '</table>\n ' + diky + '</body>\n</html>\n';
}

function getStyledText(text, size){
  return ' style="box-sizing:border-box;color:rgb(0, 0, 0);display:block;font-family:\'Segoe UI\', Arial, sans-serif;font-size: ' + size.toString() + 'px;font-weight:300;line-height:'+ (size + 10).toString() +'px;margin-bottom:10px;margin-left:0px;margin-right:0px;margin-top:10px;text-size-adjust:100%;-webkit-margin-after:10px;-webkit-margin-before:10px;-webkit-margin-end:0px;-webkit-margin-start:0px;">'+ text;
}
