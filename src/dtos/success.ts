import { HttpSuccess } from '../enums/http';
import BaseResponse from './base';

export default class SuccessResponse extends BaseResponse {
	constructor(data: any, http?: HttpSuccess) {
		const code = http || HttpSuccess.Ok;
		super(data, 'success', code);
	}
}
