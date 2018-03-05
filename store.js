import Vue from 'vue'
import Vuex from 'vuex'

import { asyncHelper } from './storeUtils.js'

// shared successMutation Handler

const setAuthStorage = (state, userData) => {
  localStorage.setItem('user-token', userData.token )
  changePasswordAxiosConfig.headers.Authorization = `Bearer ${userData.token}`
  return userData
}

// shared errorMutation Handler

const clearAuthStorage = (state, error) => {
  localStorage.removeItem('user-token')
  return error;
}

// create helper for different API endpoints

const login = asyncHelper({
  name: 'LOGIN', method: 'post', url: 'http://address/of/your/endpoint/login',
  successMutation: setAuthStorage,
  errorMutation: clearAuthStorage
});

const logout = asyncHelper({
  name: 'LOGOUT', method: 'post', url: 'http://address/of/your/endpoint/logout',
  successMutation(state, data){
    clearAuthStorage()
    state.LOGIN_SUCCESS = null
    return data
  },
  errorMutation: clearAuthStorage
});

const register = asyncHelper({
  name: 'REGISTER', method: 'post', url: 'http://address/of/your/endpoint/register',
});

const changePassword = asyncHelper({
  name: 'CHANGE_PASSWORD', method: 'post', url: 'http://address/of/your/endpoint/password/change',
  successMutation: setAuthStorage,
  errorMutation: clearAuthStorage
});

// if you need to change axios configuration settings, extract them from your created helper
// The axiosConfig is a constant Object but by adding and manipulating its properties
// we can achieve what we want

const changePasswordAxiosConfig = changePassword.axiosConfig
changePasswordAxiosConfig.withCredentials = true
changePasswordAxiosConfig.headers = { 'Authorization': 'Bearer tralalallaaaaa' }

// to make the helper available in our store we spread its corresponding properties
// into the store

export default new Vuex.Store({
  state: {
    ...login.state,
    ...logout.state,
    ...register.state,
    ...changePassword.state,
  },
  mutations: {
    ...login.mutations,
    ...logout.mutations,
    ...register.mutations,
    ...changePassword.mutations,
  },
  actions: {
    ...login.actions,
    ...logout.actions,
    ...register.actions,
    ...changePassword.actions,
  },
  getters: {
    ...login.getters,
    ...logout.getters,
    ...register.getters,
    ...changePassword.getters,
  }
})
