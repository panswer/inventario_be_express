const resetUnicode = '\x1b[0m';
exports.warningText = text => `\x1b[33m\u26a0 ${text}${resetUnicode}`;
exports.errorText = text => `\x1b[31m\u26D4 ${text}${resetUnicode}`;
