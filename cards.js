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

  /**
   *  Create the top-level card, with buttons leading to each of three
   *  'children' cards, as well as buttons to backtrack and return to the
   *  root card of the stack.
   *  @return {Card}
   */

  function getContextualAddOn() {
    var card = rootCard();
    return card.build();
  }
 
function rootCard(){
  // Create a button set with actions to navigate to 3 different
    // 'children' cards.
    var buttonSet = CardService.newButtonSet();
    
    // get the Map of Products for each Meal
    var productList = getMeals();
    
    // generate buttons for each Meal
    var meals = Object.keys(productList);
    var mealSection = CardService.newCardSection();
    
    // add a separate button for each meal section
    for(var i = 0; i < meals.length ; i++) {
      mealSection.addWidget(CardService.newButtonSet().addButton(createSectionButton(meals[i])));
    }
    
    // Settings section
    var workingFileSelector = CardService.newSelectionInput()
     .setType(CardService.SelectionInputType.DROPDOWN)
     .setFieldName(SELECT_FILE);
    
    const files = getSpreadSheetList();
    const fileNames = Object.keys(files);
    const ss_id = PropertiesService.getScriptProperties().getProperty(SS_ID_PROP_NAME);
    Logger.log(files);
    if (files){
      for(var i = 0; i < fileNames.length; i++){
        Logger.log(fileNames[i]);
        workingFileSelector.addItem(fileNames[i], files[fileNames[i]], files[fileNames[i]] === ss_id);
      }
    }
    
    var settingsSection = CardService.newCardSection()
    .setHeader('Settings')
    .setCollapsible(true)
    .addWidget(workingFileSelector)
    .addWidget(CardService.newButtonSet()
               .addButton(CardService.newTextButton()
                          .setText('Select')
                          .setOnClickAction(CardService.newAction()
                                            .setFunctionName('selectNewSS'))));


    // Build the card with Meal buttons
    var card = CardService.newCardBuilder()
        .setHeader(CardService.newCardHeader().setTitle('Choose the meal'))
        .addSection(mealSection)
        .addSection(settingsSection);
  return card;
}


// function to set new SpreadSheet if selected from setting
function selectNewSS(e){
  var newSSId = e.formInput[SELECT_FILE];
  setSpreadSheet(newSSId);
  var nav = CardService.newNavigation().updateCard(getContextualAddOn());
  return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
}

  /**
   *  Create a button that navigates to the specified child card.
   *  @return {TextButton}
   */
  function createSectionButton(id) {
    var action = CardService.newAction()
        .setFunctionName('SectionListCard')
        .setParameters({'id': id});
    var button = CardService.newTextButton()
        .setText(id)
        .setOnClickAction(action);
    return button;
  }

  /**
   *  Create a ButtonSet with two buttons: one that backtracks to the
   *  last card and another that returns to the original (root) card.
   *  @return {ButtonSet}
   */
  function buildPreviousAndRootButtonSet() {
    var previousButton = CardService.newTextButton()
        .setText('Back')
        .setOnClickAction(CardService.newAction()
            .setFunctionName('gotoPreviousCard'));
    var toRootButton = CardService.newTextButton()
        .setText('To Root')
        .setOnClickAction(CardService.newAction()
            .setFunctionName('gotoRootCard'));

    // Return a new ButtonSet containing these two buttons.
    return CardService.newButtonSet()
        .addButton(previousButton)
        .addButton(toRootButton);
  }

  /**
   *  Create a child card, with buttons leading to each of the other
   *  child cards, and then navigate to it.
   *  @param {Object} e object containing the id of the card to build.
   *  @return {ActionResponse}
   */
  function SectionListCard(e) {
    var id = e.parameters.id;  // Current card ID
    var formTexts = e.formInput; // values submited with previous form
    
    if (Object.keys(formTexts).length !== 0) {
      addToCurrentList(formTexts);
    }

    
    var currentList = getCurrentList(); // read what's currently in the table

    var productList = getMeals();

    var products = productList[id];
    
    var buttonSet = CardService.newButtonSet();

    var cardSection = CardService.newCardSection();//.setHeader(id);
    
    for (var i = 0; i < products.length; i++){
      
      var selectItemSwitch = CardService.newKeyValue()
      .setContent(products[i])
      .setSwitch(CardService.newSwitch()
                 .setSelected(products[i] in currentList) //automatically set selected if it's in a current list
                 .setFieldName(products[i])
                 .setValue('1'));

      cardSection
      .addWidget(selectItemSwitch)
    }
    
    
    /**
    * Field to add an extra item that is not in the list
    */
    cardSection.addWidget(CardService.newTextInput()
                        .setFieldName(OTHER).setTitle(OTHER));
    
    var nextAction = CardService
                       .newAction()
                            .setFunctionName('SectionListCard')
                            .setParameters({'id': getNextSection(id)});
    
    if( getNextSection(id) == 'Confirm') {
      nextAction = CardService.newAction().setFunctionName('amountsCard');
    }
    
    buttonSet.addButton(CardService.newTextButton()
              .setText('Back')
               .setOnClickAction(CardService.newAction()
                                .setFunctionName('gotoPreviousCard')))
    buttonSet.addButton(CardService.newTextButton()
                            .setText('Next')
                            .setOnClickAction(nextAction));
    
    cardSection.addWidget(buttonSet);
    
    var card = CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle(id))
        .addSection(cardSection)
        .build();

    // Create a Navigation object to push the card onto the stack.
    // Return a built ActionResponse that uses the navigation object.
    var nav = CardService.newNavigation().pushCard(card);
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
    
  }

 /**
   *  Create card to confirm the amounts of selected products
   */
  function amountsCard(e) {
    var formTexts = e.formInput; // values submited with previous form
    if (Object.keys(formTexts).length !== 0) {
      addToCurrentList(formTexts);
    }

    var cardSection = CardService.newCardSection();
    var buttonSet = CardService.newButtonSet();
    
    const currentList = getCurrentList();
   
    for (var name in currentList){
      
      var curAmount = currentList[name][0] ? currentList[name][0] : '1';
      var itemAmount = CardService.newTextInput()
      .setFieldName(name)
      .setValue(curAmount)
      .setTitle(name)
      .setSuggestions(CardService.newSuggestions()
                      .addSuggestion("0.1")
                      .addSuggestion("0.2")
                      .addSuggestion("0.5")
                      .addSuggestion("1")
                      .addSuggestion("2"));
      
      cardSection.addWidget(itemAmount);

    }
      
    buttonSet
    .addButton(CardService.newTextButton()
              .setText('Back')
              .setOnClickAction(CardService.newAction()
                                .setFunctionName('gotoPreviousCard')))
    .addButton(CardService.newTextButton()
               .setText('Next')
               .setOnClickAction(CardService.newAction()
                                 .setFunctionName('chooseRecipient')));
    
    cardSection.addWidget(buttonSet);
    
    var card = CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle('Specify amount'))
        .addSection(cardSection)
        .build();

    // Create a Navigation object to push the card onto the stack.
    // Return a built ActionResponse that uses the navigation object.
    var nav = CardService.newNavigation().pushCard(card);
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
    
  }

