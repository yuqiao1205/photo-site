document.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('posttitle');
    const title_message = document.getElementById('title_message');

    const description = document.getElementById('description');
    const description_message = document.getElementById('description_message');

    const uploadfile = document.getElementById('img');
    const uploadfile_message = document.getElementById('uploadfile_message');

    const postimage = document.getElementById('postimage'); //for form
    const submit_message = document.getElementById('submit_log');

    // map for user final submitting after correct any errors
    var has_been_edited = {
        "title": false,
        "description": false,
        "uploadfile": false
    };

    function validateTitle(value) {
        // Test:Title cannot be empty
        if (value == "") {
            return " Title cannot be empty!";
        }
        return true;
    }

    function validateDescription(value) {
        // Test: Description cannot be empty
        if (value == "") {
            return " Description is required!";
        }
        return true;
    }

    function validateFile(value) {
        
        if (value.type !='file' && value.length == 0) {
            return "Upload file can't be empty";
        }
       
        if ( !/\.(jpe?g|png|gif)$/i.test(value)) {
            return "Upload file must be image file";
        }
        return true;

    }

    function validateAll() {
        return validateTitle(title.value) !== true ||
            validateDescription(description.value) !== true ||
            validateFile(uploadfile.value) !== true
    }

    function checkTitle() {

        let value = title.value;
        let valid_or_message = validateTitle(value);

        if (valid_or_message === true) {
            title_message.innerText = "";
            title_message.style.visibility = "hidden";
        } else {
            title_message.style.visibility = "visible";
            title_message.innerText = valid_or_message;
        }
        return valid_or_message !== true;
    }

    function checkDescription() {
        // return true if error
        let value = description.value;
        let valid_or_message = validateDescription(value);

        if (valid_or_message === true) {
            description_message.innerText = "";
            description_message.style.visibility = "hidden";
        } else {
            description_message.style.visibility = "visible";
            description_message.innerText = valid_or_message;
        }

        return valid_or_message !== true;
    }

    function checkFile() {
        // return true if error
        let value = uploadfile.value;
        let valid_or_message = validateFile(value);

        if (valid_or_message === true) {

            uploadfile_message.innerText = "";
            uploadfile_message.style.visibility = "hidden";
        } else {

            uploadfile_message.style.visibility = "visible";
            uploadfile_message.innerText = valid_or_message;
        }

        return valid_or_message !== true;
    }



    function checkEdited() {
        var errors = [];

        if (has_been_edited["posttitle"]) {
            errors.push(checkTitle());
        }


        if (has_been_edited["description"]) {
            errors.push(checkDescription());
        }

        if (has_been_edited["img"]) {
            errors.push(checkFile());
        }

        // will be true if there are any errors
        let error = errors.some(x => x);

        if (!error) {
            submit_message.style.visibility = "hidden";
        }
    }

    description.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    title.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    uploadfile.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    postimage.addEventListener('submit', (e) => {
        if (validateAll()) {

            checkTitle();
            checkDescription();
            checkFile();

            submit_message.innerText = "Fix errors below in order to submit form.";
            submit_message.style.visibility = "visible";
            e.preventDefault();
        } else {
            submit_message.innerText = "";
            submit_message.style.visibility = "hidden";

            return true;
        }
    });

})