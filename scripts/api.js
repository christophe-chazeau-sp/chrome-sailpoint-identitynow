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
// JSON Editor for Response container
const responseJSONContainer = document.getElementById("responseJSON") ;
// JSON Editor for Response options
const optionsResponseJSONEditor = {
    modes:['preview','view'],
    mode: 'code',
    name:"IDN",
    indentation:2
} ;
// JSON Editor for Response
const responseJSONEditor = new JSONEditor(responseJSONContainer, optionsResponseJSONEditor) ;
responseJSONEditor.set({"response":"will be displayed here"}) ;

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
        responseJSONEditor.set(responseJson) ;  
    }
    catch (exceptionVar) {
        console.log("IdentityNow Extension : There was an error when performing a request : " + exceptionVar) ;
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
