import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      feedback: ''
    }));
    setLoading(false);
  };

  const handleSelect = (option) => {
    const isCorrect = option === quiz.correctAnswer;
    setQuiz(prev => ({
      ...prev,
      selected: option,
      feedback: isCorrect ? '✅ Correct!' : '❌ Oops!'
    }));

    setTimeout(() => {
      setQuiz(prev => {
        const newHealth = isCorrect ? prev.health : prev.health - 20;
        if (newHealth <= 0) {
          setGameOver(true);
          return { ...prev, health: 0 };
        }
        return {
          ...prev,
          score: isCorrect ? prev.score + 1 : prev.score,
          health: newHealth
        };
      });
      if (!gameOver) loadQuestion();
    }, 1500);
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

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🌍 EcoGames</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre pseudo"
          value={pseudo}
          onChangeText={setPseudo}
        />
        <View style={styles.row}>
          <View style={styles.column}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: pseudo ? '#16a34a' : '#ccc' }]}
              onPress={() => {
                if (pseudo) {
                  setQuizStarted(true);
                  loadQuestion();
                }
              }}
              disabled={!pseudo}
            >
              <Text style={styles.buttonText}>Start Quiz</Text>
            </TouchableOpacity>
            <Text style={styles.leaderboardTitle}>Classement Quiz :</Text>
            <FlatList
              data={leaderboard}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.leaderboardItem}>
                  {item.pseudo}: {item.score}
                </Text>
              )}
            />
          </View>
          <View style={styles.column}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: pseudo ? '#16a34a' : '#ccc' }]}
              onPress={() => {
                if (pseudo) {
                  startMemoryGame();
                }
              }}
              disabled={!pseudo}
            >
              <Text style={styles.buttonText}>Start Memory Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🌍 EcoQuiz</Text>
        <Text style={styles.gameOverText}>Vous avez perdu !</Text>
        <Text style={styles.score}>Score final : {quiz.score}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
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
          }}>
          <Text style={styles.buttonText}>Recommencer</Text>
        </TouchableOpacity>
        <Text style={styles.leaderboardTitle}>Classement :</Text>
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.leaderboardItem}>
              {item.pseudo}: {item.score}
            </Text>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🌍 EcoQuiz</Text>
      <View style={styles.barContainer}>
        <Text>Planet Health: {quiz.health} / 100</Text>
        <View style={styles.healthBarBg}>
          <View style={[styles.healthBar, { width: `${quiz.health}%` }]} />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <QuestionCard quiz={quiz} handleSelect={handleSelect} />
      )}
      <Text style={styles.score}>Score: {quiz.score}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e0fce1' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  barContainer: { marginBottom: 10 },
  healthBarBg: { height: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 4 },
  healthBar: { height: 10, backgroundColor: '#4ade80', borderRadius: 5 },
  score: { textAlign: 'center', marginVertical: 10, fontSize: 16 },
  button: { backgroundColor: '#16a34a', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  gameOverText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: 'red' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginVertical: 10 },
  leaderboardTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  leaderboardItem: { fontSize: 16, textAlign: 'center', marginVertical: 5 },
  memoryInfo: { fontSize: 16, textAlign: 'center', marginVertical: 10, color: '#16a34a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  column: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
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
});
