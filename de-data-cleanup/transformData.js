/**
 * @typedef {Object} Amount
 * @property {int} friendly - A friendly representation of the amount.
 * @property {int} metric - The metric unit of the amount.
 * @property {int} imperial - The imperial unit of the amount.
 */

/**
 * @typedef {Object} Unit
 * @property {string} friendly - A friendly representation of the unit.
 * @property {string} metric - The metric unit.
 * @property {string} imperial - The imperial unit.
 */

/**
 * @typedef {Object} Comment
 * @property {string} en_GB - Preparation comment in British English.
 * @property {string} en_US - Preparation comment in American English.
 * @property {string} de - Preparation comment in German.
 */

/**
 * @typedef {Object} IngredientData
 * @property {string} title - The name entered for the ingredient.
 * @property {string} ingredient - The ID of the ingredient.
 * @property {Amount} amount - The amount details.
 * @property {Unit} unit - The unit details.
 * @property {Comment} comment - The preparation comments.
 * @property {boolean} includeInShoppingList - Indicates if the ingredient should be included in the shopping list.
 * @property {number} metricWeight - The weight of the ingredient in metric units.
 */

const fetchData = require("./fetchData")
const dotenv = require('dotenv');
const contentfulManagement = require('contentful-management');
const { getIngredientItemData, getIngredientData, getIngredientSectionData } = require("./getData");

dotenv.config();

async function transformData(){
    // get ingredientItems fetched
    const ingredientItems = await getIngredientItemData();
    const ingredienItemsJSON = JSON.stringify(ingredientItems, null, 2);
    console.log('--> ', ingredienItemsJSON);

    const entryIDsToDelete = []

    const ingredientItemsReduced = ingredientItems.reduce((unique, item) => {
        // do I need to compare it based on friendlyAmount? Sometimes friendly amount is present in 'de' and not 'en-US'. 
        // Do I need consider the 'de' translation in the de-deplucation??
        if (item.fields) {
            const existingItem = unique.find(obj => {
                if (obj.fields) {
                    const objFriendlyAmount = obj.fields.friendlyAmount ? (obj.fields.friendlyAmount['en-US'] || obj.fields.friendlyAmount) : null;
                    const itemFriendlyAmount = item.fields.friendlyAmount ? (item.fields.friendlyAmount['en-US'] || item.fields.friendlyAmount) : null;
                    const objImperialAmount = obj.fields.imperialAmount ? obj.fields.imperialAmount['en-US'] : null;
                    const itemImperialAmount = item.fields.imperialAmount ? item.fields.imperialAmount['en-US'] : null;
                    const objMetricAmount = obj.fields.metricAmount ? obj.fields.metricAmount['en-US'] : null;
                    const itemMetricAmount = item.fields.metricAmount ? item.fields.metricAmount['en-US'] : null;
    
                    return (
                        objFriendlyAmount === itemFriendlyAmount &&
                        objImperialAmount === itemImperialAmount &&
                        objMetricAmount === itemMetricAmount
                    );
                }
                return false;
            });
            if (!existingItem) {
                unique.push(item);
            } else {
                entryIDsToDelete.push(existingItem.sys['id']);
            }
        }
        return unique;
    }, []);
    console.log('entries to delete: ', entryIDsToDelete);
    console.log('ingredientItems de-duplicated: ', ingredientItemsReduced);

    // findNutritionalData(ingredientItemsReduced);

    return ingredientItemsReduced
}

// De-duplicate entries for ingrediets content type
async function transformIngredientData(){
    const ingredients = await getIngredientData();
    const ingredienItemsJSON = JSON.stringify(ingredients, null, 2);
    console.log('--> ', ingredienItemsJSON);

    const entryIDsToDelete = []

    const ingredientsDeduplicated = ingredients.reduce((unique, item) => {
        const {
          fields: { name, metricUnit, imperialUnit, isPlantBased },
          sys: { id },
        } = item;
    
        const existingIngredient = unique.find((ingredient) => {
          const {
            fields: {
              name: ingredientName,
              metricUnit: ingredientMetricUnit,
              imperialUnit: ingredientImperialUnit,
              isPlantBased: ingredientIsPlantBased,
            },
          } = ingredient;
    
          const metricUnitId = metricUnit?.['en-US']?.sys?.id || null;
          const ingredientMetricUnitId = ingredientMetricUnit?.['en-US']?.sys?.id || null;
    
          const imperialUnitId = imperialUnit?.['en-US']?.sys?.id || null;
          const ingredientImperialUnitId = ingredientImperialUnit?.['en-US']?.sys?.id || null;
    
          const isPlantBasedValue = isPlantBased?.['en-US'] ?? false;
          const ingredientIsPlantBasedValue = ingredientIsPlantBased?.['en-US'] ?? false;

          const nameValue = name?.['en-US'] || '';
          const ingredientNameValue = ingredientName?.['en-US'] || '';

    
          return (
            name['en-US'] === ingredientName['en-US'] &&
            metricUnitId === ingredientMetricUnitId &&
            imperialUnitId === ingredientImperialUnitId &&
            isPlantBasedValue === ingredientIsPlantBasedValue
          );
        });
    
        if (!existingIngredient) {
          unique.push(item);
        } else {
          entryIDsToDelete.push(id);
        }
    
        return unique;
      }, []);
    
      console.log('Entry IDs to Delete:', entryIDsToDelete);
    
      return ingredientsDeduplicated;
}

