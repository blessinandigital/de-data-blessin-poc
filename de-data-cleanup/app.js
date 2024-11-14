const fetchData = require("./fetchData")

async function getData() {
    const ingredientSectionContentType = process.env.CONTENT_TYPE_INGREDIENT_SECTION
    const ingredientItemContentType = process.env.CONTENT_TYPE_INGREDIENT_ITEM
    // const {fetchedIngredientSectionData, fetchedIngredientItemsData} = await fetchData();
    // const fetchedIngredientSectionData = await fetchData(ingredientSectionContentType);
    const fetchedIngredientItemsData = await fetchData(ingredientItemContentType);

    // const ingredientSection = fetchedData.map((data) => data["ingredientObject"])

    // console.log('ingredientSection --->: ', fetchedIngredientSectionData)
    // console.log('ingredientItem --->: ', fetchedIngredientItemsData)

    let ingredientSectionList = [];
    let ingredientItemList = [];
    const filteredIngredientItem = fetchedIngredientItemsData.filter((ingredientEntry) => ingredientEntry.sys['contentType']['sys']['id'] === process.env.CONTENT_TYPE_INGREDIENT_ITEM)

    for(const entry of filteredIngredientItem) {
        console.log('single entry --> ', entry.sys['contentType']['sys'])
        console.log('single entry fields --> ', entry.fields)
        // ingredientSectionList.push(entry.fields['name']);
        ingredientItemList.push(entry.fields['name']);
    }
    // console.log('fields -->', ingredientSectionList)
    console.log('fields -->:', ingredientItemList)

    console.log('ingredient section count: ', ingredientItemList.length)
  }
  
getData();

console.log("Hello")
