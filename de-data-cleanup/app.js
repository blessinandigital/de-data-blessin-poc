const { getIngredientData, getIngredientItemData } = require('./extract/getData');
const getDeDuplicateIngredients = require('./transform/transformIngredients')
const { createIngredientListEntry } = require('./transform/transformData')

// de duplicate entries
getDeDuplicateIngredients().then((ingredientDeduplicatedList) => {
	console.log('ingredient deduplicated -->: ', JSON.stringify(ingredientDeduplicatedList, null, 2))

}).catch((error) => {
	console.error('Error deduplicating data: ', error)
})

// creates ingredientList entry
// createIngredientListEntry().then((ingredientList) => {
// 	console.log('ingredientSection items: ', JSON.stringify(ingredientList, null, 2))

// })

console.log("Hello")
