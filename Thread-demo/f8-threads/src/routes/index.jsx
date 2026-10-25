import { createBrowserRouter } from 'react-router'
import { BASE_PATH } from '@/lib/appUrl'
import DefaultLayout from '@/layouts/DefaultLayout'
import EmbedLayout from '@/layouts/EmbedLayout'
import Activity from '@/pages/Activity/Activity'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import ResetPassword from '@/pages/Auth/ResetPassword'
import VerifyEmail from '@/pages/Auth/VerifyEmail'
import Embed from '@/pages/Embed'
import Home from '@/pages/Home/Home'
import NotFound from '@/pages/NotFound'
import PostDetail from '@/pages/PostDetail/PostDetail'
import Profile from '@/pages/Profile/Profile'
import Search from '@/pages/Search/Search'
import { GuestOnly, RequireAuth } from './guards'
import RootLayout from './RootLayout'

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          element: <DefaultLayout />,
          children: [
            { index: true, element: <Home /> },
            { path: 'search', element: <Search /> },
            { path: ':username/post/:postId', element: <PostDetail /> },
            {
              element: <RequireAuth />,
              children: [
                { path: 'activity', element: <Activity /> },
                { path: 'profile', element: <Profile /> },
              ],
            },
          ],
        },
        {
       
          children: [
            {
              element: <GuestOnly />,
              children: [
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: 'forgot-password', element: <ForgotPassword /> },
              ],
            },
            { path: 'verify-email', element: <VerifyEmail /> },
            { path: 'reset-password', element: <ResetPassword /> },
          ],
        },
        {
          element: <EmbedLayout />,
          children: [{ path: ':username/post/:postId/embed', element: <Embed /> }],
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    basename: BASE_PATH || '/',
  },
)