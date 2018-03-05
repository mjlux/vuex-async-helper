import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import _ from 'lodash'

/*
 *  requires an Object with the following properties as argument
 *  {
 *     name: STRING, name of your action i.e. LOGIN - will be transformed into uppercase
 *     method: STRING, any axios supported method - defaults to get
 *     url: STRING, url of your endpoint to call
 *     successMutation: FUNCTION, (optional) recieves state and payload as arguments - has to return value for SUCCESS payload
 *     errorMutation: FUNCTION (optional) recieves state and payload as argument - has to return value for ERROR payload
 *     axiosConfig: OBJECT (optional) axios configuration - defaults to {}
 *   }
 */

const asyncHelper = function({
    name = '',
    url = '',
    method = 'get',
    successMutation = (state, data) => data,
    errorMutation = (state, error) => error
  }){

  const camelCaseName = _.camelCase(name)
  name = name.toUpperCase()

  if( !name || !url ){
    return { state: {}, mutations: {}, actions: {}, getters: {} }
  }

  const state = {
    [`${name}_STATUS`]: 'idle',
    [`${name}_SUCCESS`]: null,
    [`${name}_ERROR`]: null,
  }

  const mutations = {
    [`${name}_STATUS`](state, payload){
      state[`${name}_STATUS`] = payload
    },
    [`${name}_SUCCESS`](state, payload){
      state[`${name}_SUCCESS`] = successMutation(state, payload)
      state[`${name}_ERROR`] = null
    },
    [`${name}_ERROR`](state, payload){
      state[`${name}_ERROR`] = errorMutation(state, payload)
    },
  }

  const axiosConfig = {}

  const actions = {
    [`${name}`]( {commit}, payload ){

      commit(`${name}_STATUS`, 'pending')

      return new Promise( (resolve, reject) =>{
        axios[method]( url, payload, axiosConfig )
          .then( res => {
            commit(`${name}_STATUS`, `${res.status} ${res.statusText}`)
            commit(`${name}_SUCCESS`, res.data)
            resolve(res.data)
          })
          .catch( err => {
            const res = err.response
            commit(`${name}_STATUS`, res ? `${res.status} ${res.statusText}` : err.message)
            commit(`${name}_ERROR`, res ? res.data : err.message)
            reject(res ? res.data : err.message)
          })
      })
    }
  }

  const getters = {
    [`${camelCaseName}Status`]( state ){ return state[`${name}_STATUS`] },
    [`${camelCaseName}Data`]( state ){ return state[`${name}_SUCCESS`] },
    [`${camelCaseName}Error`]( state ){ return state[`${name}_ERROR`] },
  }

  return {
    state,
    mutations,
    actions,
    getters,
    axiosConfig
  }

}




const setAuthStorage = (state, userData) => {
  localStorage.setItem('user-token', userData.token )
  changePasswordAxiosConfig.headers.Authorization = `Bearer ${userData.token}`
  return userData
}

const clearAuthStorage = (state, error) => {
  localStorage.removeItem('user-token')
  return error;
}

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

const changePasswordAxiosConfig = changePassword.axiosConfig
changePasswordAxiosConfig.withCredentials = true
changePasswordAxiosConfig.headers = { 'Authorization': 'Bearer tralalallaaaaa' }


export default new Vuex.Store({
  state: {
    ...login.mutations,
    ...logout.mutations,
    ...register.mutations,
    ...changePassword.state,
  },
  mutations: {
    ...login.actions,
    ...logout.actions,
    ...register.actions,
    ...changePassword.mutations,
  },
  actions: {
    ...login.getters,
    ...logout.getters,
    ...register.getters,
    ...changePassword.actions,
  },
  getters: {
    ...login.getters,
    ...logout.getters,
    ...register.getters,
    ...changePassword.getters,
  }
})
