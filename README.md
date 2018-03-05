# vuex-async-helper
vuex async helper function inspired by lmiller1990

In the search for a easy vuex async abstraction to get rid of the repetetive nature of state, mutations, actions and getters I stumbled upon [this article](https://medium.com/@lachlanmiller_52885/reducing-vuex-boilerplate-for-ajax-calls-1cd4a74cef26) by [lmiller1990](https://github.com/lmiller1990).

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















