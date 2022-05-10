document.addEventListener('DOMContentLoaded', () => {
    function setFlashMessageFadeOut(flashMessageElement) {
        setTimeout(() => {
            let currentOpacity = 1.0;
            let timer = setInterval(() => {
                if (currentOpacity < 0.05) {
                    clearInterval(timer);
                    flashMessageElement.remove();
                }
                currentOpacity = currentOpacity - .05;
                flashMessageElement.style.opacity = currentOpacity;
            }, 50);
        }, 4000);
    }

    let flashElement = document.getElementById('flash-message');
    if (flashElement) {
        setFlashMessageFadeOut(flashElement);
    }

    //flash message for search result
    function addFlashFromFrontEnd(message) {
        let flashMessageDiv = document.createElement('div');
        let innerFlashDiv = document.createElement('div');
        let innerTextNode = document.createTextNode(message);
        let parentNode = document.getElementsByClassName('alert-login')[0];
        innerFlashDiv.appendChild(innerTextNode);
        flashMessageDiv.appendChild(innerFlashDiv);
        flashMessageDiv.setAttribute('id', 'flash-message');
        innerFlashDiv.setAttribute('class', 'alert alert-info');
    
        parentNode.appendChild(flashMessageDiv);
        setFlashMessageFadeOut(flashMessageDiv);  
    }
    document.addFlashFromFrontEnd = addFlashFromFrontEnd;

    function executeSearch() {
        let searchTerm = document.getElementById('search-text').value;
        if (!searchTerm) {
            location.replace('/');
            return;
        }
        let mainContent = document.getElementsByClassName('container')[0];
        let searchURL = `/posts/search?search=${searchTerm}`;
        fetch(searchURL)
            .then((data) => {
                return data.json();
            })
            .then((json_data) => {
                let newMainContentHtml = '';
                json_data.results.forEach((row) => {
                    newMainContentHtml += createCard(row);
                });
                mainContent.innerHTML = newMainContentHtml;
                if (json_data.message) {
                    addFlashFromFrontEnd(json_data.message);
                }

            })
            .catch((err) => console.log(err));
    }

    var searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.onclick = executeSearch;
    }

    function createCard(postData) {
        return `<div id="post-${postData.id}" class="post">
        <img class="pic" src="${postData.thumbnail}" alt="Missing Image">
        <div class="title"><strong><p>${postData.title}</p></strong></div>
        <div class="description"><p>${postData.description}</p></div>
        <button id="postdetails" onclick="location.href='/post/${postData.id}'" type="button">
             More</button>
            
    </div> `;
    }

});

