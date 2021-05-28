
//  object that contains the title-url pair for a tab
class Site{
    constructor(title, url, icon){
        this.title = title;
        this.url = url;
        this.icon = icon;
    }

    getName(){
        return this.title;
    }

    getUrl(){
        return this.url;
    }

    getIcon(){
        return this.icon;
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
}

function getTabs() { 
    
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                currentWindow: true
            }, function(tabs) {
                let siteArray = [];
                for (var i = 0; i < tabs.length; i++) {
                    siteArray.push(new Site(tabs[i].title, tabs[i].url, tabs[i].favIconUrl));
                }
                resolve(siteArray);
            });
        } catch (e) {
            reject(e);
        }
    });
}

function getSessions() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get('sessions', function(results) {
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
            chrome.storage.local.set({'sessions': updatedSessions}, function(){});
            resolve(0);
        } catch(e){
            reject(1);
        }
    });
}

//  after pressing the button, a new Session is created with a default name
async function createSession(){

    var sessions = await getSessions(); //  wait for the async function to return sessions

    if (typeof(sessions) == 'undefined') {
        sessions = [];
    }

    //  if Promise in getSessions() returned an 'undefined' object, then no sessions are saved in the Storage API
    //  so newName becomes Session 1. Otherwise just increment as usual.
    var newName = 'Session ' + ((typeof(sessions) == 'undefined') ? 1 : (sessions.length + 1));
    var newSession = new Session(newName);

    var newTabs = await getTabs();
    for (x in newTabs) {
        newSession.addSite(newTabs[x]);
    }

    sessions.push(newSession);

    await updateStorage(sessions);
    updateSessions(sessions);
}

//  clears all <div> elements under the "session-cont" element so 
//  the list can be re-generated with any updates made to the sessions
function clearDivs(container) {
    //  keeps removing child nodes until there are no more left
    while (container.firstChild) {
        container.removeChild(container.firstChild);
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
            createSessionDiv(i, allSessions[i].name, allSessions[i].sites.length)
        );
    }
}

async function sessionClick(sessionIndex) {

    tabs = (await getSessions())[sessionIndex];
    
    var sessionContainerRef = document.querySelector('.session-cont');
    sessionContainerRef.style.display = 'none';

    var footerRef = document.querySelector('.footer');
    footerRef.style.display = 'none';

    var tabContainerRef = document.querySelector('.tab-cont');
    tabContainerRef.style.display = 'block';

    var sessionHeader = document.querySelector('.sessionheader');
    sessionHeader.style.display = 'none';

    var frontHeader = document.querySelector('.tabheader');
    frontHeader.style.display = 'block'; 
    

    // var sessionTitleText = document.getElementById('sessiontitletext');
    // sessionTitleText.style.display = 'block';
    // sessionTitleText.innerHTML = tabs.name;

    var leftContainer = document.querySelector('.leftcontainer');
    leftContainer.style.display = 'block';

    // var backArrow = document.getElementById('leftarrow');

    for (var i = 0; i < tabs.sites.length; i++) {
        var site = tabs.sites[i];
        console.log(site);
        console.log(site.url);
        tabContainerRef.appendChild(
            createTabDiv(site.title, site.url)
        );
    }
}

async function backClick(sessionIndex) {

    // tabs = (await getSessions())[sessionIndex];
    
    var sessionContainerRef = document.querySelector('.session-cont');
    sessionContainerRef.style.display = 'block';

    // var footerRef = document.querySelector('.footer');
    // footerRef.style.display = 'none';

    // var tabContainerRef = document.querySelector('.tab-cont');
    // tabContainerRef.style.display = 'block';

    // var sessionHeader = document.querySelector('.sessionheader');
    // sessionHeader.style.display = 'none';

    // var frontHeader = document.querySelector('.tabheader');
    // frontHeader.style.display = 'block'; 
    

    // var sessionTitleText = document.getElementById('sessiontitletext');
    // sessionTitleText.style.display = 'block';
    // sessionTitleText.innerHTML = tabs.name;

    // var leftContainer = document.querySelector('.leftcontainer');
    // leftContainer.style.display = 'block';

    // // var backArrow = document.getElementById('leftarrow');

    // for (var i = 0; i < tabs.sites.length; i++) {
    //     var site = tabs.sites[i];
    //     console.log(site);
    //     console.log(site.url);
    //     tabContainerRef.appendChild(
    //         createTabDiv(site.title, site.url)
    //     );
    // }
}

//  creates and returns a div element with the set parameters
function createSessionDiv(sessionIndex, sessionName, sessionTabCount){
    var newDiv = document.createElement('div');
    newDiv.id = sessionIndex;
    newDiv.onclick = function(){sessionClick(newDiv.id)};
    newDiv.className = 'sessiondiv';

    var title = document.createElement('div');
    title.className = 'sessiontitle';
    title.innerHTML = sessionName;
    
    var tabCount = document.createElement('div');
    tabCount.className = 'tabcount';
    tabCount.innerHTML = 'Number of tabs: ' + sessionTabCount;
    
    newDiv.appendChild(title);
    newDiv.appendChild(tabCount);

    return newDiv;
}   

function createTabDiv(tabName, tabLink) {
    var newDiv = document.createElement('div');
    newDiv.className = 'sessiondiv';

    var title = document.createElement('div');
    title.className = 'tabtitle';
    title.innerHTML = tabName;

    var tabUrl = document.createElement('div');
    tabUrl.className = 'taburl';
    tabUrl.innerHTML = "URL: " + tabLink;

    newDiv.appendChild(title);
    newDiv.appendChild(tabUrl);

    return newDiv;
}

document.addEventListener('DOMContentLoaded', async function() {

    // chrome.storage.local.clear();

    var tabContainerRef = document.querySelector('.tab-cont');
    tabContainerRef.style.display = 'none';

    //  initialLoad will retrieve all current session information from the Storage API
    //  any other loads of the sessions-list will be done using the cached "sessions" constant
    //  on updateSessions()

    let initialSessions = await getSessions();
    initialLoad((typeof(initialSessions) == 'undefined') ? [] : initialSessions);
    
    var link = document.getElementById('savebutton');

    //  call the createSession() function when the Save button is clicked
    link.addEventListener('click', () => {
        createSession();
    }, false);

    var back = document.querySelector('.leftcontainer');

    back.addEventListener('click', () => {
        backClick()
    }, false);

})