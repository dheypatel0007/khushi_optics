/**
 * KHUSHI OPTICS - Login Controller
 */

export const Login = {
  submit(username, password) {
    if (window.App) return window.App.login(username, password);
    return false;
  }
};

window.Login = Login;
