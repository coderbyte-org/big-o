
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {HttpClient} from './HttpClient';

class AxiosClient implements HttpClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post(uri: string, body: string): Promise<any> {
        const config: AxiosRequestConfig = {
            responseType: 'json'
        };
        return axios.post(uri, body, config)
            .then((res: AxiosResponse) => {
                return res.data;
            });
    }
}

export {AxiosClient};