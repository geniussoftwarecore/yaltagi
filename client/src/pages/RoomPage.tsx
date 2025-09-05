import React from 'react';
import { useParams } from 'wouter';

export function RoomPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          غرفة الاجتماع {id}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Video Grid */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <div className="text-gray-400">
                <p>سيتم عرض الفيديوهات هنا</p>
                <p className="text-sm mt-2">Video conferencing functionality coming soon</p>
              </div>
            </div>
          </div>
          
          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 h-[400px] flex flex-col">
              <h3 className="font-semibold mb-4">المحادثة</h3>
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="text-gray-400 text-sm">
                  لا توجد رسائل بعد
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="اكتب رسالة..." 
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                  إرسال
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="mt-4 flex justify-center gap-4">
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
            🎤 الميكروفون
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
            📷 الكاميرا
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
            🖥️ مشاركة الشاشة
          </button>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            مغادرة الغرفة
          </button>
        </div>
      </div>
    </div>
  );
}