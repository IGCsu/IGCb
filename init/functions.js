const fs = require("fs");

/**
 * Определяет базовые функции и утилиты бота
 */
module.exports = () => {
    console.log('Loading functions:');
    fs.readdirSync('./functions/').forEach(file => {
        const path = './functions/' + file;
        console.time(path);
        require('.' + path);
        console.timeEnd(path);
    });
}