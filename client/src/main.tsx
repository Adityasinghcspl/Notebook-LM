import "./index.css"
import App from "./App.tsx"
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { createRoot } from "react-dom/client"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider, useTheme } from "./components/theme-provider.tsx"

// ✅ Wrap ToastContainer in its own component so hooks can be used safely
function AppWithProviders() {
  const { theme } = useTheme()

  return (
    <>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"} // use themeProvider
      />
    </>
  )
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppWithProviders />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
)
