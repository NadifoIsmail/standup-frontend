import axios from "axios";

const api = axios.create({
  baseURL: "https://standup-backend-v4n5.onrender.com",  
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;