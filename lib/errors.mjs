export class ServiceError extends Error{constructor(message,status=400,code='VALIDATION'){super(message);this.status=status;this.code=code}}
