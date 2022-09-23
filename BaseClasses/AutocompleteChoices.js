class AutocompleteChoices extends Array {

	constructor() {
		super();
	}

	/**
	 *
	 * @param {String} query query target
	 * @return {[{name: String, value: String}]|[null]}
	 */
	sort(query){
		query = query.toLowerCase();
		let choices = [];
		for(let value of this.values()){
			if(query && value.name.toLowerCase().indexOf(query) === -1) continue;
			choices.push(value);
		}
		if(!query) return choices;

		choices.sort((a, b) => b.name.similarity(query) - a.name.similarity(query));

		return choices.slice(0,24);
	}
}
module.exports = AutocompleteChoices