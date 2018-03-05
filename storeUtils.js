import axios from 'axios'
import _ from 'lodash'

// This helper function will abstract a basic actions->mutations->state dataflow

/*
 *  requires an Object with the following properties as argument
 *  {
 *     name:            STRING,  name of your action i.e. LOGIN - will be transformed into uppercase
 *     url:             STRING,  url of your endpoint to call
 *     method:          STRING   (optional), any axios supported method - defaults to get
 *     successMutation: FUNCTION (optional), recieves state and payload as arguments - has to return value for SUCCESS payload
 *     errorMutation:   FUNCTION (optional), recieves state and payload as arguments - has to return value for ERROR payload
 *   }
 */

export const asyncHelper = function({
    name = '',
    url = '',
    method = 'get',
    successMutation = (state, data) => data,
    errorMutation = (state, error) => error
  }){

  // get camelCaseName for use in getters
  const camelCaseName = _.camelCase(name)
  
  // make sure 'name' is UPPERCASE
  name = name.toUpperCase()

  // rudimentary validity check for name and url - fails silently and returns empty objects
  if( !name || !url ){
    return { state: {}, mutations: {}, actions: {}, getters: {} }
  }

  // setup state
  // with 'LOGIN' as example name it will result in
  // {
  //  LOGIN_STATUS: 'idle',
  //  LOGIN_SUCCESS: null,
  //  LOGIN_ERROR: null,
  // }
  
  const state = {
    [`${name}_STATUS`]: 'idle',
    [`${name}_SUCCESS`]: null,
    [`${name}_ERROR`]: null,
  }
  
  // setup mutations with the same _STATUS, _SUCCESS, _ERROR pattern
  //
  // Notice: The value for state.LOGIN_SUCCESS will pass the successMutation function and
  //         the value for state.LOGIN_ERROR will pass the errorMutation function
  //
  // with 'LOGIN' as example name it will result in
  // {
  //  LOGIN_STATUS(state, payload){ 
  //    state.LOGIN_STATUS = payload 
  //  },
  //  LOGIN_SUCCESS(state, payload){ 
  //    state.LOGIN_SUCCESS = successMutation(payload)
  //    state.LOGIN_ERROR = null
  //  },
  //  LOGIN_ERROR(state, payload){ 
  //    state.LOGIN_ERROR = errorMutation(payload) 
  //  },
  // }
  
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

  // create the axiosConfig as empty Object
  // it will be returned to be set up as needed outside of this function
  
  const axiosConfig = {}

  // setup one action with the name i.e. 'LOGIN'
  // commits follow the _STATUS, _SUCCESS, _ERROR pattern
  //
  // with 'LOGIN' as example name and 'get' as example method it will result in
  // {
  //  LOGIN({commit}, payload){ 
  //    commit(`LOGIN_STATUS`, 'pending')
  //
  //    return new Promise( (resolve, reject) => {
  //      axios.get( url, payload, axiosConfig )
  //      .then( res => {
  //        commit(`LOGIN_STATUS`, `${res.status} ${res.statusText}`)
  //        commit(`LOGIN_SUCCESS`, res.data)
  //        resolve(res.data)
  //      })
  //      .catch( err => {
  //        const res = err.response
  //        commit(`LOGIN_STATUS`, res ? `${res.status} ${res.statusText}` : err.message)
  //        commit(`LOGIN_ERROR`, res ? res.data : err.message)
  //        reject(res ? res.data : err.message)
  //      })
  //    })
  //  },
  
  
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
  
  // setup getters with Status, Data, Error pattern
  //
  // here we use the camelCased version of name
  // with 'login' as example name it will result in
  // {
  //   loginStatus(state){ return state.LOGIN_STATUS },
  //   loginData(state){ return state.LOGIN_SUCCESS },
  //   loginError(state){ return state.LOGIN_ERROR }, 
  // }

  const getters = {
    [`${camelCaseName}Status`]( state ){ return state[`${name}_STATUS`] },
    [`${camelCaseName}Data`]( state ){ return state[`${name}_SUCCESS`] },
    [`${camelCaseName}Error`]( state ){ return state[`${name}_ERROR`] },
  }
  
  // finally we return the created parts for our store
  // along with the axiosConfig to be tinkered with

  return {
    state,
    mutations,
    actions,
    getters,
    axiosConfig
  }

}
