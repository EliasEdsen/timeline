import { createRouter, createWebHistory } from 'vue-router'
import NotFoundView                       from '../views/NotFoundView.vue'
import HomeView                           from '../views/HomeView.vue'
import PointsView                         from '../views/PointsView.vue'
import PointView                          from '../views/PointView.vue'
import CreatePointView                    from '../views/CreatePointView.vue'
import ChangePointView                    from '../views/ChangePointView.vue'
import MergeTagsView                      from '../views/MergeTagsView.vue'
import ProfileView                        from '../views/ProfileView.vue'
import ProfileChangeView                  from '../views/ProfileChangeView.vue'
import AuthenticationView                 from '../views/AuthenticationView.vue'

export default (app) => {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
      {
        path: '/',
        name: 'Home',
        component: HomeView
      },
      {
        path: '/points',
        name: 'Points',
        component: PointsView
      },
      {
        path: '/point',
        name: 'Point',
        component: PointView
      },
      {
        path: '/createPoint',
        name: 'CreatePoint',
        component: CreatePointView,
        meta: {
          requiresAuth: true
        },
      },
      {
        path: '/changePoint',
        name: 'ChangePoint',
        component: ChangePointView,
        meta: {
          requiresAuth: true
        },
      },
      {
        path: '/mergeTags',
        name: 'MergeTags',
        component: MergeTagsView,
        meta: {
          requiresAuth: true
        },
      },
      {

        path: '/authentication',
        name: 'Authentication',
        component: AuthenticationView
      },
      {
        path: '/profile',
        name: 'Profile',
        component: ProfileView,
        meta: {
          requiresAuth: true
        },
        children: [
          {
            path: 'change',
            component: ProfileChangeView
          },
        ]
      },
      {
        path: "/:catchAll(.*)",
        name: "NotFound",
        component: NotFoundView
      }
    ],
  });

  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!app.config.globalProperties.$store.state.User.isHasLoggedIn()) {
        next({path: '/authentication', query: {redirect: to.fullPath}})
      } else {
        next()
      }
    } else {
      next()
    }
  })

  return router;
}
