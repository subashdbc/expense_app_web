const users = {
  path: "/users",
  component: () => import('../views/users/Index.vue'),
  children: [{
    path: "",
    name: "users",
    component: () => import('../views/users/List.vue'),
  }, {
    path: "actions/:user_id?",
    name: "users_actions",
    component: () => import('../views/users/Actions.vue'),
  }]
};

export { users }