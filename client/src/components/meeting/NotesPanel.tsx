import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Clock, 
  User, 
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  X
} from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  completed: boolean;
  createdBy: string;
  createdAt: number;
}

interface MeetingNote {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  type: 'note' | 'action' | 'decision';
}

interface NotesPanelProps {
  participantId: string;
  participantName: string;
  isHost: boolean;
  agenda: AgendaItem[];
  notes: MeetingNote[];
  onUpdateAgenda: (agenda: AgendaItem[]) => void;
  onAddNote: (note: Omit<MeetingNote, 'id' | 'timestamp'>) => void;
  onExportNotes: () => void;
  onClose: () => void;
}

export function NotesPanel({ 
  participantId, 
  participantName, 
  isHost, 
  agenda, 
  notes, 
  onUpdateAgenda, 
  onAddNote, 
  onExportNotes,
  onClose 
}: NotesPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'agenda' | 'notes'>('agenda');
  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', description: '', duration: 5 });
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'action' | 'decision'>('note');
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === 'notes' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeTab]);

  const addAgendaItem = () => {
    if (!newAgendaItem.title.trim()) return;

    const item: AgendaItem = {
      id: `agenda-${Date.now()}`,
      title: newAgendaItem.title.trim(),
      description: newAgendaItem.description.trim() || undefined,
      duration: newAgendaItem.duration,
      completed: false,
      createdBy: participantName,
      createdAt: Date.now()
    };

    onUpdateAgenda([...agenda, item]);
    setNewAgendaItem({ title: '', description: '', duration: 5 });
  };

  const toggleAgendaItem = (id: string) => {
    const updatedAgenda = agenda.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateAgenda(updatedAgenda);
  };

  const deleteAgendaItem = (id: string) => {
    const updatedAgenda = agenda.filter(item => item.id !== id);
    onUpdateAgenda(updatedAgenda);
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    onAddNote({
      content: newNote.trim(),
      author: participantName,
      type: noteType
    });

    setNewNote('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalDuration = () => {
    return agenda.reduce((total, item) => total + (item.duration || 0), 0);
  };

  const getCompletedItems = () => {
    return agenda.filter(item => item.completed).length;
  };

  const getNoteTypeColor = (type: MeetingNote['type']) => {
    switch (type) {
      case 'action':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'decision':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNoteTypeLabel = (type: MeetingNote['type']) => {
    switch (type) {
      case 'action':
        return 'إجراء';
      case 'decision':
        return 'قرار';
      default:
        return 'ملاحظة';
    }
  };

  const exportNotes = () => {
    const meetingData = {
      date: new Date().toLocaleDateString('ar-SA'),
      time: new Date().toLocaleTimeString('ar-SA'),
      agenda: agenda,
      notes: notes,
      participants: [participantName] // In a real app, this would be all participants
    };

    const content = generateNotesDocument(meetingData);
    downloadAsFile(content, `meeting-notes-${Date.now()}.txt`);
    onExportNotes();
  };

  const generateNotesDocument = (data: any) => {
    let content = `ملاحظات الاجتماع\n`;
    content += `التاريخ: ${data.date}\n`;
    content += `الوقت: ${data.time}\n\n`;
    
    content += `جدول الأعمال:\n`;
    content += `================\n`;
    data.agenda.forEach((item: AgendaItem, index: number) => {
      const status = item.completed ? '✓' : '○';
      content += `${index + 1}. ${status} ${item.title}`;
      if (item.duration) content += ` (${item.duration} دقيقة)`;
      content += `\n`;
      if (item.description) content += `   - ${item.description}\n`;
    });
    
    content += `\nالملاحظات والقرارات:\n`;
    content += `===================\n`;
    data.notes.forEach((note: MeetingNote) => {
      const typeLabel = getNoteTypeLabel(note.type);
      const time = formatTime(note.timestamp);
      content += `[${time}] ${typeLabel} - ${note.author}:\n`;
      content += `${note.content}\n\n`;
    });
    
    return content;
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-effect animate-[scaleIn_0.4s_ease-out]">
        <CardHeader className="pb-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold gradient-text flex items-center">
              <FileText className="w-6 h-6 text-teal-500 ml-2" />
              جدول الأعمال والملاحظات
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportNotes}
                size="sm"
                variant="outline"
                className="hover-lift"
                disabled={agenda.length === 0 && notes.length === 0}
              >
                <Download className="w-4 h-4 ml-1" />
                تصدير
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="hover-lift">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setActiveTab('agenda')}
              variant={activeTab === 'agenda' ? 'default' : 'outline'}
              size="sm"
              className={`hover-lift ${
                activeTab === 'agenda' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                  : 'hover:bg-teal-50'
              }`}
            >
              جدول الأعمال
              {agenda.length > 0 && (
                <Badge variant="secondary" className="mr-2 bg-white/20">
                  {getCompletedItems()}/{agenda.length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => setActiveTab('notes')}
              variant={activeTab === 'notes' ? 'default' : 'outline'}
              size="sm"
              className={`hover-lift ${
                activeTab === 'notes' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                  : 'hover:bg-teal-50'
              }`}
            >
              الملاحظات
              {notes.length > 0 && (
                <Badge variant="secondary" className="mr-2 bg-white/20">
                  {notes.length}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Agenda Tab */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              {/* Stats */}
              {agenda.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50">
                    <div className="text-2xl font-bold text-blue-600">{agenda.length}</div>
                    <div className="text-sm text-blue-700">إجمالي البنود</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200/50">
                    <div className="text-2xl font-bold text-green-600">{getCompletedItems()}</div>
                    <div className="text-sm text-green-700">مكتملة</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200/50">
                    <div className="text-2xl font-bold text-purple-600">{getTotalDuration()}</div>
                    <div className="text-sm text-purple-700">دقيقة متوقعة</div>
                  </div>
                </div>
              )}

              {/* Add Agenda Item */}
              {isHost && (
                <Card className="border-teal-200/50 bg-gradient-to-br from-teal-50/30 to-cyan-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="w-5 h-5 text-teal-500 ml-2" />
                      إضافة بند جديد
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={newAgendaItem.title}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="عنوان البند"
                      className="text-right"
                    />
                    <Textarea
                      value={newAgendaItem.description}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف إضافي (اختياري)"
                      className="resize-none text-right"
                      rows={2}
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">المدة المتوقعة:</label>
                        <Input
                          type="number"
                          value={newAgendaItem.duration}
                          onChange={(e) => setNewAgendaItem(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
                          className="w-20 text-center"
                          min="1"
                          max="120"
                        />
                        <span className="text-sm text-gray-600">دقيقة</span>
                      </div>
                      <Button 
                        onClick={addAgendaItem}
                        className="mr-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                        disabled={!newAgendaItem.title.trim()}
                      >
                        <Plus className="w-4 h-4 ml-1" />
                        إضافة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agenda Items */}
              <div className="space-y-3">
                {agenda.map((item, index) => (
                  <Card key={item.id} className={`transition-all duration-300 hover-lift ${
                    item.completed ? 'bg-green-50/50 border-green-200/50' : 'bg-white/50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Button
                          onClick={() => toggleAgendaItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="mt-0.5 hover-lift"
                        >
                          {item.completed ? 
                            <CheckSquare className="w-5 h-5 text-green-500" /> : 
                            <Square className="w-5 h-5 text-gray-400" />
                          }
                        </Button>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-semibold ${item.completed ? 'line-through text-gray-500' : ''}`}>
                              {index + 1}. {item.title}
                            </h4>
                            
                            <div className="flex items-center gap-2">
                              {item.duration && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 ml-1" />
                                  {item.duration} د
                                </Badge>
                              )}
                              {isHost && (
                                <Button
                                  onClick={() => deleteAgendaItem(item.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className={`text-sm mt-1 ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>بواسطة {item.createdBy}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {agenda.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد بنود في جدول الأعمال</h3>
                    <p className="text-gray-500">
                      {isHost ? 'قم بإضافة بنود لتنظيم الاجتماع' : 'سيقوم المضيف بإضافة بنود جدول الأعمال'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note */}
              <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-sky-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Edit3 className="w-5 h-5 text-blue-500 ml-2" />
                    إضافة ملاحظة جديدة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="اكتب ملاحظتك هنا..."
                    className="resize-none text-right"
                    rows={3}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {[
                        { value: 'note', label: 'ملاحظة', color: 'bg-gray-100' },
                        { value: 'action', label: 'إجراء', color: 'bg-blue-100' },
                        { value: 'decision', label: 'قرار', color: 'bg-green-100' }
                      ].map((type) => (
                        <Button
                          key={type.value}
                          onClick={() => setNoteType(type.value as any)}
                          variant={noteType === type.value ? 'default' : 'outline'}
                          size="sm"
                          className={`hover-lift ${
                            noteType === type.value 
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                              : 'hover:bg-teal-50'
                          }`}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={addNote}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                      disabled={!newNote.trim()}
                    >
                      <Save className="w-4 h-4 ml-1" />
                      حفظ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notes List */}
              <div className="space-y-3">
                {notes
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((note, index) => (
                    <Card key={note.id} className="bg-white/50 hover-lift animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge className={`${getNoteTypeColor(note.type)} text-xs flex-shrink-0 mt-0.5`}>
                            {getNoteTypeLabel(note.type)}
                          </Badge>
                          
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>{note.author}</span>
                              <span>•</span>
                              <span>{formatTime(note.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                
                {notes.length === 0 && (
                  <div className="text-center py-12">
                    <Edit3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد ملاحظات</h3>
                    <p className="text-gray-500">ابدأ بكتابة أول ملاحظة للاجتماع</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}