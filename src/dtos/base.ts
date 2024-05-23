export default class BaseResponse {
	data?: any;
	code?: number;
	message?: string;
	constructor(data?: any, message?: string, code?: number) {
		this.data = data;
		this.code = code;
		this.message = message;
	}
}
