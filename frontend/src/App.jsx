import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Veiculos from './pages/Veiculos'
import Ordens from './pages/Ordens'
import Financeiro from './pages/Financeiro'
import Estoque from './pages/Estoque'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="veiculos" element={<Veiculos />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="ordens" element={<Ordens />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}
