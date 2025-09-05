import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Vote, 
  Plus, 
  Minus, 
  Send, 
  BarChart3, 
  Clock, 
  Users, 
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
  allowMultiple: boolean;
  isAnonymous: boolean;
  totalVotes: number;
}

interface PollVote {
  pollId: string;
  optionId: string;
  participantId: string;
  participantName: string;
  timestamp: number;
}

interface PollsPanelProps {
  participantId: string;
  participantName: string;
  isHost: boolean;
  polls: Poll[];
  votes: PollVote[];
  onCreatePoll: (poll: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>) => void;
  onVote: (pollId: string, optionIds: string[]) => void;
  onEndPoll: (pollId: string) => void;
  onClose: () => void;
}

export function PollsPanel({ 
  participantId, 
  participantName, 
  isHost, 
  polls, 
  votes, 
  onCreatePoll, 
  onVote, 
  onEndPoll, 
  onClose 
}: PollsPanelProps) {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    allowMultiple: false,
    isAnonymous: false
  });

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const createPoll = () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
      return;
    }

    const pollOptions: PollOption[] = newPoll.options
      .filter(opt => opt.trim())
      .map((opt, index) => ({
        id: `option-${index}`,
        text: opt.trim(),
        votes: 0,
        voters: []
      }));

    onCreatePoll({
      question: newPoll.question.trim(),
      options: pollOptions,
      createdBy: participantName,
      isActive: true,
      allowMultiple: newPoll.allowMultiple,
      isAnonymous: newPoll.isAnonymous
    });

    // Reset form
    setNewPoll({
      question: '',
      options: ['', ''],
      allowMultiple: false,
      isAnonymous: false
    });
    setShowCreateForm(false);
  };

  const getParticipantVotes = (pollId: string) => {
    return votes.filter(vote => vote.pollId === pollId && vote.participantId === participantId);
  };

  const hasVoted = (pollId: string) => {
    return getParticipantVotes(pollId).length > 0;
  };

  const handleVote = (pollId: string, optionId: string, allowMultiple: boolean) => {
    const currentVotes = getParticipantVotes(pollId);
    
    if (allowMultiple) {
      const hasVotedForOption = currentVotes.some(vote => vote.optionId === optionId);
      if (hasVotedForOption) {
        // Remove vote
        const remainingVotes = currentVotes
          .filter(vote => vote.optionId !== optionId)
          .map(vote => vote.optionId);
        onVote(pollId, remainingVotes);
      } else {
        // Add vote
        const allVotes = [...currentVotes.map(vote => vote.optionId), optionId];
        onVote(pollId, allVotes);
      }
    } else {
      // Single choice
      onVote(pollId, [optionId]);
    }
  };

  const getPollResults = (poll: Poll) => {
    const pollVotes = votes.filter(vote => vote.pollId === poll.id);
    const totalVotes = pollVotes.length;
    
    return poll.options.map(option => {
      const optionVotes = pollVotes.filter(vote => vote.optionId === option.id);
      const percentage = totalVotes > 0 ? (optionVotes.length / totalVotes) * 100 : 0;
      
      return {
        ...option,
        votes: optionVotes.length,
        percentage,
        voters: poll.isAnonymous ? [] : optionVotes.map(vote => vote.participantName)
      };
    });
  };

  const activePolls = polls.filter(poll => poll.isActive);
  const completedPolls = polls.filter(poll => !poll.isActive);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-effect animate-[scaleIn_0.4s_ease-out]">
        <CardHeader className="pb-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold gradient-text flex items-center">
              <Vote className="w-6 h-6 text-teal-500 ml-2" />
              التصويت والاستطلاعات
            </CardTitle>
            <div className="flex items-center gap-2">
              {isHost && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إنشاء استطلاع
                </Button>
              )}
              <Button onClick={onClose} variant="ghost" size="sm" className="hover-lift">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Create Poll Form */}
          {showCreateForm && isHost && (
            <Card className="mb-6 border-teal-200/50 bg-gradient-to-br from-teal-50/30 to-cyan-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Plus className="w-5 h-5 text-teal-500 ml-2" />
                  إنشاء استطلاع جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">السؤال</label>
                  <Textarea
                    value={newPoll.question}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="اكتب سؤال الاستطلاع هنا..."
                    className="resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الخيارات</label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`الخيار ${index + 1}`}
                          className="flex-1"
                        />
                        {newPoll.options.length > 2 && (
                          <Button
                            onClick={() => removeOption(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {newPoll.options.length < 6 && (
                      <Button
                        onClick={addOption}
                        size="sm"
                        variant="outline"
                        className="w-full border-dashed hover-lift"
                      >
                        <Plus className="w-4 h-4 ml-1" />
                        إضافة خيار
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPoll.allowMultiple}
                      onChange={(e) => setNewPoll(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">السماح بخيارات متعددة</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPoll.isAnonymous}
                      onChange={(e) => setNewPoll(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">تصويت مجهول</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200/50">
                  <Button 
                    onClick={createPoll}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                    disabled={!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())}
                  >
                    <Send className="w-4 h-4 ml-1" />
                    إنشاء الاستطلاع
                  </Button>
                  <Button 
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="hover-lift"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Polls */}
          {activePolls.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg flex items-center">
                <Clock className="w-5 h-5 text-green-500 ml-2" />
                الاستطلاعات النشطة ({activePolls.length})
              </h3>
              
              {activePolls.map((poll) => {
                const results = getPollResults(poll);
                const userVotes = getParticipantVotes(poll.id);
                const totalVotes = votes.filter(vote => vote.pollId === poll.id).length;
                
                return (
                  <Card key={poll.id} className="border-green-200/50 bg-gradient-to-br from-green-50/30 to-emerald-50/30 hover-lift">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{poll.question}</CardTitle>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 ml-1" />
                              {totalVotes} صوت
                            </span>
                            <span>بواسطة {poll.createdBy}</span>
                            {poll.allowMultiple && <Badge variant="secondary" className="text-xs">خيارات متعددة</Badge>}
                            {poll.isAnonymous && (
                              <Badge variant="secondary" className="text-xs flex items-center">
                                <EyeOff className="w-3 h-3 ml-1" />
                                مجهول
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {isHost && (
                          <Button
                            onClick={() => onEndPoll(poll.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            إنهاء التصويت
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {results.map((option) => {
                        const isVoted = userVotes.some(vote => vote.optionId === option.id);
                        
                        return (
                          <div key={option.id} className="space-y-2">
                            <Button
                              onClick={() => handleVote(poll.id, option.id, poll.allowMultiple)}
                              variant="outline"
                              className={`w-full text-left justify-start hover-lift transition-all duration-300 ${
                                isVoted 
                                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent shadow-lg' 
                                  : 'hover:bg-teal-50 hover:border-teal-300'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  {isVoted && <CheckCircle className="w-4 h-4 ml-2" />}
                                  <span>{option.text}</span>
                                </div>
                                <Badge variant={isVoted ? "secondary" : "outline"} className="bg-white/20">
                                  {option.votes}
                                </Badge>
                              </div>
                            </Button>
                            
                            {/* Results bar */}
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${option.percentage}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>{option.percentage.toFixed(1)}%</span>
                                {!poll.isAnonymous && option.voters.length > 0 && (
                                  <span>{option.voters.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {hasVoted(poll.id) && (
                        <div className="text-center text-sm text-green-600 font-medium mt-4 animate-pulse">
                          ✓ تم تسجيل صوتك
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completed Polls */}
          {completedPolls.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <BarChart3 className="w-5 h-5 text-gray-500 ml-2" />
                الاستطلاعات المكتملة ({completedPolls.length})
              </h3>
              
              {completedPolls.map((poll) => {
                const results = getPollResults(poll);
                const totalVotes = votes.filter(vote => vote.pollId === poll.id).length;
                
                return (
                  <Card key={poll.id} className="border-gray-200/50 bg-gradient-to-br from-gray-50/30 to-slate-50/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 text-gray-700">{poll.question}</CardTitle>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 ml-1" />
                              {totalVotes} صوت إجمالي
                            </span>
                            <span>بواسطة {poll.createdBy}</span>
                            <Badge variant="outline" className="text-xs">مكتمل</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {results
                        .sort((a, b) => b.votes - a.votes)
                        .map((option, index) => (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium flex items-center">
                                {index === 0 && option.votes > 0 && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-2">
                                    الفائز
                                  </Badge>
                                )}
                                {option.text}
                              </span>
                              <div className="text-right">
                                <span className="font-bold text-teal-600">{option.votes}</span>
                                <span className="text-sm text-gray-500 mr-1">({option.percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                            
                            {!poll.isAnonymous && option.voters.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {option.voters.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {polls.length === 0 && (
            <div className="text-center py-12">
              <Vote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد استطلاعات</h3>
              <p className="text-gray-500 mb-6">
                {isHost 
                  ? 'قم بإنشاء استطلاع لجمع آراء المشاركين' 
                  : 'سينشئ المضيف استطلاعات للتصويت'
                }
              </p>
              {isHost && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إنشاء أول استطلاع
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}