import { Component, createReaction, createResource, lazy, Resource } from 'solid-js';
import { Routes, Route, Navigate, RouteDataFuncArgs } from "@solidjs/router"
import Home from './pages/Home';
import Layout from './components/Layout/Layout';
import Explore from './pages/Explore';
import Thread from './pages/Thread';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import Help from './pages/Help';
// import Profile from './pages/Profile';
import { PrimalWindow } from './types/primal';
import { useHomeContext } from './contexts/HomeContext';
import { useExploreContext } from './contexts/ExploreContext';
import { useThreadContext } from './contexts/ThreadContext';
import { useAccountContext } from './contexts/AccountContext';
import { useProfileContext } from './contexts/ProfileContext';
import { useSettingsContext } from './contexts/SettingsContext';
import NotFound from './pages/NotFound';
import { fetchKnownProfiles } from './lib/profile';
import Search from './pages/Search';
import { useMessagesContext } from './contexts/MessagesContext';
import { useMediaContext } from './contexts/MediaContext';
import { useNotificationsContext } from './contexts/NotificationsContext';
import { useSearchContext } from './contexts/SearchContext';

const primalWindow = window as PrimalWindow;

const Router: Component = () => {

  const account = useAccountContext();
  const profile = useProfileContext();
  const settings = useSettingsContext();
  const home = useHomeContext();
  const explore = useExploreContext();
  const thread = useThreadContext();
  const messages = useMessagesContext();
  const media = useMediaContext();
  const notifications = useNotificationsContext();
  const search = useSearchContext();

  const loadPrimalStores = () => {
    primalWindow.primal = {
      account,
      explore,
      home,
      media,
      messages,
      notifications,
      profile,
      search,
      settings,
      thread,
    };
  };

  primalWindow.loadPrimalStores = loadPrimalStores;

  const Profile = lazy(() => import('./pages/Profile'))

  const getKnownProfiles = ({ params }: RouteDataFuncArgs) => {
    const [profiles] = createResource(params.vanityName, fetchKnownProfiles)
    return profiles;
  }

  return (
    <>
      <Routes>
        <Route path="/" component={Layout} >
          <Route path="/" element={<Navigate href="/home" />} />
          <Route path="/home" component={Home} />
          <Route path="/thread/:postId" component={Thread} />
          <Route path="/explore/:scope?/:timeframe?" component={Explore} />
          <Route path="/messages/:sender?" component={Messages} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/downloads" component={Downloads} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile/:npub?" component={Profile} />
          <Route path="/help" component={Help} />
          <Route path="/search/:query" component={Search} />
          <Route path="/rest" component={Explore} />
          <Route path="/404" component={NotFound} />
          <Route path="/:vanityName" component={Profile} data={getKnownProfiles} />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
