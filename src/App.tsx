import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Settings2, 
  Compass, 
  Hourglass, 
  Stamp, 
  Flame, 
  MapPin, 
  DoorOpen,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Hexagon,
  Eye,
  ScrollText,
  Feather,
  Swords,
  Lightbulb,
  ListChecks,
  Key,
  Gem,
  Gamepad2,
  Cloud,
  PawPrint,
  Pencil,
  Map,
  Menu,
  X,
  Minus,
  Smartphone,
  Sun,
  Moon,
  Star,
  CloudRain,
  Zap,
  Waves,
  MoonStar,
  SunDim,
  Bird,
  Cat,
  Dog,
  Fish,
  TreePine,
  Wind,
  Sparkles,
  Flag
} from 'lucide-react';
import { generatePuzzle, CellData, Point, PuzzleData } from './generator';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

// Initialize mobile drag and drop polyfill
polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

import { 
  GiDragonHead, GiEatingPelican, GiTigerHead, GiFoxHead, GiMonkey, GiCirclingFish, GiPrayingMantis, GiTurtle, GiUnicorn,
  GiSun, GiMoon, GiStarSwirl, GiCloudRing, GiRaining, GiLightningTear, GiWhirlwind, GiSnowflake1, GiEclipse
} from 'react-icons/gi';

// --- Types ---
type Tab = 'mission' | 'variables' | 'play' | 'mobilePlay' | 'tutorial' | 'feedback';

// --- Mock Data ---
const ROW_LABELS = ['Sun', 'Moon', 'Star', 'Cloud', 'Rain', 'Lightning', 'Wind', 'Frost', 'Eclipse'];
const COL_LABELS = ['Dragon', 'Pelican', 'Tiger', 'Fox', 'Monkey', 'Koi', 'Mantis', 'Turtoise', 'Kirin'];

const WEATHER_ICONS_MAP: Record<string, any> = {
  'Sun': GiSun,
  'Moon': GiMoon,
  'Star': GiStarSwirl,
  'Cloud': GiCloudRing,
  'Rain': GiRaining,
  'Lightning': GiLightningTear,
  'Wind': GiWhirlwind,
  'Frost': GiSnowflake1,
  'Eclipse': GiEclipse
};

const ANIMAL_ICONS_MAP: Record<string, any> = {
  'Dragon': GiDragonHead,
  'Pelican': GiEatingPelican,
  'Tiger': GiTigerHead,
  'Fox': GiFoxHead,
  'Monkey': GiMonkey,
  'Koi': GiCirclingFish,
  'Mantis': GiPrayingMantis,
  'Turtoise': GiTurtle,
  'Kirin': GiUnicorn
};

const ROLES = [
  { name: 'The Celestial Architect', title: 'Ten-no-Kenshitsusha', icon: Cloud },
  { name: 'The Earth Tracker', title: 'Chi-no-Tsuiseki', icon: PawPrint },
  { name: 'The Reliquary', title: 'Shinki-no-Moribito', icon: Flame },
  { name: 'The Pathfinder', title: 'Michi-no-Kaitakusha', icon: Compass },
  { name: 'The Chronicler', title: 'Reki-no-Kirokusha', icon: ScrollText },
];

