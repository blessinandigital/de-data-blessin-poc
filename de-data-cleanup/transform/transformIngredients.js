const dotenv = require('dotenv');
const contentfulManagement = require('contentful-management');
const { getIngredientItemData, getIngredientData } = require("../extract/getData");

dotenv.config();

// For each ingredient calculate nutritional data
async function calculateNutritionalData(ingredientsList) {
    // TO DO
    const edamamApiURL = process.env.EDAMAM_API_BASE_URL
    const edamamAppId = process.env.EDAMAM_APP_ID
    const edamamApiKey = process.env.EDAMAM_API_KEY

    // Sometimes ingredients have quantity and measure already - Do we remove them?
    const ingredientNames = ingredientsList.map(item => {
        const { fields: { name: ingredientName } } = item;
        if (ingredientName && ingredientName['en-US']) {
            return `100 g ${ingredientName['en-US']}`; // Prepend '100 g' to the ingredient name
        }
        return null; // Return null for empty ingredient names
    })
    .filter(name => name !== null);

    const requestBody = {
        title: ingredientNames.join(', '),
        ingr: ingredientNames.map(name => name.trim())
    };
    console.log('8-->', ingredientNames);
    console.log('request body -->', requestBody);

    try {
        const response = await fetch(
            `${edamamApiURL}/nutrition-details?app_id=${edamamAppId}&app_key=${edamamApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        }
        );
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} - request body ${JSON.stringify(requestBody, null, 2)}`);
        }

        const data = await response.json();
        console.log('Edamam API Response JSON:\n', JSON.stringify(data, null, 2));
        
        // update nutritional data info
        const ingredientNutritionalData = data.ingredients.map((ingredient, index) => {
            const nutritionalData = ingredient.parsed[0].nutrients;
            const ingredientId = ingredientsList[index].sys.id; // Assuming ingredientsList has sys.id

            return {
                id: ingredientId,
                energyKJ: nutritionalData.ENERC_KJ || 0,
                proteinG: nutritionalData.PROCNT || 0,
                carbohydrateG: nutritionalData.CHOCDF || 0,
                carbohydrateOfWhichSugarsG: nutritionalData.SUGAR || 0,
                fatG: nutritionalData.FAT || 0,
                fatOfWhichSaturatesG: nutritionalData.FA_SAT || 0,
                fibreG: nutritionalData.FIBTG || 0,
                sodiumG: nutritionalData.NA || 0,
                calciumMg: nutritionalData.CA || 0,
                // cholineMg;
                // copperMg;
                // ironMg;
                //  magnesiumMg;
                //  manganeseMg;
                //  omega3Mg;
                //  phosphorusMg;
                //  potassiumMg;
                //  seleniumMicrogram;
                //  zincMg;
                //  vitaminAMicrogramRAE;
                //  thiaminVitaminB1Mg;
                //  riboflavinVitaminB2Mg;
                //  niacinVitaminB3Mg;
                //  vitaminB6Mg;
                //  folateVitaminB9Microgram;
                // let vitaminB12GMicrogram;
                // let vitaminCMg;
                // let vitaminDMicrogram;
                // let vitaminEMg;
                // let vitaminKMicrogram;
                // Add other nutrients as required
            };
        });

        
        }catch(error){
        console.error('Error fetching nutritional data:', error);
    }

}

// Need to find nutritional data for ingredients - quantity: 100g
// Need to remove metric and imperial amounts
async function getDeDuplicateIngredients() {
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
        // for each ingredient name store non-duplicate and duplicate entry ids
        return unique;
    }, []);

    console.log('entries to delete: ', JSON.stringify(entryIDsToDelete, null, 2));
    console.log('duplicate ingredients: ',  JSON.stringify(duplicateIngredients, null, 2));
    console.log('ingredients de-duplicated: ',  JSON.stringify(ingredientsDeDuplicated, null, 2));

    // populate nutritional data
    const nutritionalDatFetched = await calculateNutritionalData(ingredientsDeDuplicated);

    return ingredientsDeDuplicated

}
// 3. archive duplicate entries (?) - TO CONFIRM


module.exports = getDeDuplicateIngredients