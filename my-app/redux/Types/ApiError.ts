interface ApiError {
    data: {
        code: string;
        message: string;
    };
    status: number;
}

const isApiError = (error: any): error is ApiError => {
    return error && error.data && typeof error.data.message === 'string';
};

export { ApiError, isApiError };