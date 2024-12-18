export class ErrorHandler {
    static handle(error, request) {
        console.error('Error:', error);

        if (error instanceof ValidationError) {
            return new Response(JSON.stringify({
                error: error.message,
                code: 'VALIDATION_ERROR'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        if (error instanceof AuthError) {
            return new Response(JSON.stringify({
                error: error.message,
                code: 'AUTH_ERROR'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'WWW-Authenticate': 'Basic realm="Admin Access"'
                }
            });
        }

        // 默认错误响应
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class AuthError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'AuthError';
    }
} 