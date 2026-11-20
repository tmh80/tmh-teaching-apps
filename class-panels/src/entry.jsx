import { createRoot } from 'react-dom/client';
import { jsx as _jsx } from 'react/jsx-runtime';
import TeacherApp from './teacher-app.jsx';

const root = document.getElementById('root');
if (root) createRoot(root).render(_jsx(TeacherApp, {}));
