![SFT Image](https://github.com/MarkWattsBoomi/SearchFilterTable/blob/main/sft.png)

This module provides table implementation with advanced sorting and filtering features. 

The latest version can be included in your player from this location: -

```
https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/sft.js
https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/sft.css
```

# Class Names

SearchFilterTable

## Functionality

The component will display a paginated table with per column sorting and complex filtering tools.

It allows outcomes to be attached at table and row level

## Datasource

Set the datasource to a list of objects


## State

Create a State LIST object of the type of the model data items.  

This will hold the list of selected / tagged items


## Outcomes

Any outcome attached to the component is dealt with in this way: -

* If the outcome is set as "Appears At Top" then it will become a button in the top title bar or its context menu otherwise it becomes a button on the tree node or its context menu.

* If the outcome has its "When this outcome is selected" option set to either "Save Changes" or "Partially Save Changes" and is attached 
to a tree node then the current node is set as the state value when triggered.

* If the outcome has an "icon" attribute then this value is used to specify the icon, otherwise a default "+" icon is used.  Note: Icons are 
bootstrap glyphicons without the "glyphicon-" prefix e.g. "trash","edit" etc.

* If the outcome has a "Label" set then this is used as the tooltip otherwise the outcome's name is used.

* "OnSelect" is a special case and is attached to the action of clicking a tree node.

* If the outcome's developer name begins with "CM" (case insensitive) then the outcome is added to either the main tree or the current node's context menu rather than as a button.

* All outcomes including "OnSelect" are optional.

* Outcome order is respected.  

* If the outcome has an attribute of "RequireSelected"="true" then it will only be shown if one or more items are tagged.

* Outcomes flagged as "RequireSelected" are placed at the left end of the ribbon bar, others are placed on the right end.




## Outcome Attributes

### display

Tells the ribbons how to display the buttons.
text or iconandtext will cause the outcome's label to be displayed. 

### classes

Any class names in this value are added to the button's class attribute


### icon

Sets the glyphicon to show for the outcome.

### RequiresSelected

Only shows the outcome button if there are selected rows
"true" / "false" - default is "false"

### uri

Will launch a uri when clicked rather than trigger an outcome.

Uri can contain {{FieldName}} elements which will be substituted with values from that column in the row.

### target

_blank for opening uri in new window (default if ommitted) or _self to reuse current tab


## Settings

### Columns

Sets the display columns for the table.

### Label

The Label of the component is used as the title bar

### Width & Height

If specified then these are applied as pixel values.

## Component Attributes

### PaginationSize

Sets the default max number of rows to show per pagination page if the user hasn't selected a different page size.

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value

### canExport

enables or disables the export to csv options.  defaults to "true".  Set to "false" to remove the feature.

### RowLevelState

The name of a value in Flow to use for the single row level state.

As opposed to the main state value which is a list containing all/any selected rows, 
the RowLevelState value will always hold the value of any row which triggered an outcome.

### RibbonStyle

This tells the component which ribbon style to use.

The options are "ribbon" (default) or "search"

### RibbonDisplay

Tells the ribbons how to display the standard buttons.
text or iconandtext will cause the outcome's label to be displayed.

Default is "iconandtext"

### IsSelectedColumn

Tells the component on load which column in the model should be used (if any) to pre-select rows when the component is in multi-select mode.

Must be a boolean or number field.

Supply the developerName of the column and the checkboxes for rows where the value is true or > 0 will be checked.

## Styling

All elements of the component can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.



