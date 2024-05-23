import { HttpClientError, HttpServerError } from '../enums/http';

export default class HttpException extends Error {
	code: number;
	constructor(message?: string, code?: HttpServerError | HttpClientError) {
		super(message);
		console.log('Error Message', message);
		this.code = code || 500;
	}
}
