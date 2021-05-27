
//  object that contains the title-url pair for a tab
class Site{
    constructor(title, url){
        this.title = title;
        this.url = url;
    }

    displayTitle(){
        console.log(this.title);
    }

    displayUrl(){
        console.log(this.url);
    }
}

//  object that contains the tab information for any given session
class Session{
    constructor(name){
        this.name = name;
        this.sites = [];
    }

    addSite(tabSite){
        this.sites.push(tabSite);
    }

    deleteSite(tabData){
        //  insert code to delete website info from  chrome.storage
    }

    getSiteCount(){
        return this.sites.length;
    }

    //  testing purposes
    //  outputs the titles and urls for all contained sites to the Console
    displaySites(){
        for (var i = 0; i < this.sites.length; i++){
            this.sites[i].displayTitle();
            this.sites[i].displayUrl();
        }
    }

    //  export all contained information into a storable format for chrome.storage
    exportSession(){
        //  format: name/tab1.title, tab1.url/tab2.title, tab2.url/...tabn.title, tabn.url
        let _export = this.name + "|";
        
        for (var i = 0; i < this.sites.length; i++){
            _export = _export.concat(this.sites[i].title, ",", this.sites[i].url, "|");
        }

        console.log(_export);
    }

    //  parse an imported session from chrome.storage back into class format
    importSession(){
    }
}

const cachedSessions = [];

function getTabs() {
    
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                currentWindow: true
            }, function(tabs) {
                let siteArray = [];
                for (var i = 0; i < tabs.length; i++) {
                    siteArray.push(new Site(tabs[i].title, tabs[i].url));
                }
                resolve(siteArray);
            });
        } catch (e) {
            reject(e);
        }
    });

    // var tabTitleLinks = [];

    // let tabs = await chrome.tabs.query({currentWindow: true}, function(result) {

    //     let siteArray = [];

    //     for (var i = 0; i < result.length; i++){
    //         siteArray.push(new Site(result[i].title, result[i].url));
    //     }
    //     Object.assign(tabTitleLinks, siteArray);
    // });

    // var tabTitleLinks = [];

    // // for (var i = 0; i < tabs.; i++) {
        
    // //     console.log(i);
    // //     console.log(tab);
    // //     tabTitleLinks.push(new Site(tab.title, tab.url));
    // // }

    // return tabTitleLinks;
}

// //  locally stores the Sessions list
// function getSessions() {
//     return newchrome.storage.local.get('sessions', (results) => {
//         Object.assign(sessions, results.sessions);
//     });
// }

function getSessions() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get('sessions', function(results) {
                console.log(results.sessions);
                resolve(results.sessions);
            });
        } catch (e) {
            reject(-1);
        }
    });
}

//  updates the Sessions list in the Storage API
function updateStorage(updatedSessions) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({'sessions': updatedSessions}, function(results){
                console.log("stored " + results);
            });
            resolve(0);
        } catch(e){
            reject(1);
        }
    });
}

//  after pressing the button, a new Session is created with a default name
async function createSession(){

    var sessions = await getSessions(); //  wait for the async function to return sessions
    
    //  TESTING USE OF A CACHED SESSION ARRAY

    // if (typeof(sessions) != 'undefined') {
    //     cachedSessions = [];
    //     for (x in sessions) {
    //         cachedSessions.push(sessions[x])
    //     }
    //     console.log(cachedSessions); // for testing
    // }

    //  TESTING USE OF A CACHED SESSION ARRAY

    //  if Promise in getSessions() returned an 'undefined' object, then no sessions are saved in the Storage API
    //  so newName becomes Session 1. Otherwise just increment as usual.
    var newName = 'Session ' + ((typeof(sessions) == 'undefined') ? 1 : (sessions.length + 1));

    var newSession = new Session(newName);

    //  TESTING PROMISE VS. AWAIT

    var newTabs = await getTabs();

    // getTabs().then(tabs => {
    //     newTabs = tabs;
    //     console.log(newTabs);
    //     cachedSession.push(newTabs);
    // });

    //  TESTING PROMISE VS. AWAIT

    for (tab in newTabs) {
        newSession.addSite(newTabs[tab]);
    }

    sessions.push(newSession);
    // cachedSessions.push(newSession); // add the new session to the cached Sessions-list
    console.log(sessions);
    
    await updateStorage(sessions);
    updateSessions(sessions);
}

//  clears all <div> elements under the "session-cont" element so 
//  the list can be re-generated with any updates made to the sessions
function clearDivs(sessionContainer) {
    //  keeps removing child nodes until there are no more left
    while (sessionContainer.firstChild) {
        sessionContainer.removeChild(sessionContainer.firstChild);
    }
}

//  retrieves the Sessions-list from the Storage API and sets the "No Sessions" text accordingly
function initialLoad(initialSessions) {
    let noSessionText = document.getElementById('nosessiontext'); // get the text element from the HTML document

    if (initialSessions.length > 0) {
        noSessionText.style.display = 'none'; // remove the "No Sessions" text
        loadDivElements(initialSessions);
    } else {
        noSessionText.style.display = 'block';    
    }
}

function updateSessions(newSessions) {    
    clearDivs(document.querySelector('.session-cont'));

    console.log(newSessions);

    let noSessionText = document.getElementById('nosessiontext');

    if (typeof(newSessions) != 'undefined') {
        noSessionText.style.display = 'none';
        loadDivElements(newSessions);
    } else {
        noSessionText.style.display = 'block';
    }
}

//  create and load the div elements for all sessions stored
function loadDivElements(allSessions) {
    var sessionContainerRef = document.querySelector('.session-cont');

    for (var i = 0; i < allSessions.length; i++) {
        sessionContainerRef.appendChild(
            createSessionDiv(allSessions[i].name, allSessions[i].sites.length)
        );
    }
}

//  creates and returns a div element with the set parameters
function createSessionDiv(sessionName, sessionTabCount){
    var newDiv = document.createElement('div');
    newDiv.className = 'sessiondiv';

    var title = document.createElement('div');
    title.className = 'sessiontitle'
    title.innerHTML = sessionName;
    
    var tabCount = document.createElement('div');
    tabCount.className = 'tabcount';
    tabCount.innerHTML = "Number of tabs: " + sessionTabCount;
    
    newDiv.appendChild(title);
    newDiv.appendChild(tabCount);

    return newDiv;
}

document.addEventListener('DOMContentLoaded', async function() {

    // chrome.storage.local.clear();

    //  initialLoad will retrieve all current session information from the Storage API
    //  any other loads of the sessions-list will be done using the cached "sessions" constant
    //  on updateSessions()

    let initialSessions = await getSessions();

    console.log(initialSessions);

    initialLoad((typeof(initialSessions) == 'undefined') ? [] : initialSessions);

    // cachedSessions = await getSessions();
    
    var link = document.getElementById('savebutton');

    //  call the createSession() function when the Save button is clicked
    link.addEventListener('click', () => {
        createSession();
        // updateSessions(createSession());
    }, false);
})