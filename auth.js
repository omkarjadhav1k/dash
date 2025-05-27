
// auth.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signin-form");
  const forgot = document.getElementById("forgot-password");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        if (!userCred.user.emailVerified) {
          alert("Please verify your email.");
          await auth.signOut();
        } else {
          window.location.href = "dashboard.html";
        }
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    });
  }

  if (forgot) {
    forgot.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = prompt("Enter your email:");
      if (email) {
        try {
          await auth.sendPasswordResetEmail(email);
          alert("Password reset email sent.");
        } catch (err) {
          alert("Error: " + err.message);
        }
      }
    });
  }
});
