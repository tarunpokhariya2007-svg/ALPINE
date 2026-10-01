import { RouterProvider } from 'react-router'
import CursorSparkles from './component/CursorSparkles'
import { ThemeProvider } from './context/ThemeContext'
import { router } from './app/routes'

export default function App() {
  return (
    <ThemeProvider>
      <CursorSparkles />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
