/**
 * Функция для определения окончания слова по числительному
 *
 * Пример:
 * * '1 '.num2str(1, ['год', 'года', 'лет']); // 1 год
 * * '22 '.num2str(22, ['год', 'года', 'лет']); // 22 года
 * * '50 '.num2str(50, ['год', 'года', 'лет']); // 50 лет
 *
 * @param  {Number} n  Число
 * @param  {Array}  tf Массив склонений слова
 * @return {String}
 */
module.exports = (n, tf) => {
  n = n % 100;
  if(n > 19) n = n % 10;
  switch(n){
    case 1: return(tf[0]);
    case 2: case 3: case 4: return(tf[1]);
    default: return(tf[2]);
  }
};
