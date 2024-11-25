# Deliciously Ella Data Clean-up script documentation

This documentation contains information on how to run the script and what each components does.

## Machine Set-up

- Node 18.16.1

## Start script
1. Install dependecies
`npm install`

2. Run application
`npm run start`

## Repository structure guide
./extract:
- fetchData: extracts contentype entries directly from Contentful
- getData: data manipulation for IngredientSection, IngredientItem, Ingredients and Unit content types

./transform:
- transformData: creates ingredientList entries in contentful
- tranformIngredient: de-duplicates ingredients and creat nutritional data

./utils:
- convertToImperial: converts metric fields into imperial