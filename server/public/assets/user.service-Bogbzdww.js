import{r as e}from"./index-CpPucNuj.js";const t={async getProfile(){return e("/users/me")},async updateProfile(r){return e("/users/me",{method:"PATCH",body:JSON.stringify(r)})}};export{t as u};
