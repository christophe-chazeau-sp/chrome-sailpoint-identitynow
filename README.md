# IdentityNow Chrome Extension.

> **NOT developped, maintained or supported by SailPoint**

## What is it ?

The idea of this extension is very simple :

**Provide the ability to retrieve access tokens from browser opened sessions**

It is basically a GUI replacement for 
1. Opening the https://{tenantURL}/ui/session URL
2. Copy the accessToken property from the JSON

It presents all the currently openened tenant in a nice list and provides the ability to copy the accessToken to the clipboard with only a click.


![Identity Now Extension](https://raw.githubusercontent.com/christophe-chazeau-sp/chrome-sailpoint-identitynow/master/images/README/extension-screenshot.png)

## How to use it
For the time being, it's only possible to use it via an unpacked extension like so, from the command line.

```
git clone https://github.com/christophe-chazeau-sp/chrome-sailpoint-identitynow
"C:\Program Files\Google\Chrome\Application\chrome.exe" --load-extension=<path to cloned repo>
```

Or by loading it from chrome directly as described in the official doc : https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked