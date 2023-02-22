import Vue from 'vue'
import App from './App'
import uView from "uview-ui";
Vue.use(uView);
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
uni.$u.setConfig({
	// 修改$u.props对象的属性
	props: {
		// 修改radio组件的size参数的默认值，相当于执行 uni.$u.props.radio.size = 30
		rate: {
			value: 0
		},
		textarea:{
			confirmType:"none"
		}
	}
})