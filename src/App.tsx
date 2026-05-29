import { HashRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import ResistorPage from "./pages/tools/resistor/ResistorPage"
import ResistorCombinationPage from "./pages/tools/resistor-combination"
import LEDResistorPage from "./pages/tools/led-resistor"
import DCDCPage from "./pages/tools/dcdc-converter"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools/resistor" element={<ResistorPage />} />
          <Route path="tools/resistor-combination" element={<ResistorCombinationPage />} />
          <Route path="tools/led-resistor" element={<LEDResistorPage />} />
          <Route path="tools/dcdc-converter" element={<DCDCPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
