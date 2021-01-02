import axios from '../base';

function getData(current,size,data){
    return axios({
        url: '/job/getJobInfoPage?size=' + size + '&current=' + current,
        method: 'post',
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export {
    getData
}