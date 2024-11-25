const { getIngredientData, getIngredientItemData} = require('./getData');
const getDeDuplicateIngredients = require('./transformIngredients')
const { createIngredientListEntry } = require('./transformData')



// de duplicate entries
getDeDuplicateIngredients().then((ingredientDeduplicatedList) => {
	console.log('ingredient deduplicated -->: ', JSON.stringify(ingredientDeduplicatedList, null, 2))

}).catch((error) => {
		console.error('Error deduplicating data: ', error)
})

createIngredientListEntry().then((ingredientList) => {
	console.log('ingredientSection items: ', JSON.stringify(ingredientList, null, 2))

})

console.log("Hello")
