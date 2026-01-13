import React, { useState } from 'react';
import { LayoutDashboard, Palette, DollarSign, Sofa, ArrowRight, Home } from 'lucide-react';

interface DesignPreference {
  spaceSize: string;
  style: string;
  budget: string;
}

interface DesignSuggestion {
  layout: string;
  furniture: string[];
  colorScheme: string[];
  estimatedCost: string;
  imageUrl: string;
}

function App() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<DesignPreference>({
    spaceSize: '',
    style: '',
    budget: ''
  });
  const [suggestion, setSuggestion] = useState<DesignSuggestion | null>(null);

  const handlePreferenceChange = (key: keyof DesignPreference, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const generateSuggestion = () => {
    // 在实际应用中，这里会调用API
    const suggestions: Record<string, DesignSuggestion> = {
      modern: {
        layout: "开放式概念布局，搭配简约现代的家具摆放",
        furniture: ["低矮组合沙发", "玻璃茶几", "LED落地灯", "抽象墙面艺术"],
        colorScheme: ["#F5F5F5", "#333333", "#007AFF"],
        estimatedCost: "¥100,000 - ¥140,000",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80"
      },
      minimal: {
        layout: "功能性空间布局，仅保留必要家具",
        furniture: ["简约平台床", "嵌入式收纳", "吊灯", "竹制休闲椅"],
        colorScheme: ["#FFFFFF", "#000000", "#BEIGE"],
        estimatedCost: "¥70,000 - ¥100,000",
        imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80"
      },
      traditional: {
        layout: "对称式家具布置，清晰的空间划分",
        furniture: ["绒面沙发", "实木茶几", "水晶吊灯", "东方风格地毯"],
        colorScheme: ["#8B4513", "#DEB887", "#800000"],
        estimatedCost: "¥175,000 - ¥210,000",
        imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80"
      }
    };

    setSuggestion(suggestions[preferences.style.toLowerCase()] || suggestions.modern);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-indigo-600" />
            <span className="font-semibold text-xl text-gray-800">家居设计助手</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step < 4 && (
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${s < step ? 'text-indigo-600' : 'text-gray-400'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-24 h-1 mx-2 ${s < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                房间尺寸
              </h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-700">您的房间大小是？</span>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={preferences.spaceSize}
                    onChange={(e) => handlePreferenceChange('spaceSize', e.target.value)}
                  >
                    <option value="">请选择尺寸</option>
                    <option value="small">小型 (9-19平方米)</option>
                    <option value="medium">中型 (19-33平方米)</option>
                    <option value="large">大型 (33平方米以上)</option>
                  </select>
                </label>
                <button
                  onClick={() => setStep(2)}
                  disabled={!preferences.spaceSize}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  下一步 <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Palette className="h-6 w-6" />
                风格偏好
              </h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-700">您喜欢什么风格？</span>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={preferences.style}
                    onChange={(e) => handlePreferenceChange('style', e.target.value)}
                  >
                    <option value="">请选择风格</option>
                    <option value="modern">现代风格</option>
                    <option value="minimal">极简风格</option>
                    <option value="traditional">传统风格</option>
                  </select>
                </label>
                <button
                  onClick={() => setStep(3)}
                  disabled={!preferences.style}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  下一步 <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                预算范围
              </h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-700">您的预算范围是？</span>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={preferences.budget}
                    onChange={(e) => handlePreferenceChange('budget', e.target.value)}
                  >
                    <option value="">请选择预算</option>
                    <option value="budget">¥35,000 - ¥70,000</option>
                    <option value="moderate">¥70,000 - ¥140,000</option>
                    <option value="luxury">¥140,000以上</option>
                  </select>
                </label>
                <button
                  onClick={generateSuggestion}
                  disabled={!preferences.budget}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  生成设计方案 <Sofa className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && suggestion && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">您的个性化设计方案</h2>
              
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={suggestion.imageUrl}
                  alt="设计方案参考"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">布局建议</h3>
                    <p className="text-gray-600">{suggestion.layout}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">推荐家具</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {suggestion.furniture.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">配色方案</h3>
                    <div className="flex space-x-2 mt-2">
                      {suggestion.colorScheme.map((color, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">预估费用</h3>
                    <p className="text-gray-600">{suggestion.estimatedCost}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setPreferences({ spaceSize: '', style: '', budget: '' });
                  setSuggestion(null);
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                重新开始
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;