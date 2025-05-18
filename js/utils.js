export function displayMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.className = isError ? 'error-message' : 'success-message';
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; el.textContent = ''; }, 5000);
    }
}
