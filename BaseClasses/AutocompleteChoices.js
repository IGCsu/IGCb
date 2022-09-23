class AutocompleteChoices extends Array {

	constructor() {
		super(arguments);
	}

	/**
	 *
	 * @param {String} query query target
	 * @return {[{name: String, value: String}]|[null]}
	 */
	sort(query){
		let choices = [];
		for(let value of this.values()){
			choices.push(value);
		}
		if(!query) return choices;

		query = query.toLowerCase();

		choices.sort((a, b) => b.name.similarity(query) - a.name.similarity(query));

		return choices.slice(0,24);
	}

}
module.exports = AutocompleteChoices