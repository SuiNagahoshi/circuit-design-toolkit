import { HashRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import ResistorPage from "./pages/tools/resistor/ResistorPage"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools/resistor" element={<ResistorPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
