'use strict'
const clearStorageButton = document.getElementById("clearStorage");  //this is added functionality for dev stuff so that we can clear storage for form.html.
//IDK IF THIS BREAKS STUFF EDWIN SORRY.


// stores a new genre param is a string represeting one genre
function storeGenre(genre) {
    chrome.storage.sync.get(['genre'], function (items) {
        let json = {};
        let genres = [];
        if (items['genre']) { 
            genres = JSON.parse(items['genre']);
            genres.put(genre);
            json['genre'] = JSON.stringify(genres);
            chrome.storage.sync.set(json, function() {
            })
        } else { // if there isnt any genres already
            genres.put(genre);
            json['genre'] = JSON.stringify(genres);
            chrome.storage.sync.set(json, function() {
            })
        }
    });
}

//returns list of genres
function getGenres() {
chrome.storage.sync.get(['genre'], function (items) {
    if(items['genre']) {
        genres = JSON.parse(items['genre']);
        return genres; 
    }
});

}

var notesAsObjects = [];
var keys = [];
var notesDiv = document.querySelector('#notes');
var noteInput = document.querySelector('#noteInput');
var ids = new Array();
chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    chrome.storage.sync.get([url], function (items) {

        if (items[url]) {
            keys = JSON.parse(items[url]);
            console.log(keys);
            chrome.storage.sync.get(keys, function (items) {
                console.log(items);
                keys.forEach(key => {
                    let noteObj = JSON.parse(items[key]);
                    notesAsObjects.push(noteObj);
                })
                notesAsObjects.forEach(note => {
                    placeNote(note, url);
                })
            });
        }

    //     chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    //     let title = tabs[0].title

    //     chrome.storage.sync.get([title], function (items) {

    //         if (items[title]) {
    //             keys = JSON.parse(items[title]);
    //             console.log(keys);
    //             chrome.storage.sync.get(keys, function (items) {
    //                 console.log(items);
    //                 keys.forEach(key => {
    //                     let noteObj = JSON.parse(items[key]);
    //                     notesAsObjects.push(noteObj);
    //                 })
    //                 notesAsObjects.forEach(note => {
    //                     placeNote(note, title);
    //                 })
    //             });
    //         }
    
    //     });
    // });

    });

});


function placeNote(note, url) {
    let div = document.createElement('div');
    let p = document.createElement('p');
    div.append(p);
    
    p.textContent = note.title;
    div.classList.add("note");
    notesDiv.append(div);
    let button = document.createElement('button');
    button.addEventListener('click', function (e) {
        chrome.storage.sync.get([url], function (item) {
            let ids = JSON.parse(item[url]);
            ids.splice(ids.indexOf(note.id), 1);
            chrome.storage.sync.remove([url], function () {
                let json = {};
                json[url] = JSON.stringify(ids);
                chrome.storage.sync.set(json, function() {
                    chrome.storage.sync.remove([note.id], function() {
                        e.target.parentElement.replaceChildren();
                    })
                })
            });
        });
    });
    p.addEventListener('click', function () {
        scrollToLocation(note);
    })
    div.append(button);
    button.textContent = "[X]";
    button.classList.add("deleteNoteButton");
}

 // on add note -- note from Isaac: I uncommented this since we actually did not need this to be de-anonymized. We found a separate solution for our issues with testing. 
/*document.querySelector('#addNote').addEventListener('click', function (e) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async tabs => {
         let url = tabs[0].url;
         chrome.storage.sync.get([url], function (items) {
             console.log(items[url]);
            if (typeof items[url] === "undefined") {
                 ids = [];
                 setNote(url);
             } else {
                 ids = JSON.parse(items[url]);
                 chrome.storage.sync.remove([url], function () {
                     //removes current list of ids so that same url key can be used agin
                     console.log("old ids" + ids);
                     setNote(url);
                 });
             }
         });


     });
 });
*/
function setNote(url) {
    let currentId = Date.now();
    ids.push(currentId.toString());
    let newNote = { note: noteInput.value, id: currentId.toString() };
    placeNote(newNote, url);
    let currentNote = JSON.stringify(newNote);
    let currentIds = JSON.stringify(ids);
    let json = {};
    let json2 = {};
    json[currentId] = currentNote;
    json2[url] = currentIds;
    console.log(json);
    console.log(json2);
    chrome.storage.sync.set(json, function () {
        //stores notes in persistence storage based on id
        chrome.storage.sync.set(json2, function () {
            //stores a list or ids with key url 
            noteInput.textContent = "";
        });
    });
}


document.querySelector('#clearPage').addEventListener('click', function () {
        deletAllForPage();
});

function deletAllForPage() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async tabs => {
        let url = tabs[0].url;
        chrome.storage.sync.get([url], function (items) {
            if (typeof items[url] === "undefined") {
                //Empty list for URL
            } else {
                let idsRemove = JSON.parse(items[url]);
                chrome.storage.sync.remove(idsRemove, function () {
                    chrome.storage.sync.remove([url]);
                    //Removes notes from URL
                    notesDiv.replaceChildren();
                });
            }
        });


    });
}

// scrolls to the note does this by injecting the script into the page 
function scrollToLocation(note){
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async tabs => {
        chrome.scripting.executeScript({
            target:{ tabId:tabs[0].id},
            func: scroll,
            args: [ note.scroll ],
        })
        });
}

function scroll(position) {
    window.scrollTo({top: position, behavior: "smooth"});
}


//dev stuff dont worry about tests
/*document.querySelector('#clearAll').addEventListener('click', function () {
    chrome.storage.sync.clear();

});

document.querySelector('#getAll').addEventListener('click', function () {
    chrome.storage.sync.get(null, function (items) {
        console.log(JSON.stringify(items));
    });
});
*/
clearStorageButton.addEventListener("click", clearUserResponses); //event listener for index html

function clearUserResponses() { 
    chrome.storage.sync.clear(function() { //clear out of web...
        console.log("Sync storage cleared.");
      });
      chrome.storage.local.clear(function() { //and local.
        console.log("Local storage cleared.");
      });
      window.location.href = "index.html"; //kicked back to index html.
      alert("Storage cleared."); //just so you know
    }