// 1. calculate and convert imperial metric
// 2. send API request to Edamam to calculate the nutritional data (input: quantity + metric unit + name basic ingredient + , + (prep comment))

// No need to de-duplicate Ingredient Items
// Need to find nutritional data for ingredients - quantity: 100g
// async function findNutritionalData(deduplicateEntries){
//     const edamamApiURL = process.env.EDAMAM_API_BASE_URL
//     const edamamAppId = process.env.EDAMAM_APP_ID
//     const edamamApiKey = process.env.EDAMAM_API_KEY

//     // get ingredient item name, quantity, metric, prep comment
//     nutritionalDataResult = deduplicateEntries.forEach(element => {

//         const {
//             fields: {
//               name: ingredientName,
//               metricAmount: ingredientMetricUnit,
//               imperialUnit: ingredientImperialUnit,
//               includeInShoppingList: ingredientIsShoppingList,
//               friendlyAmount: ingredientFriendlyAmount,
//               comment: ingredientPrepComment,
//               ingredient: ingredientBaseInfo

//             },
//           } = element;
//           console.log('--->', JSON.stringify(element, null, 2))
//           console.log('2--->', ingredientName)
//         //   const response = fetch(
//         //     `${edamamApiURL}/nutrition-data?app_id=${edamamAppId}&app_key=${edamamApiKey}&nutrition-type=cooking&ingr=${ingredientName['en-US']}`
//         //   );
//         const inputName = (ingredientName['en-US'].split(','))[0]
//         console.log('input name: ', inputName)
//         const requestBody = {
//             title: JSON.stringify(ingredientName['en-US']),
//             ingr: [inputName]
//           };
        
//         // send api POST request to edamam - with list of ingredients - to move it outside the function and take in list of ingredients - UPDATE - to be done at Ingredient level
//         const edamamResponse = fetch(
//             `${edamamApiURL}/nutrition-details?app_id=${edamamAppId}&app_key=${edamamApiKey}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(requestBody),
//             }
//             ).then(response => {
//                 if (!response.ok) {
//                   throw new Error(`HTTP error ${response.status}`);
//                 }
//                 return response.json();
//               })
//               .then(data => {
//                 const formattedJSON = JSON.stringify(data, null, 2);
//                 console.log('Response JSON:\n', formattedJSON);;
//                 // Handle the JSON data as needed
//               })
//               .catch(error => {
//                 console.error('Error fetching nutritional data:', error);
//               });

//         // created structure for the new Ingredient JSON object (remember to include Entry ID, Ingredients Entry IDs)
//         // create a Typescript Data structure
//         const ingredientData = {
//             ingredient: ingredientBaseInfo?.["en-US"]?.sys?.id || null,
//             amount: {
//               friendly: ingredientFriendlyAmount?.["en-US"] || null,
//               metric: ingredientMetricUnit?.["en-US"] || null,
//               imperial: ingredientImperialUnit?.["en-US"] || null
//             },
//             unit: {
//               friendly: ingredientFriendlyAmount?.["en-US"] || null,
//               metric: ingredientMetricUnit?.["en-US"] || null,
//               imperial: ingredientImperialUnit?.["en-US"] || null,
//             },
//             comment: {
//               en_GB: ingredientPrepComment?.["en-US"] || null,
//               en_US: ingredientPrepComment?.["en-GB"] || null,
//               de: ingredientPrepComment?.["de"] || null
//             },
//             includeInShoppingList: ingredientIsShoppingList,
//             metricWeight: 100
//           };
          
