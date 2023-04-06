/*** VARIABLES ***/
// Get the URLs we want to monitor from the manifest
const idn_urls = chrome.runtime.getManifest().host_permissions;
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



/*** FUNCTIONS ***/
// Build API URL from tenant URL
function getAPIURL(url) {
  return url.replace("identitynow", "api.identitynow");
}

// Function injected in the tenant page just to info
function grabTenantInfo() {
  try {
    slptGobals = JSON.parse(document.getElementById("slpt-globals-json").textContent);
    orgStandardLogoUrl = slptGobals.orgStandardLogoUrl;
    orgProductName = slptGobals.orgProductName;
    userName = slptGobals.userInfo.displayName;
    tenantInfo = {
      orgStandardLogoUrl: orgStandardLogoUrl,
      orgProductName: orgProductName,
      userName: userName
    };

    tenantInfo = {
      orgStandardLogoUrl: orgStandardLogoUrl,
      orgProductName: orgProductName,
      userName: userName
    };

    console.log("IdentityNow tenant Info is : " + JSON.stringify(tenantInfo));
    return tenantInfo;

  } catch (exceptionVar) {
    console.log("IdentityNow Extension : There was an error retrieving tenant info : " + exceptionVar);
    return null;
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
      notifData.message = "Successfully written the token for " + idnTenant + "to the clipboard";
      chrome.notifications.create(notifData);
    },
    () => {
      notifData.message = "Error when writing the token for " + idnTenant + "to the clipboard";
      chrome.notifications.create(notifData);
    }
  );

}

/*** MAIN LOGIC ***/
// Loop through IDN tenants found tabs
for (const tab of tabs) {
  // Try to determine if we are logged into this tenant
  // In order to do this, we try to get the tenant's logo
  // in the top left corner
  let getTenantInfoFromTab = {
    target: { tabId: tab.id },
    func: grabTenantInfo
  };

  // Get Da Logo from the tab
  chrome.scripting.executeScript(getTenantInfoFromTab)
    .then((result) => {

      // retrieve tenant info
      let tenantInfo = result[0].result;

      // Clone the row
      const element = template.content.firstElementChild.cloneNode(true);
      // Build relevant IDN data from tab data
      let idnMatches = tab.url.match(idn_regexp);
      let idnTenant = idnMatches[2];
      let idnUrl = idnMatches[1];

      // Set Icon
      element.querySelector(".tenanticon").src = tenantInfo.orgStandardLogoUrl;

      // Set Tenant Name
      element.querySelector(".idntenant").textContent = tenantInfo.orgProductName;
      // Set URL
      //element.querySelector(".idnurl").textContent = idnUrl;

      // Create the "Access Token" Button
      let button_access_token = element.querySelector(".get_access_token");

      button_access_token.textContent = "Copy Access Token";
      button_access_token.setAttribute("data-tabid", tab.id);
      button_access_token.setAttribute("data-idnurl", idnUrl);
      button_access_token.setAttribute("data-idntenant", idnTenant);
      button_access_token.setAttribute("data-idnapiurl", getAPIURL(idnUrl));

      // Add its event listener to copy the access token to the clipboard
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

          });
      });

      // Add this to the main table
      mainTable.append(element);
    });
}