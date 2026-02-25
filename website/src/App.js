import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import OnlineUsers from './components/OnlineUsers';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import History from './pages/History';
import MultiQuiz from './pages/MultiQuiz';
import Legal from './pages/Legal';
import Footer from './components/Footer';
import DailyChallenge from './pages/DailyChallenge';
import Games from './pages/Games';
import WordScramble from './pages/games/WordScramble';
import MemoryFlip from './pages/games/MemoryFlip';
import MathChallenge from './pages/games/MathChallenge';
import Hangman from './pages/games/Hangman';
import SpeedRound from './pages/games/SpeedRound';
import SurvivalMode from './pages/games/SurvivalMode';
import FlagQuiz from './pages/games/FlagQuiz';
import TypeTheWord from './pages/games/TypeTheWord';
import TrueOrFalse from './pages/games/TrueOrFalse';
import NumberSequence from './pages/games/NumberSequence';
import TicTacToe from './pages/games/kids/TicTacToe';
import ColorMatch from './pages/games/kids/ColorMatch';
import AnimalSounds from './pages/games/kids/AnimalSounds';
import KidsMath from './pages/games/kids/KidsMath';
import BalloonPop from './pages/games/kids/BalloonPop';
import GalaxyShooter from './pages/games/kids/GalaxyShooter';
import ImagePuzzle from './pages/games/kids/ImagePuzzle';
import GamesLeaderboard from './pages/GamesLeaderboard';
import AdSystem from './components/AdSystem';
import ArcadeGamePlayer from './pages/games/ArcadeGamePlayer';
import AchievementToast from './components/AchievementToast';
import Achievements from './pages/Achievements';
import { registerSW, scheduleDailyReminder } from './services/pushNotifications';

function App() {
  // Register PWA service worker on startup
  useEffect(() => {
    registerSW();
    // Schedule daily challenge reminder at 9am
    scheduleDailyReminder();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <OnlineUsers />
        <AdSystem />
        <AchievementToast />
<div style={{
  minHeight: '100vh',
  background: 'transparent',
  color: '#ffffff',
}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:category" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/history" element={<History />} />
            <Route path="/challenge/:roomId" element={<MultiQuiz />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/daily" element={<DailyChallenge />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/word-scramble" element={<WordScramble />} />
            <Route path="/games/memory-flip" element={<MemoryFlip />} />
            <Route path="/games/math-challenge" element={<MathChallenge />} />
            <Route path="/games/hangman" element={<Hangman />} />
            <Route path="/games/speed-round" element={<SpeedRound />} />
            <Route path="/games/survival" element={<SurvivalMode />} />
            <Route path="/games/flag-quiz" element={<FlagQuiz />} />
            <Route path="/games/type-the-word" element={<TypeTheWord />} />
            <Route path="/games/true-or-false" element={<TrueOrFalse />} />
            <Route path="/games/number-sequence" element={<NumberSequence />} />
            <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/games/color-match" element={<ColorMatch />} />
            <Route path="/games/animal-sounds" element={<AnimalSounds />} />
            <Route path="/games/kids-math" element={<KidsMath />} />
            <Route path="/games/balloon-pop" element={<BalloonPop />} />
            <Route path="/games/galaxy-shooter" element={<GalaxyShooter />} />
            <Route path="/games/image-puzzle" element={<ImagePuzzle />} />
            <Route path="/games/hub" element={<GamesLeaderboard />} />
            <Route path="/games/arcade/play" element={<ArcadeGamePlayer />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;