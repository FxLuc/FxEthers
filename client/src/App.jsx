import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-loading-skeleton/dist/skeleton.css'
import './App.scss'
import { EthProvider } from './contexts'
import { BrowserRouter } from 'react-router-dom'
import { MainRoutes } from './routers'

function App() {
  return (
    <EthProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </EthProvider>
  );
}

export default App;
