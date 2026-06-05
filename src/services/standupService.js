
import api from "./api";

export const getStandups = () => {
  return api.get("/standups/"); 
};

export const createStandup = (data) => {
  return api.post("/standups/", data, {  
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getStandupStats = () => {
  return api.get("/standups/stats/");
};