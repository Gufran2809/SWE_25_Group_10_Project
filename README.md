Password Reset Feature
New Component: PasswordReset.js

Added a new component for users to reset their password by entering their email.
Uses Firebase's sendPasswordResetEmail to send the reset email.
Displays success or error messages based on the operation.
New Styles: PasswordReset.css

Created a new CSS file for styling the password reset form.
Includes styles for the form container, success messages, and error messages.
Routing Update:

Added a new route /password-reset in App.js to render the PasswordReset component.
Login Page Update:

Added a link on the login page to navigate to the password reset page:
"Forgot your password? Reset it here"
