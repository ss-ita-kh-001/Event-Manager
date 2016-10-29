var escape = function() {
    this.makeTrusted = function(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\r?\n/g, '<br />');
    }
};

module.exports = escape;
