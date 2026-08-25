import React from 'react';
import ReactDOM from 'react-dom';
import './ui/index.scss' with {type: "css"};
import App, { AppRedirect } from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { Route, Routes, HashRouter } from 'react-router-dom';
import Notifications from './ui/notifications';
import Dialogs from './ui/dialogs';
import { Flyouts } from './ui/flyout';
import { CurrentContextMenu } from './ui/context-menu';
import { getAppearanceSetting } from './screens/settings/appearance/appearance';

import HomePage from './screens/home/home';
import LoginForm from './screens/login';
import InvalidVersionPage from './screens/invalid-version';
import HomePageRoom from './screens/home/room';

console.log('JavaScript is executing');

export const darkThemeMediaQuery = matchMedia("(prefers-color-scheme: dark)");
export function updateTheme() {
    const setting = getAppearanceSetting('colorTheme');
    const isDarkNow = (setting === 'system') ?
        darkThemeMediaQuery.matches :
        setting === 'dark';

    if (isDarkNow)
        document.documentElement.classList.add('dark');
    else
        document.documentElement.classList.remove('dark');

    document.documentElement.style.setProperty("--hue", getAppearanceSetting("hue").toString())
};
darkThemeMediaQuery.addEventListener('change', updateTheme);
updateTheme();

const SettingsLazy = React.lazy(() => import("./screens/settings/settings"));
function Settings() {
    return (
        <React.Suspense fallback={(
            <main className='placeholders loading'>
                <div className="circle"></div>
            </main>
        )}>
            <SettingsLazy />
        </React.Suspense>
    )
}

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <HashRouter>
                <Notifications />
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/invalid-version" element={<InvalidVersionPage />} />
                    <Route path="/" element={<App />}>
                        <Route path="home" element={<HomePage />}>
                            <Route index element={<HomePageRoom />} />
                            <Route path=":roomId" element={<HomePageRoom />} />
                        </Route>
                        <Route path="settings/*" element={ <Settings /> } />
                        <Route index element={<AppRedirect />} />
                        <Route path="*" element={<AppRedirect />} />
                    </Route>
                </Routes>
                <Dialogs />
                <Flyouts />
                <CurrentContextMenu />
            </HashRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
