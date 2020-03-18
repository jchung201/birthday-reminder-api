import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";
import { store } from "./store/store";
import App from "./components/container/AppContainer.jsx";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
