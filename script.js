// This file is the page's one JavaScript interaction: it validates the
// form when the user submits it, shows a message under each invalid
// field, and — if everything is valid — builds and reveals a
// confirmation summary in the DOM without reloading the page.

const form = document.getElementById("registration-form");
const confirmation = document.getElementById("confirmation");

// Expected student ID shape: two letters, four digits, dash, four digits
// e.g. CS2023-0142
const studentIdPattern = /^[A-Za-z]{2}[0-9]{4}-[0-9]{4}$/;

// Writes a message into the <p class="error"> that sits under a given field.
// fieldId matches the input's id, and each error paragraph is "<id>-error".
function setError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) errorEl.textContent = message;
}

// Wipes all error messages — called at the start of every submit attempt
// so old messages don't linger once a field is fixed.
function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
}

// Runs every check and returns true only if ALL fields pass.
// Each failing check sets its own specific error message.
function validate() {
  let isValid = true;

  const fullName = form.fullName.value.trim();
  if (fullName.length < 2) {
    setError("full-name", "Enter your full name.");
    isValid = false;
  }

  const studentId = form.studentId.value.trim();
  if (!studentIdPattern.test(studentId)) {
    setError("student-id", "Use the format CS2023-0142.");
    isValid = false;
  }

  const email = form.email.value.trim();
  // Simple email shape check: something@something.something
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Enter a valid email address.");
    isValid = false;
  }

  // For radio buttons, "checked" isn't on the group — we query for
  // whichever one (if any) is currently selected.
  const tutorialGroup = form.querySelector(
    'input[name="tutorialGroup"]:checked',
  );
  if (!tutorialGroup) {
    setError("group", "Select one tutorial group.");
    isValid = false;
  }

  if (!form.agree.checked) {
    setError("agree", "You must confirm your details before registering.");
    isValid = false;
  }

  return isValid;
}

form.addEventListener("submit", (event) => {
  // Stop the browser's default "reload the page and send the form somewhere" behavior
  event.preventDefault();

  clearErrors();
  confirmation.hidden = true;

  if (!validate()) {
    // Move keyboard focus to the first field that failed, so keyboard
    // and screen reader users land exactly where the problem is.
    const firstError = form.querySelector(".error:not(:empty)");
    if (firstError) {
      const field = firstError.previousElementSibling;
      if (field && typeof field.focus === "function") field.focus();
    }
    return; // stop here — don't show a confirmation for an invalid form
  }

  // Form is valid — gather the selected values to display back to the user
  const tutorialGroup = form.querySelector(
    'input[name="tutorialGroup"]:checked',
  ).value;
  const electives = Array.from(
    form.querySelectorAll('input[name="electives"]:checked'),
  ).map((el) => el.value);

  // Build and insert the confirmation message into the page
  confirmation.innerHTML = `
    <h2>Registration received</h2>
    <p>${form.fullName.value.trim()} (${form.studentId.value.trim()}) is registered for ICT461.</p>
    <ul>
      <li>Tutorial group: ${tutorialGroup}</li>
      <li>Electives: ${electives.length ? electives.join(", ") : "None selected"}</li>
    </ul>
  `;
  confirmation.hidden = false;
  confirmation.focus?.(); // announce it to screen readers via aria-live
  form.reset(); // clear the form for the next entry
});
