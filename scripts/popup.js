/*** VARIABLES ***/
// Get the URLs we want to monitor from the manifest
const idn_urls = chrome.runtime.getManifest().host_permissions;
// Version
const version = chrome.runtime.getManifest().version;

// Regexp for detecting IdentityNow tabs
const idn_regexp = /(?:http)?s?(?::\/\/)?(([\w-]+)\.identitynow(?:-demo)?\.com)(\/.*)?/
// Get the opened IDN tabs
const tabs = await chrome.tabs.query({
  url: idn_urls
});
// Get the template from our popup page
const template = document.getElementById("template");
// Get the main table
const mainTable = document.querySelector("#main-table");
// Declare a map of elements in order to manage potential duplicates (several tabs on the same tenant)
const tenantsMap = new Map();



/*** FUNCTIONS ***/
// Build API URL from tenant URL
function getAPIURL(url) {
  return url.replace("identitynow", "api.identitynow");
}

// Function injected in the tenant page just to get info
function grabTenantInfo() {
  try {

    // the script id=slpt-navigation-json contains data we want
    slptNavigation = JSON.parse(document.getElementById("slpt-navigation-json").textContent);
    // Tenant Name is retrieved from the page title
    tenantName = document.querySelector("title").textContent;
    // username is retrieved from the slpt-navigation-json script
    userName = slptNavigation.default.filter(el => el.id === "slpt-nav-account")[0].label;
    // logo is retrieved from the slpt-navigation-json script
    logoUrl = slptNavigation.navLogo;

    tenantInfo = {
      orgStandardLogoUrl: logoUrl,
      orgProductName: tenantName,
      userName: userName
    };

    return tenantInfo;

  } catch (exceptionVar) {
    console.log("IdentityNow Extension : There was an error retrieving tenant info : " + exceptionVar);
  }
}

// Callback function retrieving the data for the tenantInfo
function onGetTenantLogo(result) {
  try {
    return result[0].result;
  } catch (exceptionVar) {
    console.log("Identity Now Extension : There was an error retrieving tenant info : " + exceptionVar);
  }
}

// Clipboard functions
// Reset Clipboard to nothing after <delay> seconds 
async function clearClipboardAfter(delay) {
  console.log("Clear Clipboard placeholder");
}

// Write <text> to clipboard
function writeToClipBoard(token, iconUrl, idnTenant) {

  // Building clipboard data
  const type = "text/plain";
  const blob = new Blob([token], { type });
  const data = [new ClipboardItem({ [type]: blob })];

  // Building notification data 
  let notifData = {
    type: "basic",
    iconUrl: "images/spidn-128.png",
    title: "IDN Extension - " + idnTenant,
  }

  navigator.clipboard.write(data).then(
    () => {
      notifData.message = "Successfully written the token for " + idnTenant + " to the clipboard";
      chrome.notifications.create(notifData);
    },
    () => {
      notifData.message = "Error when writing the token for " + idnTenant + " to the clipboard";
      chrome.notifications.create(notifData);
    }
  );

}

/*** MAIN LOGIC ***/
// Populate static elements
document.querySelector("#version").textContent = "Chrome extension v"+version

// Loop through IDN tenants found tabs
for (const tab of tabs) {
  // Try to determine if we are logged into this tenant
  // In order to do this, we try to get the tenant's logo
  // in the top left corner
  let getTenantInfoFromTab = {
    target: { tabId: tab.id },
    func: grabTenantInfo
  };

  // Build relevant IDN data from tab data
  let idnMatches = tab.url.match(idn_regexp);
  let idnTenant = idnMatches[2];
  let idnUrl = idnMatches[1];

  // Get Da Logo from the tab
  await chrome.scripting.executeScript(getTenantInfoFromTab)
    // Everything went smoothly : we have tenantInfo
    .then((result) => {

      // retrieve tenant info
      let tenantInfo = result[0].result;

      // Clone the row
      const element = template.content.firstElementChild.cloneNode(true);

      //Set the row id to the tenant name
      element.id = idnTenant;

      // Set row id with the tenant
      element.setAttribute("data-idnurl", idnTenant);

      // Set Icon
      element.querySelector(".tenanticon").src = tenantInfo.orgStandardLogoUrl;

      // Set Tenant Name
      element.querySelector(".idntenant").textContent = tenantInfo.orgProductName;
      // Set URL
      element.querySelector(".idnurl").textContent = idnUrl;
      // Set User
      element.querySelector(".idnuser").textContent = tenantInfo.userName;

      // Create the "Access Token" Button
      let button_access_token = element.querySelector(".get_access_token");
      button_access_token.textContent = "Copy Access Token";
      button_access_token.setAttribute("data-tabid", tab.id);
      button_access_token.setAttribute("data-idnurl", idnUrl);
      button_access_token.setAttribute("data-idntenant", idnTenant);
      button_access_token.setAttribute("data-idnapiurl", getAPIURL(idnUrl));
      // Add the event listener to copy the access token to the clipboard
      button_access_token.addEventListener("click", async (event) => {
        let token_url = "https://" + event.target.dataset.idnurl + "/ui/session";
        fetch(token_url)
          .then(r => r.text())
          .then(result => {

            writeToClipBoard(JSON.parse(result).accessToken, tab.favIconUrl, idnTenant);
            clearClipboardAfter(10).then(
              () => { console.log("Clipboard successfully cleared") },
              () => { console.error(); ("Error while clearing clipboard") },
            )

          }).catch(e => {
            console.log(e);
          });
      }) ;

      // Create the "API" Button
      let button_api = element.querySelector(".api");
      button_api.textContent = "Copy Access Token";
      button_api.setAttribute("data-tenantUrl", idnUrl);
      button_api.setAttribute("data-idnapiurl", getAPIURL(idnUrl));
      button_api.setAttribute("data-idnuser", tenantInfo.userName);
      button_api.setAttribute("data-tenantLogo", tenantInfo.orgStandardLogoUrl);
      button_api.setAttribute("data-idntenant", tenantInfo.orgProductName);
      // Add the event listener to copy the access token to the clipboard
      button_api.addEventListener("click", async (event) => {
        const tenantInfo = event.target.dataset;
        window.location = "api.html?idnurl="+tenantInfo.tenanturl+"&apiUrl="+tenantInfo.idnapiurl+"&apiUser="+tenantInfo.idnuser+"&tenantLogo="+tenantInfo.tenantlogo+"&tenantName="+tenantInfo.idntenant ;
      }) ;

      // Add this to the hash
      // the idnUrl is used as a key to avoid duplicates
      tenantsMap.set(idnUrl,element) ;

      // Things went wrong
    }).catch(e => {
      /* in case one would want to display problematic tenant, the code is here
      // Clone the row
      const element = template.content.firstElementChild.cloneNode(true);

      //Set the row id to the tenant name
      element.id = idnTenant;
      element.setAttribute("class","errorTenant") ;

      // Set row id with the tenant
      element.setAttribute("data-idnurl", idnTenant);

      // Set URL
      element.querySelector(".idnurl").textContent = idnUrl;
      mainTable.append(element);
      */

    });;


}
// add our map of elements to the main table.


tenantsMap.forEach( (value,key) => mainTable.append(value));