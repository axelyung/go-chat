import axios from 'axios';

const client = axios.create();

client.interceptors.response.use((res) => res.data);

export default {
    getMessages: async (count, skip) => {
        return client.get('/messages', {
            params: {count, skip},
        });
    },
    sendMessage: async (sender, content) => {
        return client.post('/send-message', {sender, content});
    },
    getUsers: async () => {
        return await client.get('/users');
    },
};
