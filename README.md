# vuex-async-helper
vuex async helper function inspired by [lmiller1990](https://github.com/lmiller1990)

In the search for a easy vuex async abstraction to get rid of the repetetive nature of state, mutations, actions and getters I stumbled upon [this article](https://medium.com/@lachlanmiller_52885/reducing-vuex-boilerplate-for-ajax-calls-1cd4a74cef26).

It inspired me to build up on his ideas and make it simpler and more versatile.

# Simple Usage

import the async helper into your store.js

```javascript
import { asyncHelper } from './storeUtils.js'
```

Create a helper Object

```javascript
const register = asyncHelper({
  name: 'REGISTER',
  url: 'http://address/of/your/endpoint/register',
});
```

Spread the helper properties into your store

```javascript
export default new Vuex.Store({
  state: {
    ...register.state,
  },
  mutations: {
    ...register.mutations,
  },
  actions: {
    ...register.actions,
  },
  getters: {
    ...register.getters,
  }
})
```

In your components you can dispatch your chosen name to load the data  
i.e. when your component is created

```javascript
created(){
  this.$store.dispatch('REGISTER')
}
```

Now you have access to the REGISTER data via getters in your components  
i.e. in your computed properties

```javascript
computed: {
  registerStatus(){ return this.$store.getters.registerStatus },
  registerData(){ return this.$store.getters.registerData },
  registerError(){ return this.$store.getters.registerError },
}
```

# Advanced Usage

You can also provide other methods to use (default is get)

```javascript
const register = asyncHelper({
  name: 'REGISTER',
  method: 'post'
  url: 'http://address/of/your/endpoint/register',
});
```

And send your payload with the dispatch. i.e. in a signUp component

```javascript
methods: {
 sendForm(){
  const payload = {
    username: this.username,
    password: this.password
  }
  this.$store.dispatch('REGISTER', payload)
 }
}
```

If you need to alter the recieved data you can provide a successMutation function.  
This will be executed in the mutation before the data is set into the store.  
Remember to return the data you want to store

```javascript
const register = asyncHelper({
  name: 'REGISTER',
  method: 'post'
  url: 'http://address/of/your/endpoint/register',
  successMutation(state, data){
    console.log('my recieved data:', data)
    data.awesome = true
    console.log('my awesome data:', data)
    return data
  }
});
```

If you need to alter the recieved error you can provide a errorMutation function.  
This will be executed in the mutation before the error is set into the store.  
Remember to return the error you want to store

```javascript
const register = asyncHelper({
  name: 'REGISTER',
  method: 'post'
  url: 'http://address/of/your/endpoint/register',
  successMutation(state, data){
    console.log('my recieved data:', data)
    data.awesome = true
    console.log('my awesome data:', data)
    return data
  },
  errorMutation(state, error){
    console.log('my recieved error:', error)
    error.pesky = true
    console.log('my pesky error:', error)
    return error
  },
});
```

If you need to setup additional axios configuration you can do so by editing the 'axiosConfig' property of your helper  
Note that you can't just set a new Object as value because 'axiosConfig' is a constant to prevent accidental change of type

```javascript
const register = asyncHelper({
  name: 'REGISTER',
  url: 'http://address/of/your/endpoint/register',
});

const registerAxiosConfig = register.axiosConfig
registerAxiosConfig.withCredentials = true
registerAxiosConfig.headers = { Authorization: 'Bearer mysuperawesomebearertoken' }
```



