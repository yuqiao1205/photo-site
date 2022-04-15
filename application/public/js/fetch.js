document.addEventListener('DOMContentLoaded', () => {
    const url = 'https://jsonplaceholder.typicode.com/albums/2/photos'
    const options = {
        "method": "GET",
        headers: {
            Accept: 'application/json'
        },
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }

    function createAllPosts(items) {
        var content = document.getElementById('content');

        var template = '<img id="$img_id" src="$url" class="pic"><div class="title">$title</div>';

        for (const item of items) {
            console.log(item);
            let postDiv = document.createElement('div');
            postDiv.classList.add("post");

            postDiv.innerHTML = template.replace('$url', item['url']).replace('$title', item['title']);

            content.appendChild(postDiv);
        }
    }

    // Request only if the content div is defined
    if (document.getElementById('content') !== null) {
        fetch(url, options)
            .then(response => response.json())
            .then(data => {
                createAllPosts(data)
                updateCount()
            })
            .catch(error => console.log(error));
    }

    // TODO: Show count in UI
    function updateCount() {
    }

    // library of generic dom functions
    function includes(array, item) {
        for (const value of array) {
            if (value === item) {
                return true;
            }
        }
        return false;
    }

    function fade(element, final_function) {
        element.style.opacity = 1.0;

        function fadestep() {
            element.style.opacity -= 0.1;
            if (element.style.opacity < 0.0) {
                element.display = "none";
                final_function();
            } else {
                setTimeout(fadestep, 40);
            }
        };
        fadestep();
    }

    // app specific functions

    // post functions
    function isPost(element) {
        return includes(element.classList, 'post');
    }

    function findPost(hit_element) {
        // return the div of the post [image + title]
        var element;
        if (isPost(hit_element)) {
            element = hit_element;
        } else {
            // assume child of post div
            element = hit_element.parentNode;
        }
        return element;
    }

    function removePost(hit_element) {
        findPost(hit_element).remove();
    }

    // bind on click to fade out and remove posts and update number of photos
    document.body.addEventListener('mousedown', function (e) {

        if (e.target.nodeName === "IMG" || (e.target.nodeName === "DIV" && e.target.classList.contains('title'))) {
            let postElement = findPost(e.target);
            fade(postElement, () => {
                removePost(findPost(postElement));
                updateCount();
            });
        }

    }, false);
})