console.log('popup.jsx loaded!');

import { render } from 'preact'
import { App } from './src/popup/App.jsx'


render(<App />, document.getElementById('root'))