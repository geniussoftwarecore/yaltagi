import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hand, 
  Heart, 
  Smile, 
  ThumbsUp, 
  Clap, 
  Star, 
  Coffee,
  Fire,
  X,
  Users
} from 'lucide-react';

interface Reaction {
  id: string;
  type: 'hand' | 'thumbs-up' | 'heart' | 'clap' | 'smile' | 'star' | 'coffee' | 'fire';
  emoji: string;
  label: string;
  participantId: string;
  participantName: string;
  timestamp: number;
}

interface FloatingReaction {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface ReactionsPanelProps {
  participantId: string;
  participantName: string;
  onSendReaction: (reaction: Omit<Reaction, 'id' | 'timestamp'>) => void;
  reactions: Reaction[];
  onClose: () => void;
}

const REACTION_TYPES = [
  { type: 'hand' as const, emoji: '✋', label: 'رفع اليد', icon: Hand, color: 'bg-yellow-100 text-yellow-600' },
  { type: 'thumbs-up' as const, emoji: '👍', label: 'أعجبني', icon: ThumbsUp, color: 'bg-blue-100 text-blue-600' },
  { type: 'heart' as const, emoji: '❤️', label: 'حب', icon: Heart, color: 'bg-red-100 text-red-600' },
  { type: 'clap' as const, emoji: '👏', label: 'تصفيق', icon: Clap, color: 'bg-green-100 text-green-600' },
  { type: 'smile' as const, emoji: '😊', label: 'ابتسامة', icon: Smile, color: 'bg-orange-100 text-orange-600' },
  { type: 'star' as const, emoji: '⭐', label: 'ممتاز', icon: Star, color: 'bg-purple-100 text-purple-600' },
  { type: 'coffee' as const, emoji: '☕', label: 'استراحة', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { type: 'fire' as const, emoji: '🔥', label: 'رائع', icon: Fire, color: 'bg-pink-100 text-pink-600' }
];

export function ReactionsPanel({ participantId, participantName, onSendReaction, reactions, onClose }: ReactionsPanelProps) {
  const { t } = useTranslation();
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [handRaised, setHandRaised] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Check if hand is raised
  useEffect(() => {
    const recentHandRaise = reactions.find(
      r => r.type === 'hand' && 
      r.participantId === participantId && 
      Date.now() - r.timestamp < 300000 // 5 minutes
    );
    setHandRaised(!!recentHandRaise);
  }, [reactions, participantId]);

  // Handle floating reactions
  useEffect(() => {
    const recentReactions = reactions.filter(r => Date.now() - r.timestamp < 3000);
    
    const newFloatingReactions: FloatingReaction[] = recentReactions.map(reaction => ({
      id: reaction.id,
      type: reaction.type,
      emoji: reaction.emoji,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 100,
      timestamp: reaction.timestamp
    }));

    setFloatingReactions(newFloatingReactions);

    // Clean up old floating reactions
    const cleanup = setTimeout(() => {
      setFloatingReactions(prev => 
        prev.filter(fr => Date.now() - fr.timestamp < 3000)
      );
    }, 3000);

    return () => clearTimeout(cleanup);
  }, [reactions]);

  const handleReaction = (reactionType: typeof REACTION_TYPES[0]) => {
    if (reactionType.type === 'hand') {
      setHandRaised(!handRaised);
    }

    onSendReaction({
      type: reactionType.type,
      emoji: reactionType.emoji,
      label: reactionType.label,
      participantId,
      participantName
    });
  };

  const getReactionStats = () => {
    const stats = new Map<string, { count: number; participants: string[] }>();
    
    reactions.forEach(reaction => {
      const key = reaction.type;
      if (!stats.has(key)) {
        stats.set(key, { count: 0, participants: [] });
      }
      const stat = stats.get(key)!;
      if (!stat.participants.includes(reaction.participantName)) {
        stat.participants.push(reaction.participantName);
        stat.count++;
      }
    });

    return stats;
  };

  const reactionStats = getReactionStats();
  const raisedHands = reactions.filter(r => 
    r.type === 'hand' && 
    Date.now() - r.timestamp < 300000 // Active for 5 minutes
  );

  return (
    <>
      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {floatingReactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute text-4xl animate-[float_3s_ease-out] pointer-events-none select-none"
            style={{
              left: `${reaction.x}px`,
              top: `${reaction.y}px`,
              animationFillMode: 'forwards'
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card ref={panelRef} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-effect animate-[scaleIn_0.4s_ease-out]">
          <CardHeader className="pb-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold gradient-text flex items-center">
                <Smile className="w-6 h-6 text-teal-500 ml-2" />
                التفاعل والردود
              </CardTitle>
              <div className="flex items-center gap-2">
                {handRaised && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse">
                    <Hand className="w-3 h-3 ml-1" />
                    يد مرفوعة
                  </Badge>
                )}
                <Button onClick={onClose} variant="ghost" size="sm" className="hover-lift">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Quick Reactions */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Heart className="w-5 h-5 text-teal-500 ml-2" />
                  الردود السريعة
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {REACTION_TYPES.map((reaction) => {
                    const IconComponent = reaction.icon;
                    const isActive = reaction.type === 'hand' ? handRaised : false;
                    
                    return (
                      <Button
                        key={reaction.type}
                        onClick={() => handleReaction(reaction)}
                        className={`h-16 flex flex-col items-center justify-center gap-1 hover-lift transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg animate-pulse' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-teal-300'
                        }`}
                        variant="outline"
                      >
                        <div className="relative">
                          <span className="text-2xl">{reaction.emoji}</span>
                          {isActive && reaction.type === 'hand' && (
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">
                          {reaction.label}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Raised Hands */}
              {raisedHands.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 p-4 rounded-2xl border border-yellow-200/50">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Hand className="w-5 h-5 text-yellow-500 ml-2" />
                    الأيدي المرفوعة ({raisedHands.length})
                  </h3>
                  <div className="space-y-2">
                    {raisedHands.map((hand, index) => {
                      const timeAgo = Math.floor((Date.now() - hand.timestamp) / 60000);
                      return (
                        <div 
                          key={hand.id}
                          className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-yellow-200/30 animate-[slideInRight_0.3s_ease-out]"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                              <Hand className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{hand.participantName}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {timeAgo === 0 ? 'الآن' : `منذ ${timeAgo} د`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reaction Statistics */}
              {reactionStats.size > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Users className="w-5 h-5 text-teal-500 ml-2" />
                    إحصائيات التفاعل
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from(reactionStats.entries()).map(([type, stats]) => {
                      const reactionType = REACTION_TYPES.find(r => r.type === type);
                      if (!reactionType || type === 'hand') return null;
                      
                      return (
                        <div 
                          key={type}
                          className="bg-white/50 p-3 rounded-xl border border-white/50 text-center hover-lift transition-all duration-300"
                        >
                          <div className="text-2xl mb-1">{reactionType.emoji}</div>
                          <div className="font-bold text-teal-600">{stats.count}</div>
                          <div className="text-xs text-gray-600">{reactionType.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Reactions Feed */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <Star className="w-5 h-5 text-teal-500 ml-2" />
                  التفاعلات الأخيرة
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {reactions
                    .filter(r => r.type !== 'hand') // Don't show hand raises in recent feed
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 20)
                    .map((reaction, index) => {
                      const timeAgo = Math.floor((Date.now() - reaction.timestamp) / 1000);
                      const reactionType = REACTION_TYPES.find(r => r.type === reaction.type);
                      
                      return (
                        <div 
                          key={reaction.id}
                          className="flex items-center gap-3 p-2 bg-white/30 rounded-lg animate-[fadeIn_0.5s_ease-out]"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <span className="text-lg">{reaction.emoji}</span>
                          <div className="flex-1">
                            <span className="font-medium text-sm">{reaction.participantName}</span>
                            <span className="text-gray-600 text-xs mr-2">{reactionType?.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {timeAgo < 60 ? 'الآن' : `منذ ${Math.floor(timeAgo / 60)} د`}
                          </span>
                        </div>
                      );
                    })}
                  
                  {reactions.filter(r => r.type !== 'hand').length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">لا توجد ردود حتى الآن</p>
                      <p className="text-xs">كن أول من يتفاعل!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Compact reactions quick access component
export function ReactionsQuickAccess({ 
  participantId, 
  participantName, 
  onSendReaction, 
  reactions,
  onOpenPanel 
}: {
  participantId: string;
  participantName: string;
  onSendReaction: (reaction: Omit<Reaction, 'id' | 'timestamp'>) => void;
  reactions: Reaction[];
  onOpenPanel: () => void;
}) {
  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    const recentHandRaise = reactions.find(
      r => r.type === 'hand' && 
      r.participantId === participantId && 
      Date.now() - r.timestamp < 300000
    );
    setHandRaised(!!recentHandRaise);
  }, [reactions, participantId]);

  const quickReactions = REACTION_TYPES.slice(0, 4); // Show first 4 reactions

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Hand raise button (special) */}
      <Button
        onClick={() => {
          const handReaction = REACTION_TYPES.find(r => r.type === 'hand')!;
          onSendReaction({
            type: handReaction.type,
            emoji: handReaction.emoji,
            label: handReaction.label,
            participantId,
            participantName
          });
        }}
        className={`w-12 h-12 rounded-full shadow-lg hover-lift transition-all duration-300 ${
          handRaised 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white animate-pulse shadow-yellow-400/25' 
            : 'bg-white/90 backdrop-blur-sm hover:bg-yellow-50 border border-gray-200'
        }`}
        title="رفع اليد"
      >
        <Hand className={`w-5 h-5 ${handRaised ? 'text-white' : 'text-yellow-500'}`} />
      </Button>

      {/* Quick reaction buttons */}
      {quickReactions.slice(1).map((reaction) => (
        <Button
          key={reaction.type}
          onClick={() => onSendReaction({
            type: reaction.type,
            emoji: reaction.emoji,
            label: reaction.label,
            participantId,
            participantName
          })}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-gray-50 border border-gray-200 shadow-lg hover-lift transition-all duration-300"
          title={reaction.label}
        >
          <span className="text-lg">{reaction.emoji}</span>
        </Button>
      ))}

      {/* More reactions button */}
      <Button
        onClick={onOpenPanel}
        className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover-lift transition-all duration-300"
        title="المزيد من الردود"
      >
        <Smile className="w-5 h-5" />
      </Button>
    </div>
  );
}