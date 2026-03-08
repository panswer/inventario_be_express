const getPassDateByMilliseconds = (ms) => new Date(Date.now() - ms);

module.exports = {
    getPassDateByMilliseconds,
}