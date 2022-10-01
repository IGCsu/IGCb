class AutocompleteChoices extends Array {

	constructor () {
		super();
	}

	/**
	 * Сортирует массив по соответствию переданной строке
	 * @param {string} str
	 * @return {Object[]}
	 */
	sort (str) {
		str = str.toLowerCase();
		let choices = [];
		for (let value of this.values()) {
			if (str && value.name.toLowerCase().indexOf(str) === -1) continue;
			choices.push(value);
		}
		if (!str) return choices;

		choices.sort((a, b) => b.name.similarity(str) - a.name.similarity(str));

		return choices.slice(0, 24);
	}
}

module.exports = AutocompleteChoices;