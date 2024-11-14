const fetchData = require("./fetchData")
const dotenv = require('dotenv');

dotenv.config();

const ingredientSectionContentType = process.env.CONTENT_TYPE_INGREDIENT_SECTION
const ingredientItemContentType = process.env.CONTENT_TYPE_INGREDIENT_ITEM
const ingredientContentType = process.env.CONTENT_TYPE_INGREDIENT

async function getIngredientItemData() {
    // const {fetchedIngredientSectionData, fetchedIngredientItemsData} = await fetchData();
    // const fetchedIngredientSectionData = await fetchData(ingredientSectionContentType);
    const fetchedIngredientItemsData = await fetchData(ingredientItemContentType);

    // const ingredientSection = fetchedData.map((data) => data["ingredientObject"])

    // console.log('ingredientSection --->: ', fetchedIngredientSectionData)
    console.log('ingredientItem fetched --->: ', fetchedIngredientItemsData)

    let ingredientSectionList = [];
    let ingredientItemList = [];

    for(const entry of fetchedIngredientItemsData) {
        console.log('content type --> ', entry.sys['contentType']['sys'])
        ingredientItemList.push(entry.fields['name']);
    }
    console.log('fields -->:', ingredientItemList)

    console.log('ingredient items count: ', ingredientItemList.length)
  }

async function getIngredientItemData() {
	// const {fetchedIngredientSectionData, fetchedIngredientItemsData} = await fetchData();
	// const fetchedIngredientSectionData = await fetchData(ingredientSectionContentType);
	const fetchedIngredientData = await fetchData(ingredientContentType);

	// const ingredientSection = fetchedData.map((data) => data["ingredientObject"])

	// console.log('ingredientSection --->: ', fetchedIngredientSectionData)
	console.log('ingredient fetched --->: ', fetchedIngredientData)

	let ingredientList = [];

	for(const entry of fetchedIngredientData) {
			console.log('content type --> ', entry.sys['contentType']['sys'])
			ingredientItemList.push(entry.fields['name']);
	}
	console.log('fields -->:', ingredientList)

	console.log('ingredient count: ', ingredientList.length)
}
getIngredientitemData();
getIngredientItemData();

console.log("Hello")
