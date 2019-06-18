export class ApiConfigurationList {
    items: ApiConfigurationItem[];
}
export class ApiConfigurationItem {
    function: string;
    verb: HTTP_VERBS = HTTP_VERBS.POST;
    returns = false;
    controller: string;
    params: {
        name: string,
        type: string
    }[] = [];

    get plainController() {
        return this.controller.replace('Controller', '').toLowerCase();
    }
    constructor(params: { function: string, verb: HTTP_VERBS, returns: boolean, controller: string }) {
        this.function = params.function;
        this.verb = params.verb || HTTP_VERBS.POST;
        this.returns = params.returns || false;
        this.controller = params.controller;
    }
}

export enum HTTP_VERBS {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}