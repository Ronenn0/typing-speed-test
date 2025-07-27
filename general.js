/**
 * 
 * @param element 
 * adds class hidden to the element
 */
function hideElement(element) {
    addClass(element, 'hidden');
}

/**
 * 
 * @param {*} element
 * removes the class hidden from the element. 
 */
function showElement(element) {
    removeClass(element, 'hidden');
}

/**
 * 
 * @param {*} element 
 * @param {string} className 
 * adds the class className to the element
 */
function addClass(element, className) {
    if (!element.classList.contains(className)) {
        element.classList.add(className);
    }
}

/**
 * 
 * @param {*} element 
 * @param {string} className 
 * removes the class className from the element
 */
function removeClass(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

/**
 * 
 * @param {number} ms 
 * @returns a promise that takes [ms] milliseconds to finish
 * the purpose is to wait [ms] milliseconds.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 
 * @param {string} str 
 * @returns the string normalized.
 */
function normalize(str) {
    return str.replace(/’/g, "'").replace(/—/g, '-');
}

/**
 * 
 * @param {string} name 
 * @param {*} value 
 * saves the value to the localStorage as [name]
 */
function save(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}

/**
 * 
 * @param {string} name 
 * @returns the saved value of the name in localStorage or the initial value.
 */
function load(name) {
    let value = localStorage.getItem(name);
    if (value) return JSON.parse(value);
    save(name, initialValue(name));
    return initialValue(name);
}

function initialValue(name) {
    if (name == 'time') return Number.MAX_SAFE_INTEGER;
    return 0;
}

/**
 * fixes a number
 * @param {number, string} num -> main number
 * @param {number} digitsAfterPoint -> digits after points - default 2
 * @returns the number fixed with the specified digits.
 */
function fixNumber(num, digitsAfterPoint = 2) {
    return Number(Number(num).toFixed(digitsAfterPoint));
} 