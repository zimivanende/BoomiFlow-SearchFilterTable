![SFT Image](https://github.com/MarkWattsBoomi/SearchFilterTable/blob/main/sft.png)
![SFT Image](https://github.com/MarkWattsBoomi/SearchFilterTable/blob/main/searchribbon.png)

This module provides table implementation with advanced sorting and filtering features. 

The latest version can be included in your player from this location: -

```
https://master-boomi-flow-assets-prod-us-east-1.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/sft.js
https://master-boomi-flow-assets-prod-us-east-1.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/sft.css
```

# Class Names

SearchFilterTable

## Functionality

The component will display a paginated table with per column sorting and complex filtering tools.

It allows outcomes to be attached at table and row level.

Columns are auto formatted based on type.

Text columns containing a url are handled as specials: -
   Url's detected as an image are displayed as a thumbnail which clicked opens in a new tab.
   Others are simply hyperlinks.

Text columns containing a dataUri are handled as specials: -
   Audio data uris display an in place <audio> component to allow playing,
   Image data uris display an inplace <img> which when clicked opens a new tab.
   Others are displayed with a hyperlink.

Columns are configurable at run time if the UserColumnsField is specified as an attribute.

Support for outcome modal popups.

Support for remembering the row that triggered an outcome and to bring that same row into view on any page on re-render.

Only supports model data from a list NOT A SERVICE

## Height

Sets the display height of the table.

Required !!

## Label

Optional

If set then a title bar is drawn above the table containing the label value


## Datasource

Set the datasource to a list of objects.

BETA !! or a service.


## State

Create a State LIST object of the type of the model data items.  

This will hold the list of selected / tagged items.

It must be a list, single object state is handled by the "RowLevelState" attribute.


## Outcomes

Any outcome attached to the component is dealt with in this way: -

* If the outcome is set as "Appears At Top" then it will become a button in the top title bar or its context menu otherwise it becomes a button on the tree node or its context menu.

* If the outcome has its "When this outcome is selected" option set to either "Save Changes" or "Partially Save Changes" and is attached 
to a tree node then the current node is set as the state value when triggered.

* If the outcome has an "icon" attribute then this value is used to specify the icon, otherwise a default "+" icon is used.  Note: Icons are 
bootstrap glyphicons without the "glyphicon-" prefix e.g. "trash","edit" etc.

* If the outcome has a "Label" set then this is used as the tooltip otherwise the outcome's name is used.

* "OnSelect" is a special case and is attached to the action of clicking a table row.

* If the outcome's developer name begins with "CM" (case insensitive) then the outcome is added to either the main tree or the current node's context menu rather than as a button.

* All outcomes including "OnSelect" are optional.

* Outcome order is respected.  

* If the outcome has an attribute of "RequireSelected"="true" then it will only be shown if one or more items are tagged.

* Outcomes flagged as "RequireSelected" are placed at the left end of the ribbon bar, others are placed on the right end.




## Outcome Attributes

### display

Tells the table how to display the buttons.

Valid options are "text" or "iconandtext" or "icon".

Default is text only.

### rule
Row level outcomes allow for adding rules which will control if the outcome should be displayed for the current row.
Top Level Outcomes allow for adding rules based of other non-row data.

The attribute value string should be in JSON format like this: -
'''
{
   "field":"fieldDeveloperName",
   "comparator":"enumeratedComparator",
   "value":"valueToTest"
}
'''

In the case of row level outcomes, the "field" is set to the developerName of the column to test.

The "field" specifies either the name of a row's column (only in the case of row level outcomes) or the name of a flow field or one of its attributes to test.
The "value" specifies either a fixed value or the name of a flow field or one of its attributes to compare to.

In the case either the field or value is a flow field then put the field name and optionally attribute name in curly brace notation: -
{{FlowFieldName}} or {{FlowFieldName->PropertyName}}

The "comparator" must be one of the following: - 

* "equals"          Value must match
* "not equals"      Value must not match
* "contains"        Value must contain
* "not contains"    Value must not contain
* "starts with"     Value must start with 
* "ends with"       Value must end with
* "in"              Value must appear in the comma/space separated opions
* "not in"          Value must not appear in the comma/space separated opions
* "lt"              Value must be less than - number columns only
* "lte"             Value must be less than or equal to - number columns only
* "gt"              Value must be greater than - number columns only
* "gte"             Value must be greater than or equal to - number columns only

The value should be a string, if "in" or "not in" then supply a list of values space, comma, semi-colon or pipe delimited,

For boolean values just use "true" or "false".


### classes

Any class names in this value are added to the button's class attribute


### icon

Sets the glyphicon to show for the outcome.

### iconValue

Defines a uri to an icon to display on the button.

If the iconSuffix attribute is defined at the component level it will attempt to add the suffix (lower cased)
to the file name.

If the suffixed icon is not found then it reverts to the un-suffixed name.

!! make sure the icon exists or it will loop to infinity. 

### RequiresSelected

Only shows the outcome button if there are selected rows
"true" / "false" - default is "false"

### RequiresRows

Only shows the outcome button if there are rows
"true" / "false" - default is "false"

### uri

Will launch a uri when clicked rather than trigger an outcome.

Uri can contain {{FieldName}} elements which will be substituted with values from that column in the row.
Uri can contain {{FlowValueName}} elements which will be substituted with values from flow value (must be string).
Uri can contain {{CONSTANT_NAME}} elements which will be substituted with values from flow constants.  Allowed are "TENANT_ID"

### target

_blank for opening uri in new window (default if ommitted) or _self to reuse current tab

### form
A custom class can be attached to an outcome to act as a form
form = 
````
{
   "class":"<any register react class>", 
   "title":"New Resource Request", 
   "icon":"<any bootstrap icon short name>",
   "message":"Some text to display/nline2"
}
````
The class "SFTMessageBox" is included by default e.g.
form =
```` 
{
   "class":"SFTMessageBox", 
   "title":"Please Confirm", 
   "icon":"exclamation-sign",
   "message":"Deletion is permanent/Are you sure you wish to continue?"
}
````

## Settings

### Columns

Sets the display columns for the table.


### Width & Height

If specified then these are applied as pixel values.

Always provide a height or the component will have a 0 height table area.

### Content

If specified then this will be used as the content of the info popup dialog and cause the info button to be shown on the toolbar.


## Component Attributes

### height

allows passing a string to use as the component's height e.g. "600px" or "60vh".


### PaginationSize

Sets the default max number of rows to show per pagination page if the user hasn't selected a different page size.

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value

### canExport

enables or disables the export to csv options.  defaults to "true".  Set to "false" to remove the feature.

### exportUserColumns

sets if all columns are exported or only those shown / selected by user.  defaults to "false".  Set to "true" to export only the user's displayed columns.

### RowLevelState

The name of a value in Flow to use for the single row level state.

As opposed to the main state value which is a list containing all/any selected rows, 
the RowLevelState value will always hold the value of any row which triggered an outcome.

### RibbonStyle

This tells the component which ribbon style to use.

The options are "ribbon" (default) or "search"

### RibbonDisplay

Tells the ribbons how to display the standard buttons.

Valid options are "text" or "iconandtext" or "icon".

Default is text only.

### RetainRowColumn

String.

The name of a column which should be used as the primary key for a row so that it can be brought back into view on return to the table.

It will calculate the page the row now exists in and scroll to bring that row to center screen.


### IsSelectedColumn

Optional

Tells the component on load which column in the model should be used (if any) to pre-select rows when the component loads.

Must be a boolean or number field.

Supply the developerName of the column and the checkboxes for rows where the value is true or > 0 will be checked.


### UserColumnsValue

Optional.

The name of a string value which will contian the names of columns the user should see for this table or the constant "LOCAL_STORAGE" to use browser local storage.

The values should be in a comma delimited string.

Enabling this value makes the table configurable in that a column selector buttom appears and the column headers in the table are dragable to re-order.

Changes to the selected columns and their order are persisted back to the field on change.

These can then be persisted into a database with the user's login and the name of the table.

If there are no columns in the string it will default to the Display Columns of the table and immediatly set that value into the state.


### ColumnsIcon

Optional.

The name of a glyphicon to show on the column picker button if it will be shown.

defaults to option-vertical.


### InfoIcon

Optional.

The name of a glyphicon to show on the info button if it will be shown.

defaults to question-sign.

### LoadingIcon

Optional.

The name of an image to show while loading.

Animated gif maybe.

### DateFormat

Optional.

A string to control date formatting, UTC, JSON, LOCALE.

Defaults to LOCALE

### ColumnRules

The "ColumnRules" attribute allows us to specify special formatting / function for one or more columns.

You can optionally add a condition to control if it is applied.

The value is a JSON object with one attribute per column.


```
{
   "SalesforceId":{
      "mode":"url",
      "target":"_blank",
      "url":"https://xxx.my.salesforce.com/{{VALUE}}",
      "label":"Open In Salesforce" 
   },
   "AccountId":{
      "mode":"url",
      "target":"_blank",
      "url":"https://xxx.my.salesforce.com/{{VALUE}}",
      "label":"{{AccountName}}"
   },
   "Summary":{
      "mode":"class",
      "className":"MyReactClass"
      "condition":{
         "comparator":"equals",
         "value": 200
      }
   },
   "StartDate":{
      "mode":"dateFormat",
      "dateFormat":"date",
      "timeZone":false,
      "classes":"mycssclass",
      "whitespace":"pre" // any allowed whitespace flag like nowrap etc.
   },
   "MyColumn":{
      "mode":"outcome",
      "outcomeName":"MyOutcome",
   },
   "Status":{
      "mode":"lookup",
      "options":{
         "A": "Active",
         "P":"Passive"
      },
   },
   "PCColumn":{
      "mode":"percent"
   },
   "StyleColumn":{
      "mode":"format",
      "format":"whatever {{value}} you want"
   },
   "DollarColumn":{
      "mode":"currency",
      "currency":"USD"
   },
   "someColumn": {
      "mode":"style",
      "cellClass":"default-cell-class"
      "rowClass":"default-row-class";
      "condition":{
         "comparator":"equals / not equals / gt",
         "value": 200,
         "cellClass":"cell-true-class",
         "rowClass":"true-row-class"
      }
   },
   "someOtherColumn": {
      "mode":"icon",
      "callClass":"default-cell-class"
      "rowClass":"default-row-class";
      "icon":"wrench",
      "iconClass":"def-icon-class",
      "condition":{
         "comparator":"equals / not equals / gt",
         "value": 200,
         "cellClass":"cell-true-class",
         "rowClass":"true-row-class",
         "icon":"remove-sign",
         "iconClass":"extra-icon-class"
      }
   }
}
```

Currently mode only supports "url","outcome", "class", "lookup", "percent", "format", "currency", "style" & "dateFormat".

Note: If there is a column rule with mode outcome then that outcome will be forcibly hidden from the actions column

Note: This can also be the name of a Flow Value containing the json value wrapped in double braces e.g. {{MyFlowValueName}}
!!! In this case make sure to reference the value in your flow so that it exists in the state !!!

The label (optional) may containe the name of another field surrounded by double curley braces in which case that other columns value will be displayed as the value.
This allows for making composite columns. 

For "dateFormat" you can use: -
"datetime"  date & time in local format
"date"      displays local date format
"time"      shows only the time element in local format
"json"      shows date & time in JSON format
"iso"       shows date & time in ISO format
"utc"       shows date & time in UTC format
"year"      shows only the year element

Setting "timeZone" to false will display dates without the locale conversion, they will be absolute.

For "lookup" you are providing a value to display text conversion set.  The actual column's value will be compared to the key and if found replaced with the corresponding value.

For "percent" the value will be converted to an int and the % symbol appended.

For "format" you need to add a "format" argument, this will be displayed with the {{value}} token replaced with the column's value.

For "currency" you need to add a "currency" argument which should be the 3 char currency enum value like USD, GBP etc.

For "style" you need to add a "className" argument which should contain the extra css class name to apply and/or "rowClass" for a class to add to the parent row.  The style "bad-cell" & "bad-row" are included.

### OutcomesPosition

The "OutcomesPosition" attribute allows specifying the default column position for outcomes.

Values can be "first","last" or a number.

Default is "first".

If the table allows dynamic user columns then this will only be applied the frist time and will be stored into the user's column data.

### OutcomesLabel

String.

Allows control of the outcomes / actions column title.

Default is "Actions".

### MaxColumnTextLength

Number.

The maximum length of a column's text before it's converted to a popout button.

### QuickCheck
Boolean.

If true then check boxes appear in the column headers allowing quick application of true/false criteria to boolean columns.

### noResults

String.

The message to be displayed when there are no results.

Default = "No Results Available"

### noResultsFilter

String.

The sub message to be displayed when there are no results and there are filters applied.

Default = "( This may be due to the filters applied )"

### JSONModelValue
String.

The name of a Flow Value which contains the model in a JSON string form.  This will load the datasource data ignoring the standard one.

Exclude this to operate normally.

### JSONModelPrimaryKey
String.

The name of the property on the JSON data which is the primary key.

Only works with JSONModelValue.

### ModelTypeName
String.

The name of the Flow object type to create when setting the state & row level state.

Only works with JSONModelValue.

### greyDissabled
Boolean

Grey out dissabled outcomes rather than hide them based on column rules


## Styling

All elements of the component can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.



