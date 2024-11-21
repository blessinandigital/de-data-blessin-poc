const { getIngredientData, getIngredientItemData} = require('./getData')
const { transformData, transformIngredientData, findNutritionalData, createIngredientListEntry } = require('./transformData')

	// de-duplicated data
transformData().then((ingredientItemListDeDuplicated) => {
	console.log('items: ', JSON.stringify(ingredientItemListDeDuplicated, null, 2))
	// const newIngredientlist = findNutritionalData(ingredientItemListDeDuplicated)
	// console.log(JSON.stringify(newIngredientlist, null, 2))
})
.catch((error) => {
	console.error('Error deduplicating data: ', error)
})

createIngredientListEntry().then((ingredientList) => {
	console.log('ingredientSection items: ', JSON.stringify(ingredientList, null, 2))

})

// transformIngredientData().then((ingredientListDeDuplicated) => {
// 	console.log('de-duplicated ingredients: ', JSON.stringify(ingredientListDeDuplicated, null, 2))
// 	console.log('deduplicated items count: ', ingredientListDeDuplicated.length)
// })
// .catch((error) => {
// 	console.error('Error deduplicating data: ', error)
// })

console.log("Hello")
