/*** VARIABLES ***/

// Get the URL
const urlSearch = new URLSearchParams(window.location.search);
// Get api_url from URL parameters
const apiUrl = urlSearch.get("apiUrl");
// Get tenantUrl from URL parameters
const tenantUrl = urlSearch.get("idnurl");
// Get user from URL parameters
const apiUser = urlSearch.get("apiUser");
// Get tenant from URL parameters
const tenantName = urlSearch.get("tenantName");
// Get tenant from URL parameters
const tenantLogo = urlSearch.get("tenantLogo");
// Access Token
let accessToken;

/*** FUNCTIONS ***/
async function apiCall() {
    await getAccessToken() ;
    try {
        // Build endpoint
        const endpoint = document.querySelector("#endpointInput").value;
        let endpointUrl = "https://" + apiUrl + endpoint
        
        // Build Authorization header
        let authorizationHeaders = { Authorization: 'Bearer '+accessToken}

        // Perform Request
        const response = await fetch(endpointUrl , {
            headers: authorizationHeaders
        });
        const responseJson = await response.json();
        alert("yeay : "+JSON.stringify(responseJson)) ;
        
    }
    catch (exceptionVar) {
        console.log("IdentityNow Extension : There was an errorwhen performing request : " + exceptionVar) ;
    }

}

async function getAccessToken(){
    try {
        let tokenUrl = "https://" + tenantUrl + "/ui/session";
        const response = await fetch(tokenUrl);
        const responseJson = await response.json();

        accessToken = responseJson.accessToken;
    }
    catch (exceptionVar) {
        console.log("IdentityNow Extension : There was an error retrieving tenant token : " + exceptionVar) ;
    }
}

/*** MAIN LOGIC ***/
document.querySelector("#tenantLogo").src = tenantLogo;
document.querySelector("#sendButton").addEventListener("click", async (event) => {
    await apiCall();
});