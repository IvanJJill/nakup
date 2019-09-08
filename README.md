# nakup
Google Scripts Gmail App to make a shopping list and send it to the spose\\

the app needs a specific Spreadsheet linked to it
linking is done using an app Card

It should contain 2 sheets with specific names:
1st -- "seznam"
2nd -- "nakup"

the "seznam" contains list of products you normally buy and must contain 3 columns 
1st -- heading is irrelative, contains the separation for meals e.g. Breakfast, Lunch, Dinner
2nd -- specific heading "nazev" contains products sparated by meal name in 1st column
3rd -- specific heading "cena" containing prices for each item

the "nakup" will store the list of items to buy with it's prices and total

in the end you will be asked where to send an email, optionally you will be able to add a message to it
