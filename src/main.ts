import { ElLoading } from 'element-plus'
import App from './App.vue'
import router from './router'

import 'uno.css'

const app = createApp(App)

app.use(ElLoading)
app.use(router)
app.mount('#app')