//           // If you need to convert it to a JSON string, you can use:
//           const jsonString = JSON.stringify(ingredientData, null, 2); // The second argument is for pretty-printing
//           console.log(jsonString);

//         // fetch each recipe and store the new Ingredient JSON object by fetching from the collection newIngredienObjecList that will be created

//     });
// }

// Frist: would need to add the new JSON entry field in the Contentful Content Model
// Need to connect to the Frontend app
async function createIngredientListEntry() {
    const ingredientSectionList = await getIngredientSectionData();
    const ingredientItemsList = await getIngredientItemData();
    
    const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
    const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID;
    const ACCESS_TOKEN = process.env.CMA_TOKEN;

    const client = contentfulManagement.createClient({
        accessToken: ACCESS_TOKEN
    });

    for (const ingredientSection of ingredientSectionList) {
        console.log('ingredientSection name: ', ingredientSection.fields.heading['en-US']);

        // Get the list of ingredientItem IDs
        const ingredientItemIdList = (ingredientSection.fields.ingredientItems['en-US'] || []).map((ingredientItem) => {
            console.log('---> ingredient section ids', ingredientItem.sys.id);
            return ingredientItem.sys.id; 
        });

        // Filter ingredientItems based on the IDs
        const ingredientItems = ingredientItemsList.filter((ingredientItem) => {
            return ingredientItemIdList.includes(ingredientItem.sys.id);
        });

        console.log('Filtered Ingredient Items:', JSON.stringify(ingredientItems, null, 2));

        // Create a list of ingredient references for IngredientListData
        const ingredientListDataPromises = ingredientItems.map((ingredientItem) => {
            return getUnit(ingredientItem.fields.ingredient['en-US'].sys.id).then(({ metricUnitId, imperialUnitId }) => {
                return {
                    ingredient: ingredientItem.fields.ingredient['en-US'].sys.id,
                    amount: {
                        friendly: ingredientItem.fields.friendlyAmount?.['en-US'] || null,
                        metric: ingredientItem.fields.metricAmount['en-US'],
                        imperial: ingredientItem.fields.imperialAmount['en-US']
                    },
                    unit: {
                        friendly: null, // Set as needed
                        metric: metricUnitId,
                        imperial: imperialUnitId,
                    },
                    comment: {
                        'en-GB': ingredientItem.fields.comment?.['en-US'] || null,
                        'en-US': ingredientItem.fields.comment?.['en-US-POSIX'] || null,
                        de: ingredientItem.fields.comment?.['de'] || null
                    },
                    includeInShoppingList: ingredientItem.fields.includeInShoppingList?.['en-US'] || null,
                    metricWeight: ingredientItem.fields.metricAmount['en-US']
                };
            });
        });
        
        try {
            const ingredientListData = await Promise.all(ingredientListDataPromises);
            console.log('Ingredient List Data:', JSON.stringify(ingredientListData, null, 2));

            // Update the Ingredient Section
            const space = await client.getSpace(SPACE_ID);
            const environment = await space.getEnvironment(ENVIRONMENT_ID);
            const entry = await environment.getEntry(ingredientSection.sys.id);

            // Ensure the ingredientListData field is initialized
            if (!entry.fields.ingredientListData) {
                entry.fields.ingredientListData = {};
            }
            entry.fields.ingredientListData['en-US'] = ingredientListData;

            // Update and publish the entry
            const updatedEntry = await entry.update();
            const publishedEntry = await updatedEntry.publish();

            console.log('Ingredient Section updated and published:', JSON.stringify(publishedEntry, null, 2));
        } catch (error) {
            console.error('Error fetching ingredient list data or updating Ingredient Section:', error);
        }
    }
}

async function getUnit(ingredientId){
    // from the ingredent collection filter the right ingredient id
    // collect the right the metricUnitId and imperialUnitId
    const ingredients = await getIngredientData()

    const ingredientFetched = ingredients.find((ingredient) => {
        return ingredient.id === ingredientId
    })

    if(ingredientFetched){
        const metricUnitId = ingredientFetched.fields.metricUnit?.sys.id || null;
        const imperialUnitId = ingredientFetched.fields.imperialUnit?.sys.id || null;

        return {
            metricUnitId,
            imperialUnitId
        };
    }else{
        console.error(`Ingredient with ID ${ingredientId} not found.`);
        return null;
    }

}

// 3. archive duplicate entries


module.exports = { transformData, transformIngredientData, createIngredientListEntry }
// module.exports = { transformData, transformIngredientData, findNutritionalData, createIngredientListEntry }