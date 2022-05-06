document.addEventListener('DOMContentLoaded', () => {
    const username = document.getElementById('username');
    const username_message = document.getElementById('username_message');

    const password = document.getElementById('password');
    const password_message = document.getElementById('password_message');


    const re_enter_password = document.getElementById('re_enter_password');
    const re_enter_password_message = document.getElementById('re_enter_password_message');
   
    const email = document.getElementById('email');

    const form = document.getElementById('registration');
    const submit_message = document.getElementById('submit_log');

    const reload = document.getElementById('reload');

    var has_been_edited = {
        "username": false,
        "email": false,
        "password": false,
        "re_enter_password": false
    };

    function validateUserName(value) {
        // Test 1: Username cannot be empty
        if (value == "") {
            return "Username cannot be empty!";
        }
        // Test 2: Test the begins with a character
        if (!/^[a-z]/i.test(value)) {
            return "Username should begin with character!";
        }

        // Test 3: Test username length must >= 3
        if (value.length <= 2) {
            return "Username should be at least 3 charaters! ";
        }

        // Test 4: Username should only include alphanumeric
        if (!/^[a-z0-9]+$/i.test(value)) {
            return "Username should only contain alphanumeric!";
        }
        return true;
    }

    function validateEmail(value) {
        // Test 1: Test email cannot be empty
        if (value == '') {
            return "Email cannot be empty";
        }
        return true;
    }

    function validatePassword(value) {
        // Test 1: Password cannot be empty
        if (value == "") {
            return "Password cannot be empty!";
        }
        // Test 2: Test password must contain at least 1 number
        if (!/[0-9]/.test(value)) {
            return "Password should contain at least 1 number!";
        }

        // Test 3: Test password length must >=8
        if (value.length <= 7) {
            return "Password should be at least 8 charaters!";
        }

        // Test 4: Password at least 1 uppercase
        if (!/[A-Z]/.test(value)) {
            return "Password should at least contain 1 uppercase!";
        }

        // Test 5: Password at least 1 special character
        if (!/[/*-+!@#$^&*]/.test(value)) {
            return "Password at least contain 1 special character!";
        }
        return true;
    }

    function validatePassReenter(value, password_value) {
        if (password_value !== value) {
            return "Password doesn't match!";
        }
        return true;
    }

    function validateAll() {
        return validateUserName(username.value) !== true ||
            validateEmail(email.value) !== true ||
            validatePassword(password.value) !== true ||
            validatePassReenter(re_enter_password.value, password.value) !== true
    }

    function checkUsername() {
        // return true if error
        // get the value
        let value = username.value;

        // process the value
        let valid_or_message = validateUserName(value);

        // present the result
        if (valid_or_message === true) {

            username_message.innerText = "";
            username_message.style.visibility = "hidden";
        } else {

            username_message.style.visibility = "visible";
            username_message.innerText = valid_or_message;
        }

        return valid_or_message !== true;
    }

    function checkEmail() {
        // return true if error
        // get the value
        let value = email.value;

        // process the value
        let valid_or_message = validateEmail(value);

        // present the result
        if (valid_or_message === true) {

            email_message.innerText = "";
            email_message.style.visibility = "hidden";
        } else {

            email_message.style.visibility = "visible";
            email_message.innerText = valid_or_message;
        }

        return valid_or_message !== true;
    }

    function checkPassword() {
        // return true if error
        let value = password.value;
        let valid_or_message = validatePassword(value);

        if (valid_or_message === true) {

            password_message.innerText = "";
            password_message.style.visibility = "hidden";
        } else {

            password_message.style.visibility = "visible";
            password_message.innerText = valid_or_message;
        }

        return valid_or_message !== true;
    }

    function checkPasswordRenter() {
        // return true if error
        let value = re_enter_password.value;
        let valid_or_message = validatePassReenter(value, password.value);

        if (valid_or_message === true) {

            re_enter_password_message.innerText = "";
            re_enter_password_message.style.visibility = "hidden";
        } else {

            re_enter_password_message.style.visibility = "visible";
            re_enter_password_message.innerText = valid_or_message;
        }

        return valid_or_message !== true;
    }

    function checkEdited() {
        var errors = [];

        if (has_been_edited["username"]) {
            errors.push(checkUsername());
        }


        if (has_been_edited["email"]) {
            errors.push(checkEmail());
        }

        if (has_been_edited["password"]) {
            errors.push(checkPassword());
        }

        if (has_been_edited["re_enter_password"]) {
            errors.push(checkPasswordRenter());
        }

        // will be true if there are any errors
        let error = errors.some(x => x);

        if (!error) {
            submit_message.style.visibility = "hidden";
        }
    }

    username.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    email.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    password.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    re_enter_password.addEventListener('input', (e) => {
        has_been_edited[e.target.id] = true;
        checkEdited();
    });

    reload.addEventListener('click', () => {
        window.location.reload(true);
    })

    form.addEventListener('submit', (e) => {
        if (validateAll()) {

            checkUsername();
            checkEmail();
            checkPassword();
            checkPasswordRenter();

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