import ApiUtils from './ApiUtils'
var Api = {  
  getItems: function(url) {
    return fetch(url)
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .catch(e => e)
  }
};
export { Api as default };
