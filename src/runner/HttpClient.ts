interface HttpClient {
    post(uri: string, body: string): Promise<any>
}

export {HttpClient};