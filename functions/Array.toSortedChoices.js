/**
 * Возвращает отсортированный готовый к отправке список choices для AutocompleteInteraction
 *
 * @param {String} query Искомый запрос
 * @return {Array}
 */
Array.prototype.toSortedChoices = function(query){
	let choices = [];
	for(let value of this.values()){
		choices.push(value);
	}
	if(!query) return choices;

	query = query.toLowerCase();

	choices.sort((a, b) => b.name.similarity(query) - a.name.similarity(query));

	return choices.slice(0,24);
}