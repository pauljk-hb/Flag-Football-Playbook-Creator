import { EditorLayout } from "./layouts/EditorLayout";
import { PlaybookProvider } from "./contexts/PlaybookContext";

function App() {
  return (
    <PlaybookProvider>
      <EditorLayout />
    </PlaybookProvider>
  );
}

export default App;
