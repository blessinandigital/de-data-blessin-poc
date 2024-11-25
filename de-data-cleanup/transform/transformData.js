/**
 * @typedef {Object} Amount
 * @property {int} friendly - A friendly representation of the amount.
 * @property {int} metric - The metric unit of the amount.
 * @property {int} imperial - The imperial unit of the amount.
 * @property {int} cups - The cups unit of the amount.
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

const fetchData = require("../extract/fetchData")
const dotenv = require('dotenv');
const contentfulManagement = require('contentful-management');
const convertImperial = require('./utils/convertToImperialUnit')
const { getIngredientItemData, getIngredientData, getIngredientSectionData, getUnitData } = require("../extract/getData");


// 1. calculate and convert imperial metric
// 2. send API request to Edamam to calculate the nutritional data


// async function fetchIngredientItemEdamam(ingredientItemList) {
//     const edamamApiURL = process.env.EDAMAM_API_BASE_URL
//     const edamamAppId = process.env.EDAMAM_APP_ID
//     const edamamApiKey = process.env.EDAMAM_API_KEY

//     // return metric, imperial, friendly amount and unit
//     // nutritionalDataResult = ingredientItemList.forEach(element => {

//         const ingredientNames = ingredientItemList.map(item => {
//             const { fields: { name: ingredientName } } = item;
//             return ingredientName['en-US'];
//         });

//         const requestBody = {
//             title: ingredientNames.join(', '),
//             // ingr: ingredientNames.map(name => name.split(',')[0].trim())
//             ingr: ingredientNames.map(name => name.trim())
//         };
//         // const {
//         //     fields: {
//         //       name: ingredientName,
//         //       metricAmount: ingredientMetricUnit,
//         //       imperialUnit: ingredientImperialUnit,
//         //       friendlyAmount: ingredientFriendlyAmount,
//         //       comment: ingredientPrepComment,
//         //       ingredient: ingredientBaseInfo

//         //     },
//         //   } = element;
//         //   console.log('--->', JSON.stringify(element, null, 2))
//         //   console.log('2--->', ingredientName)
//         // //   const response = fetch(
//         // //     `${edamamApiURL}/nutrition-data?app_id=${edamamAppId}&app_key=${edamamApiKey}&nutrition-type=cooking&ingr=${ingredientName['en-US']}`
//         // //   );
//         // const inputName = (ingredientName['en-US'].split(','))[0]
//         // console.log('input name: ', inputName)
//         // const requestBody = {
//         //     title: JSON.stringify(ingredientName['en-US']),
//         //     ingr: [inputName]
//         //   };

//         const standardMetricUnitList = ['grams', 'gram', 'milliliters', 'milliliter', 'liters', 'liter']

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
//                   throw new Error(`HTTP error ${response.status} - request body ${JSON.stringify(requestBody, null, 2)}`);
//                 }
//                 return response.json();
//               })
//               .then(data => {
//                 const formattedJSON = JSON.stringify(data, null, 2);
//                 console.log('Edamam API Response JSON:\n', formattedJSON);
//                 console.log('Raw data:', data);
//                 (data.ingredients).forEach(ingredientItem => {
//                     const isPresent = standardMetricUnitList.includes(ingredientItem.parsed[0].measure)
//                     console.log('7-->', ingredientItem.parsed[0].measure)
//                     console.log('isPresent -->', isPresent)

//                     // if unit present
//                     if(isPresent){
//                         return {unit: ingredientItem.parsed[0].measure,
//                              amount: ingredientItem.parsed[0].quantity, 
//                              metricWeight: ingredientItem.parsed[0].weight}
//                     }else if(ingredientItem.parsed[0].measure === 'whole'){
//                         return {unit: 'whole',
//                             amount: ingredientItem.parsed[0].quantity, 
//                             metricWeight: ingredientItem.parsed[0].weight} 
//                     }else{
//                         return {unit: '',
//                             amount: ingredientItem.parsed[0].quantity, 
//                             metricWeight: ingredientItem.parsed[0].weight} 
//                     }
//                 });
//               })
//               .catch(error => {
//                 console.error('Error fetching nutritional data:', error);
//               });
//             // });

//             // need to calculate imperial amount
//             // return friendly, imperial, metric, metricWeight values
//             // if the metric 'whole' stores a nothing
// }

dotenv.config();


// Create entry for each ingredientSection in Contentful
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

        // call edamam API 
        if (ingredientItems && ingredientItems.length) {
            const ingredientDataList = await fetchIngredientItemEdamam(ingredientItems);


            // Create a list of ingredient references for IngredientListData
            const ingredientListDataPromises = ingredientItems.map((ingredientItem, index) => {
                const ingredientData = ingredientDataList[index];
                return getIngredientUnit(ingredientItem.fields.ingredient['en-US'].sys.id).then(({ metricName, imperialName }) => {
                    const ingredientListData = {
                        amount: {
                            metric: ingredientData.amount,
                            imperial: ingredientData.amount,
                            friendly: ingredientData.friendlyAmount,
                        },
                        unit: {
                            metric: metricName || ingredientData.unit,
                            imperial: imperialName,
                            friendly: ingredientData.friendlyUnit,
                        },
                        metricWeight: ingredientData.metricWeight,
                        comment: {},
                    };

                    if (ingredientItem.fields.friendlyAmount?.['en-US'] && !ingredientDataList.amount?.friendly.length && !ingredientDataList.unt?.friendly.length) {
                        ingredientListData.amount.friendly = ingredientItem.fields.friendlyAmount['en-US'];
                        ingredientListData.unit.friendly = ingredientItem.fields.friendlyAmount['en-US'];
                    }

                    if (!ingredientDataList.amount?.metric && !ingredientDataList.unit?.metric) {
                        ingredientListData.amount.metric = ingredientItem.fields.metricAmount['en-US'];
                        ingredientListData.unit.metric = metricName;
                    }

                    if (ingredientItem.fields.imperialAmount['en-US']) {
                        ingredientListData.amount.imperial = ingredientItem.fields.imperialAmount['en-US'];
                        ingredientListData.unit.imperial = imperialName;
                    }

                    if (ingredientItem.fields.comment?.['en-US']) {
                        ingredientListData.comment['en-GB'] = ingredientItem.fields.comment['en-US']; // get it from the edamam api
                        ingredientListData.comment['en-US'] = ingredientItem.fields.comment['en-US'];
                    }

                    if (ingredientItem.fields.comment?.['de']) {
                        ingredientListData.comment.de = ingredientItem.fields.comment['de'];
                    }

                    if (ingredientItem.fields.includeInShoppingList?.['en-US']) {
                        ingredientListData.includeInShoppingList = ingredientItem.fields.includeInShoppingList['en-US'];
                    }

                    ingredientListData.metricWeight = ingredientItem.fields.metricAmount['en-US']; // It will contain the value used to conduct calculations

                    return ingredientListData;
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
}
async function fetchIngredientItemEdamam(ingredientItems) {
    const edamamApiURL = process.env.EDAMAM_API_BASE_URL;
    const edamamAppId = process.env.EDAMAM_APP_ID;
    const edamamApiKey = process.env.EDAMAM_API_KEY;

    const ingredientNames = ingredientItems.map(item => {
        const { fields: { name: ingredientName } } = item;
        return ingredientName['en-US'];
    });

    const requestBody = {
        title: ingredientNames.join(', '),
        ingr: ingredientNames.map(name => name.trim())
    };

    const standardMetricUnitList = ['grams', 'gram', 'milliliters', 'milliliters', 'liters', 'liter'];

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

        // Prepare the results array
        const ingredientDataList = data.ingredients.map(ingredientItem => {
            const parsedItem = ingredientItem.parsed[0];
            let unit = '';
            let amount = 0;
            let metricWeight = 0;
            let friendlyUnit = '';
            let friendlyAmount = 0;

            if (parsedItem) {
                if (standardMetricUnitList.includes(parsedItem.measure)) {
                    unit = parsedItem.measure;
                    amount = parsedItem.quantity;
                    metricWeight = parsedItem.weight;
                    friendlyAmount = extractFirstNumber(ingredientItem.text);
                } else if (parsedItem.measure === 'whole') {
                    unit = 'whole';
                    amount = parsedItem.quantity;
                    metricWeight = parsedItem.weight;
                    friendlyAmount = extractFirstNumber(ingredientItem.text);
                } else {
                    friendlyAmount = extractFirstNumber(ingredientItem.text);
                    friendlyUnit = parsedItem.measure
                    metricWeight = parsedItem.weight;
                }
            }

            // Return the structured object for each ingredient
            return {
                unit,
                amount,
                metricWeight,
                friendlyUnit,
                friendlyAmount
            };
        });

        return ingredientDataList; // Return the list of ingredient data
    } catch (error) {
        console.error('Error fetching nutritional data:', error);
        return [];
    }
}

function extractFirstNumber(ingredientItemText) {
    // Regular expression to find the first number, decimal, or fraction in the string
    const match = ingredientItemText.match(/(\d+\.\d+|\d+\/\d+|\d+)/);

    if (match) {
        const value = match[0];

        // Check if the value is a fraction
        if (value.includes('/')) {
            const [numerator, denominator] = value.split('/').map(Number);
            // Check if both numerator and denominator are valid numbers
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                return numerator / denominator; // Return the decimal value of the fraction
            } else {
                return 1; // Return 1 if the fraction is invalid
            }
        } else if (value.includes('.')) {
            // If it's a decimal number, return it as a number
            return Number(value);
        }

        // If it's a whole number, return it as a number
        return Number(value);
    }

    return 1; // Return 1 if no match is found
}

// from the ingredent collection filter the right ingredient id
// collect the right the metricUnitId and imperialUnitId
async function getIngredientUnit(ingredientId) {
    console.log('5')
    const ingredients = await getIngredientData([ingredientId])
    console.log('ingredients fetched ', ingredients)

    const ingredientFetched = ingredients.find((ingredient) => {
        return ingredient.sys.id === ingredientId
    })

    if (ingredientFetched) {
        const metricUnitId = ingredientFetched.fields.metricUnit?.['en-US']?.sys.id || null;
        const imperialUnitId = ingredientFetched.fields.imperialUnit?.['en-US']?.sys.id || null;
        const unitList = await getUnitData([metricUnitId, imperialUnitId])
        console.log('unit list fetched ', JSON.stringify(unitList, null, 2))
        const metricValue = unitList.find(entry => entry.sys.id === metricUnitId);
        const imperialValue = unitList.find(entry => entry.sys.id === imperialUnitId);

        console.log('6 --->', metricValue, imperialValue);

        console.log(`Found ingredient with name ${ingredientFetched.fields.name['en-US']} and id ${ingredientId}`)
        const metricName = metricValue?.fields?.singularName?.['en-US'] || null
        const imperialName = imperialValue?.fields?.singularName?.['en-US'] || null
        console.log(`unit found --> ${imperialName}, ${metricName}`)

        const result = {};
        if (metricValue && imperialValue) {
            const metricName = metricValue.fields?.singularName?.['en-US'];
            const imperialName = imperialValue.fields?.singularName?.['en-US'];
            console.log(`unit found --> ${imperialName}, ${metricName}`);

            return { metricName, imperialName };
        } else {
            console.error(`Unit data not found for ingredient with ID ${ingredientId}`);
            return {};
        }
    } else {
        console.error(`Ingredient with ID ${ingredientId} not found.`);
        return { metricName: null, imperialName: null };
    }

}


module.exports = { transformData, createIngredientListEntry }
