const contentful = require('contentful-management')
const dotenv = require('dotenv');

async function fetchData(contentType){
  dotenv.config();

  const accessToken = process.env.CMA_TOKEN
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  
  try{
    const client = contentful.createClient({
      accessToken: accessToken,
    });
    
    const ingredientList = client.getSpace(spaceId)
    .then((space) => space.getEnvironment(environmentId))
    .then((environment) => environment.getEntries({
        content_type: contentType,
        'sys.publishedAt[exists]': true, // do we consider draft entries?
        // 'fields.name[in]': 'chives',
        limit: 10,
        
    }))
    .then((ingredientEntries) => ingredientEntries.items)

    // handle pagination case
    return ingredientList

  }catch(error){
    console.error(error)
    return 'Error fetching contentful data'+ error
  }
}

module.exports = fetchData;