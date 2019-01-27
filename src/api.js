import axios from 'axios';
import qs from 'qs'

const BaseUrl = 'http://localhost:8000';


const baseApi = async (url, params, method) => {
    let options = {
        url: url,
        method: method,
        baseURL: BaseUrl,
        headers: {
            Authorization: localStorage.getItem('token')
        }
    };
    if (method === 'get') {
        options = {
            params,
            ...options
        }
    } else {
        options = {
            data: qs.stringify(params),
            ...options
        }
    }
    try {
        const res = await axios.request(options);
        return res.data;
    } catch (e) {
        throw e.response.msg;
    }
};

const auth = (params, path) => {
    params = qs.stringify(params);
    return axios.post(path, params, {
        baseURL: BaseUrl
    })
};

const setOvertime = params => {
    return baseApi('overtime', params, 'post')
};

const surplus = () => {
    return baseApi('surplus', [], 'get')
};

export {auth, setOvertime, surplus}