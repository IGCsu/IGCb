const fs = require('fs').promises;
const p = require('path')

class CacheController {

	#path = '';
	#type = '';

	constructor (path, type) {
		this.#path = path.slice(0, -9) + "/UserLevelCard/cache/" + type
		this.#type = '/' + type
		console.log("Cache controller connected: " + this.#path);
		this.clearAll();
	}

	async get(name) {
		const endPath = this.#path + '/' + name;
		let data = null;
		const displayPlace = this.#type + '/' + name + '.json';
		console.log("Getting cached data from: " + displayPlace);
		try {
			data = await fs.readFile(endPath);
		} catch (e) {
			console.log("Failed to get cache");
			return null;
		}
		console.log("Cache found in: " + displayPlace);
		return data;
	}

	async getAsJson(name) {
		const endPath = this.#path + '/' + name + '.json';
		let data = null;
		const displayPlace = this.#type + '/' + name + '.json';
		console.log("Getting cached data from: " + displayPlace);

		try {
			data = JSON.parse(await fs.readFile(endPath, 'utf8'));
		} catch (e) {
			console.log('Cache not found');
			return null;
		}
		console.log("Cache found in: " + displayPlace);
		return data;
	}

	async set(name, file) {
		const displayPlace = this.#type + '/' + name + ' (' + file.length + ')';
		console.log("Writing cached data to: " + displayPlace)
		try {
			await fs.writeFile(this.#path + '/' + name, file, {encoding: 'utf-8', })
		} catch {
			console.log("Failed to write cache")
			return null
		}
		console.log("Cache written to: " + displayPlace)
		return true
	}

	async setAsJson(name, object) {
		await this.set(name + '.json', JSON.stringify(object));
	}

	async clear(name) {
		console.log('Clearing cache: ' + this.#type + ' ' + name)
		await fs.rm(this.#path + '/' + name)
	}

	async clearAll() {
		console.log('Clearing all caches: ' + this.#type)
		const files = await fs.readdir(this.#path + '/')
		for (const file of files) {
			await this.clear(file)
		}
		console.log('Caches cleared: ' + this.#type)
	}
}

module.exports = CacheController