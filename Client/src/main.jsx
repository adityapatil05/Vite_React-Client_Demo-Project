import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Launcher from './launcher'
createRoot(document.getElementById('root')).render(<BrowserRouter>
                                                      <Launcher/>
                                                    </BrowserRouter>)
