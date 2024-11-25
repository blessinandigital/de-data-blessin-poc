const dotenv = require('dotenv');
const contentfulManagement = require('contentful-management');
const { getIngredientItemData, getIngredientData } = require("../extract/getData");

dotenv.config();

// For each ingredient calculate nutritional data
async function calculateNutritionalData() {
    // TO DO

}

// Need to find nutritional data for ingredients - quantity: 100g
// Need to remove metric and imperial amounts
async function getDeDuplicateIngredients() {
    const edamamApiURL = process.env.EDAMAM_API_BASE_URL
    const edamamAppId = process.env.EDAMAM_APP_ID
    const edamamApiKey = process.env.EDAMAM_API_KEY

    const ingredients = await getIngredientData();
    const ingredientItems = await getIngredientItemData();

    const entryIDsToDelete = [];
    const duplicateIngredients = [];

    const ingredientsDeDuplicated = ingredients.reduce((unique, item) => {
        if (item.fields) {
            const existingItem = unique.find(obj => {
                if (obj.fields) {
                    const objName = obj.fields.name?.['en-US'];
                    const itemName = item.fields.name?.['en-US'];

                    return (
                        objName === itemName
                    );
                }
                return false;
            });
            if (!existingItem) {
                unique.push(item);
            } else {
                entryIDsToDelete.push(existingItem.sys.id);
                duplicateIngredients.push(item);
            }
        }
        return unique;
    }, []);

    console.log('entries to delete: ', entryIDsToDelete);
    console.log('duplicate ingredients: ', duplicateIngredients);
    console.log('ingredientItems de-duplicated: ', ingredientsDeDuplicated);

    // Update ingredientItems to remove duplicate ingredients - NEED TO REVIEW
    const updatedIngredientItems = ingredientItems.filter(item => {
        const ingredientId = item.fields.ingredient['en-US'].sys.id;
        const isDuplicate = duplicateIngredients.some(duplicate => duplicate.sys.id === ingredientId);
        return !isDuplicate;
    });

    console.log('Updated ingredientItems: ', updatedIngredientItems);

    // findNutritionalData(ingredientItemsReduced);

    return ingredientsDeDuplicated

}
// 3. archive duplicate entries (?) - TO CONFIRM


module.exports = getDeDuplicateIngredients