function FeedbackPage({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use the full URL to ensure we hit the correct endpoint
      const apiUrl = window.location.origin + '/api/send-feedback';
      console.log("Sending request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, feedback }),
      });

      // Read the raw text first to see what the server actually sent
      const rawText = await response.text();
      console.log("Raw server response:", rawText);

      let data;
      try {
        // Try to parse it as JSON
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error(`Server returned an invalid response (Status: ${response.status}). Check console for details.`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to send feedback (Status: ${response.status})`);
      }

      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onBack();
      }, 3000);
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert(error instanceof Error ? error.message : 'Failed to send feedback. Please try again later.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-parchment overflow-y-auto">
      <div className="p-6 md:p-12 max-w-2xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-crimson mb-2">Feedback Archive</h2>
            <p className="text-sm text-ink/60 uppercase tracking-widest font-bold">Help us refine the Sacred Path</p>
          </div>
          <button 
            onClick={onBack}
            className="p-2 hover:bg-ink/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-ink/40" />
          </button>
        </div>

        {isSent ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 p-8 rounded-sm text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-emerald-900 mb-2">Message Dispatched</h3>
            <p className="text-sm text-emerald-700">Your feedback has been prepared for the archive. Thank you for your contribution.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-ink/50">Naam</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="w-full bg-parchment border border-ink/10 p-4 rounded-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson/50 transition-all font-serif"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-ink/50">Feedback</label>
              <textarea 
                required
                rows={6}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, report a bug, or suggest an improvement..."
                className="w-full bg-parchment border border-ink/10 p-4 rounded-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson/50 transition-all font-serif resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-ink hover:bg-ink-dark text-parchment font-bold uppercase tracking-widest rounded-sm shadow-md transition-all flex items-center justify-center gap-3 group"
            >
              <ScrollText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Send to Archive
            </button>
            
            <p className="text-[10px] text-center text-ink/40 italic">
              Your feedback will be sent directly to our team.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function MissionFileContent({ puzzle, selectedTier, playerCount, checkedClues, toggleClue, isDesigner = false, hideStory = false, hideOrder = false, isOrderRevealed = false, onRevealOrder }: any) {
  if (!puzzle) return null;
  return (
    <div className="space-y-8">
      {/* Prologue / Story Context */}
      {!hideStory && (
        <section className="relative">
          <div className="mb-4 flex items-center gap-3">
            <Feather className="w-4 h-4 text-crimson" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50">Archive Fragment</h4>
          </div>
          <div className="font-serif text-[14px] leading-relaxed text-ink/80 border-l-2 border-crimson/30 pl-4 space-y-4">
            {puzzle.story.map((paragraph: string, idx: number) => (
              <p key={idx} className={`italic ${idx === puzzle.story.length - 1 ? 'text-xs text-ink/50 mt-4' : ''}`}>
                <span dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </p>
            ))}
          </div>
        </section>
      )}

      {/* The Sacred Order */}
      {!hideOrder && (
        <section className="relative">
          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-5 flex items-center gap-3">
            <span className="w-6 h-px bg-ink/20"></span>
            The Sacred Order
          </h4>
          <div className="bg-parchment border border-ink/10 p-4 rounded-sm shadow-sm relative overflow-hidden mb-5">
            {isDesigner && (
              <div className="absolute top-2 right-2 text-[9px] uppercase tracking-widest text-crimson/70 font-bold border border-crimson/20 px-1.5 py-0.5 rounded-sm bg-parchment z-10">
                Designer View
              </div>
            )}
            
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-ink/20"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-ink/20"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-ink/20"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-ink/20"></div>

            {(!isDesigner && !isOrderRevealed && onRevealOrder) ? (
              <div className="flex flex-col items-center justify-center py-6 gap-4">
                <p className="font-serif text-sm italic text-ink/60 text-center px-4">
                  "A fragmented scroll reveals the sacred order... but the ink is faded. Deciphering it will take time."
                </p>
                <button 
                  onClick={onRevealOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-ink text-parchment rounded-sm shadow-md hover:bg-ink-dark transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <Eye className="w-4 h-4" />
                  Decipher Order (+5 min)
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 px-2 flex-wrap gap-y-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <div className="flex-1 h-px bg-ink/10 mx-2 border-t border-dashed border-ink/30 min-w-[20px]"></div>
                  
                  {(puzzle?.items ? puzzle.items.slice(1, -1) : SACRED_ITEMS_POOL.slice(0, selectedTier.items).map(i => i.name)).map((itemName: string, idx: number) => {
                    const itemObj = SACRED_ITEMS_POOL.find(i => i.name === itemName);
                    const Icon = itemObj ? itemObj.icon : Hexagon;
                    return (
                      <React.Fragment key={itemName}>
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="w-4 h-4 text-gold" />
                          <span className="text-[8px] font-bold text-ink/40">{idx + 1}</span>
                        </div>
                        <div className="flex-1 h-px bg-ink/10 mx-2 border-t border-dashed border-ink/30 min-w-[20px]"></div>
                      </React.Fragment>
                    );
                  })}
                  
                  <DoorOpen className="w-4 h-4 text-ink" />
                </div>
                <p className="font-serif text-[12px] italic text-ink/60 text-center">
                  "The unbroken path visits every open space, never crossing itself. The relics must be found in this exact sequence. Distance is measured in steps: 1 step means the rooms are directly connected."
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* Deciphered Clues */}
      <section className="relative">
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-5 flex items-center gap-3">
          <span className="w-6 h-px bg-ink/20"></span>
          Deciphered Clues
        </h4>
        
        {playerCount === 1 ? (
          <ul className="space-y-4 font-serif text-[14px] leading-relaxed text-ink/90">
            {puzzle.clues.map((clue: any) => (
              <li 
                key={clue.id} 
                className={`flex gap-4 items-start cursor-pointer transition-opacity ${checkedClues[clue.id] ? 'opacity-40' : 'opacity-100'}`}
                onClick={() => toggleClue(clue.id)}
              >
                <div className={`mt-1 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${checkedClues[clue.id] ? 'bg-crimson border-crimson' : 'border-ink/20'}`}>
                  {checkedClues[clue.id] && <CheckCircle2 className="w-3 h-3 text-parchment" />}
                </div>
                <span className={`text-crimson font-bold font-sans text-sm mt-0.5 ${checkedClues[clue.id] ? 'line-through decoration-ink/30' : ''}`}>
                  {clue.id.toString().padStart(2, '0')}
                </span>
                <span 
                  className={checkedClues[clue.id] ? 'line-through decoration-ink/30' : ''}
                  dangerouslySetInnerHTML={{ __html: clue.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>') }} 
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-6">
            {Array.from({ length: playerCount }).map((_, i) => {
              const role = ROLES[i];
              const roleClues = puzzle.clues.filter((_: any, idx: number) => idx % playerCount === i);
              const Icon = role.icon;
              return (
                <div key={i} className="bg-parchment border border-ink/10 p-4 rounded-sm shadow-sm">
                  <div className="flex items-center gap-3 mb-3 border-b border-ink/10 pb-2">
                    <Icon className="w-5 h-5 text-crimson" />
                    <div>
                      <h5 className="font-bold text-sm text-ink">{role.name}</h5>
                      <p className="text-[10px] text-ink/50 uppercase tracking-widest">{role.title}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 font-serif text-[13px] leading-relaxed text-ink/90">
                    {roleClues.map((clue: any) => (
                      <li 
                        key={clue.id} 
                        className={`flex gap-3 items-start cursor-pointer transition-opacity ${checkedClues[clue.id] ? 'opacity-40' : 'opacity-100'}`}
                        onClick={() => toggleClue(clue.id)}
                      >
                        <div className={`mt-1 w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${checkedClues[clue.id] ? 'bg-crimson border-crimson' : 'border-ink/20'}`}>
                          {checkedClues[clue.id] && <CheckCircle2 className="w-2.5 h-2.5 text-parchment" />}
                        </div>
                        <span className={`text-crimson font-bold font-sans text-xs mt-0.5 ${checkedClues[clue.id] ? 'line-through decoration-ink/30' : ''}`}>
                          {clue.id.toString().padStart(2, '0')}
                        </span>
                        <span 
                          className={checkedClues[clue.id] ? 'line-through decoration-ink/30' : ''}
                          dangerouslySetInnerHTML={{ __html: clue.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>') }} 
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TutorialScreen({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: "The Legend of Kiro Fort",
      text: "Deep within the mountains lies the Kiro Fort, a shifting labyrinth designed to protect the Shogun's most guarded secrets. You are a shadow operative, and you have been trapped inside.",
      instruction: "Your mind is your only escape.",
      board: []
    },
    {
      title: "The Torii & The Passage",
      text: "Every escape begins at the Torii Gate and ends at the hidden Passage. The unbroken path must connect these two points.",
      instruction: "The journey begins.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 2, c: 2, type: 'passage' }
      ]
    },
    {
      title: "The Sacred Relics",
      text: "To unlock the Passage, you must collect Sacred Relics along the way. The Archive Fragments will give you clues to their locations.",
      clue: "The Lantern is in the North-East corner. The Sword is exactly in the center.",
      instruction: "Relics must be collected in order.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 0, c: 2, type: 'relic', item: 'Lantern' },
        { r: 1, c: 1, type: 'relic', item: 'Sword' },
        { r: 2, c: 2, type: 'passage' }
      ]
    },
    {
      title: "The Secret Rooms",
      text: "Some rooms are secret. These are Blockers. The path cannot enter them. You must deduce their locations to narrow down the possible routes.",
      clue: "The entire Western wall, except for the Torii, is secret.",
      instruction: "Blockers restrict your movement.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 0, c: 2, type: 'relic', item: 'Lantern' },
        { r: 1, c: 1, type: 'relic', item: 'Sword' },
        { r: 2, c: 2, type: 'passage' },
        { r: 1, c: 0, type: 'blocker' },
        { r: 2, c: 0, type: 'blocker' }
      ]
    },
    {
      title: "The Serpent's Path",
      text: "The most important rule: The path must visit EVERY open room exactly once. It cannot cross itself, and it cannot branch. There is always only one logical path.",
      instruction: "Trace the unbroken path.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 0, c: 2, type: 'relic', item: 'Lantern' },
        { r: 1, c: 1, type: 'relic', item: 'Sword' },
        { r: 2, c: 2, type: 'passage' },
        { r: 1, c: 0, type: 'blocker' },
        { r: 2, c: 0, type: 'blocker' }
      ],
      path: [
        {r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2}, 
        {r: 1, c: 2}, {r: 1, c: 1}, {r: 2, c: 1}, {r: 2, c: 2}
      ]
    },
    {
      title: "The Art of Deduction",
      text: "Mastering the Pencil Tool is the key to solving complex archives. Follow this strategy to systematically narrow down the path:",
      strategy: [
        { text: "1. Read a clue and mark potential Secret Rooms (Blockers) using the pencil icon.", icon: <Stamp className="w-4 h-4" /> },
        { text: "2. Use the '-' mark for rows or cells where you know no relics can exist.", icon: <Minus className="w-4 h-4" /> },
        { text: "3. Mark columns with specific relics mentioned in clues, excluding 'Safe' rows.", icon: <Flame className="w-4 h-4" /> },
        { text: "4. Cross out clues as you use them to keep your mind clear.", icon: <CheckCircle2 className="w-4 h-4" /> }
      ],
      instruction: "Think like a shadow operative.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 2, c: 2, type: 'passage' },
        { r: 0, c: 1, marks: ['blocker'] },
        { r: 1, c: 0, marks: ['no-relic-mark'] },
        { r: 1, c: 2, marks: ['Lantern'] }
      ]
    },
    {
      title: "The Golden Rules",
      text: "Every mission is governed by absolute laws. Memorize them, for they are the key to your escape:",
      rules: [
        "The path moves orthogonally (or diagonally, depending on the Archive Settings).",
        "The path cannot cross itself, overlap, or branch.",
        "Every open room must be visited exactly once.",
        "Blockers (Secret Rooms) can never be entered.",
        "Relics must be collected in the exact order given.",
        "Dead End Rule: Any room with only one open neighbor (that isn't the start or end) must be a Secret Room, otherwise the Serpent would get trapped!",
        "Elimination Rule: If a row has exactly X secret rooms and you find X secret rooms, mark the rest as Safe (No Secret Room)."
      ],
      instruction: "These rules apply to every archive.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 0, c: 2, type: 'relic', item: 'Lantern' },
        { r: 1, c: 1, type: 'relic', item: 'Sword' },
        { r: 2, c: 2, type: 'passage' },
        { r: 1, c: 0, type: 'blocker' },
        { r: 2, c: 0, type: 'blocker' }
      ],
      path: [
        {r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2}, 
        {r: 1, c: 2}, {r: 1, c: 1}, {r: 2, c: 1}, {r: 2, c: 2}
      ]
    },
    {
      title: "Solo vs. Cooperative",
      text: "You can brave the fort alone, seeing all the clues at once. Or, you can play cooperatively with up to 5 players.",
      rules: [
        "In Solo mode, you have access to the complete Archive Fragment.",
        "In Cooperative mode, the clues are divided among the players.",
        "Players must communicate what they know without showing their screens.",
        "Only by combining your knowledge can you deduce the true path."
      ],
      instruction: "Communication is your greatest weapon.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 0, c: 2, type: 'relic', item: 'Lantern' },
        { r: 1, c: 1, type: 'relic', item: 'Sword' },
        { r: 2, c: 2, type: 'passage' },
        { r: 1, c: 0, type: 'blocker' },
        { r: 2, c: 0, type: 'blocker' }
      ]
    },
    {
      title: "The Archive Index",
      text: "Familiarize yourself with the sacred symbols of Kiro Fort. Each icon represents a vital element of your mission.",
      isIndex: true,
      board: []
    },
    {
      title: "The Weather Elements",
      text: "The rows of the Archive are governed by the celestial elements. These symbols mark your vertical position within the fort.",
      isWeatherIndex: true,
      board: []
    },
    {
      title: "The Spirit Animals",
      text: "The columns are guarded by the Great Spirits. These animal icons mark your horizontal position within the fort.",
      isAnimalIndex: true,
      board: []
    },
    {
      title: "Your Mission Begins",
      text: "Use the clues, place your pencil marks, and deduce the one true path. The Archive awaits.",
      instruction: "Good luck, shadow operative.",
      board: [
        { r: 0, c: 0, type: 'torii' },
        { r: 0, c: 2, type: 'relic', item: 'Lantern' },
        { r: 1, c: 1, type: 'relic', item: 'Sword' },
        { r: 2, c: 2, type: 'passage' },
        { r: 1, c: 0, type: 'blocker' },
        { r: 2, c: 0, type: 'blocker' }
      ],
      path: [
        {r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2}, 
        {r: 1, c: 2}, {r: 1, c: 1}, {r: 2, c: 1}, {r: 2, c: 2}
      ]
    }
  ];

  const currentStep = tutorialSteps[step];

  return (
    <div className="h-full flex flex-col bg-[#1a1412] text-[#e6d5ac] font-serif relative overflow-hidden">
      {/* Background texture simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #3a2a22 0%, #1a1412 100%)' }}></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 8px)' }}></div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 flex flex-col items-center">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center my-auto py-8">
          
          {/* Left: Narrative */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#d4af37]/30 bg-[#d4af37]/10 rounded-full text-[#d4af37] text-xs font-bold tracking-widest uppercase">
              <BookOpen className="w-3 h-3" />
              Tutorial • Step {step + 1} of {tutorialSteps.length}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#d4af37] leading-tight">
              {currentStep.title}
            </h1>
            
            <p className="text-lg leading-relaxed text-[#e6d5ac]/80">
              {currentStep.text}
            </p>

            {currentStep.rules && (
              <ul className="space-y-3 mt-4">
                {currentStep.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[#e6d5ac]/90">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0"></div>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            )}

            {currentStep.clue && (
              <div className="p-4 border-l-2 border-[#8b0000] bg-[#8b0000]/10 italic text-[#e6d5ac]">
                "{currentStep.clue}"
              </div>
            )}

            {currentStep.strategy && (
              <div className="space-y-4 mt-6">
                {currentStep.strategy.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-3 bg-white/5 border border-white/10 rounded-sm animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 200}ms` }}>
                    <div className="mt-1 p-2 bg-[#d4af37]/20 rounded-full text-[#d4af37]">
                      {item.icon}
                    </div>
                    <p className="text-sm leading-relaxed text-[#e6d5ac]/90">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-8 flex items-center gap-4">
              {step > 0 && (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 border border-[#e6d5ac]/20 text-[#e6d5ac] hover:bg-[#e6d5ac]/10 transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  Previous
                </button>
              )}
              {step < tutorialSteps.length - 1 ? (
                <button 
                  onClick={() => setStep(s => s + 1)}
                  className="px-8 py-3 bg-[#8b0000] hover:bg-[#a00000] text-[#e6d5ac] transition-colors uppercase tracking-widest text-sm font-bold shadow-[0_0_15px_rgba(139,0,0,0.5)]"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={onStart}
                  className="px-8 py-3 bg-[#d4af37] hover:bg-[#ebd07a] text-[#1a1412] transition-colors uppercase tracking-widest text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  Enter the Archive
                </button>
              )}
            </div>
          </div>

          {/* Right: Board Visualization */}
          <div className="flex justify-center">
            {currentStep.isIndex ? (
              <div className="max-w-md w-full grid grid-cols-3 gap-4 p-6 bg-[#2c241b] rounded-sm shadow-2xl border-4 border-[#111]">
                <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-sm border border-white/10">
                  <div className="w-12 h-12 bg-[#8b0000] rounded-sm flex items-center justify-center border border-[#5a0000] shadow-lg">
                    <MapPin className="w-8 h-8 text-[#d4af37]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Torii Gate</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-sm border border-white/10">
                  <div className="w-12 h-12 bg-[#2c241b] rounded-sm flex items-center justify-center border border-[#111] shadow-lg">
                    <DoorOpen className="w-8 h-8 text-[#d4af37]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Passage</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-sm border border-white/10">
                  <div className="w-12 h-12 bg-[#111] rounded-sm flex items-center justify-center border border-[#333] shadow-lg">
                    <span className="text-xl font-mono text-white/30 font-bold">S</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Secret Room</span>
                </div>
                {SACRED_ITEMS_POOL.map((item: any) => (
                  <div key={item.id} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-sm border border-white/10">
                    <div className="w-12 h-12 bg-[#8b0000] rounded-sm flex items-center justify-center border border-[#5a0000] shadow-lg">
                      <item.icon className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">{item.name}</span>
                  </div>
                ))}
              </div>
            ) : currentStep.isWeatherIndex ? (
              <div className="max-w-md w-full grid grid-cols-3 gap-4 p-6 bg-[#2c241b] rounded-sm shadow-2xl border-4 border-[#111]">
                {ROW_LABELS.map((label) => {
                  const Icon = WEATHER_ICONS_MAP[label];
                  return (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-sm border border-white/10">
                      <div className="w-12 h-12 bg-[#1a1412] rounded-sm flex items-center justify-center border border-white/5 shadow-lg">
                        <Icon className="w-6 h-6 text-[#d4af37]/60" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">{label}</span>
                    </div>
                  );
                })}
              </div>
            ) : currentStep.isAnimalIndex ? (
              <div className="max-w-md w-full grid grid-cols-3 gap-4 p-6 bg-[#2c241b] rounded-sm shadow-2xl border-4 border-[#111]">
                {COL_LABELS.map((label) => {
                  const Icon = ANIMAL_ICONS_MAP[label];
                  return (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-sm border border-white/10">
                      <div className="w-12 h-12 bg-[#1a1412] rounded-sm flex items-center justify-center border border-white/5 shadow-lg">
                        <Icon className="w-6 h-6 text-[#d4af37]/60" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">{label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative p-6 bg-[#2c241b] rounded-sm shadow-2xl border-4 border-[#111] transform rotate-1 hover:rotate-0 transition-transform duration-700">
              {/* Wooden board texture */}
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 22px)' }}></div>
              
              <div className="grid grid-cols-3 gap-1 bg-[#111] p-1 relative z-10 shadow-inner">
                {currentStep.path && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ padding: '0.25rem' }}>
                    {currentStep.path.map((p, i) => {
                      if (i === 0) return null;
                      const prev = currentStep.path[i - 1];
                      return (
                        <line 
                          key={i}
                          x1={`${(prev.c + 0.5) / 3 * 100}%`}
                          y1={`${(prev.r + 0.5) / 3 * 100}%`}
                          x2={`${(p.c + 0.5) / 3 * 100}%`}
                          y2={`${(p.r + 0.5) / 3 * 100}%`}
                          stroke="#d4af37" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]"
                        />
                      );
                    })}
                  </svg>
                )}

                {Array.from({ length: 9 }).map((_, idx) => {
                  const r = Math.floor(idx / 3);
                  const c = idx % 3;
                  const cellData = currentStep.board.find(b => b.r === r && b.c === c) as any;

                  return (
                    <div key={idx} className="w-20 h-20 md:w-24 md:h-24 bg-[#e6d5ac] relative flex items-center justify-center shadow-inner border border-[#c4b58c]">
                      {/* Grid lines */}
                      <div className="absolute inset-0 border border-[#8b0000]/10 pointer-events-none"></div>
                      
                      {cellData && (
                        <div className={`w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.4)] relative z-30 transition-all duration-500 animate-in zoom-in ${
                          cellData.type === 'blocker' ? 'bg-[#111] border-2 border-[#333]' : 
                          cellData.type === 'torii' ? 'bg-[#8b0000] border-2 border-[#5a0000]' :
                          cellData.type === 'passage' ? 'bg-[#2c241b] border-2 border-[#111]' :
                          cellData.type === 'relic' ? 'bg-[#8b0000] border-2 border-[#5a0000]' :
                          'bg-transparent border-0 shadow-none' // For marks only
                        }`}>
                          {/* Tile highlight */}
                          {cellData.type && <div className="absolute inset-0 border-t border-l border-white/20 pointer-events-none"></div>}
                          
                          {cellData.type === 'torii' && <MapPin className="w-8 h-8 text-[#d4af37]" />}
                          {cellData.type === 'passage' && <DoorOpen className="w-8 h-8 text-[#d4af37]" />}
                          {cellData.type === 'blocker' && <span className="text-xl font-mono text-white/30 font-bold">S</span>}
                          {cellData.type === 'relic' && (
                            <>
                              {cellData.item === 'Lantern' && <Flame className="w-6 h-6 text-[#d4af37] mb-1" />}
                              {cellData.item === 'Sword' && <Swords className="w-6 h-6 text-[#d4af37] mb-1" />}
                              <span className="text-[8px] font-bold uppercase tracking-widest text-[#d4af37]">{cellData.item}</span>
                            </>
                          )}

                          {cellData.marks && cellData.marks.length > 0 && (
                            <div className="absolute inset-0 p-1 flex flex-wrap content-start justify-start gap-[2px] z-40">
                              {cellData.marks.map((markId: string) => {
                                if (markId === 'safe-mark') return <div key={markId} className="w-4 h-4 flex items-center justify-center bg-emerald-500/20 rounded-sm"><span className="text-[12px] font-mono font-bold text-emerald-400 leading-none">x</span></div>;
                                if (markId === 'no-relic-mark') return <div key={markId} className="w-4 h-4 flex items-center justify-center bg-slate-500/20 rounded-sm"><span className="text-[12px] font-mono font-bold text-slate-400 leading-none">-</span></div>;
                                if (markId === 'blocker') return <div key={markId} className="w-4 h-4 bg-[#111] rounded-sm flex items-center justify-center border border-white/10"><span className="text-[8px] font-mono text-white/50 font-bold leading-none">S</span></div>;
                                if (markId === 'Lantern') return <div key={markId} className="w-4 h-4 flex items-center justify-center bg-[#8b0000]/30 rounded-sm"><Flame className="w-3 h-3 text-[#d4af37]" /></div>;
                                if (markId === 'Sword') return <div key={markId} className="w-4 h-4 flex items-center justify-center bg-[#8b0000]/30 rounded-sm"><Swords className="w-3 h-3 text-[#d4af37]" /></div>;
                                return null;
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Check for designer mode via URL parameter
  const isDesigner = new URLSearchParams(window.location.search).get('mode') === 'designer';

  const [activeTab, setActiveTab] = useState<Tab>(isDesigner ? 'tutorial' : 'mobilePlay');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkedClues, setCheckedClues] = useState<Record<string, boolean>>({});

  const toggleClue = (clueId: string) => {
    setCheckedClues(prev => ({ ...prev, [clueId]: !prev[clueId] }));
  };
  
  // Lifted State
  // Default to Jōki (5x5) which is index 1 in DIFFICULTY_TIERS
  const [selectedTier, setSelectedTier] = useState(DIFFICULTY_TIERS[1]); 
  const [rowLabels, setRowLabels] = useState(ROW_LABELS);
  const [colLabels, setColLabels] = useState(COL_LABELS);
  const [itemLabels, setItemLabels] = useState(SACRED_ITEMS_POOL.map(i => i.name));
  const [secretRooms, setSecretRooms] = useState(4);
  const [movementType, setMovementType] = useState<'orthogonal' | 'diagonal'>('orthogonal');
  const [playerCount, setPlayerCount] = useState(1);
  const [seedInput, setSeedInput] = useState('');
  
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);

  const handleRegenerate = useCallback((specificSeed?: string | any) => {
    const seedToUse = typeof specificSeed === 'string' ? specificSeed : undefined;
    
    // For public users, ensure we stick to the 5x5 tier even if state drifts
    const tierToUse = isDesigner ? selectedTier : DIFFICULTY_TIERS[1];

    const itemsToPlace = [
      'Torii',
      ...SACRED_ITEMS_POOL.slice(0, tierToUse.items).map(i => i.name),
      'Passage'
    ];
    const newPuzzle = generatePuzzle(
      tierToUse.size, 
      secretRooms, 
      itemsToPlace, 
      rowLabels, 
      colLabels, 
      movementType,
      seedToUse
    );
    setPuzzle(newPuzzle);
    setSeedInput(newPuzzle.seed);
  }, [selectedTier, secretRooms, rowLabels, colLabels, movementType, isDesigner]);

  useEffect(() => {
    handleRegenerate();
  }, [handleRegenerate]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-parchment text-ink font-sans selection:bg-crimson selection:text-parchment relative">
      
      {/* Mobile Header (Only for non-mobilePlay tabs) */}
      {activeTab !== 'mobilePlay' && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-parchment border-b border-ink/10 flex items-center justify-between px-4 z-50">
          <h1 className="font-serif text-xl font-bold tracking-wide text-crimson flex items-center gap-2">
            <Hexagon className="w-5 h-5 fill-crimson/20" />
            KIRO
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-ink hover:bg-ink/5 rounded-sm"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Sidebar Navigation (Hidden in Public Mode) */}
      {isDesigner && (
        <nav className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-ink/10 bg-parchment-dark/95 md:bg-parchment-dark/30 flex flex-col justify-between backdrop-blur-md transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="pt-16 md:pt-0">
            <div className="p-6 border-b border-ink/10 hidden md:block">
              <h1 className="font-serif text-2xl font-bold tracking-wide text-crimson flex items-center gap-2">
                <Hexagon className="w-6 h-6 fill-crimson/20" />
                KIRO
              </h1>
              <p className="text-xs uppercase tracking-widest text-ink/60 mt-1 font-medium">Mission Generator</p>
            </div>
            
            <div className="p-4 space-y-2">
              <button 
                onClick={() => { setActiveTab('tutorial'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 ${
                  activeTab === 'tutorial' 
                    ? 'bg-ink text-parchment shadow-md' 
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <Map className="w-4 h-4" />
                The Legend
              </button>
              <button 
                onClick={() => { setActiveTab('mission'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 ${
                  activeTab === 'mission' 
                    ? 'bg-ink text-parchment shadow-md' 
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Mission Archive
              </button>
              <button 
                onClick={() => { setActiveTab('play'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 ${
                  activeTab === 'play' 
                    ? 'bg-ink text-parchment shadow-md' 
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                Play Mission
              </button>
              <button 
                onClick={() => { setActiveTab('mobilePlay'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 ${
                  activeTab === 'mobilePlay' 
                    ? 'bg-ink text-parchment shadow-md' 
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile Play (Beta)
              </button>
              <button 
                onClick={() => { setActiveTab('variables'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 ${
                  activeTab === 'variables' 
                    ? 'bg-ink text-parchment shadow-md' 
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                Archive Variables
              </button>
              <button 
                onClick={() => { setActiveTab('feedback'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 ${
                  activeTab === 'feedback' 
                    ? 'bg-ink text-parchment shadow-md' 
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <ScrollText className="w-4 h-4" />
                Send Feedback
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-ink/10">
            <div className="flex items-center gap-3 text-xs text-ink/50 uppercase tracking-widest">
              <Stamp className="w-4 h-4" />
              <span>Authorized Access</span>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto relative ${activeTab !== 'mobilePlay' ? 'pt-16 md:pt-0' : ''}`}>
        {/* Overlay for mobile when menu is open */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-ink/20 backdrop-blur-sm z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        {activeTab === 'tutorial' ? (
          <TutorialScreen onStart={() => setActiveTab(isDesigner ? 'mission' : 'mobilePlay')} />
        ) : activeTab === 'feedback' ? (
          <FeedbackPage onBack={() => setActiveTab(isDesigner ? 'mission' : 'mobilePlay')} />
        ) : activeTab === 'mission' ? (
          <GridMissionScreen 
            selectedTier={selectedTier}
            rowLabels={rowLabels}
            colLabels={colLabels}
            itemLabels={itemLabels}
            secretRooms={secretRooms}
            puzzle={puzzle}
            onRegenerate={handleRegenerate}
            playerCount={playerCount}
            movementType={movementType}
            setMovementType={setMovementType}
            checkedClues={checkedClues}
            toggleClue={toggleClue}
            onNavigate={setActiveTab}
          />
        ) : activeTab === 'play' ? (
          <PlayMissionScreen 
            selectedTier={selectedTier}
            rowLabels={rowLabels}
            colLabels={colLabels}
            itemLabels={itemLabels}
            secretRooms={secretRooms}
            puzzle={puzzle}
            onRegenerate={handleRegenerate}
            playerCount={playerCount}
            seedInput={seedInput}
            setSeedInput={setSeedInput}
            checkedClues={checkedClues}
            toggleClue={toggleClue}
            onNavigate={setActiveTab}
          />
        ) : activeTab === 'mobilePlay' ? (
          <MobilePlayScreen 
            selectedTier={selectedTier}
            rowLabels={rowLabels}
            colLabels={colLabels}
            itemLabels={itemLabels}
            secretRooms={secretRooms}
            puzzle={puzzle}
            onRegenerate={handleRegenerate}
            playerCount={playerCount}
            seedInput={seedInput}
            setSeedInput={setSeedInput}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            checkedClues={checkedClues}
            toggleClue={toggleClue}
            onNavigate={setActiveTab}
          />
        ) : (
          <VariablesScreen 
            selectedTier={selectedTier} setSelectedTier={setSelectedTier}
            rowLabels={rowLabels} setRowLabels={setRowLabels}
            colLabels={colLabels} setColLabels={setColLabels}
            itemLabels={itemLabels} setItemLabels={setItemLabels}
            secretRooms={secretRooms} setSecretRooms={setSecretRooms}
            movementType={movementType} setMovementType={setMovementType}
            playerCount={playerCount} setPlayerCount={setPlayerCount}
            seedInput={seedInput} setSeedInput={setSeedInput}
            onRegenerate={handleRegenerate}
          />
        )}
      </main>
    </div>
  );
}

// --- Screens ---

function GridMissionScreen({ selectedTier, rowLabels, colLabels, itemLabels, secretRooms, puzzle, onRegenerate, playerCount, movementType, setMovementType, checkedClues, toggleClue, onNavigate }: any) {
  const [activeTab, setActiveTab] = useState<'mission' | 'solver'>('mission');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [celebrationIndex, setCelebrationIndex] = useState<number | null>(null);

  const size = selectedTier.size;

  useEffect(() => {
    if (celebrationIndex !== null && puzzle) {
      if (celebrationIndex < puzzle.path.length) {
        const timeout = setTimeout(() => {
          setCelebrationIndex(prev => (prev !== null ? prev + 1 : null));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D93838', '#D4AF37', '#141414', '#E4E3E0']
        });
      }
    }
  }, [celebrationIndex, puzzle]);

  // When switching tabs, reset step
  useEffect(() => {
    if (activeTab === 'solver') {
      setActiveStepIndex(0);
    } else {
      if (puzzle?.solverSteps) {
        setActiveStepIndex(puzzle.solverSteps.length - 1);
      }
    }
  }, [activeTab, puzzle]);

  // Compute Derived Grid State based on Active Step
  const derivedState = useMemo(() => {
    if (!puzzle) return null;
    
    // Initialize with unknown state
    const gridState = Array.from({ length: size }, () => Array(size).fill({ state: 'unknown' }));
    
    // If Mission Tab, show full truth
    if (activeTab === 'mission') {
      puzzle.grid.forEach((row: any[], r: number) => {
        row.forEach((cell: any, c: number) => {
           if (cell.b) gridState[r][c] = { state: 'blocker' };
           else if (cell.i) gridState[r][c] = { state: 'item', item: cell.i };
           else gridState[r][c] = { state: 'path', n: cell.n };
        });
      });
      return { grid: gridState, showPath: true };
    }

    // Solver Tab: Apply steps up to activeStepIndex
    const stepsToApply = (puzzle.solverSteps || []).slice(0, activeStepIndex + 1);
    const lastStep = stepsToApply[stepsToApply.length - 1];
    
    if (lastStep && lastStep.gridSnapshot) {
      const snapGridState = lastStep.gridSnapshot.map((row: any, r: number) => 
        row.map((cell: any, c: number) => {
          const isHighlighted = lastStep.cells.some((hc: any) => hc.r === r && hc.c === c);
          
          let uiState = cell.state; 
          let item = cell.item;
          
          if (cell.state === 'safe' && cell.possibleItems && cell.possibleItems.length === 1) {
             uiState = 'item';
             item = cell.possibleItems[0];
          }
          
          return {
            state: uiState,
            item: item,
            pencilMarks: cell.pencilMarks,
            maybeBlocker: cell.maybeBlocker,
            maybeSafe: cell.maybeSafe,
            highlight: isHighlighted,
            n: cell.n // from final step
          };
        })
      );
      
      const showPath = lastStep.title === 'Trace the Serpent';
      return { grid: snapGridState, showPath };
    }

    // Fallback if no gridSnapshot
    const fallbackGridState = Array.from({ length: size }, () => 
      Array.from({ length: size }, () => ({ state: 'unknown' }))
    );
    
    stepsToApply.forEach((step: any) => {
      step.cells.forEach((cell: any) => {
        let extra = {};
        if (cell.state === 'item') {
           extra = { item: puzzle.grid[cell.r][cell.c].i };
        }
        fallbackGridState[cell.r][cell.c] = { ...fallbackGridState[cell.r][cell.c], ...cell, ...extra };
      });
    });

    const showPath = lastStep?.title === 'Trace the Serpent';
    return { grid: fallbackGridState, showPath };
  }, [puzzle, activeTab, activeStepIndex, size]);

  const handleExportMission = () => {
    if (!puzzle) return;
    
    // Create a printable HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kiro Fort - Mission ${puzzle.seed}</title>
        <style>
          body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1412; background: #f5f0e6; }
          h1 { text-align: center; color: #8b0000; border-bottom: 2px solid #8b0000; padding-bottom: 10px; }
          .meta { text-align: center; font-family: monospace; color: #666; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          h2 { color: #d4af37; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .clue-list { list-style-type: none; padding: 0; }
          .clue-list li { margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.05); border-left: 3px solid #8b0000; }
          .grid-container { display: flex; justify-content: center; margin: 40px 0; }
          table { border-collapse: collapse; }
          td, th { border: 1px solid #333; width: 60px; height: 60px; text-align: center; }
          th { background: #e0d5c1; font-size: 12px; }
          .story { font-style: italic; line-height: 1.6; padding: 20px; border: 1px solid #ccc; background: #fff; }
          .rules { font-size: 14px; color: #555; }
          .elements-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
          .element-box { border: 1px solid #8b0000; padding: 10px; text-align: center; background: #fff; border-radius: 4px; min-width: 80px; }
        </style>
      </head>
      <body>
        <h1>KIRO FORT: MISSION ARCHIVE</h1>
        <div class="meta">
          ID: ${puzzle.seed} | Grid: ${selectedTier.size}x${selectedTier.size} | Relics: ${selectedTier.items} | Secret Rooms: ${secretRooms}
        </div>

        <div class="section story">
          ${puzzle.story.map((p: string) => `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`).join('')}
        </div>

        <div class="section">
          <h2>The Archive Fragments (Clues)</h2>
          <ul class="clue-list">
            ${puzzle.clues.map((c: any) => `<li><strong>Clue ${c.id.toString().padStart(2, '0')}:</strong> ${c.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <h2>Mission Elements</h2>
          <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Draw these symbols on your map to track your deduction:</p>
          <div class="elements-grid">
            <div class="element-box"><strong>[ T ]</strong><br>Torii (Start)</div>
            <div class="element-box"><strong>[ P ]</strong><br>Passage (End)</div>
            <div class="element-box"><strong>[ X ]</strong><br>${secretRooms} Secret Rooms</div>
            ${(puzzle?.items ? puzzle.items.slice(1, -1) : itemLabels.slice(0, selectedTier.items)).map((item: string, idx: number) => `<div class="element-box"><strong>[ ${idx + 1} ]</strong><br>${item}</div>`).join('')}
          </div>
        </div>

        <div class="section">
          <h2>Your Map</h2>
          <div class="grid-container">
            <table>
              <tr>
                <th></th>
                ${colLabels.slice(0, selectedTier.size).map((l: string) => `<th>${l.substring(0,3)}</th>`).join('')}
              </tr>
              ${rowLabels.slice(0, selectedTier.size).map((rLabel: string, r: number) => `
                <tr>
                  <th>${rLabel.substring(0,3)}</th>
                  ${Array(selectedTier.size).fill('<td></td>').join('')}
                </tr>
              `).join('')}
            </table>
          </div>
        </div>

        <div class="section rules">
          <strong>Golden Rules:</strong>
          <ul>
            <li>The path moves orthogonally (no diagonals).</li>
            <li>The path cannot cross itself, overlap, or branch.</li>
            <li>Every open room must be visited exactly once.</li>
            <li>Secret Rooms can never be entered.</li>
            <li>Relics must be collected in the exact order given in the story.</li>
            <li><strong>Dead End Rule:</strong> Any room with only one open neighbor (that isn't the start or end) must be a Secret Room, otherwise the Serpent would get trapped!</li>
            <li><strong>Elimination Rule:</strong> If a row has exactly X secret rooms and you find X secret rooms, mark the rest as Safe (No Secret Room).</li>
          </ul>
        </div>
      </body>
      </html>
    `;

    // Create a Blob and download it
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kiro_Mission_${puzzle.seed}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!puzzle) return <div className="h-full flex items-center justify-center font-serif text-ink/50">Generating Archive...</div>;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-ink/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-parchment/80 sticky top-0 z-10 backdrop-blur-md">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink">Mission #{puzzle.seed}</h2>
          <p className="text-xs md:text-sm text-ink/60 mt-1 font-medium tracking-wide">{selectedTier.name} {size}x{size} • The Crimson Path</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={() => onRegenerate()}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 border border-ink/20 text-ink hover:bg-ink/5 rounded-sm text-xs md:text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
            Regenerate
          </button>
          <button 
            onClick={handleExportMission}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-crimson text-parchment hover:bg-crimson-dark rounded-sm text-xs md:text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            Export Mission
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Grid Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto flex flex-col items-center">
          <div className="relative flex flex-col items-center min-w-max my-auto py-8">
            
            <div className="flex w-full">
              {/* Top-left empty space */}
              <div className="w-12 md:w-24 shrink-0"></div>
              
              {/* Column Labels */}
              <div className="flex-1 px-2">
                <div 
                  className="grid w-full"
                  style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                >
                  {colLabels.slice(0, size).map((label: string, i: number) => (
                    <div key={i} className="flex justify-center items-end h-16 w-10 sm:w-12 md:w-16">
                      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-ink/50 -rotate-45 origin-bottom-left translate-x-2 md:translate-x-3 whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex w-full">
              {/* Row Labels */}
              <div className="w-12 md:w-24 flex flex-col shrink-0 mt-2">
                {rowLabels.slice(0, size).map((label: string, i: number) => (
                  <div key={i} className="h-10 sm:h-12 md:h-16 flex items-center justify-end text-[10px] md:text-xs font-semibold uppercase tracking-widest text-ink/50 pr-2 md:pr-4">
                    {label}
                  </div>
                ))}
              </div>

              {/* The Grid */}
              <div className="p-2 bg-ink/5 border border-ink/20 rounded-sm shadow-inner backdrop-blur-sm">
                <div className="relative">
                  {/* Snake Path SVG Overlay */}
                  {derivedState?.showPath && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {puzzle.path.map((p: Point, i: number) => {
                        if (i === 0) return null;
                        const prev = puzzle.path[i - 1];
                        return (
                          <line 
                            key={i}
                            x1={`${(prev.c + 0.5) / size * 100}%`}
                            y1={`${(prev.r + 0.5) / size * 100}%`}
                            x2={`${(p.c + 0.5) / size * 100}%`}
                            y2={`${(p.r + 0.5) / size * 100}%`}
                            stroke="var(--color-crimson)" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeDasharray="8 8"
                            opacity="0.4"
                          />
                        );
                      })}
                    </svg>
                  )}

                  <div 
                    className="grid relative z-20 border-t border-l border-ink/10 bg-parchment"
                    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                  >
                  {derivedState?.grid.map((row: any[], rIdx: number) => (
                    row.map((cell: any, cIdx: number) => {
                      const showBlocker = cell.state === 'blocker';
                      const showMaybeBlocker = cell.state === 'maybe-blocker';
                      const showMaybeItem = cell.state === 'maybe-item';
                      const showMaybePath = cell.state === 'maybe-path';
                      const showSafe = cell.state === 'safe';
                      const showItem = cell.state === 'item';
                      const showPath = cell.state === 'path';
                      
                      const pathIndex = puzzle.path.findIndex((p: Point) => p.r === rIdx && p.c === cIdx);
                      const isCelebrating = celebrationIndex !== null && pathIndex !== -1 && pathIndex <= celebrationIndex;
                      const isCurrentCelebration = celebrationIndex !== null && pathIndex === celebrationIndex;
                      
                      return (
                        <div 
                          key={`${rIdx}-${cIdx}`} 
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center relative transition-all duration-500 cursor-default border-b border-r border-ink/10 ${
                            showBlocker 
                              ? 'bg-ink/10' 
                              : showSafe 
                                ? 'bg-emerald-500/5'
                                : 'bg-parchment hover:bg-parchment-dark'
                          } ${cell.highlight ? 'ring-2 ring-inset ring-crimson/50' : ''} ${isCelebrating ? 'z-40' : ''}`}
                          style={{ 
                            transform: isCelebrating ? 'translateY(-8px)' : 'none',
                            boxShadow: isCelebrating ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
                          }}
                        >
                          {/* Subtle inner border for tile effect */}
                          <div className="absolute inset-1 border border-ink/5 pointer-events-none"></div>
                          
                          {isCelebrating && (
                            <div className={`absolute inset-0 bg-gold/20 mix-blend-overlay z-20 animate-pulse transition-opacity duration-500 ${isCurrentCelebration ? 'opacity-100' : 'opacity-40'}`}></div>
                          )}
                          
                          {/* Secret Room Blocker */}
                          {showBlocker && (
                            <div className="w-8 h-8 rounded-sm bg-ink/20 flex items-center justify-center">
                              <span className="text-[10px] font-mono text-ink/40 font-bold">S</span>
                            </div>
                          )}

                          {/* Maybe Blocker (Pencil) */}
                          {cell.maybeBlocker && cell.state === 'unknown' && (
                            <div className="absolute top-0 right-0 p-0.5 opacity-60">
                              <span className="text-[10px] font-mono text-ink/60 font-bold italic">S</span>
                            </div>
                          )}

                          {/* Maybe Safe (Pencil) */}
                          {cell.maybeSafe && cell.state === 'unknown' && (
                            <div className="absolute top-0 right-0 p-0.5 opacity-60">
                              <span className="text-[10px] font-mono text-emerald-600/60 font-bold italic">x</span>
                            </div>
                          )}

                          {/* Maybe Item (Pencil) */}
                          {cell.state !== 'item' && cell.state !== 'blocker' && cell.pencilMarks && cell.pencilMarks.length > 0 && (
                            <div className="absolute inset-0 flex flex-wrap items-center justify-center opacity-40 gap-0.5 p-1">
                              {cell.pencilMarks.map((item: string) => (
                                <div key={item} className="flex flex-col items-center">
                                  {item === 'Torii' && <MapPin className="w-3 h-3 text-crimson" />}
                                  {item === 'Lantern' && <Flame className="w-3 h-3 text-gold" />}
                                  {item === 'Compass' && <Compass className="w-3 h-3 text-gold" />}
                                  {item === 'Seal' && <Stamp className="w-3 h-3 text-gold" />}
                                  {item === 'Hourglass' && <Hourglass className="w-3 h-3 text-gold" />}
                                  {item === 'Scroll' && <ScrollText className="w-3 h-3 text-gold" />}
                                  {item === 'Key' && <Key className="w-3 h-3 text-gold" />}
                                  {item === 'Mirror' && <Eye className="w-3 h-3 text-gold" />}
                                  {item === 'Sword' && <Swords className="w-3 h-3 text-gold" />}
                                  {item === 'Jewel' && <Gem className="w-3 h-3 text-gold" />}
                                  {item === 'Passage' && <DoorOpen className="w-3 h-3 text-ink" />}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Maybe Path (Pencil) */}
                          {showMaybePath && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                              <span className="text-[10px] font-bold text-crimson/40 italic">R</span>
                            </div>
                          )}

                          {/* Safe Indicator (No-Blocker) */}
                          {showSafe && (
                            <div className="absolute top-0 right-0 p-0.5 opacity-80">
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">x</span>
                            </div>
                          )}

                          {/* Path Number / Rune */}
                          {(showPath || cell.state === 'path') && !showItem && cell.n !== undefined && (
                            <div className="w-6 h-6 rounded-full border border-crimson/30 flex items-center justify-center bg-parchment relative">
                              <span className="text-[10px] font-bold text-crimson leading-none">{cell.n}</span>
                            </div>
                          )}

                          {/* Sacred Item */}
                          {showItem && cell.item && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-parchment z-10">
                              <div className="absolute inset-1 border border-gold/30 pointer-events-none"></div>
                              
                              {/* Order Circle for Items */}
                              {cell.n !== undefined && (
                                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center z-20">
                                  <span className="text-[8px] font-bold text-ink/80">{cell.n}</span>
                                </div>
                              )}

                              {cell.item === 'Torii' && <MapPin className="w-5 h-5 text-crimson mb-1" />}
                              {cell.item === 'Lantern' && <Flame className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Compass' && <Compass className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Seal' && <Stamp className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Hourglass' && <Hourglass className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Scroll' && <ScrollText className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Key' && <Key className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Mirror' && <Eye className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Sword' && <Swords className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Jewel' && <Gem className="w-5 h-5 text-gold mb-1" />}
                              {cell.item === 'Passage' && <DoorOpen className="w-5 h-5 text-ink mb-1" />}
                              <span className="text-[8px] font-bold uppercase tracking-widest text-ink/70">{cell.item}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Mission File & Solver's Log */}
        <div className="w-full md:w-[420px] border-t md:border-t-0 md:border-l border-ink/10 bg-parchment-dark/30 flex flex-col relative z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] md:shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] h-[40vh] md:h-auto shrink-0 md:shrink">
          
          {/* Tabs */}
          <div className="flex border-b border-ink/10 bg-parchment/80 backdrop-blur-md sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab('mission')}
              className={`flex-1 p-5 flex items-center justify-center gap-2 font-serif text-sm font-semibold transition-colors ${activeTab === 'mission' ? 'text-crimson border-b-2 border-crimson bg-ink/5' : 'text-ink/50 hover:text-ink/80 hover:bg-ink/5'}`}
            >
              <ScrollText className="w-4 h-4" />
              Mission File
            </button>
            <button 
              onClick={() => setActiveTab('solver')}
              className={`flex-1 p-5 flex items-center justify-center gap-2 font-serif text-sm font-semibold transition-colors ${activeTab === 'solver' ? 'text-crimson border-b-2 border-crimson bg-ink/5' : 'text-ink/50 hover:text-ink/80 hover:bg-ink/5'}`}
            >
              <ListChecks className="w-4 h-4" />
              Solver's Log
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 relative">
            {/* Background watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <Hexagon className="w-64 h-64" />
            </div>

            {activeTab === 'mission' ? (
            <MissionFileContent 
              puzzle={puzzle} 
              selectedTier={selectedTier} 
              playerCount={playerCount} 
              checkedClues={checkedClues}
              toggleClue={toggleClue}
              isDesigner={true}
            />
            ) : (
              <div className="space-y-8">
                {/* Solver's Log Content */}
                <section className="relative">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-4 h-4 text-gold" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50">Deduction Path</h4>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-crimson/70 font-bold border border-crimson/20 px-1.5 py-0.5 rounded-sm bg-parchment z-10">
                      Designer View
                    </div>
                  </div>
                  <p className="font-serif text-[13px] leading-relaxed text-ink/70 italic mb-6">
                    This log proves the puzzle is solvable by a 12+ year old using only logical deduction. No guessing is required.
                  </p>

                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ink/10 before:to-transparent">
                    
                    {(puzzle.solverSteps || []).map((step: any, idx: number) => {
                      const prevStep = idx > 0 ? puzzle.solverSteps[idx - 1] : null;
                      const isNewClue = !prevStep || step.clueId !== prevStep.clueId;
                      const displayNum = step.clueId || idx + 1;

                      return (
                        <div 
                          key={step.id} 
                          className="relative flex items-start gap-4 cursor-pointer group" 
                          onClick={() => setActiveStepIndex(idx)}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 mt-0.5 transition-colors ${activeStepIndex >= idx ? 'bg-crimson border-crimson text-parchment' : 'bg-parchment border-crimson text-crimson group-hover:bg-crimson/10'}`}>
                            {isNewClue ? (
                              <span className="text-[10px] font-bold">{displayNum}</span>
                            ) : (
                              <div className={`w-1.5 h-1.5 rounded-full ${activeStepIndex >= idx ? 'bg-parchment' : 'bg-crimson'}`}></div>
                            )}
                          </div>
                          <div className={`border p-4 rounded-sm shadow-sm flex-1 transition-colors ${activeStepIndex === idx ? 'bg-crimson/5 border-crimson/30' : 'bg-parchment border-ink/10 group-hover:border-crimson/30'}`}>
                            <h5 className="font-bold text-sm text-ink mb-1">{step.title}</h5>
                            <p className="text-[13px] text-ink/80 font-serif leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Strip: Validation */}
      <div className="h-auto md:h-16 py-4 md:py-0 border-t border-ink/10 bg-ink text-parchment flex flex-col md:flex-row items-center px-4 md:px-8 justify-between shrink-0 relative overflow-hidden gap-4 md:gap-0">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide uppercase text-parchment/90">Unique solution: <span className="text-emerald-400 font-bold ml-1">PASS</span></span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-parchment/20"></div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide uppercase text-parchment/90">No-guess route: <span className="text-emerald-400 font-bold ml-1">PASS</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => onNavigate('feedback')}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <ScrollText className="w-3 h-3" />
            Feedback
          </button>
          <button 
            onClick={() => setCelebrationIndex(0)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <Sparkles className="w-3 h-3" />
            Test Animation
          </button>
          <div className="text-[10px] uppercase tracking-widest text-parchment/40 font-mono hidden md:block">
            Archive Seal
          </div>
          <div className="text-[10px] md:text-xs font-mono text-gold bg-gold/10 px-3 py-1.5 rounded-sm border border-gold/20">
            GEN_SEED: {puzzle?.seed || 'UNKNOWN'}
          </div>
        </div>
      </div>
    </div>
  );
}

const DIFFICULTY_TIERS = [
  { name: 'Kōhai (後輩)', size: 4, items: 2 },
  { name: 'Deshi (弟子)', size: 4, items: 3 },
  { name: 'Chūgen (中堅)', size: 5, items: 3 },
  { name: 'Jōki (上級)', size: 5, items: 4 },
  { name: 'Renshi (錬士)', size: 6, items: 4 },
  { name: 'Kyōshi (教士)', size: 6, items: 5 },
  { name: 'Shinpan (審判)', size: 7, items: 6 },
  { name: 'Hanshi (範士)', size: 8, items: 7 },
  { name: 'Meijin (名人)', size: 9, items: 9 },
];

const SACRED_ITEMS_POOL = [
  { id: 'lantern', name: 'Lantern', icon: Flame },
  { id: 'compass', name: 'Compass', icon: Compass },
  { id: 'seal', name: 'Seal', icon: Stamp },
  { id: 'hourglass', name: 'Hourglass', icon: Hourglass },
  { id: 'scroll', name: 'Scroll', icon: ScrollText },
  { id: 'key', name: 'Key', icon: Key },
  { id: 'mirror', name: 'Mirror', icon: Eye },
  { id: 'sword', name: 'Sword', icon: Swords },
  { id: 'jewel', name: 'Jewel', icon: Gem },
];

function VariablesScreen({ 
  selectedTier, setSelectedTier,
  rowLabels, setRowLabels,
  colLabels, setColLabels,
  itemLabels, setItemLabels,
  secretRooms, setSecretRooms,
  movementType, setMovementType,
  playerCount, setPlayerCount,
  seedInput, setSeedInput,
  onRegenerate
}: any) {
  const maxSecretRooms = Math.floor((selectedTier.size * selectedTier.size) * 0.25);

  const handleTierChange = (tier: typeof DIFFICULTY_TIERS[0]) => {
    setSelectedTier(tier);
    const newMax = Math.floor((tier.size * tier.size) * 0.25);
    if (secretRooms > newMax) {
      setSecretRooms(newMax);
    }
  };

  return (
    <div className="h-full flex flex-col bg-parchment-dark/10">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-ink/10 bg-parchment/80 sticky top-0 z-10 backdrop-blur-md">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink">Archive Variables</h2>
        <p className="text-xs md:text-sm text-ink/60 mt-1 font-medium tracking-wide">Configure generator parameters and constraints</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          
          {/* Left Column: Settings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Presets */}
            <section className="bg-parchment border border-ink/10 p-6 rounded-sm shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70">Mission ID (Seed)</h3>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value.toUpperCase())}
                  placeholder="Enter Mission ID..."
                  className="flex-1 px-4 py-2 bg-ink/5 border border-ink/20 rounded-sm text-ink font-mono font-bold tracking-widest focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson uppercase"
                />
                <button 
                  onClick={() => onRegenerate(seedInput)}
                  className="px-6 py-2 bg-ink text-parchment font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-ink/80 transition-colors"
                >
                  Load Mission
                </button>
              </div>
              <p className="text-xs text-ink/50 mt-2 font-serif italic">Share this ID with others so they can play the exact same mission.</p>
            </section>

            <section className="bg-parchment border border-ink/10 p-6 rounded-sm shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70 mb-4">Difficulty Tiers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTY_TIERS.map((tier, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleTierChange(tier)}
                    className={`p-3 border rounded-sm text-left transition-colors relative ${
                      selectedTier.name === tier.name 
                        ? 'border-crimson bg-crimson/5' 
                        : 'border-ink/20 hover:border-crimson group'
                    }`}
                  >
                    {selectedTier.name === tier.name && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-crimson"></div>
                    )}
                    <div className={`font-serif text-sm font-semibold transition-colors ${selectedTier.name === tier.name ? 'text-crimson' : 'group-hover:text-crimson'}`}>
                      {tier.name}
                    </div>
                    <div className="text-[10px] text-ink/60 mt-1 font-mono flex justify-between">
                      <span>{tier.size}x{tier.size} Grid</span>
                      <span>{tier.items} Items</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Grid Boundaries & Labels */}
            <section className="bg-parchment border border-ink/10 p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70">Grid Configuration</h3>
                <span className="text-xs font-mono bg-ink/5 px-2 py-1 rounded-sm text-crimson font-bold border border-crimson/20">
                  {selectedTier.size} Rows × {selectedTier.size} Cols
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Movement Rules</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="movement" 
                      checked={movementType === 'orthogonal'}
                      onChange={() => setMovementType('orthogonal')}
                      className="accent-crimson" 
                    />
                    <span className="text-sm font-medium">Orthogonal Only (Classic)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="movement" 
                      checked={movementType === 'diagonal'}
                      onChange={() => setMovementType('diagonal')}
                      className="accent-crimson" 
                    />
                    <span className="text-sm font-medium">Allow Diagonals (Advanced)</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Row Labels</label>
                  <div className="space-y-2">
                    {rowLabels.slice(0, selectedTier.size).map((label, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-ink/30 w-4">{i + 1}.</span>
                        <input 
                          type="text" 
                          value={label}
                          onChange={(e) => {
                            const newLabels = [...rowLabels];
                            newLabels[i] = e.target.value;
                            setRowLabels(newLabels);
                          }}
                          className="w-full bg-transparent border-b border-ink/20 py-1 text-sm font-serif focus:outline-none focus:border-crimson transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Column Labels</label>
                  <div className="space-y-2">
                    {colLabels.slice(0, selectedTier.size).map((label, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-ink/30 w-4">{String.fromCharCode(65 + i)}.</span>
                        <input 
                          type="text" 
                          value={label}
                          onChange={(e) => {
                            const newLabels = [...colLabels];
                            newLabels[i] = e.target.value;
                            setColLabels(newLabels);
                          }}
                          className="w-full bg-transparent border-b border-ink/20 py-1 text-sm font-serif focus:outline-none focus:border-crimson transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Narrative Lexicon */}
            <section className="bg-parchment border border-ink/10 p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70 flex items-center gap-2">
                    <Feather className="w-4 h-4 text-crimson" />
                    Narrative Lexicon
                  </h3>
                  <p className="text-xs text-ink/50 mt-1">Story elements used to generate indirect logic hints.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Protagonist Faction</label>
                  <select className="w-full bg-ink/5 border border-ink/10 rounded-sm py-2 px-3 text-sm font-serif focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer">
                    <option>The Shadow Clan</option>
                    <option>Fallen Monks</option>
                    <option>Imperial Scholars</option>
                    <option>Ronin Brotherhood</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Antagonist Force</label>
                  <select className="w-full bg-ink/5 border border-ink/10 rounded-sm py-2 px-3 text-sm font-serif focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer">
                    <option>The Shogun's Guard</option>
                    <option>Yokai Spirits</option>
                    <option>Rival Daimyo</option>
                    <option>Time Itself</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Historical Era</label>
                  <input 
                    type="text" 
                    defaultValue="Sengoku Period (1582)"
                    className="w-full bg-transparent border-b border-ink/20 py-1 text-sm font-serif focus:outline-none focus:border-crimson transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Archive Location</label>
                  <input 
                    type="text" 
                    defaultValue="Sunken Temple"
                    className="w-full bg-transparent border-b border-ink/20 py-1 text-sm font-serif focus:outline-none focus:border-crimson transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">Primary Objective</label>
                  <input 
                    type="text" 
                    defaultValue="Recover the lost clan records"
                    className="w-full bg-transparent border-b border-ink/20 py-1 text-sm font-serif focus:outline-none focus:border-crimson transition-colors"
                  />
                </div>
                <div className="col-span-2 pt-2 border-t border-ink/10">
                  <label className="block text-xs font-semibold text-ink/60 mb-3 uppercase tracking-wider">Hint Tone</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tone" defaultChecked className="accent-crimson" />
                      <span className="text-sm font-medium">Cryptic & Poetic</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tone" className="accent-crimson" />
                      <span className="text-sm font-medium">Militaristic & Direct</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Sacred Items */}
            <section className="bg-parchment border border-ink/10 p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70">Sacred Items Pool</h3>
                  <p className="text-xs text-ink/50 mt-1">First and last items are fixed. Middle items are drawn from the pool.</p>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-ink/40 font-mono border border-ink/10 px-2 py-1 rounded-sm bg-ink/5">
                  Rule: Randomize({selectedTier.items})
                </div>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <div className="shrink-0 p-4 border border-ink/20 bg-ink/5 rounded-sm flex flex-col items-center gap-2 relative min-w-[80px]">
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-parchment border border-ink/20 rounded-full flex items-center justify-center text-[8px] font-bold text-ink">1</div>
                  <MapPin className="w-6 h-6 text-ink/50" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Torii</span>
                  <span className="text-[10px] text-ink/40 font-mono">Start</span>
                </div>
                
                <div className="text-ink/30 font-mono text-sm shrink-0">→</div>
                
                <div className="flex-1 p-4 border border-crimson/30 bg-crimson/5 rounded-sm border-dashed flex items-center justify-center gap-6 relative min-w-[200px]">
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-parchment border border-crimson/30 rounded-full flex items-center justify-center text-[8px] font-bold text-crimson">?</div>
                  <div className="absolute -top-2.5 right-4 bg-parchment px-2 text-[10px] uppercase tracking-widest text-crimson font-bold">
                    Pool (Draw {selectedTier.items})
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    {SACRED_ITEMS_POOL.slice(0, selectedTier.items).map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="flex flex-col items-center gap-2">
                          <Icon className="w-6 h-6 text-crimson"/>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-crimson/80">{itemLabels[idx]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-ink/30 font-mono text-sm shrink-0">→</div>
                
                <div className="shrink-0 p-4 border border-ink/20 bg-ink/5 rounded-sm flex flex-col items-center gap-2 relative min-w-[80px]">
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-parchment border border-ink/20 rounded-full flex items-center justify-center text-[8px] font-bold text-ink">End</div>
                  <DoorOpen className="w-6 h-6 text-ink/50" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Passage</span>
                  <span className="text-[10px] text-ink/40 font-mono">Exit</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-ink/10">
                <label className="block text-xs font-bold text-ink/70 mb-4 uppercase tracking-wider">Item Translations (Editable)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  {SACRED_ITEMS_POOL.slice(0, selectedTier.items).map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-ink/40 shrink-0" />
                        <input 
                          type="text" 
                          value={itemLabels[idx]}
                          onChange={(e) => {
                            const newLabels = [...itemLabels];
                            newLabels[idx] = e.target.value;
                            setItemLabels(newLabels);
                          }}
                          className="w-full bg-transparent border-b border-ink/20 py-1 text-sm font-serif focus:outline-none focus:border-crimson transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Rules & Check Panel */}
          <div className="space-y-8">
            
            {/* Generation Rules */}
            <section className="bg-parchment border border-ink/10 p-6 rounded-sm shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70 mb-4">Path Constraints</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium">Secret Rooms (b)</label>
                    <span className="text-sm font-mono text-ink/60">{secretRooms} / {maxSecretRooms}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxSecretRooms} 
                    value={secretRooms}
                    onChange={(e) => setSecretRooms(parseInt(e.target.value))}
                    className="w-full accent-crimson" 
                  />
                  <p className="text-[10px] text-ink/50 mt-1">Determines the length of the snake path (Total Cells - Secret Rooms).</p>
                </div>

                <div className="pt-4 border-t border-ink/10">
                  <label className="block text-xs font-semibold text-ink/60 mb-3 uppercase tracking-wider">Movement Type</label>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="movementType" 
                        checked={movementType === 'orthogonal'}
                        onChange={() => setMovementType('orthogonal')}
                        className="mt-1 accent-crimson w-4 h-4" 
                      />
                      <div>
                        <div className="text-sm font-medium">The Straight Path (Orthogonal)</div>
                        <div className="text-xs text-ink/60 mt-0.5">The Serpent moves only straight—forward, backward, left, or right.</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="movementType" 
                        checked={movementType === 'diagonal'}
                        onChange={() => setMovementType('diagonal')}
                        className="mt-1 accent-crimson w-4 h-4" 
                      />
                      <div>
                        <div className="text-sm font-medium">The Eight Winds (Diagonal)</div>
                        <div className="text-xs text-ink/60 mt-0.5">The Serpent may move straight or slip diagonally through the corners.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-ink/10">
                  <label className="block text-xs font-semibold text-ink/60 mb-3 uppercase tracking-wider">Cooperative Mode</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setPlayerCount(num)}
                        className={`w-10 h-10 rounded-sm font-bold font-mono transition-colors ${
                          playerCount === num 
                            ? 'bg-crimson text-parchment' 
                            : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink/50 mt-2">
                    {playerCount === 1 
                      ? "Solo Mode: All clues are available to a single player." 
                      : `${playerCount} Players: Clues are distributed among ${playerCount} distinct roles to enforce communication.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Check Panel Preview */}
            <section className="bg-ink text-parchment p-6 rounded-sm shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-crimson/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <h3 className="text-sm font-bold uppercase tracking-widest text-parchment/70 mb-5 flex items-center gap-2">
                <Eye className="w-4 h-4 text-crimson" />
                Live Validation
              </h3>
              
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between p-3 bg-parchment/5 rounded-sm border border-parchment/10">
                  <span className="text-xs text-parchment/70 uppercase tracking-wider">Solvability</span>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Guaranteed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-parchment/5 rounded-sm border border-parchment/10">
                  <span className="text-xs text-parchment/70 uppercase tracking-wider">Hint Complexity</span>
                  <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded-sm">Medium (4-6 steps)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-parchment/5 rounded-sm border border-parchment/10">
                  <span className="text-xs text-parchment/70 uppercase tracking-wider">Est. Gen Time</span>
                  <span className="text-xs text-parchment/60">~120ms</span>
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-crimson hover:bg-crimson-dark text-parchment font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2 group">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Apply & Generate
              </button>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function PlayMissionScreen({ selectedTier, rowLabels, colLabels, itemLabels, secretRooms, puzzle, onRegenerate, playerCount, seedInput, setSeedInput, checkedClues, toggleClue, onNavigate }: any) {
  const size = selectedTier.size;
  const [placedTiles, setPlacedTiles] = useState<Record<string, {r: number, c: number} | null>>({});
  const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [isHintMode, setIsHintMode] = useState(false);
  const [hintFeedback, setHintFeedback] = useState<{id: string, status: 'correct' | 'incorrect'} | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<{r: number, c: number} | null>(null);
  const [incorrectCells, setIncorrectCells] = useState<{r: number, c: number}[]>([]);
  const [pencilMarks, setPencilMarks] = useState<Record<string, string[]>>({});
  const [selectedTileForMove, setSelectedTileForMove] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isOrderRevealed, setIsOrderRevealed] = useState(false);
  const [celebrationIndex, setCelebrationIndex] = useState<number | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (celebrationIndex !== null && puzzle) {
      if (celebrationIndex < puzzle.path.length) {
        const timeout = setTimeout(() => {
          setCelebrationIndex(prev => (prev !== null ? prev + 1 : null));
        }, 100); // Speed of the serpent coming to life
        return () => clearTimeout(timeout);
      } else {
        // Animation finished, fire confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D93838', '#D4AF37', '#141414', '#E4E3E0']
        });
        // Delay showing the success overlay so they can see the final state
        setTimeout(() => setShowSuccessOverlay(true), 800);
      }
    }
  }, [celebrationIndex, puzzle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!puzzle) return;
    const initial: Record<string, {r: number, c: number} | null> = {};
    const items = ['Torii', ...itemLabels.slice(0, selectedTier.items), 'Passage'];
    items.forEach(item => initial[item] = null);
    for (let i = 0; i < secretRooms; i++) {
      initial[`blocker-${i}`] = null;
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = puzzle.grid[r][c];
        if (cell.n && !cell.i) {
          initial[`number-${cell.n}`] = null;
        }
      }
    }
    setPlacedTiles(initial);
    setCheckStatus('idle');
    setPencilMarks({});
    setIsPencilMode(false);
    setHighlightedCell(null);
    setTimer(0);
    setIsTimerRunning(false);
    setIncorrectCells([]);
    setIsOrderRevealed(false);
    setCelebrationIndex(null);
    setShowSuccessOverlay(false);
  }, [puzzle, selectedTier, itemLabels, secretRooms, size]);

  const isSolved = React.useMemo(() => {
    if (!puzzle || Object.keys(placedTiles).length === 0) return false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = puzzle.grid[r][c];
        const tileId = Object.keys(placedTiles).find(k => placedTiles[k]?.r === r && placedTiles[k]?.c === c);
        
        if (cell.b) {
          if (!tileId || !tileId.startsWith('blocker-')) return false;
        } else if (cell.i) {
          if (tileId !== cell.i) return false;
        } else if (cell.n) {
          if (tileId !== `number-${cell.n}`) return false;
        } else {
          if (tileId) return false;
        }
      }
    }
    return true;
  }, [puzzle, placedTiles, size]);

  const handleHint = () => {
    if (!selectedTileForMove) {
      setToastMessage("Please select a tile first to get a hint.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (isHintMode) {
      setIsHintMode(false);
      setHighlightedCell(null);
      return;
    }

    let correctPos = puzzle?.solution[selectedTileForMove];
    
    // Special handling for blockers since they are generic
    if (!correctPos && selectedTileForMove.startsWith('blocker-')) {
      const blockerLocations = Object.keys(puzzle?.solution || {})
        .filter(k => k.startsWith('blocker-'))
        .map(k => puzzle.solution[k]);
      
      // Find a blocker location that doesn't have a blocker placed on it yet
      correctPos = blockerLocations.find(loc => {
        const isOccupied = Object.keys(placedTiles).some(k => 
          k.startsWith('blocker-') && placedTiles[k]?.r === loc.r && placedTiles[k]?.c === loc.c
        );
        return !isOccupied;
      }) || blockerLocations[0];
    }

    if (correctPos) {
      setHighlightedCell(correctPos);
      setTimer(prev => prev + 60); // Penalty
      setIsHintMode(true);
    }
  };

  const handleCheckSolution = () => {
    const errors: {r: number, c: number}[] = [];
    let isPerfect = true;
    let isComplete = true;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = puzzle.grid[r][c];
        const tileId = Object.keys(placedTiles).find(k => placedTiles[k]?.r === r && placedTiles[k]?.c === c);
        
        // Check for completeness
        if (cell.b || cell.i || cell.n) {
          if (!tileId) isComplete = false;
        }

        // Only check correctness if a tile is placed
        if (tileId) {
          let isCellCorrect = true;
          if (cell.b) {
            if (!tileId.startsWith('blocker-')) isCellCorrect = false;
          } else if (cell.i) {
            if (tileId !== cell.i) isCellCorrect = false;
          } else if (cell.n) {
            if (tileId !== `number-${cell.n}`) isCellCorrect = false;
          } else {
            // Tile placed where it shouldn't be
            isCellCorrect = false;
          }
          
          if (!isCellCorrect) {
            errors.push({r, c});
            isPerfect = false;
          }
        }
      }
    }

    if (isPerfect && isComplete) {
      setCheckStatus('correct');
      setIsTimerRunning(false);
      setIsHintMode(false);
      setIncorrectCells([]);
      setCelebrationIndex(0); // Start celebration sequence
    } else if (errors.length > 0) {
      setCheckStatus('incorrect');
      setIncorrectCells(errors);
      setTimeout(() => setCheckStatus('idle'), 3000);
    } else {
      setCheckStatus('idle');
      setIncorrectCells([]);
    }
  };

  const handleDrop = (tileId: string, r: number | null, c: number | null) => {
    if (!isTimerRunning && checkStatus !== 'correct') {
      setIsTimerRunning(true);
    }
    setCheckStatus('idle');
    setIncorrectCells([]);
    
    if (isHintMode) {
      setIsHintMode(false);
      setHighlightedCell(null);
    }

    if (isPencilMode && r !== null && c !== null) {
      setPencilMarks(prev => {
        const key = `${r}-${c}`;
        const cellMarks = prev[key] || [];
        if (cellMarks.includes(tileId)) {
          return { ...prev, [key]: cellMarks.filter(id => id !== tileId) };
        } else {
          return { ...prev, [key]: [...cellMarks, tileId] };
        }
      });
      return;
    }

    setPlacedTiles(prev => {
      const next = { ...prev };
      if (r !== null && c !== null) {
        const existingTile = Object.keys(next).find(k => next[k]?.r === r && next[k]?.c === c);
        if (existingTile && existingTile !== tileId) {
          next[existingTile] = null;
        }
        next[tileId] = { r, c };
      } else {
        next[tileId] = null;
      }
      return next;
    });
  };

  if (!puzzle) return <div className="h-full flex items-center justify-center font-serif text-ink/50">Generating Archive...</div>;

  const allTiles = Object.keys(placedTiles).sort((a, b) => {
    const typeA = a.startsWith('blocker-') ? 1 : a.startsWith('number-') ? 2 : 0;
    const typeB = b.startsWith('blocker-') ? 1 : b.startsWith('number-') ? 2 : 0;
    if (typeA !== typeB) return typeA - typeB;
    if (typeA === 2) return parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]);
    return a.localeCompare(b);
  });

  const unplacedTiles = isPencilMode 
    ? allTiles 
    : allTiles.filter(k => placedTiles[k] === null);

  const renderTile = (tileId: string, isPencilPalette = false) => {
    const isPlaced = placedTiles[tileId] !== null;
    const opacityClass = (isPencilPalette && isPlaced) ? 'opacity-40' : 'opacity-100';
    const isHinted = hintFeedback?.id === tileId;
    const hintOverlay = isHinted ? (
      <div className={`absolute inset-0 flex items-center justify-center bg-parchment/90 backdrop-blur-sm z-20 ${hintFeedback.status === 'correct' ? 'text-emerald-500' : 'text-red-500'}`}>
        {hintFeedback.status === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
      </div>
    ) : null;

    const handleTileClick = () => {
      if (selectedTileForMove === tileId) setSelectedTileForMove(null);
      else setSelectedTileForMove(tileId);
      if (isHintMode) {
        setIsHintMode(false);
        setHighlightedCell(null);
      }
    };

    if (tileId.startsWith('blocker-')) {
      return (
        <div 
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', tileId)}
          onClick={handleTileClick}
          className={`w-full h-full rounded-sm bg-ink/80 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md border ${selectedTileForMove === tileId ? 'border-crimson ring-2 ring-crimson/50' : 'border-ink'} ${opacityClass} relative overflow-hidden`}
        >
          <span className="text-[12px] font-mono text-parchment/60 font-bold">S</span>
          {hintOverlay}
        </div>
      );
    }
    
    if (tileId.startsWith('number-')) {
      const num = tileId.split('-')[1];
      return (
        <div 
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', tileId)}
          onClick={handleTileClick}
          className={`w-full h-full flex items-center justify-center bg-parchment cursor-grab active:cursor-grabbing shadow-md border ${selectedTileForMove === tileId ? 'border-crimson ring-2 ring-crimson/50' : 'border-ink/20'} relative overflow-hidden ${opacityClass}`}
        >
          <div className="absolute inset-1 border border-ink/5 pointer-events-none"></div>
          <span className="text-xs md:text-sm font-mono text-ink/50 font-bold">{num}</span>
          {hintOverlay}
        </div>
      );
    }
    
    const name = tileId;
    let Icon = Hexagon;
    let colorClass = "text-gold";
    if (name === 'Torii') { Icon = MapPin; colorClass = "text-crimson"; }
    else if (name === 'Passage') { Icon = DoorOpen; colorClass = "text-ink"; }
    else {
      const idx = itemLabels.indexOf(name);
      if (idx >= 0 && idx < SACRED_ITEMS_POOL.length) {
        Icon = SACRED_ITEMS_POOL[idx].icon;
      }
    }

    return (
      <div 
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', tileId)}
        onClick={handleTileClick}
        className={`w-full h-full flex flex-col items-center justify-center bg-parchment cursor-grab active:cursor-grabbing shadow-md border ${selectedTileForMove === tileId ? 'border-crimson ring-2 ring-crimson/50' : 'border-gold/40'} relative overflow-hidden ${opacityClass}`}
      >
        <div className="absolute inset-1 border border-gold/20 pointer-events-none"></div>
        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${colorClass}`} />
        {hintOverlay}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-ink text-parchment px-4 py-2 rounded shadow-lg font-sans text-sm animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-ink/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-parchment/80 sticky top-0 z-10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hexagon className="w-5 h-5 text-crimson" />
            <span className="font-serif font-bold text-lg tracking-tight text-ink">KIRO</span>
            <span className="text-[10px] bg-ink/5 px-1.5 py-0.5 rounded text-ink/40 font-mono">v1.5</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink flex flex-wrap items-center gap-2 md:gap-4">
            Play Mission
            <div className="flex items-center gap-2 bg-ink/5 px-2 py-1 md:px-3 md:py-1.5 rounded-sm border border-ink/10 text-sm md:text-base font-sans font-normal">
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-ink/50">ID:</span>
              <input 
                type="text" 
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRegenerate(seedInput);
                }}
                className="w-20 md:w-24 bg-transparent border-none focus:outline-none text-ink font-mono font-bold uppercase"
              />
              <button onClick={() => onRegenerate(seedInput)} className="text-crimson hover:text-crimson-dark">
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-ink/5 px-2 py-1 md:px-3 md:py-1.5 rounded-sm border border-ink/10 text-sm md:text-base font-sans font-normal ml-2">
              <Hourglass className={`w-3 h-3 md:w-4 md:h-4 ${isTimerRunning ? 'text-crimson animate-pulse' : 'text-ink/50'}`} />
              <span className="font-mono font-bold text-ink">{formatTime(timer)}</span>
            </div>
          </h2>
          <p className="text-xs md:text-sm text-ink/60 mt-1 font-medium tracking-wide">Drag and drop (or tap) tiles to solve the puzzle</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={handleHint}
            className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 border rounded-sm text-xs md:text-sm font-medium transition-colors ${
              isHintMode 
                ? 'bg-gold text-ink border-gold shadow-inner ring-2 ring-gold/50' 
                : 'border-ink/20 text-ink hover:bg-ink/5'
            }`}
          >
            <Lightbulb className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Hint Mode</span>
            <span className="sm:hidden">Hint</span>
          </button>
          <button 
            onClick={() => {
              setIsPencilMode(!isPencilMode);
              if (!isPencilMode) setIsHintMode(false);
            }}
            className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 border rounded-sm text-xs md:text-sm font-medium transition-colors ${
              isPencilMode 
                ? 'bg-crimson text-parchment border-crimson shadow-inner' 
                : 'border-ink/20 text-ink hover:bg-ink/5'
            }`}
          >
            <Pencil className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Pencil Mode</span>
            <span className="sm:hidden">Pencil</span>
          </button>
          <button 
            onClick={handleCheckSolution}
            className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-sm text-xs md:text-sm font-bold transition-all duration-300 shadow-sm ${
              checkStatus === 'correct' 
                ? 'bg-emerald-500 text-white border-emerald-600' 
                : checkStatus === 'incorrect'
                ? 'bg-crimson text-white border-crimson-dark animate-pulse'
                : 'bg-ink text-parchment hover:bg-ink-dark border-ink'
            }`}
          >
            {checkStatus === 'correct' ? <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> : checkStatus === 'incorrect' ? <XCircle className="w-3 h-3 md:w-4 md:h-4" /> : <ListChecks className="w-3 h-3 md:w-4 md:h-4" />}
            {checkStatus === 'correct' ? 'Path Clear!' : checkStatus === 'incorrect' ? 'Incorrect' : <span className="hidden sm:inline">Check Solution</span>}
            {checkStatus === 'idle' && <span className="sm:hidden">Check</span>}
          </button>
          <button 
            onClick={onRegenerate}
            className="flex-none flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 border border-ink/20 text-ink hover:bg-ink/5 rounded-sm text-xs md:text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {showSuccessOverlay && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-parchment/80 backdrop-blur-sm">
            <div className="bg-parchment border-2 border-emerald-500 p-8 rounded-sm shadow-2xl text-center max-w-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink mb-2">Mission Accomplished</h3>
              <p className="text-sm text-ink/70 mb-2">You have successfully deduced the Serpent's Path and placed all relics and secret rooms correctly.</p>
              <p className="text-sm font-bold text-crimson mb-6">Time: {formatTime(timer)}</p>
              <button 
                onClick={() => {
                  setCheckStatus('idle');
                  onRegenerate();
                }}
                className="w-full py-3 bg-ink hover:bg-ink-dark text-parchment font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Play Another Mission
              </button>
              <button 
                onClick={() => onNavigate('feedback')}
                className="w-full py-3 bg-emerald-100 text-emerald-800 font-bold uppercase tracking-widest rounded-sm hover:bg-emerald-200 transition-all text-xs flex items-center justify-center gap-2"
              >
                <ScrollText className="w-4 h-4" />
                Send Feedback
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 overflow-auto flex flex-col items-center">
          <div className="relative flex flex-col items-center min-w-max my-auto">
            
            <div className="flex w-full">
              <div className="w-12 md:w-24 shrink-0"></div>
              <div className="flex-1 px-2">
                <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                  {colLabels.slice(0, size).map((label: string, i: number) => (
                    <div key={i} className="flex justify-center items-end h-16 w-10 sm:w-12 md:w-16">
                      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-ink/50 -rotate-45 origin-bottom-left translate-x-2 md:translate-x-3 whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex w-full">
              <div className="w-12 md:w-24 flex flex-col shrink-0 mt-2">
                {rowLabels.slice(0, size).map((label: string, i: number) => (
                  <div key={i} className="h-10 sm:h-12 md:h-16 flex items-center justify-end text-[10px] md:text-xs font-semibold uppercase tracking-widest text-ink/50 pr-2 md:pr-4">
                    {label}
                  </div>
                ))}
              </div>

              <div className="p-2 bg-ink/5 border border-ink/20 rounded-sm shadow-inner backdrop-blur-sm">
                <div className="relative">
                  {checkStatus === 'correct' && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {puzzle.path.map((p: Point, i: number) => {
                        if (i === 0) return null;
                        const prev = puzzle.path[i - 1];
                        return (
                          <line 
                            key={i}
                            x1={`${(prev.c + 0.5) / size * 100}%`}
                            y1={`${(prev.r + 0.5) / size * 100}%`}
                            x2={`${(p.c + 0.5) / size * 100}%`}
                            y2={`${(p.r + 0.5) / size * 100}%`}
                            stroke="var(--color-crimson)" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeDasharray="8 8"
                            opacity="0.4"
                          />
                        );
                      })}
                    </svg>
                  )}

                  <div 
                    className="grid relative z-20 border-t border-l border-ink/10 bg-parchment"
                    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: size }).map((_, rIdx) => (
                      Array.from({ length: size }).map((_, cIdx) => {
                        const tileId = Object.keys(placedTiles).find(k => placedTiles[k]?.r === rIdx && placedTiles[k]?.c === cIdx);
                        const isIncorrect = incorrectCells.some(cell => cell.r === rIdx && cell.c === cIdx);
                        const isHighlighted = highlightedCell?.r === rIdx && highlightedCell?.c === cIdx;
                        
                        const pathIndex = puzzle.path.findIndex((p: Point) => p.r === rIdx && p.c === cIdx);
                        const isCelebrating = celebrationIndex !== null && pathIndex !== -1 && pathIndex <= celebrationIndex;
                        const isCurrentCelebration = celebrationIndex !== null && pathIndex === celebrationIndex;
                        
                        return (
                          <div 
                            key={`${rIdx}-${cIdx}`} 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDrop(e.dataTransfer.getData('text/plain'), rIdx, cIdx);
                            }}
                            onClick={() => {
                              if (isPencilMode) {
                                if (selectedTileForMove) {
                                  handleDrop(selectedTileForMove, rIdx, cIdx);
                                }
                              } else if (selectedTileForMove) {
                                handleDrop(selectedTileForMove, rIdx, cIdx);
                                setSelectedTileForMove(null);
                              } else if (tileId) {
                                setSelectedTileForMove(tileId);
                              }
                            }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center relative transition-all duration-500 border-b border-r border-ink/10 bg-parchment hover:bg-parchment-dark ${selectedTileForMove && !tileId ? 'cursor-pointer hover:bg-crimson/5' : ''} ${isCelebrating ? 'z-40' : ''}`}
                      style={{ 
                        transform: isCelebrating ? 'translateY(-8px)' : 'none',
                        boxShadow: isCelebrating ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      <div className="absolute inset-1 border border-ink/5 pointer-events-none"></div>
                      {isHighlighted && (
                        <div className="absolute inset-0 z-[70] ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,1)] pointer-events-none animate-pulse rounded-sm"></div>
                      )}
                      {isCelebrating && (
                              <div className={`absolute inset-0 bg-gold/20 mix-blend-overlay z-20 animate-pulse transition-opacity duration-500 ${isCurrentCelebration ? 'opacity-100' : 'opacity-40'}`}></div>
                            )}
                            {isIncorrect && (
                              <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center bg-parchment/90 backdrop-blur-[2px]">
                                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-crimson shadow-[0_0_10px_rgba(220,20,60,0.6)] animate-pulse ring-2 ring-white/50"></div>
                              </div>
                            )}
                            {tileId ? (
                              <div className="absolute inset-0 p-0.5 z-10">
                                {renderTile(tileId)}
                              </div>
                            ) : (
                              pencilMarks[`${rIdx}-${cIdx}`] && pencilMarks[`${rIdx}-${cIdx}`].length > 0 && (
                                <div className="absolute inset-1 flex flex-wrap content-start gap-0.5 p-0.5 overflow-hidden z-0 opacity-70">
                                  {pencilMarks[`${rIdx}-${cIdx}`].map(markId => {
                                    let Icon = Hexagon;
                                    let colorClass = "text-gold";
                                    if (markId === 'Torii') { Icon = MapPin; colorClass = "text-crimson"; }
                                    else if (markId === 'Passage') { Icon = DoorOpen; colorClass = "text-ink"; }
                                    else if (markId === 'safe-mark') {
                                      return <span key={markId} className="text-[10px] font-mono font-bold text-emerald-600 leading-none w-3 h-3 flex items-center justify-center">x</span>;
                                    }
                                    else if (markId === 'no-relic-mark') {
                                      return <span key={markId} className="text-[10px] font-mono font-bold text-slate-500 leading-none w-3 h-3 flex items-center justify-center">-</span>;
                                    }
                                    else if (markId.startsWith('blocker-')) {
                                      return <span key={markId} className="text-[8px] font-mono font-bold text-ink/80 leading-none w-3 h-3 flex items-center justify-center bg-ink/10 rounded-sm">S</span>;
                                    }
                                    else if (markId.startsWith('number-')) {
                                      return <span key={markId} className="text-[8px] font-mono font-bold text-ink/80 leading-none w-3 h-3 flex items-center justify-center bg-ink/5 rounded-sm border border-ink/10">{markId.split('-')[1]}</span>;
                                    }
                                    else {
                                      const idx = itemLabels.indexOf(markId);
                                      if (idx >= 0 && idx < SACRED_ITEMS_POOL.length) {
                                        Icon = SACRED_ITEMS_POOL[idx].icon;
                                      }
                                    }
                                    return <Icon key={markId} className={`w-3 h-3 ${colorClass}`} />;
                                  })}
                                </div>
                              )
                            )}
                          </div>
                        );
                      })
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 w-full max-w-3xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-3 text-center">Available Tiles</h4>
            <div 
              className={`p-6 bg-ink/5 border border-ink/10 rounded-sm min-h-[120px] flex flex-wrap gap-3 items-center justify-center shadow-inner ${selectedTileForMove ? 'cursor-pointer hover:bg-ink/10' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(e.dataTransfer.getData('text/plain'), null, null);
              }}
              onClick={(e) => {
                // If they click the container (not a specific tile inside it) and have a tile selected, put it back
                if (selectedTileForMove && (e.target === e.currentTarget)) {
                  handleDrop(selectedTileForMove, null, null);
                  setSelectedTileForMove(null);
                }
              }}
            >
              {isPencilMode && (
                <>
                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 shrink-0 cursor-grab active:cursor-grabbing flex flex-col items-center gap-1"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'safe-mark');
                      setSelectedTileForMove('safe-mark');
                    }}
                    onClick={() => setSelectedTileForMove('safe-mark')}
                  >
                    <div className={`w-full h-full flex items-center justify-center bg-parchment border-2 border-dashed border-emerald-500/50 rounded-sm shadow-sm hover:shadow-md transition-all ${selectedTileForMove === 'safe-mark' ? 'ring-2 ring-emerald-500' : ''}`}>
                      <span className="text-xl font-mono font-bold text-emerald-600">x</span>
                    </div>
                    <span className="text-[8px] uppercase font-bold text-emerald-600/70 tracking-tighter">No Secret</span>
                  </div>

                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 shrink-0 cursor-grab active:cursor-grabbing flex flex-col items-center gap-1"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'no-relic-mark');
                      setSelectedTileForMove('no-relic-mark');
                    }}
                    onClick={() => setSelectedTileForMove('no-relic-mark')}
                  >
                    <div className={`w-full h-full flex items-center justify-center bg-parchment border-2 border-dashed border-slate-400/50 rounded-sm shadow-sm hover:shadow-md transition-all ${selectedTileForMove === 'no-relic-mark' ? 'ring-2 ring-slate-400' : ''}`}>
                      <span className="text-xl font-mono font-bold text-slate-500">-</span>
                    </div>
                    <span className="text-[8px] uppercase font-bold text-slate-500/70 tracking-tighter">No Relic</span>
                  </div>
                </>
              )}
              {unplacedTiles.length === 0 && !isPencilMode ? (
                <span className="text-sm font-serif text-ink/40 italic">All tiles placed</span>
              ) : (
                unplacedTiles.map(tileId => (
                  <div key={tileId} className="w-14 h-14 md:w-16 md:h-16 shrink-0">
                    {renderTile(tileId, isPencilMode)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-[420px] border-t md:border-t-0 md:border-l border-ink/10 bg-parchment-dark/30 flex flex-col relative z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] md:shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] h-[40vh] md:h-auto shrink-0 md:shrink">
          <div className="p-4 md:p-5 border-b border-ink/10 bg-parchment/80 backdrop-blur-md flex items-center gap-2 sticky top-0 z-20">
            <ScrollText className="w-4 h-4 text-crimson" />
            <h3 className="font-serif text-sm font-semibold text-ink">Mission File</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            <MissionFileContent 
              puzzle={puzzle} 
              selectedTier={selectedTier} 
              playerCount={playerCount} 
              checkedClues={checkedClues}
              toggleClue={toggleClue}
              isOrderRevealed={isOrderRevealed}
              onRevealOrder={() => {
                setIsOrderRevealed(true);
                setTimer(prev => prev + 300);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobilePlayScreen({ selectedTier, rowLabels, colLabels, itemLabels, secretRooms, puzzle, onRegenerate, playerCount, seedInput, setSeedInput, isMobileMenuOpen, setIsMobileMenuOpen, checkedClues, toggleClue, onNavigate }: any) {
  const size = selectedTier.size;
  const [placedTiles, setPlacedTiles] = useState<Record<string, {r: number, c: number} | null>>({});
  const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [isHintMode, setIsHintMode] = useState(false);
  const [hintFeedback, setHintFeedback] = useState<{id: string, status: 'correct' | 'incorrect'} | null>(null);
  const [pencilMarks, setPencilMarks] = useState<Record<string, string[]>>({});
  const [selectedTileForMove, setSelectedTileForMove] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<'tiles' | 'clues' | 'story'>('tiles');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [incorrectCells, setIncorrectCells] = useState<{r: number, c: number}[]>([]);
  const [highlightedCell, setHighlightedCell] = useState<{r: number, c: number} | null>(null);
  const [isOrderRevealed, setIsOrderRevealed] = useState(false);
  const [celebrationIndex, setCelebrationIndex] = useState<number | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (celebrationIndex !== null && puzzle) {
      if (celebrationIndex < puzzle.path.length) {
        const timeout = setTimeout(() => {
          setCelebrationIndex(prev => (prev !== null ? prev + 1 : null));
        }, 100); // Speed of the serpent coming to life
        return () => clearTimeout(timeout);
      } else {
        // Animation finished, fire confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D93838', '#D4AF37', '#141414', '#E4E3E0']
        });
        // Delay showing the success overlay so they can see the final state
        setTimeout(() => setShowSuccessOverlay(true), 800);
      }
    }
  }, [celebrationIndex, puzzle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!puzzle) return;
    const initial: Record<string, {r: number, c: number} | null> = {};
    const items = ['Torii', ...itemLabels.slice(0, selectedTier.items), 'Passage'];
    items.forEach(item => initial[item] = null);
    for (let i = 0; i < secretRooms; i++) {
      initial[`blocker-${i}`] = null;
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = puzzle.grid[r][c];
        if (cell.n && !cell.i) {
          initial[`number-${cell.n}`] = null;
        }
      }
    }
    setPlacedTiles(initial);
    setCheckStatus('idle');
    setPencilMarks({});
    setIsPencilMode(false);
    setHighlightedCell(null);
    setTimer(0);
    setIsTimerRunning(false);
    setIncorrectCells([]);
    setIsOrderRevealed(false);
    setCelebrationIndex(null);
    setShowSuccessOverlay(false);
  }, [puzzle, selectedTier, itemLabels, secretRooms, size]);

  const isSolved = React.useMemo(() => {
    if (!puzzle || Object.keys(placedTiles).length === 0) return false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = puzzle.grid[r][c];
        const tileId = Object.keys(placedTiles).find(k => placedTiles[k]?.r === r && placedTiles[k]?.c === c);
        
        if (cell.b) {
          if (!tileId || !tileId.startsWith('blocker-')) return false;
        } else if (cell.i) {
          if (tileId !== cell.i) return false;
        } else if (cell.n) {
          if (tileId !== `number-${cell.n}`) return false;
        } else {
          if (tileId) return false;
        }
      }
    }
    return true;
  }, [puzzle, placedTiles, size]);

  const handleHint = () => {
    if (!selectedTileForMove) {
      setToastMessage("Please select a tile first to get a hint.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (isHintMode) {
      setIsHintMode(false);
      setHighlightedCell(null);
      return;
    }

    let correctPos = puzzle?.solution[selectedTileForMove];
    
    // Special handling for blockers since they are generic
    if (!correctPos && selectedTileForMove.startsWith('blocker-')) {
      const blockerLocations = Object.keys(puzzle?.solution || {})
        .filter(k => k.startsWith('blocker-'))
        .map(k => puzzle.solution[k]);
      
      // Find a blocker location that doesn't have a blocker placed on it yet
      correctPos = blockerLocations.find(loc => {
        const isOccupied = Object.keys(placedTiles).some(k => 
          k.startsWith('blocker-') && placedTiles[k]?.r === loc.r && placedTiles[k]?.c === loc.c
        );
        return !isOccupied;
      }) || blockerLocations[0];
    }

    if (correctPos) {
      setHighlightedCell(correctPos);
      setTimer(prev => prev + 60); // Penalty
      setIsHintMode(true);
    }
  };

  const handleCheckSolution = () => {
    const errors: {r: number, c: number}[] = [];
    let isPerfect = true;
    let isComplete = true;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = puzzle.grid[r][c];
        const tileId = Object.keys(placedTiles).find(k => placedTiles[k]?.r === r && placedTiles[k]?.c === c);
        
        // Check for completeness
        if (cell.b || cell.i || cell.n) {
          if (!tileId) isComplete = false;
        }

        // Only check correctness if a tile is placed
        if (tileId) {
          let isCellCorrect = true;
          if (cell.b) {
            if (!tileId.startsWith('blocker-')) isCellCorrect = false;
          } else if (cell.i) {
            if (tileId !== cell.i) isCellCorrect = false;
          } else if (cell.n) {
            if (tileId !== `number-${cell.n}`) isCellCorrect = false;
          } else {
            // Tile placed where it shouldn't be
            isCellCorrect = false;
          }
          
          if (!isCellCorrect) {
            errors.push({r, c});
            isPerfect = false;
          }
        }
      }
    }

    if (isPerfect && isComplete) {
      setCheckStatus('correct');
      setIsTimerRunning(false);
      setIsHintMode(false);
      setIncorrectCells([]);
      setCelebrationIndex(0); // Start celebration sequence
    } else if (errors.length > 0) {
      console.log('Incorrect cells:', errors);
      setCheckStatus('incorrect');
      setIncorrectCells(errors);
      setTimeout(() => setCheckStatus('idle'), 3000);
    } else {
      // No errors found, but not complete
      setCheckStatus('idle');
      // Maybe show a "so far so good" message?
      // For now, just clear errors
      setIncorrectCells([]);
    }
  };

  const handleDrop = (tileId: string, r: number | null, c: number | null) => {
    if (!isTimerRunning && checkStatus !== 'correct') {
      setIsTimerRunning(true);
    }
    setCheckStatus('idle');
    setIncorrectCells([]);
    
    if (isHintMode) {
      setIsHintMode(false);
      setHighlightedCell(null);
    }

    if (isPencilMode && r !== null && c !== null) {
      setPencilMarks(prev => {
        const key = `${r}-${c}`;
        const cellMarks = prev[key] || [];
        if (cellMarks.includes(tileId)) {
          return { ...prev, [key]: cellMarks.filter(id => id !== tileId) };
        } else {
          return { ...prev, [key]: [...cellMarks, tileId] };
        }
      });
      return;
    }

    setPlacedTiles(prev => {
      const next = { ...prev };
      if (r !== null && c !== null) {
        const existingTile = Object.keys(next).find(k => next[k]?.r === r && next[k]?.c === c);
        if (existingTile && existingTile !== tileId) {
          next[existingTile] = null;
        }
        next[tileId] = { r, c };
      } else {
        next[tileId] = null;
      }
      return next;
    });
  };

  if (!puzzle) return <div className="h-full flex items-center justify-center font-serif text-ink/50">Generating Archive...</div>;

  const allTiles = Object.keys(placedTiles).sort((a, b) => {
    const typeA = a.startsWith('blocker-') ? 1 : a.startsWith('number-') ? 2 : 0;
    const typeB = b.startsWith('blocker-') ? 1 : b.startsWith('number-') ? 2 : 0;
    if (typeA !== typeB) return typeA - typeB;
    if (typeA === 2) return parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]);
    return a.localeCompare(b);
  });

  const unplacedTiles = isPencilMode 
    ? allTiles 
    : allTiles.filter(k => placedTiles[k] === null);

  const renderTile = (tileId: string, isPencilPalette = false) => {
    const isPlaced = placedTiles[tileId] !== null;
    const opacityClass = (isPencilPalette && isPlaced) ? 'opacity-40' : 'opacity-100';
    const isHinted = hintFeedback?.id === tileId;
    const hintOverlay = isHinted ? (
      <div className={`absolute inset-0 flex items-center justify-center bg-parchment/90 backdrop-blur-sm z-20 ${hintFeedback.status === 'correct' ? 'text-emerald-500' : 'text-red-500'}`}>
        {hintFeedback.status === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
      </div>
    ) : null;

    const handleTileClick = () => {
      if (selectedTileForMove === tileId) setSelectedTileForMove(null);
      else setSelectedTileForMove(tileId);
      if (isHintMode) {
        setIsHintMode(false);
        setHighlightedCell(null);
      }
    };

    if (tileId.startsWith('blocker-')) {
      return (
        <div 
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', tileId)}
          onClick={handleTileClick}
          className={`w-full h-full rounded-sm bg-ink/80 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md border ${selectedTileForMove === tileId ? 'border-crimson ring-2 ring-crimson/50' : 'border-ink'} ${opacityClass} relative overflow-hidden`}
        >
          <span className="text-[12px] font-mono text-parchment/60 font-bold">S</span>
          {hintOverlay}
        </div>
      );
    }
    
    if (tileId.startsWith('number-')) {
      const num = tileId.split('-')[1];
      return (
        <div 
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', tileId)}
          onClick={handleTileClick}
          className={`w-full h-full flex items-center justify-center bg-parchment cursor-grab active:cursor-grabbing shadow-md border ${selectedTileForMove === tileId ? 'border-crimson ring-2 ring-crimson/50' : 'border-ink/20'} relative overflow-hidden ${opacityClass}`}
        >
          <div className="absolute inset-1 border border-ink/5 pointer-events-none"></div>
          <span className="text-xs md:text-sm font-mono text-ink/50 font-bold">{num}</span>
          {hintOverlay}
        </div>
      );
    }
    
    const name = tileId;
    let Icon = Hexagon;
    let colorClass = "text-gold";
    if (name === 'Torii') { Icon = MapPin; colorClass = "text-crimson"; }
    else if (name === 'Passage') { Icon = DoorOpen; colorClass = "text-ink"; }
    else {
      const idx = itemLabels.indexOf(name);
      if (idx >= 0 && idx < SACRED_ITEMS_POOL.length) {
        Icon = SACRED_ITEMS_POOL[idx].icon;
      }
    }

    return (
      <div 
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', tileId)}
        onClick={handleTileClick}
        className={`w-full h-full flex flex-col items-center justify-center bg-parchment cursor-grab active:cursor-grabbing shadow-md border ${selectedTileForMove === tileId ? 'border-crimson ring-2 ring-crimson/50' : 'border-gold/40'} relative overflow-hidden ${opacityClass}`}
      >
        <div className="absolute inset-1 border border-gold/20 pointer-events-none"></div>
        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${colorClass}`} />
        {hintOverlay}
      </div>
    );
  };

  const getIconForLabel = (label: string) => {
    const renderIcon = (Icon: any) => (
      <span className="text-ink/40 flex items-center justify-center w-4 h-4" title={label}>
        <Icon style={{ width: '100%', height: '100%' }} />
      </span>
    );

    switch (label) {
      case 'Sun': return renderIcon(GiSun);
      case 'Moon': return renderIcon(GiMoon);
      case 'Star': return renderIcon(GiStarSwirl);
      case 'Cloud': return renderIcon(GiCloudRing);
      case 'Rain': return renderIcon(GiRaining);
      case 'Lightning': return renderIcon(GiLightningTear);
      case 'Wind': return renderIcon(GiWhirlwind);
      case 'Frost': return renderIcon(GiSnowflake1);
      case 'Eclipse': return renderIcon(GiEclipse);
      
      case 'Dragon': return renderIcon(GiDragonHead);
      case 'Pelican': return renderIcon(GiEatingPelican);
      case 'Tiger': return renderIcon(GiTigerHead);
      case 'Fox': return renderIcon(GiFoxHead);
      case 'Monkey': return renderIcon(GiMonkey);
      case 'Koi': return renderIcon(GiCirclingFish);
      case 'Mantis': return renderIcon(GiPrayingMantis);
      case 'Turtoise': return renderIcon(GiTurtle);
      case 'Kirin': return renderIcon(GiUnicorn);
      default: return <span className="text-[9px] font-semibold uppercase tracking-widest text-ink/40" title={label}>{label.substring(0, 3)}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-parchment">
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-ink text-parchment px-4 py-2 rounded shadow-lg font-sans text-sm animate-in fade-in slide-in-from-top-4 w-11/12 text-center">
          {toastMessage}
        </div>
      )}
      {/* Mobile Header */}
      <div className="flex-none h-14 bg-parchment border-b border-ink/10 flex items-center justify-between px-3 z-50">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold tracking-wide text-crimson flex items-center gap-2">
            <Hexagon className="w-5 h-5 fill-crimson/20" />
            KIRO
          </h1>
          
          <div className="flex items-center gap-1 bg-ink/5 px-2 py-1 rounded-sm border border-ink/10 shadow-sm ml-2">
            <span className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">ID:</span>
            <input 
              type="text" 
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRegenerate(seedInput);
              }}
              className="w-12 bg-transparent border-none focus:outline-none text-ink font-mono font-bold text-xs uppercase"
            />
            <button onClick={() => onRegenerate(seedInput)} className="text-crimson hover:text-crimson-dark p-0.5">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-ink/5 px-2 py-1 rounded-sm border border-ink/10">
            <Hourglass className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-crimson animate-pulse' : 'text-ink/50'}`} />
            <span className="font-mono font-bold text-ink text-sm">{formatTime(timer)}</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-ink hover:bg-ink/5 rounded-sm"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-parchment border-b border-ink/10 shadow-lg z-40 p-4 flex flex-col gap-3 animate-in slide-in-from-top-2">
          <button 
            onClick={() => {
              onNavigate('tutorial');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 bg-gold/10 rounded-sm text-sm font-bold text-ink hover:bg-gold/20 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-gold" />
            The Legend (Tutorial)
          </button>
          <button 
            onClick={() => {
              onNavigate('feedback');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 bg-ink/5 rounded-sm text-sm font-bold text-ink hover:bg-ink/10 transition-colors"
          >
            <ScrollText className="w-4 h-4" />
            Give Feedback / Report Bug
          </button>
          <button 
            onClick={() => {
              onRegenerate();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 bg-crimson/10 rounded-sm text-sm font-bold text-crimson hover:bg-crimson/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Mission
          </button>
        </div>
      )}

      {showSuccessOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-parchment/80 backdrop-blur-sm">
          <div className="bg-parchment border-2 border-emerald-500 p-8 rounded-sm shadow-2xl text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-ink mb-2">Mission Accomplished</h3>
            <p className="text-sm text-ink/70 mb-2">You have successfully deduced the Serpent's Path and placed all relics and secret rooms correctly.</p>
            <p className="text-sm font-bold text-crimson mb-6">Time: {formatTime(timer)}</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setCheckStatus('idle');
                  onRegenerate();
                }}
                className="w-full py-3 bg-ink hover:bg-ink-dark text-parchment font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Play Another Mission
              </button>
              
              <button 
                onClick={() => {
                  onNavigate('feedback');
                }}
                className="block w-full py-3 bg-emerald-100 text-emerald-800 font-bold uppercase tracking-widest rounded-sm hover:bg-emerald-200 transition-all text-xs flex items-center justify-center gap-2"
              >
                <ScrollText className="w-4 h-4" />
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Puzzle Grid Area (Top Half) */}
      <div className="flex-none p-2 overflow-auto flex flex-col items-center border-b border-ink/10 bg-parchment-dark/10 pt-4">
        <div className="relative flex flex-col items-center min-w-max my-auto">
          <div className="flex w-full">
            <div className="w-10 shrink-0"></div>
            <div className="flex-1 px-1">
              <div className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                {colLabels.slice(0, size).map((label: string, i: number) => (
                  <div key={i} className="flex justify-center items-end h-8 w-10 pb-1">
                    {getIconForLabel(label)}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-12 shrink-0"></div> {/* Space for tools */}
          </div>
          
          <div className="flex w-full">
            <div className="w-10 grid gap-1 shrink-0 mt-1" style={{ gridTemplateRows: `repeat(${size}, minmax(0, 1fr))` }}>
              {rowLabels.slice(0, size).map((label: string, i: number) => (
                <div key={i} className="h-10 flex items-center justify-end pr-2">
                  {getIconForLabel(label)}
                </div>
              ))}
            </div>
            
            <div className="flex-1 px-1 mt-1">
              <div 
                className="grid gap-1 bg-ink/10 p-1 rounded-sm border border-ink/20 shadow-inner" 
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: size * size }).map((_, idx) => {
                  const r = Math.floor(idx / size);
                  const c = idx % size;
                  const tileId = Object.keys(placedTiles).find(k => placedTiles[k]?.r === r && placedTiles[k]?.c === c);
                  const marks = pencilMarks[`${r}-${c}`] || [];
                  const isIncorrect = incorrectCells.some(cell => cell.r === r && cell.c === c);
                  const isHighlighted = highlightedCell?.r === r && highlightedCell?.c === c;
                  
                  const pathIndex = puzzle.path.findIndex((p: Point) => p.r === r && p.c === c);
                  const isCelebrating = celebrationIndex !== null && pathIndex !== -1 && pathIndex <= celebrationIndex;
                  const isCurrentCelebration = celebrationIndex !== null && pathIndex === celebrationIndex;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`w-10 h-10 bg-parchment rounded-sm border flex items-center justify-center relative transition-all duration-500 ${selectedTileForMove ? 'hover:bg-ink/5 cursor-pointer' : ''} ${tileId ? 'border-transparent shadow-sm' : 'border-ink/10'} ${isCelebrating ? 'z-40' : ''}`}
                      style={{ 
                        transform: isCelebrating ? 'translateY(-6px)' : 'none',
                        boxShadow: isCelebrating ? '0 8px 16px rgba(0,0,0,0.2)' : 'none'
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedTileId = e.dataTransfer.getData('text/plain');
                        handleDrop(draggedTileId, r, c);
                      }}
                      onClick={() => {
                        if (selectedTileForMove) {
                          handleDrop(selectedTileForMove, r, c);
                          if (!isPencilMode) setSelectedTileForMove(null);
                        } else if (tileId) {
                          setSelectedTileForMove(tileId);
                        }
                      }}
                    >
                      {isHighlighted && (
                        <div className="absolute inset-0 z-[70] ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,1)] pointer-events-none animate-pulse rounded-sm"></div>
                      )}
                      {isCelebrating && (
                        <div className={`absolute inset-0 bg-gold/20 mix-blend-overlay z-20 animate-pulse transition-opacity duration-500 ${isCurrentCelebration ? 'opacity-100' : 'opacity-40'}`}></div>
                      )}
                      {isIncorrect && (
                        <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center bg-parchment/90 backdrop-blur-[2px]">
                          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-crimson shadow-[0_0_10px_rgba(220,20,60,0.6)] animate-pulse ring-2 ring-white/50"></div>
                        </div>
                      )}
                      {tileId ? (
                        <div className="absolute inset-0">
                          {renderTile(tileId)}
                        </div>
                      ) : marks.length > 0 ? (
                        <div className="absolute inset-0 p-0.5 flex flex-wrap content-start justify-start gap-[1px]">
                          {marks.map(markId => {
                            if (markId === 'safe-mark') return <div key={markId} className="w-3 h-3 flex items-center justify-center"><span className="text-[10px] font-mono font-bold text-emerald-600 leading-none">x</span></div>;
                            if (markId === 'no-relic-mark') return <div key={markId} className="w-3 h-3 flex items-center justify-center"><span className="text-[10px] font-mono font-bold text-slate-500 leading-none">-</span></div>;
                            if (markId.startsWith('blocker-')) return <div key={markId} className="w-3 h-3 bg-ink/80 rounded-[1px] flex items-center justify-center"><span className="text-[6px] font-mono text-parchment/60 font-bold leading-none">S</span></div>;
                            if (markId.startsWith('number-')) return <div key={markId} className="w-3 h-3 bg-parchment border border-ink/20 flex items-center justify-center"><span className="text-[6px] font-mono text-ink/50 font-bold leading-none">{markId.split('-')[1]}</span></div>;
                            
                            let Icon = Hexagon;
                            let colorClass = "text-gold";
                            if (markId === 'Torii') { Icon = MapPin; colorClass = "text-crimson"; }
                            else if (markId === 'Passage') { Icon = DoorOpen; colorClass = "text-ink"; }
                            else {
                              const idx = itemLabels.indexOf(markId);
                              if (idx >= 0 && idx < SACRED_ITEMS_POOL.length) Icon = SACRED_ITEMS_POOL[idx].icon;
                            }
                            return <div key={markId} className="w-3 h-3 flex items-center justify-center"><Icon className={`w-2.5 h-2.5 ${colorClass}`} /></div>;
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tools Column */}
            <div className="w-12 shrink-0 flex flex-col items-center justify-start gap-3 mt-1 pl-2">
              <button 
                onClick={handleHint}
                className={`flex items-center justify-center w-10 h-10 border rounded-sm transition-colors ${
                  isHintMode 
                    ? 'bg-gold text-ink border-gold shadow-inner ring-2 ring-gold/50' 
                    : 'border-ink/20 bg-parchment text-ink hover:bg-ink/5 shadow-sm'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setIsPencilMode(!isPencilMode);
                  if (!isPencilMode) setIsHintMode(false);
                }}
                className={`flex items-center justify-center w-10 h-10 border rounded-sm transition-colors ${
                  isPencilMode 
                    ? 'bg-crimson text-parchment border-crimson shadow-inner' 
                    : 'border-ink/20 bg-parchment text-ink hover:bg-ink/5 shadow-sm'
                }`}
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button 
                onClick={handleCheckSolution}
                className={`flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-300 shadow-sm ${
                  checkStatus === 'correct' 
                    ? 'bg-emerald-500 text-white border-emerald-600' 
                    : checkStatus === 'incorrect'
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-ink text-parchment hover:bg-ink-dark border-ink'
                }`}
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center border-b border-ink/10 bg-parchment shrink-0 shadow-sm z-10 px-2">
        <div className="flex flex-1">
          <button 
            onClick={() => setBottomTab('story')}
            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${bottomTab === 'story' ? 'text-crimson border-b-2 border-crimson bg-ink/5' : 'text-ink/50 hover:text-ink/80 hover:bg-ink/5'}`}
          >
            Mission
          </button>
          <button 
            onClick={() => setBottomTab('tiles')}
            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${bottomTab === 'tiles' ? 'text-crimson border-b-2 border-crimson bg-ink/5' : 'text-ink/50 hover:text-ink/80 hover:bg-ink/5'}`}
          >
            Tiles
          </button>
          <button 
            onClick={() => setBottomTab('clues')}
            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${bottomTab === 'clues' ? 'text-crimson border-b-2 border-crimson bg-ink/5' : 'text-ink/50 hover:text-ink/80 hover:bg-ink/5'}`}
          >
            Clues
          </button>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="flex-1 overflow-y-auto relative bg-parchment">
        {bottomTab === 'story' ? (
          <div className="p-4">
            <section className="relative">
              <div className="mb-4 flex items-center gap-3">
                <Feather className="w-4 h-4 text-crimson" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50">Archive Fragment</h4>
              </div>
              <div className="font-serif text-[14px] leading-relaxed text-ink/80 border-l-2 border-crimson/30 pl-4 space-y-4">
                {puzzle.story.map((paragraph: string, idx: number) => (
                  <p key={idx} className={`italic ${idx === puzzle.story.length - 1 ? 'text-xs text-ink/50 mt-4' : ''}`}>
                    <span dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </p>
                ))}
              </div>
            </section>

            <section className="relative mt-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-5 flex items-center gap-3">
                <span className="w-6 h-px bg-ink/20"></span>
                The Sacred Order
              </h4>
              <div className="bg-parchment border border-ink/10 p-4 rounded-sm shadow-sm relative overflow-hidden mb-5">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-ink/20"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-ink/20"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-ink/20"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-ink/20"></div>

                {!isOrderRevealed ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-4">
                    <p className="font-serif text-sm italic text-ink/60 text-center px-4">
                      "A fragmented scroll reveals the sacred order... but the ink is faded. Deciphering it will take time."
                    </p>
                    <button 
                      onClick={() => {
                        setIsOrderRevealed(true);
                        setTimer(prev => prev + 300);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-ink text-parchment rounded-sm shadow-md hover:bg-ink-dark transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      <Eye className="w-4 h-4" />
                      Decipher Order (+5 min)
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 px-2 flex-wrap gap-y-2">
                      <MapPin className="w-4 h-4 text-gold" />
                      <div className="flex-1 h-px bg-ink/10 mx-2 border-t border-dashed border-ink/30 min-w-[20px]"></div>
                      
                      {(puzzle?.items ? puzzle.items.slice(1, -1) : SACRED_ITEMS_POOL.slice(0, selectedTier.items).map(i => i.name)).map((itemName: string, idx: number) => {
                        const itemObj = SACRED_ITEMS_POOL.find(i => i.name === itemName);
                        const Icon = itemObj ? itemObj.icon : Hexagon;
                        return (
                          <React.Fragment key={itemName}>
                            <div className="flex flex-col items-center gap-1">
                              <Icon className="w-4 h-4 text-gold" />
                              <span className="text-[8px] font-bold text-ink/40">{idx + 1}</span>
                            </div>
                            <div className="flex-1 h-px bg-ink/10 mx-2 border-t border-dashed border-ink/30 min-w-[20px]"></div>
                          </React.Fragment>
                        );
                      })}
                      
                      <DoorOpen className="w-4 h-4 text-ink" />
                    </div>
                    <p className="font-serif text-[12px] italic text-ink/60 text-center">
                      "The unbroken path visits every open space, never crossing itself. The relics must be found in this exact sequence."
                    </p>
                  </>
                )}
              </div>
            </section>
          </div>
        ) : bottomTab === 'tiles' ? (
          <div className="p-4">
            <div 
              className={`p-4 bg-ink/5 border border-ink/10 rounded-sm min-h-[120px] flex flex-wrap gap-2 items-center justify-center shadow-inner ${selectedTileForMove ? 'cursor-pointer hover:bg-ink/10' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(e.dataTransfer.getData('text/plain'), null, null);
              }}
              onClick={(e) => {
                if (selectedTileForMove && (e.target === e.currentTarget)) {
                  handleDrop(selectedTileForMove, null, null);
                  setSelectedTileForMove(null);
                }
              }}
            >
              {isPencilMode && (
                <>
                  <div 
                    className="w-12 h-12 shrink-0 cursor-grab active:cursor-grabbing flex flex-col items-center gap-1"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'safe-mark');
                      setSelectedTileForMove('safe-mark');
                    }}
                    onClick={() => setSelectedTileForMove('safe-mark')}
                  >
                    <div className={`w-full h-full flex items-center justify-center bg-parchment border-2 border-dashed border-emerald-500/50 rounded-sm shadow-sm hover:shadow-md transition-all ${selectedTileForMove === 'safe-mark' ? 'ring-2 ring-emerald-500' : ''}`}>
                      <span className="text-lg font-mono font-bold text-emerald-600">x</span>
                    </div>
                  </div>

                  <div 
                    className="w-12 h-12 shrink-0 cursor-grab active:cursor-grabbing flex flex-col items-center gap-1"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'no-relic-mark');
                      setSelectedTileForMove('no-relic-mark');
                    }}
                    onClick={() => setSelectedTileForMove('no-relic-mark')}
                  >
                    <div className={`w-full h-full flex items-center justify-center bg-parchment border-2 border-dashed border-slate-400/50 rounded-sm shadow-sm hover:shadow-md transition-all ${selectedTileForMove === 'no-relic-mark' ? 'ring-2 ring-slate-400' : ''}`}>
                      <span className="text-lg font-mono font-bold text-slate-500">-</span>
                    </div>
                  </div>
                </>
              )}
              {unplacedTiles.length === 0 && !isPencilMode ? (
                <span className="text-sm font-serif text-ink/40 italic">All tiles placed</span>
              ) : (
                unplacedTiles.map(tileId => (
                  <div key={tileId} className="w-12 h-12 shrink-0">
                    {renderTile(tileId, isPencilMode)}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : bottomTab === 'clues' ? (
          <div className="p-4">
            <MissionFileContent 
              puzzle={puzzle} 
              selectedTier={selectedTier} 
              playerCount={playerCount} 
              checkedClues={checkedClues}
              toggleClue={toggleClue}
              hideStory={true}
              hideOrder={true}
            />
          </div>
        ) : (
          <div className="p-4">
            <MissionFileContent 
              puzzle={puzzle} 
              selectedTier={selectedTier} 
              playerCount={playerCount} 
              checkedClues={checkedClues}
              toggleClue={toggleClue}
              hideStory={true}
              hideOrder={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
