export class ResponseStatusDetail {
  code!: string;
  message!: string;
}

export class ResponseError {
  errorCode!: string;
  errorMessage!: string;
  targetId!: any;
  responseStatusDetails: ResponseStatusDetail[] = [];
}

export class Page {
  number!: number;
  size!: number;
  totalElements!: number;
  totalPages!: number;

  constructor(number: number, size: number, totalElements: number) {
    this.number = number;
    this.size = size;
    this.totalElements = totalElements;
  }
}

export class BaseResponse {
  page!: Page;
  errors: ResponseError[] = [];
  statusCode!: number;
  success!: boolean;
}

export class PaginationResponse<T> extends BaseResponse {
  data!: T;

  constructor(data: T) {
    super();
    this.data = data;
  }
}
