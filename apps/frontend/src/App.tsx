import { PlaybookCanvas } from './components/PlaybookCanvas';
import { Toolbar } from './components/Toolbar';
import { PlaybookProvider } from './contexts/PlaybookContext';

function App() {
  return (
    <PlaybookProvider>
      <Toolbar></Toolbar>
      <PlaybookCanvas />
    </PlaybookProvider>
  );
}

export default App;