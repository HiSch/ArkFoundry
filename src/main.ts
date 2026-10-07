import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { preventZoom } from './ui/zoomGuard'

preventZoom()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
