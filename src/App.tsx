import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/navbar';
import RoutesApp from './routes';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">

        <Navbar />

        <div className="flex-1 flex flex-col overflow-y-auto">
          
          <main className="flex-grow max-w-6xl mx-auto w-full mt-1 p-6 bg-white shadow-sm rounded-lg border border-gray-200">
            <RoutesApp />
          </main>

          {/* <footer className="bg-gray-800 text-white text-center py-4 mt-8 mt-auto">
            <p className="text-sm">Events Check-In System</p>
          </footer> */}

        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;