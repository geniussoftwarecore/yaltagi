import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Square, 
  Circle, 
  Minus, 
  Triangle, 
  Pen, 
  Eraser, 
  Undo, 
  Redo, 
  Trash2,
  Download,
  Upload
} from 'lucide-react';

interface WhiteboardProps {
  roomId: string;
}

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'triangle';
type DrawingData = {
  tool: Tool;
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
};

export function Whiteboard({ roomId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath(prev => [...prev, { x, y }]);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    const path = [...currentPath, { x, y }];
    if (path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
      ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
      ctx.stroke();
    }
  }, [isDrawing, currentColor, lineWidth, currentTool, currentPath]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentPath.length > 0) {
      const newDrawing: DrawingData = {
        tool: currentTool,
        points: currentPath,
        color: currentColor,
        lineWidth: lineWidth
      };
      
      setDrawings(prev => [...prev, newDrawing]);
    }
    
    setCurrentPath([]);
  }, [isDrawing, currentPath, currentTool, currentColor, lineWidth]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawings([]);
  };

  const drawShape = (tool: Tool, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.globalCompositeOperation = 'source-over';

    switch (tool) {
      case 'rectangle':
        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
        break;
      case 'triangle':
        const midX = startPoint.x + (endPoint.x - startPoint.x) / 2;
        ctx.beginPath();
        ctx.moveTo(midX, startPoint.y);
        ctx.lineTo(startPoint.x, endPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.closePath();
        ctx.stroke();
        break;
    }
  };

  const tools = [
    { id: 'pen' as Tool, icon: Pen, label: 'Pen' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'triangle' as Tool, icon: Triangle, label: 'Triangle' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008080', '#808080', '#FFB6C1'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-gray-800">Pnu.con</span>
              <span className="text-sm text-gray-500">- teamtools</span>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-500">
              <span className="text-sm">Only</span>
              <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen pt-20">
        {/* Canvas Area */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-3xl shadow-xl h-full relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Canvas Tools Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-teal-500" />
                    <div className="w-px h-6 bg-gray-300"></div>
                    {tools.map((tool) => {
                      const IconComponent = tool.icon;
                      return (
                        <Button
                          key={tool.id}
                          onClick={() => setCurrentTool(tool.id)}
                          variant={currentTool === tool.id ? 'default' : 'ghost'}
                          size="sm"
                          className={`w-10 h-10 ${
                            currentTool === tool.id ? 'bg-teal-500 text-white' : 'hover:bg-teal-50'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {colors.slice(0, 6).map((color) => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            currentColor === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <Button onClick={clearCanvas} variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 pl-0">
          <div className="bg-white rounded-3xl shadow-xl h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-right">الأدوات</h3>
            </div>

            {/* Tools List */}
            <div className="flex-1 p-6 space-y-4">
              <Card className="p-4 bg-teal-50 border-teal-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                      <Square className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">مربع</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Circle className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-800">دائرة</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Triangle className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-800">مثلث</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Minus className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-800">خط</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Actions */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3">
                حفظ
              </Button>
              <div className="text-center text-sm text-gray-500">
                نصوص كيراشيف الأبعاد أو معدوج منع موقع قامت
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}