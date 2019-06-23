Vue.component('app-user', {
  props: ['user'],
  template: '<div><h2 class="userHeader">{{user.name}}</h2><ul class="user"><li v-for="(value, name) in user">{{ name }}: {{ value }}</li></ul></div>'
})

var app = new Vue({
  el: '#app',
  data: {
    username: localStorage.getItem('name'),
    isAuthenticated: false,
    message: false,
    listUsers: {}
  },
  methods: {
    loadUsers: function () {
      let request = new Request('https://cloud-ua1.webitel.com/engine/api/v2/accounts/', {
            method: 'GET',
            headers: {
                'X-Access-Token': localStorage.getItem('token'),
                'X-Key': localStorage.getItem('key')
            },
      });
      fetch(request).then(
            function(response) {
                if (response.status !== 200) {
                  return
                }
                return response.json();
            },
            function(error) {
                console.error(error);
            }
          ).then(function(myJson) {
            app.listUsers = myJson.info;
            app.isAuthenticated = true;
          });
    },
    exit: function () {
      let request = new Request('https://cloud-ua1.webitel.com/engine/logout/', {
            method: 'POST',
            headers: {
                'X-Access-Token': localStorage.getItem('token'),
                'X-Key': localStorage.getItem('key')
            },
      });
      fetch(request).then(
            function(response) {
                if (response.status !== 200) {
                  return
                }
                localStorage.clear();
                app.isAuthenticated = false;
            },
            function(error) {
                console.error(error);
            }
          )
    }
  },
  created: function () {
    if (localStorage.getItem('token')) {
      this.loadUsers();
    }
    return
  }
})

function submitForm(event) {
  event.preventDefault();
  let formData = new FormData(event.target);
  let obj = {};
  formData.forEach((value, key) => obj[key] = value);
  let request = new Request(event.target.action, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    fetch(request).then(
          function(response) {
              if (response.status !== 200) {
                app.message = true;
                return
              }
              return response.json();
          },
          function(error) {
              console.error(error);
          }
        ).then(function(myJson) {
          if (myJson) {
            localStorage.setItem('key', myJson.key);
            localStorage.setItem('token', myJson.token);
            localStorage.setItem('name', obj.username);
            app.username = obj.username;
            app.message = false;
            app.loadUsers();
          }
        });
}
