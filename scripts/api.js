/*** VARIABLES ***/

// Get the URL
const url_search = new URLSearchParams(window.location.search) ;
// Get api_url from URL parameters
const api_url = url_search.get("api_url") ;
// Get user from URL parameters
const user = url_search.get("user") ;
// Get tenant from URL parameters
const tenant = url_search.get("tenant") ;


/*** FUNCTIONS ***/