/**
 * Card to submit the whole list and send a result to a certain person
 */
function chooseRecipient(e){
  var formTexts = e.formInput; // values submited with previous form
  if (Object.keys(formTexts).length !== 0) {
    addAmountToCurrentList(formTexts);
  }
  
  var recepientSelection = CardService.newSelectionInput()
     .setType(CardService.SelectionInputType.RADIO_BUTTON)
     .setFieldName("recipient")
     .addItem("Ivanove", "ivanjjill@gmail.com", false)
     .addItem("Marusce", "thejazebel@gmail.com", false)
     .addItem("other", "other", false)
  
  var card = CardService.newCardBuilder()
  .setHeader(CardService.newCardHeader().setTitle('Send to:'))
  .addSection(CardService.newCardSection()
             .addWidget(recepientSelection)
              .addWidget(CardService.newTextInput()
                        .setFieldName('other').setTitle('other'))
             .addWidget(CardService.newButtonSet()
                        .addButton(CardService.newTextButton()
                                  .setText('Back')
                                  .setOnClickAction(CardService.newAction()
                                                   .setFunctionName('gotoPreviousCard')))
                        .addButton(CardService.newTextButton()
                                  .setText('Next')
                                  .setOnClickAction(CardService.newAction()
                                                   .setFunctionName('addMessage')))))
  .build();
  
  // Add a navigation object to support card display
  var nav = CardService.newNavigation().pushCard(card);
  return CardService.newActionResponseBuilder().setNavigation(nav)
  .build();
  
}

/**
 * Create a card where you can add a message
 */
function addMessage(e){
  
  var formTexts = e.formInput; // values submited with previous form
  var recipient = formTexts.recipient;
  recipient = recipient == 'other' ? e.formInput.other : recipient;

  var card = CardService.newCardBuilder()
     .setHeader(CardService.newCardHeader().setTitle('Add a message (optional)'))
     .addSection(CardService.newCardSection()
                 .addWidget(CardService.newTextInput()
                            .setFieldName('message').setTitle('Message'))
                 .addWidget(CardService.newButtonSet()
                            .addButton(CardService.newTextButton()
                                       .setText('Start')
                                       .setOnClickAction(CardService.newAction()
                                                         .setFunctionName('gotoRootCard')))
                            .addButton(CardService.newTextButton()
                                       .setText('Send')
                                       .setOnClickAction(CardService.newAction()
                                                         .setFunctionName('sendEmail')
                                                         .setParameters({'recipient': recipient})))))
  .build();
  
  // Add a navigation object to support card display
  var nav = CardService.newNavigation().pushCard(card);
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
}

function sendEmail(e){
  
  addTotal();
  
  send(e.parameters.recipient, e.formInput.message);
  clearList();
  
  return CardService.newActionResponseBuilder()
       .setNotification(CardService.newNotification()
           .setType(CardService.NotificationType.INFO)
           .setText("Sent to " + e.parameters.recipient + "!"))
       .build();
  
}

  /**
   *  Pop a card from the stack.
   *  @return {ActionResponse}
   */
  function gotoPreviousCard() {
    var nav = CardService.newNavigation().popCard();
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
  }

  /**
   *  Return to the initial add-on card.
   *  @return {ActionResponse}
   */
  function gotoRootCard() {
    var nav = CardService.newNavigation().popToRoot();
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
  }

/*
* Returns the name of a next section name. If there's no 
* next section it returns a 'Confirm' text
*/
function getNextSection(current){

    // generate buttons for each Meal
    var meals = Object.keys(getMeals());
    
    for(var i = 0; i < meals.length ; i++) {
      if(meals[i] == current){
        if(i + 1 == meals.length) {
          return 'Confirm';
        } else {
          return meals[i + 1];
        }
      }
    }
}
