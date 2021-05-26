
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
        this.sites = [0, 1, 2];
    }

    addSite(tabData){
        this.sites.push(tabData);
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

const sessions = [];

function getSessions() {
    chrome.storage.local.get('sessions', (results) => {
        Object.assign(sessions, results.sessions);
    });
}

function updateStorage() {
    chrome.storage.local.set({'sessions': sessions}, function(){});
}

function createSession(){

    // var store = chrome.storage.local;

    //  dummy sessions for the sake of testing
    // chrome.storage.local.set(
    //     {
    //         'sessions': [
    //             new Session("gang"), 
    //             new Session("test"), 
    //             new Session("bloop")
    //         ]
    //     }, function(){}
    // );

    var newName = 'Session ' + (sessions.length + 1);

    sessions.push(new Session(newName));
    updateStorage();
    
    // store.get(['sessions'], function(results) {
    //     console.log(results.sessions);

    //     var x = (
    //         (!results.sessions) ? 0 : results.sessions.length
    //     );
        
    //     var newName = 'Session ' + (x + 1);

    //     console.log(x);
    //     console.log(newName);

    //     var updatedSessionList = ((!results.sessions) ? [] : results.sessions);

    //     updatedSessionList.push(new Session(newName));

    //     store.set({'sessions': updatedSessionList}, function(){});   
    // });

    // store.get(['sessions'], function(results) {
    //     console.log(results.sessions);
    // });
}

function clearDivs(sessionContainer) {
    while (sessionContainer.firstChild) {
        sessionContainer.removeChild(sessionContainer.firstChild);
    }
}

function initialLoad() {
    chrome.storage.local.get(['sessions'], function(results) {

        let noSessionText = document.getElementById('nosessiontext');

        if (results.sessions.length > 0) {
            console.log("wassup");
            noSessionText.style.display = 'none';
            loadDivElements(results.sessions);
        } else {
            console.log("empty");
            noSessionText.style.display = 'block';    
        }

    });
}

function updateSessions() {    

    console.log(sessions);
    console.log(sessions.length);

    clearDivs(document.querySelector('.session-cont'));

    let noSessionText = document.getElementById('nosessiontext');

    if (sessions.length) {
        console.log("not empty");
        noSessionText.style.display = 'none';
        loadDivElements(sessions);
    } else {
        console.log('empty');
        noSessionText.style.display = 'block';
    }
}

//  create and load the div elements for all sessions stored
function loadDivElements(allSessions) {
    var sessionContainerRef = document.querySelector('.session-cont');

    for (var i = 0; i < allSessions.length; i++) {
        console.log(i);
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

document.addEventListener('DOMContentLoaded', function() {
    initialLoad();
    getSessions();

    var link = document.getElementById('savebutton');

    //  call the createSession() function when the Save button is clicked
    link.addEventListener('click', () => {
        createSession(); 
        updateSessions();
        // location.reload();
    }, false);
})