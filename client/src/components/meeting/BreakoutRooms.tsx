import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Minus, 
  Play, 
  ArrowLeft, 
  UserPlus, 
  UserMinus,
  Clock,
  Settings,
  Shuffle
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
}

interface BreakoutRoom {
  id: string;
  name: string;
  participants: Participant[];
  isActive: boolean;
}

interface BreakoutRoomsProps {
  participants: Participant[];
  isHost: boolean;
  onClose: () => void;
  onCreateRooms: (rooms: BreakoutRoom[]) => void;
  onJoinRoom: (roomId: string) => void;
  onReturnToMain: () => void;
}

export function BreakoutRooms({ 
  participants, 
  isHost, 
  onClose, 
  onCreateRooms, 
  onJoinRoom, 
  onReturnToMain 
}: BreakoutRoomsProps) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [roomCount, setRoomCount] = useState(2);
  const [duration, setDuration] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [unassignedParticipants, setUnassignedParticipants] = useState<Participant[]>(participants);

  useEffect(() => {
    setUnassignedParticipants(participants);
  }, [participants]);

  const createRooms = () => {
    const newRooms: BreakoutRoom[] = [];
    
    for (let i = 0; i < roomCount; i++) {
      newRooms.push({
        id: `room-${i + 1}`,
        name: `الغرفة ${i + 1}`,
        participants: [],
        isActive: false
      });
    }

    setRooms(newRooms);
    setUnassignedParticipants(participants);
  };

  const assignAutomatically = () => {
    const newRooms = [...rooms];
    const participantsToAssign = [...unassignedParticipants];
    
    // Clear existing assignments
    newRooms.forEach(room => room.participants = []);
    
    // Distribute participants evenly
    participantsToAssign.forEach((participant, index) => {
      const roomIndex = index % roomCount;
      newRooms[roomIndex].participants.push(participant);
    });

    setRooms(newRooms);
    setUnassignedParticipants([]);
  };

  const moveParticipant = (participantId: string, fromRoomId: string | null, toRoomId: string | null) => {
    const newRooms = [...rooms];
    let participant: Participant | null = null;

    // Remove from source
    if (fromRoomId) {
      const fromRoom = newRooms.find(r => r.id === fromRoomId);
      if (fromRoom) {
        participant = fromRoom.participants.find(p => p.id === participantId) || null;
        fromRoom.participants = fromRoom.participants.filter(p => p.id !== participantId);
      }
    } else {
      participant = unassignedParticipants.find(p => p.id === participantId) || null;
      setUnassignedParticipants(prev => prev.filter(p => p.id !== participantId));
    }

    if (!participant) return;

    // Add to destination
    if (toRoomId) {
      const toRoom = newRooms.find(r => r.id === toRoomId);
      if (toRoom) {
        toRoom.participants.push(participant);
      }
    } else {
      setUnassignedParticipants(prev => [...prev, participant]);
    }

    setRooms(newRooms);
  };

  const startBreakoutRooms = () => {
    const activeRooms = rooms.map(room => ({ ...room, isActive: true }));
    setRooms(activeRooms);
    setIsActive(true);
    onCreateRooms(activeRooms);
  };

  const endBreakoutRooms = () => {
    setIsActive(false);
    setRooms(prev => prev.map(room => ({ ...room, isActive: false })));
    onReturnToMain();
  };

  if (!isHost && !isActive) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center gradient-text">الغرف الجانبية</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Users className="w-16 h-16 mx-auto text-teal-500 mb-4 animate-bounce" />
            <p className="text-gray-600 mb-4">
              المضيف يقوم بإعداد الغرف الجانبية
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">
              إغلاق
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-effect animate-[scaleIn_0.4s_ease-out]">
        <CardHeader className="pb-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold gradient-text flex items-center">
              <Users className="w-6 h-6 text-teal-500 ml-2" />
              الغرف الجانبية
            </CardTitle>
            <div className="flex items-center gap-2">
              {isActive && (
                <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
                  نشطة
                </Badge>
              )}
              <Button onClick={onClose} variant="ghost" size="sm" className="hover-lift">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {!isActive && isHost && (
            <>
              {/* Setup Controls */}
              <div className="bg-gradient-to-r from-gray-50/50 to-teal-50/50 p-4 rounded-2xl mb-6 border border-white/50">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 text-teal-500 ml-2" />
                  إعدادات الغرف
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">عدد الغرف</label>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => setRoomCount(Math.max(2, roomCount - 1))}
                        size="sm" 
                        variant="outline"
                        className="hover-lift"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input 
                        type="number" 
                        value={roomCount} 
                        onChange={(e) => setRoomCount(Math.max(2, parseInt(e.target.value) || 2))}
                        className="text-center w-20"
                        min="2"
                        max="10"
                      />
                      <Button 
                        onClick={() => setRoomCount(Math.min(10, roomCount + 1))}
                        size="sm" 
                        variant="outline"
                        className="hover-lift"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">المدة (دقائق)</label>
                    <Input 
                      type="number" 
                      value={duration} 
                      onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                      className="text-center"
                      min="1"
                      max="60"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <Button 
                      onClick={createRooms} 
                      variant="outline" 
                      className="flex-1 hover-lift"
                    >
                      إنشاء الغرف
                    </Button>
                    <Button 
                      onClick={assignAutomatically} 
                      variant="outline" 
                      disabled={rooms.length === 0}
                      className="hover-lift"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Room Assignment */}
              {rooms.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">توزيع المشاركين</h3>
                    <Button 
                      onClick={startBreakoutRooms} 
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold hover-lift"
                      disabled={rooms.every(room => room.participants.length === 0)}
                    >
                      <Play className="w-4 h-4 ml-2" />
                      بدء الغرف الجانبية
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <Card key={room.id} className="hover-lift transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span>{room.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {room.participants.length} مشارك
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 min-h-[120px]">
                            {room.participants.map((participant) => (
                              <div 
                                key={participant.id} 
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-sm font-medium">{participant.name}</span>
                                <Button
                                  onClick={() => moveParticipant(participant.id, room.id, null)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                >
                                  <UserMinus className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            
                            {room.participants.length === 0 && (
                              <div className="text-center text-gray-400 py-8">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">لا يوجد مشاركين</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Unassigned Participants */}
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-gray-600">
                          مشاركين غير موزعين
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 min-h-[120px]">
                          {unassignedParticipants.map((participant) => (
                            <div 
                              key={participant.id}
                              className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                            >
                              <span className="text-sm font-medium">{participant.name}</span>
                              <div className="flex gap-1">
                                {rooms.map((room) => (
                                  <Button
                                    key={room.id}
                                    onClick={() => moveParticipant(participant.id, null, room.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-teal-100"
                                    title={`إضافة إلى ${room.name}`}
                                  >
                                    <UserPlus className="w-3 h-3" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          {unassignedParticipants.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">تم توزيع جميع المشاركين</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Active Breakout Rooms View */}
          {isActive && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 p-4 rounded-2xl border border-green-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 ml-2" />
                    <span className="font-semibold">الغرف الجانبية نشطة</span>
                  </div>
                  {isHost && (
                    <Button 
                      onClick={endBreakoutRooms}
                      variant="outline"
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover-lift"
                    >
                      إنهاء الغرف الجانبية
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="hover-lift transition-all duration-300 border-teal-200/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{room.name}</span>
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                          {room.participants.length} مشارك
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-1">
                        {room.participants.map((participant) => (
                          <div key={participant.id} className="text-sm text-gray-600">
                            • {participant.name}
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => onJoinRoom(room.id)}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                        size="sm"
                      >
                        الانضمام للغرفة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  onClick={onReturnToMain}
                  variant="outline"
                  className="hover-lift"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للغرفة الرئيسية
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}