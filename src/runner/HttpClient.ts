interface HttpClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post(uri: string, body: string): Promise<any>
}

export {HttpClient};