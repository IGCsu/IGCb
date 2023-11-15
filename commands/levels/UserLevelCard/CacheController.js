const fs = require('fs').promises;
const p = require('path')

class CacheController {

	#path = '';

	constructor (path, type) {
		this.#path = path.slice(0, -9) + "/UserLevelCard/cache/" + type
		console.log(p.resolve(this.#path) + " Cache controller connected")
	}

	async get(name) {
		const endPath = this.#path + '/' + name;
		let data = null;
		console.log("Getting cached data from: " + endPath);
		try {
			data = await fs.readFile(endPath);
		} catch (e) {
			console.log("Failed to get cache");
			return null;
		}
		console.log("Cache found")
		return data;
	}

	async getAsJson(name) {
		const endPath = this.#path + '/' + name + '.json';
		let data = null;
		console.log("Getting cached data from: " + endPath);

		try {
			data = JSON.parse(await fs.readFile(endPath, 'utf8'));
		} catch (e) {
			console.log('Cache not found');
			return null;
		}
		console.log("Cache found")
		return data;
	}

	async set(name, file) {
		console.log("Writing cached data to: " + this.#path + '/' + name)
		console.log(file.length)
		try {
			await fs.writeFile(this.#path + '/' + name, file, {encoding: 'utf-8'})
		} catch {
			console.log("Failed to write cache")
			return null
		}
		console.log("Cache written")
		return true
	}

	async setAsJson(name, object) {
		await this.set(name + '.json', JSON.stringify(object));
	}
}

module.exports = CacheController