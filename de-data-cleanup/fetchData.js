const contentful = require('contentful-management')
const contentfulCDA = require('contentful')
const dotenv = require('dotenv');

async function fetchData(contentType){
  dotenv.config();

  const accessToken = process.env.CMA_TOKEN
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  const contentDeliveryAPI = process.env.CONTENT_DELIVERY_API
  
  try{
    const client = contentful.createClient({
      accessToken: accessToken,
    });
    
    const ingredientList = client.getSpace(spaceId)
    .then((space) => space.getEnvironment(environmentId))
    .then((environment) => environment.getEntries({
        content_type: contentType,
        limit: 50,
        
    }))
    .then((ingredientEntries) => ingredientEntries.items)
    
    return ingredientList

  }catch(error){
    console.error(error)
    return 'Error '+ error
  }
}

module.exports = fetchData;