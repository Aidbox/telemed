import React from 'react'
import ReactDOM from 'react-dom/client'

import 'bootstrap/dist/css/bootstrap.css'
import './index.css'

import { App } from './Router'

const node = document.getElementById('root')

if (node) ReactDOM.createRoot(node).render(<App />)
