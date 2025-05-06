import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import QuestionCard from './components/QuestionCard';
import memoryPhrases from './data/memoryPhrases.json';
import { fetchQuestion } from './lib/ai';

export default function App() {
  const [quiz, setQuiz] = useState({
    question: '',
    options: [],
    correctAnswer: '',
    imageUrl: '',
    selected: '',
    feedback: '',
    explanation: '',
    tip: '',
    score: 0,
    health: 100
  });
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pseudo, setPseudo] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [memoryGameStarted, setMemoryGameStarted] = useState(false);
  const [memoryInfo, setMemoryInfo] = useState('');
  const [memoryCards, setMemoryCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [memoryError, setMemoryError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const storedLeaderboard = await AsyncStorage.getItem('leaderboard');
      if (storedLeaderboard) {
        setLeaderboard(JSON.parse(storedLeaderboard));
      }
    };
    loadLeaderboard();
  }, []);

  const saveScore = async () => {
    const newEntry = { pseudo, score: quiz.score };
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(updatedLeaderboard);
    await AsyncStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
  };

  const loadQuestion = async () => {
    setLoading(true);
    const data = await fetchQuestion();
    setQuiz(prev => ({
      ...prev,
      question: data.question,
      options: data.options,
      correctAnswer: data.answer,
      imageUrl: data.image,
      selected: '',
      feedback: '',
      tip: data.tip,
      explanation: data.explanation
    }));
    setLoading(false);
  };

  const handleSelect = (option) => {
    const isCorrect = option === quiz.correctAnswer;
    setQuiz(prev => {
      const newHealth = isCorrect ? prev.health : prev.health - 20;
      const isGameOver = newHealth <= 0;
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    setQuiz(prev => ({
      ...prev,
      selected: option,
      feedback: isCorrect ? '✅ Correct!' : '❌ Oops!'
    }));

      if (isGameOver) {
        setGameOver(true);
      }

      return {
        ...prev,
        selected: option,
        feedback: isCorrect ? '✅ Correct!' : '❌ Oops!',
        tip: prev.tip,
        explanation: prev.explanation,
        score: isCorrect ? prev.score + 1 : prev.score,
        health: isCorrect ? prev.health : newHealth
      };
    });
  };

  const initializeMemoryGame = () => {
    const cards = [
      { id: 1, value: '🌳', matched: false },
      { id: 2, value: '🌳', matched: false },
      { id: 3, value: '♻️', matched: false },
      { id: 4, value: '♻️', matched: false },
      { id: 5, value: '🌍', matched: false },
      { id: 6, value: '🌍', matched: false },
      { id: 7, value: '💧', matched: false },
      { id: 8, value: '💧', matched: false }
    ];
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setMatchedPairs([]);
    setMemoryInfo('');
  };

  const handleCardSelect = (index) => {
    if (selectedCards.length === 2 || memoryCards[index].matched) return;

    const newSelectedCards = [...selectedCards, index];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      const [firstIndex, secondIndex] = newSelectedCards;
      if (memoryCards[firstIndex].value === memoryCards[secondIndex].value) {
        setMatchedPairs((prev) => [...prev, memoryCards[firstIndex].value]);
        setMemoryCards((prev) =>
          prev.map((card, i) =>
            i === firstIndex || i === secondIndex ? { ...card, matched: true } : card
          )
        );
        const randomPhrase = memoryPhrases[Math.floor(Math.random() * memoryPhrases.length)];
        setMemoryInfo(randomPhrase);
      }
      setTimeout(() => setSelectedCards([]), 1000);
    }
  };

  const startMemoryGame = () => {
    setMemoryGameStarted(true);
    initializeMemoryGame();
  };

  // Prioritize memoryGameStarted, then gameOver, then !quizStarted
  if (memoryGameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🌍 EcoMemory</Text>
        <Text style={styles.memoryInfo}>{memoryInfo}</Text>
        <View style={styles.memoryGrid}>
          {memoryCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.memoryCard,
                card.matched || selectedCards.includes(index) ? styles.memoryCardFlipped : null
              ]}
              onPress={() => handleCardSelect(index)}
              disabled={card.matched || selectedCards.includes(index)}
            >
              <Text style={styles.memoryCardText}>
                {card.matched || selectedCards.includes(index) ? card.value : '?'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setMemoryGameStarted(false);
          }}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (gameOver) {
    // Fallback: show restart button after 2 seconds if not already shown
    if (!showRestartButton) {
      setTimeout(() => setShowRestartButton(true), 2000);
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameHeaderRow}>
          <Image source={require('./assets/images/icon.png')} style={styles.smallLogo} />
          <Text style={styles.smallTitle}>EcoGames</Text>
        </View>
        <View style={styles.leaderboardBox}>
          <Text style={styles.leaderboardTitle}>Classement</Text>
          <FlatList
            data={leaderboard}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardItem}>{index + 1}. {item.pseudo}</Text>
                <Text style={styles.leaderboardItem}>{item.score} pts</Text>
              </View>
            )}
          />
        </View>
        <Text style={styles.gameOverText}>Vous avez perdu !</Text>
        <View style={styles.leftPanel}>
          <Text style={styles.leaderboardTitle}>Score final</Text>
          <Text style={styles.scoreBox}>{quiz.score}</Text>
        </View>
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Image
            source={require('./assets/images/gameover.gif')}
            style={{ width: 160, height: 160, resizeMode: 'contain', marginVertical: 10 }}
          />
        </View>
        {showRestartButton && (
          <TouchableOpacity style={styles.primaryButton} onPress={() => {
            saveScore();
            setGameOver(false);
            setQuizStarted(false);
            setQuiz({
              question: '',
              options: [],
              correctAnswer: '',
              imageUrl: '',
              selected: '',
              feedback: '',
              score: 0,
              health: 100
            });
            setShowRestartButton(false);
          }}>
            <Text style={styles.buttonText}>Recommencer</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={[styles.memoryButton, !pseudo && styles.disabledButton]}
          onPress={() => {
            if (!pseudo) {
              setMemoryError("Veuillez entrer un pseudo pour jouer au Memory");
              setTimeout(() => setMemoryError(''), 2000);
              return;
            }
            startMemoryGame();
          }}
        >
          <Text style={styles.memoryButtonText}>Memory</Text>
        </TouchableOpacity>
        {memoryError ? (
          <Text style={styles.errorText}>{memoryError}</Text>
        ) : null}
        <View style={styles.leaderboardBox}>
          <Text style={styles.leaderboardTitle}>Classement</Text>
          <FlatList
            data={leaderboard}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.leaderboardContainer}
            renderItem={({ item, index }) => (
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardItem}>{index + 1}. {item.pseudo}</Text>
                <Text style={styles.leaderboardItem}>{item.score} pts</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.header}>
          <Image source={require('./assets/images/icon.png')} style={styles.logo} />
          <Text style={styles.title}>EcoGames</Text>
          <Text style={styles.subtitle}>Teste tes connaissances et ta mémoire pour sauver la planète 🌿</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Pseudo Name" 
          value={pseudo}
          onChangeText={setPseudo}
        />
        <TouchableOpacity
          style={[styles.primaryButton, !pseudo && styles.disabledButton]}
          onPress={() => {
            setQuizStarted(true);
            loadQuestion();
          }}
          disabled={!pseudo}
        >
          <Text style={styles.buttonText}>Start Quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameHeaderRow}>
        <Image source={require('./assets/images/icon.png')} style={styles.smallLogo} />
        <Text style={styles.smallTitle}>EcoGames</Text>
      </View>

      <View style={styles.healthBarBox}>
        <Text style={styles.healthText}>🌿 Santé Planète :</Text>
        <Text style={styles.healthIcons}>
          {Array.from({ length: 5 }).map((_, idx) =>
            quiz.health >= (idx + 1) * 20 ? '💚' : '🖤'
          ).join(' ')}
        </Text>
      </View>

      <View style={styles.quizContentRow}>
        <View style={styles.leftPanel}>
          <Text style={styles.leaderboardTitle}>Score</Text>
          <Text style={styles.scoreBox}>{quiz.score}</Text>
        </View>

        <View style={styles.mainQuizContent}>
          {loading ? (
            <ActivityIndicator size="large" color="green" />
          ) : (
            <QuestionCard quiz={quiz} handleSelect={handleSelect} />
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={loadQuestion}>
            <Text style={styles.buttonText}>
              {quiz.question ? 'Next Question' : 'Start Quiz'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {showConfetti && (
        <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} fadeOut />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e0fce1' },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#065f46',
    marginTop: 8,
  },
  leaderboardBox: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 160,
    backgroundColor: '#ffffffaa',
    borderRadius: 10,
    padding: 10,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#065f46',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#d1fae5',
  },
  leaderboardItem: {
    fontSize: 16,
    color: '#065f46',
  },
  barContainer: { marginBottom: 10 },
  healthBarBg: { height: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 4 },
  healthBar: { height: 10, backgroundColor: '#4ade80', borderRadius: 5 },
  score: { textAlign: 'center', marginVertical: 10, fontSize: 16 },
  button: { backgroundColor: '#16a34a', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  gameOverText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: 'red' },
  memoryInfo: { fontSize: 16, textAlign: 'center', marginVertical: 10, color: '#16a34a' },
  memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
  memoryCard: {
    width: 60,
    height: 80,
    margin: 5,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  memoryCardFlipped: { backgroundColor: '#4ade80' },
  memoryCardText: { fontSize: 24, fontWeight: 'bold' },

  homeCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    alignSelf: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 30,
  },
  memoryButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  memoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
  ,
  input: {
    borderWidth: 1,
    borderColor: '#a3d9a5',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    alignSelf: 'center',
    width: '15%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    textAlign: 'left',
    position: 'absolute',
    top: 50,
    left: 20,
  },
  healthBarBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  healthText: {
    fontSize: 14,
    color: '#064e3b',
    marginBottom: 4,
  },
  healthIcons: {
    fontSize: 22,
  },
  gameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  smallLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  smallTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#065f46',
  },

  quizContentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    gap: 20,
    marginTop: 20,
  },
  leftPanel: {
    width: 100,
    backgroundColor: '#d1fae5',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  scoreBox: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#065f46',
    marginTop: 8,
  },
  mainQuizContent: {
    flex: 1,
    maxWidth: 800,
    alignItems: 'center',
  }
});