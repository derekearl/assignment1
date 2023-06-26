let button = document.querySelector('.passwordToggle');
if(button) {
    button.addEventListener('click', (e) => {
        let password = document.querySelector('#account_password');
        let type = password.getAttribute('type');
        if(type=='password') {
            password.setAttribute('type', 'text');
            e.target.innerHTML = "Hide Password";
        } else {
            password.setAttribute('type', 'password');
            e.target.innerHTML = "Show Password";
        }
    })
}