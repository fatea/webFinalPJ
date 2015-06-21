require.config({
paths: {
"jquery": 'lib/jquery-1.11.3.min',
"trim": "lib/trim",
 "check": "lib/check"
}
});


require(['jquery', 'trim', 'check'],
function($, Trim, Check){

    var boolResult = true;
    var usernameInput = $("#usernameInput");
    var usernameAlert = $("#usernameAlert");
    var passwordInput = $("#passwordInput");
    var passwordAlert = $("#passwordAlert");
    var form = $('#loginForm');
    form.submit(validateForm);

    usernameInput.blur(function() {
        if (Check.regUsername(usernameInput.val()) == false) {
            usernameAlert.show();
            boolResult = false;
        }
    });

    usernameInput.focus(function() {
        usernameAlert.hide();
        boolResult = true;
    });

    passwordInput.blur(function() {
        if (Check.regPassword(passwordInput.val()) == false) {
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




});




