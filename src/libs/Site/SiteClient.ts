import { SiteUrls } from './SiteUrls';

export interface Rules {
	[key: string]: string;
}

export class SiteClient {

	protected static instance: SiteClient;

	protected active: boolean = true;
	protected lastResponse: Response | null = null;
	protected lastBody: any = null;

	public static async init (): Promise<SiteClient> {
		if (!this.instance) {
			this.instance = new SiteClient();
			await this.instance.checkStatus();
		}

		return this.instance;
	}

	public async checkStatus (): Promise<boolean> {
		const response = await this.fetch(SiteUrls.HOST);

		return this.active = response?.status === 200;
	}

	public isActive (): boolean {
		return this.active;
	}

	public buildRuleUrl (key: string) {
		return SiteUrls.HOST + SiteUrls.RULES_KEY + key;
	}

	public async fetchRules (): Promise<Rules> {
		const response = await this.fetch(SiteUrls.HOST + SiteUrls.RULES_JSON, true);

		return response?.status === 200 ? this.lastBody : null;
	}

	protected async fetch (url: string, json: boolean = false): Promise<Response | null> {
		try {
			this.lastResponse = await fetch(url, {
				redirect: 'manual'
			});
			if (json) {
				this.lastBody = await this.lastResponse.json();
			}
		} catch (e) {
			console.error(e);
			this.lastResponse = null;
		}

		return this.lastResponse;
	}
}