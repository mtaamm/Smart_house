import {
  Search,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Cloud,
  Lamp,
  BarChart2,
  DoorOpen,
  Wifi,
  Music,
  Zap,
  AirVentIcon as AirConditioner,
  Sun,
  Minus,
  Plus,
} from "lucide-react"
import DeviceSwitch from "../../component/DeviceSwitch/DeviceSwitch.jsx" 

const HomePage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-24 bg-purple-600 flex flex-col items-center py-6 space-y-8">
        {/* Sidebar content ... */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-700">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium">Scarlett</span>
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-amber-100 rounded-xl p-6 mb-8 flex justify-between items-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-amber-800">Hello, Scarlett!</h1>
            <p className="text-amber-700">
              Welcome Home! The air quality is good & fresh you can go out today.
            </p>
            <div className="space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-amber-800" />
                <span className="font-bold text-amber-800">+25°C</span>
                <span className="text-amber-700">Outdoor temperature</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-amber-800" />
                <span className="text-amber-700">Fuzzy cloudy weather</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/placeholder.svg?height=200&width=200"
              alt="Person walking dog"
              className="h-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Home Controls */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Scarlett's Home</h2>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span>35%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-500">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <span>15°C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Living Room</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Device Controls using DeviceSwitch */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Door */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center space-y-2">
                  <DeviceSwitch deviceName="door" />
                  <div className="text-purple-600">
                    <DoorOpen className="w-8 h-8" />
                  </div>
                  <span className="text-purple-600">Door</span>
                </div>
                {/* Temperature (e.g. for heating/cooling control) */}
                <div className="bg-purple-600 p-4 rounded-xl shadow-sm flex flex-col items-center space-y-2">
                  <DeviceSwitch deviceName="temperature" />
                  <div className="text-white">
                    <Zap className="w-8 h-8" />
                  </div>
                  <span className="text-white">Temperature</span>
                </div>
                {/* Air Conditioner */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center space-y-2">
                  <DeviceSwitch deviceName="airConditioner" />
                  <div className="text-gray-400">
                    <AirConditioner className="w-8 h-8" />
                  </div>
                  <span className="text-gray-400">Air Conditioner</span>
                </div>
                {/* Lights */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center space-y-2">
                  <DeviceSwitch deviceName="lights" />
                  <div className="text-gray-400">
                    <Sun className="w-8 h-8" />
                  </div>
                  <span className="text-gray-400">Lights</span>
                </div>
              </div>

              {/* Temperature Control */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium">Living Room Temperature</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>15°C</span>
                    <div className="flex items-center">
                      <span>ON</span>
                      <div className="ml-2">
                        {/* Giả sử cũng sử dụng DeviceSwitch cho điều khiển nhiệt độ */}
                        <DeviceSwitch deviceName="livingRoomTemperature" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Minus className="w-6 h-6 text-gray-600" />
                  </button>

                  <div className="relative">
                    <div className="w-48 h-48 rounded-full border-16 border-gray-100 flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "conic-gradient(#8b5cf6 0% 70%, #f3f4f6 70% 100%)",
                          clipPath: "circle(50% at center)",
                        }}
                      ></div>
                      <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center z-10">
                        <span className="text-4xl font-bold">25°C</span>
                        <span className="text-gray-400 text-sm">Celcius</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* My Devices */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">My Devices</h2>
                <div className="flex items-center space-x-2">
                  <span>ON</span>
                  <ChevronDown className="w-5 h-5" />
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-600 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-white">
                      <DoorOpen className="w-6 h-6" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-white text-sm mr-2">ON</span>
                      <DeviceSwitch deviceName="door" />
                    </div>
                  </div>
                  <span className="text-white">Door</span>
                </div>

                <div className="bg-amber-400 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-white">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-white text-sm mr-2">ON</span>
                      <DeviceSwitch deviceName="router" />
                    </div>
                  </div>
                  <span className="text-white">Router</span>
                </div>

                <div className="bg-orange-400 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-white">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-white text-sm mr-2">ON</span>
                      <DeviceSwitch deviceName="musicSystem" />
                    </div>
                  </div>
                  <span className="text-white">Music System</span>
                </div>

                <div className="bg-cyan-400 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-white">
                      <Lamp className="w-6 h-6" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-white text-sm mr-2">ON</span>
                      <DeviceSwitch deviceName="lamps" />
                    </div>
                  </div>
                  <span className="text-white">Lamps</span>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Members</h2>
                <ChevronRight className="w-5 h-5" />
              </div>

              <div className="flex justify-between">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-700">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Scarlett"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Scarlett</span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-300">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Nariya"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Nariya</span>
                  <span className="text-xs text-gray-500">Full Access</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-cyan-300">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Riya"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Riya</span>
                  <span className="text-xs text-gray-500">Full Access</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-300">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Dad"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Dad</span>
                  <span className="text-xs text-gray-500">Full Access</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-300">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Mom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Mom</span>
                  <span className="text-xs text-gray-500">Full Access</span>
                </div>
              </div>
            </div>

            {/* Power Consumed */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Power Consumed</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-purple-100 px-3 py-1 rounded-lg">
                    <BarChart2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">Month</span>
                  </div>
                  <ChevronDown className="w-5 h-5" />
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-orange-400"></div>
                  <span>Electricity Consumed</span>
                  <span className="ml-auto font-medium">73% Spending</span>
                </div>

                <div className="h-40 relative">
                  {/* Placeholder cho biểu đồ */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full h-full bg-gradient-to-t from-orange-200 to-transparent rounded-lg"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 border-t border-orange-300 border-dashed"></div>
                  <div className="absolute bottom-0 left-0 w-full h-3/4 border-t border-orange-300 border-dashed"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1/4 border-t border-orange-300 border-dashed"></div>

                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-400">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>June</span>
                    <span>July</span>
                    <span>Aug</span>
                  </div>

                  <div className="absolute left-0 h-full flex flex-col justify-between text-xs text-gray-400">
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
