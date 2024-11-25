const fetchData = require("./fetchData")
const dotenv = require('dotenv');

dotenv.config();

const ingredientItemContentType = process.env.CONTENT_TYPE_INGREDIENT_ITEM
const ingredientContentType = process.env.CONTENT_TYPE_INGREDIENT
const ingredientSectionContentType = process.env.CONTENT_TYPE_INGREDIENT_SECTION
const unitContentType = process.env.CONTENT_TYPE_UNIT

async function getIngredientItemData() {
    const fetchedIngredientItemsData = await fetchData(ingredientItemContentType);

    let ingredientItemList = [];

    for(const entry of fetchedIngredientItemsData) {
        ingredientItemList.push(entry);
    }
    console.log('ingredient items count: ', ingredientItemList.length)

    return ingredientItemList
    // return fetchedIngredientItemsData
  }

async function getIngredientData(entryList = null) {
	const fetchedIngredientData = await fetchData(ingredientContentType, entryList);

	let ingredientList = [];

	for(const entry of fetchedIngredientData) {
		ingredientList.push(entry);
	}
	console.log('ingredient count: ', ingredientList.length)

    return ingredientList
}

async function getIngredientSectionData() {
	const fetchedIngredientSectionData = await fetchData(ingredientSectionContentType);

	let ingredientSectionList = [];

	for(const entry of fetchedIngredientSectionData) {
        ingredientSectionList.push(entry);
	}
	console.log('ingredient section count: ', ingredientSectionList.length)

    return ingredientSectionList
}

async function getUnitData(entryList = null) {
	const fetchedUnitData = await fetchData(unitContentType, entryList);

	let unitList = [];

	for(const entry of fetchedUnitData) {
        console.log('unit entry: ', entry)
        unitList.push(entry);
	}
	console.log('unit section count: ', unitList.length)

    return unitList
}
module.exports = {getIngredientData, getIngredientItemData, getIngredientSectionData, getUnitData}