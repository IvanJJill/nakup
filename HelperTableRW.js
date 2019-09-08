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

var DRIVE_DIR_NAME = '_ShopListApp';
var SS_ID_PROP_NAME = 'spreadSheetId';

var SELECT_FILE = 'Select File';
var OTHER = 'other'


/**
 * Returns a list of available spreadsheets for application
 * to work with 
 */
function getSpreadSheetList(){
  var list = {};
  const folders = DriveApp.getFoldersByName(DRIVE_DIR_NAME);
  const appFolder = folders.hasNext() ? folders.next() : null;
  
  if (!appFolder) return null;
  
  const appFiles = appFolder.getFiles();
  
  if (!appFiles.hasNext()) return null;
  
   while (appFiles.hasNext()) {
   var file = appFiles.next();
   list[file.getName()] = file.getId();
   }

  return list;
}

function getFirstAvailabele(){
  const folders = DriveApp.getFoldersByName(DRIVE_DIR_NAME);
  const appFolder = folders.hasNext() ? folders.next() : null;
  
  if (!appFolder) return null;
  
  const appFiles = appFolder.getFiles();
  
  if (!appFiles.hasNext()) return null;
  return appFiles.next().getId();
}

/**
 * Returns a Shopping list spreadsheet assigned to this app
 * @return {Map} Products by Meals map
 */
function getSpreadSheet(pageName){

  var scriptProperties = PropertiesService.getScriptProperties();
  const ss_id = scriptProperties.getProperty(SS_ID_PROP_NAME);
  
//  const ss_id = '1uwoEkiVQD3PSrhkBYrF25fdYFtXzPNW9IIXJKUddRPc'; //PropertiesService.getScriptProperties('spreadSheetId')
  var ss;
  
  // if for any reason stored id is invalid, then take first available file
  try{
    ss = SpreadsheetApp.openById(ss_id);
  } catch (e){
    ss = SpreadsheetApp.openById(getFirstAvailabele());
  }
  return pageName ? ss.getSheetByName(pageName) : ss;
}

function setSpreadSheet(id){
  PropertiesService.getScriptProperties().setProperty(SS_ID_PROP_NAME, id);
}

/**
* Returns a map of Meals with Products in Shopping List
*/
function getMeals(){
  
  var seznam = getSpreadSheet(MEAL_SHEET);
  
  var sections = {};
  var meals = seznam.getRange(2,1,seznam.getLastRow()-2,2).getValues();
  
  // get names of all meals
  for(var m = 0; m < meals.length; m++){
    
    if(meals[m][0].toString().trim() && !sections[meals[m][0].toString().trim()]){  
        var meal = meals[m][0].toString().trim();
        sections[meal] = new Array();
    }
    
    if(meals[m][1].toString().trim()){
        sections[meal].push(meals[m][1].toString().trim());
    }
  }

  return sections;
}


// function returns a dictionary with k:v as mealName: price
function getMealsPrices(){
  const ss = getSpreadSheet(MEAL_SHEET);
  const priceCol = getColumnNumber(PRICE_COL);
  const nameCol = getColumnNumber(NAME_COL);
  
  // Check if Columns exist
  if(priceCol === 0 || nameCol === 0) return {};
  
  const len = priceCol - nameCol;
  var meals = ss.getRange(2,nameCol + 1,ss.getLastRow() - 2, len + 1).getValues();

  return meals.reduce(function (map, obj) {
    if(obj[0] && obj[0].toString().trim) {
      obj[len] = obj[len] ? obj[len] : 0;
      map[obj[0]] = obj[len];
    } return map;
  }, {});
}

function getColumnNumber(rowName){
  const ss = getSpreadSheet(MEAL_SHEET);
  const lastCol = ss.getLastColumn();
  const header = ss.getRange(1,1,1,lastCol).getValues();
  for (var i = 0; i < header[0].length; i++){
    if(header[0][i].toString().trim() == rowName.trim()){
      return i;
    }
  }
  return 0;
}

// function to get currently selected shopping list (e.g. in progress)
function getCurrentList(){
  const ss = getSpreadSheet();
  var list_page = ss.getSheetByName(LIST_SHEET);
  if(list_page.getLastRow() < 1) return {};
  var currList = list_page.getRange(1,1,list_page.getLastRow(), 3).getValues();

  return currList.reduce(function (map, obj) {
    map[obj[0]] = obj.slice(1);
    return map;
  }, {});
}

// function will write an array of items to the bottom of a current list
// parameter items is a map of key:value of product:amount
function addToCurrentList(items){
  const ss = getSpreadSheet(LIST_SHEET);
  const lastRow = ss.getLastRow() + 1; 
  const prices = getMealsPrices();
  const currentList = getCurrentList();

  // paste all the values in the end of a list
  for(var name in items){
    if (name in currentList || name === SELECT_FILE || items[name].length <= 0) continue;
    if (name === OTHER ) name = items[name];
    var listRange = ss.getRange(lastRow, 1, 1, 3);
      listRange.getCell(1, 1).setValue(name);
    var price = prices[name] ? prices[name] : 0;
      listRange.getCell(1, 3).setValue(price);
    lastRow ++;
  }
}


// adds amounts to the list from amounts card
function addAmountToCurrentList(items){
  Logger.log(items);
  const ss = getSpreadSheet(LIST_SHEET);
  var listValues = ss.getDataRange().getValues();
  var listRange = ss.getDataRange();

  Logger.log(listValues);
  for(var i = 0; i < listValues.length; i++){
    var name = listValues[i][0].toString();
    if (name in items) {
      var price = listValues[i][2];
      var amount = items[name];
      listRange.getCell(i + 1, 2).setValue(items[listValues[i][0]]);
      listRange.getCell(i + 1, 3).setValue(price * amount);
    };
  }
}

// adds Total row in the Shopping list

function addTotal(){
  const currentList = getCurrentList();
  if ('Celkem' in currentList) return;
  const ss = getSpreadSheet(LIST_SHEET);
  const lastRow = ss.getLastRow() + 1;
  var listRange = ss.getRange(lastRow,1,1,3);
  
  var total = 0;
  for(var item in currentList) {
    total += currentList[item][0] * currentList[item][1];
  }

  listRange.getCell(1, 1).setValue(TOTAL_STR);
  listRange.getCell(1, 3).setValue(total);
}

// clears shopping list
function clearList(){
  const ss = getSpreadSheet(LIST_SHEET);
  ss.clear();
}

// ToDo
// Create default spread sheet 
// add a card to set up Meals and Products


// ToDo
// Localize constants and put them into user properties
// Retrieve them from user properties to global variables