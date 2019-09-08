# nakup
Google Scripts Gmail App to make a shopping list and send it to the spose\\

the app needs a specific Spreadsheet linked to it
<br>linking is done using an app Card

It should contain 2 sheets with specific names:
<br>
1st -- "seznam"
2nd -- "nakup"
<br>

the "seznam" contains list of products you normally buy and must contain 3 columns
 
<br>1st -- heading is irrelative, contains the separation for meals e.g. Breakfast, Lunch, Dinner
<br>2nd -- specific heading "nazev" contains products sparated by meal name in 1st column
<br>3rd -- specific heading "cena" containing prices for each item
<br>
<br>the "nakup" will store the list of items to buy with it's prices and total

<br>in the end you will be asked where to send an email, optionally you will be able to add a message to it

<br> UI looks like this:
<br> main screen with the settings
<br>![alt text](https://github.com/IvanJJill/nakup/blob/master/doc/front.PNG)
<br> select items from one of the section
<br>![alt text](https://github.com/IvanJJill/nakup/blob/master/doc/selection.PNG)
<br> select amount of selected items
<br>![alt text](https://github.com/IvanJJill/nakup/blob/master/doc/amount.PNG)
<br> add a custom message to the email
<br>![alt text](https://github.com/IvanJJill/nakup/blob/master/doc/add_message.png)
<br> email received with the list
<br>![email arrived](https://github.com/IvanJJill/nakup/blob/master/doc/email_arrived.png)
