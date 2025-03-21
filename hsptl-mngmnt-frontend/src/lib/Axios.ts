import axios from "axios";
axios.defaults.withCredentials = true;

const Axios = axios.create({
  baseURL: 'https://hospital_be.ichico.solutions/',
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default Axios;
