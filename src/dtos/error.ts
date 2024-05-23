import { HttpClientError, HttpServerError } from '../enums/http';
import HttpException from '../exceptions/http';
import BaseResponse from './base';

export default class ErrorResponse extends BaseResponse {
	constructor(error?: HttpException | Error | unknown) {
		if (error instanceof HttpException) {
			super(null, error.message, error.code);
		} else if (error instanceof Error) {
			super(null, error.message, 500);
		} else {
			super(null, 'unknown error', 500);
		}
	}
}
