import Sidebar from "./components/Sidebar";
import ManageDevices from "./pages/ManageDevices";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-8 bg-gray-100">
        <ManageDevices />
      </div>
    </div>
  );
}

export default App;
