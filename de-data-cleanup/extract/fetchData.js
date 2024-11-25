const contentful = require('contentful-management')
const dotenv = require('dotenv');

async function fetchData(contentType, entryIds = null) {
    dotenv.config();
  
    const accessToken = process.env.CMA_TOKEN;
    const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID;
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
  
    try {
      const client = contentful.createClient({
        accessToken: accessToken,
      });
  
      const ingredientList = client
        .getSpace(spaceId)
        .then((space) => space.getEnvironment(environmentId))
        .then((environment) => {
          const query = {
            'sys.publishedAt[exists]': true,
            limit: 5,
          };
  
          if (entryIds) {
            query['sys.id[in]'] = entryIds.join(',');
          } else {
            query.content_type = contentType;
          }
  
          return environment.getEntries(query);
        })
        .then((ingredientEntries) => ingredientEntries.items);
  
      // TO DO : handle pagination case
      return ingredientList;
    } catch (error) {
      console.error(error);
      return 'Error fetching contentful data' + error;
    }
  }

module.exports = fetchData;