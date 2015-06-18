var regUsername = new RegExp("^[a-z0-9_]{1,10}$");
var regPassword = new RegExp("^[a-z0-9]{1,20}$");
var boolResult = true;
var usernameInput = $("#usernameInput");
var usernameAlert = $("#usernameAlert");
var passwordInput = $("#passwordInput");
var passwordAlert = $("#passwordAlert");


usernameInput.blur(function() {
    if (regUsername.test(usernameInput.val()) == false) {
        usernameAlert.show();
        boolResult = false;
    }
});

usernameInput.focus(function() {
    usernameAlert.hide();
    boolResult = true;
});

passwordInput.blur(function() {
    if (regPassword.test(passwordInput.val()) == false) {
        passwordAlert.show();
        boolResult = false;
    }
});

passwordInput.focus(function() {
    passwordAlert.hide();
    boolResult = true;
});

function validateForm() {
    return boolResult;
}

