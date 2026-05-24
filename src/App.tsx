import { HashRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import ResistorPage from "./pages/tools/resistor/ResistorPage"
import ResistorCombinationPage from "./pages/tools/resistor-combination"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools/resistor" element={<ResistorPage />} />
          <Route path="tools/resistor-combination" element={<ResistorCombinationPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
