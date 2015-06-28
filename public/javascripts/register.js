/*var regUsername = new RegExp("^[a-zA-Z0-9_]{2,14}$");
var regPassword = new RegExp("^(?=.*[a-zA-Z_])[a-zA-Z0-9_]{6,40}$");
var regName = new RegExp("^[\u4e00-\u9fa5_a-zA-Z0-9]{1,20}$");*/


require.config(

    {
        paths: {
            "jquery": 'lib/jquery-1.11.3.min',
            "trim": "lib/trim",
            "check": "lib/check"
        }
    }
);


require(['jquery', 'trim', 'check'], function($, Trim, Check){
    var boolResult = true;
    var usernameInput = $("#usernameInput");
    var usernameAlert = $("#usernameAlert");

    var passwordInput = $("#passwordInput");
    var passwordAlert = $("#passwordAlert");

    var nameInput = $("#nameInput");
    var nameAlert = $("#nameAlert");

    var repeatpwInput = $("#repeatpwInput");
    var repeatpwAlert = $("#repeatpwAlert");

    var form = $('#registerForm');
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
        if ((Check.regPassword(passwordInput.val()) == false)||((repeatpwInput.val() == passwordInput.val()) == false)) {
            passwordAlert.show();
            boolResult = false;
        }
    });

    passwordInput.focus(function() {
        passwordAlert.hide();
        boolResult = true;
    });



    nameInput.blur(function() {
        if (Check.regName(nameInput.val()) == false) {
            nameAlert.show();
            boolResult = false;
        }
    });

    nameInput.focus(function() {
        nameAlert.hide();
        boolResult = true;
    });



    repeatpwInput.blur(function() {
        if ((repeatpwInput.val() == passwordInput.val()) == false) {
            repeatpwAlert.show();
            boolResult = false;
        }
    });

    repeatpwInput.focus(function() {
        repeatpwAlert.hide();
        passwordAlert.hide();
        boolResult = true;
    });



    function validateForm() {
        if (Check.regUsername(usernameInput.val()) == false) {
            usernameAlert.show();
            boolResult = false;
        }
        if ((Check.regPassword(passwordInput.val()) == false)||((repeatpwInput.val() == passwordInput.val()) == false)) {
            passwordAlert.show();
            boolResult = false;
        }
        if (Check.regName(nameInput.val()) == false) {
            nameAlert.show();
            boolResult = false;
        }
        if ((repeatpwInput.val() == passwordInput.val()) == false) {
            repeatpwAlert.show();
            boolResult = false;
        }
        return boolResult;
    }

});

