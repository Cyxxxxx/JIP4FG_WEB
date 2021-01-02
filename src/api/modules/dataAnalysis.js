import axios from '../base';

function getData(){
    return axios({
        url: '/analysis/getData',
        method: 'get',
    });
}

function getJobSalaryPredList(jobName){
    return axios({
        url: '/analysis/getJobSalaryPredList?jobName='+encodeURIComponent(jobName),
        method: 'get',
    });
}
export {
    getData,
    getJobSalaryPredList
}