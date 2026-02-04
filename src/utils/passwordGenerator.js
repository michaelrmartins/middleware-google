/**
 * Generates a random password with a specified length.
 * @param {number} length The desired length of the password.
 * @returns {string} The generated random password.
 */

/**
 * Generates a strong random password with a specified length.
 *
 * @param {number} length 
 * @returns {string} 
 */
function generatePassword(length = 12) {
    if (length < 8) {
        length = 8;
    }

    const lowerCaseChars = 'abcdefghjkmrstuvwxy';
    const upperCaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; 
    const numberChars = '23456789'; 
    const specialChars = '*#@$%&?';

    let passwordChars = [];

    passwordChars.push(lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)]);
    passwordChars.push(upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)]);
    passwordChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    passwordChars.push(specialChars[Math.floor(Math.random() * specialChars.length)]);

    const allChars = lowerCaseChars + upperCaseChars + numberChars + specialChars;
    const remainingLength = length - passwordChars.length;

    for (let i = 0; i < remainingLength; i++) {
        passwordChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Fisher-Yates algorithm
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }
    return passwordChars.join('');
}

export { generatePassword };