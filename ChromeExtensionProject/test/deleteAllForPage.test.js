

const chai = require('chai'); //assertion library for testing
const expect = chai.expect; //import expect, functionally the same as should if you see it used by other testers.
const sinon = require('sinon'); //sinon for extras like spies, stubs, and sandboxes.
const sinonChrome = require('sinon-chrome'); //to recreate chrome's storage API. shout out to https://github.com/acvetkov/sinon-chrome for this module.
global.chrome = sinonChrome; //assign chrome as a global variable for sinon-chrome.
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const { JSDOM } = require('jsdom');
global.window = new JSDOM().window; //creates dummy document
global.document = window.document;

//creating an isolated function for deleteAllForPage

function deleteAllForPage() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async tabs => {
        console.log('tabs:', tabs);
        let url = tabs[0].url;
        console.log('url:', url);
        chrome.storage.sync.get([url], function (items) {
            console.log('items:', items);
            //this is backwards
            console.log("items[url]:",items[url]);
            if (typeof items[url] === "undefined") {
                //Empty list for URL
            } else {
                try {

                //TESTING STRINGIFY - MB
                //starting to fix top to bottom
                    console.log(url, " IN DELETE FUNC || BEFORE");
                    urlString = JSON.stringify(items[url]);

                    //let idsRemove = JSON.parse(items[url]);
                    let idsRemove = JSON.parse(urlString);

                    console.log(idsRemove, " N DELETE FUNC || AFTER");
                    
                    //testing delete function
                    chrome.storage.local.remove([items,idsRemove],function(){
                         var error = chrome.runtime.lastError;
                            if (error) {
                                console.error(error);
                            }
                        });
                        
                    //deprecated
                    //i'm not sure if you can use console log insid of these statements
                    console.log("starting remove cycle");
                    console.log("url before remove cycle what the HECK is this doing" + url + " okay thats that, here is idsremoved " + idsRemove);
                    chrome.storage.sync.remove(idsRemove, function () {
                        chrome.storage.sync.remove([url]);
                        //Removes notes from URL 
                        notesDiv.replaceChildren();
                    });
                     console.log("Removed: ", idsRemove);
                     console.log("chrome storage remove args (should not be empty):",chrome.storage.sync.remove.args);
                    console.log("ending cycle")
;
                } catch (e) {
                    console.error('Parsing error:', e);
                }
            }
        
    });
    });
}

describe('deleteAllForPage', function() {
    //sandbox = sinon.createSandbox();
    beforeEach(function(){
        chrome.storage.sync.get = sinon.stub();
        chrome.tabs.query = sinon.stub();
        chrome.storage.sync.remove = sinon.stub();
    });
    afterEach(function(){
    sinon.restore();
    });
    it('insert description here',function() {
    const url = "https://google.com";
    const notesDiv = document.createElement('div');
    chrome.tabs.query.callsArgWith(1,[{url}]);
    chrome.storage.sync.get.withArgs([url]).yields({ [url] : 'value'});

    //check if it is queuring the url
    //console.log("What is this query doing? ", chrome.tabs.query.callsArgWith(1,[{url}]));

    deleteAllForPage();
    //pass (for now)
      // Wait for chrome.storage.sync.remove() to complete
      setTimeout(function() {
        expect(chrome.storage.sync.remove.args).to.equal([[url]]);
        expect(notesDiv.children).to.be.empty;
        done();
      }, 10); //this timeout is done because chrome storage works asynchronously, and our tests for this work synchronously. This waiting period allows chrome.storage.remove to function properly. 
    expect(notesDiv.children).to.be.empty;


    });    
});

