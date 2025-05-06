import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QuestionCard from './components/QuestionCard';
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

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🌍 EcoQuiz</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre pseudo"
          value={pseudo}
          onChangeText={setPseudo}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: pseudo ? '#16a34a' : '#ccc' }]}
          onPress={() => {
            if (pseudo) {
              setQuizStarted(true);
              loadQuestion();
            }
          }}
          disabled={!pseudo}>
          <Text style={styles.buttonText}>Start Quiz</Text>
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
          }}/>
        <TouchableOpacity style={styles.button} onPress={() => {
          setGameOver(false);
          setQuiz({
            question: '',
            options: [],
            correctAnswer: '',
            imageUrl: '',
            selected: '',
            feedback: '',
            tip: '',
            explanations: '',
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
      <TouchableOpacity style={styles.button} onPress={loadQuestion}>
        <Text style={styles.buttonText}>{quiz.question ? 'Next Question' : 'Start Quiz'}</Text>
      </TouchableOpacity>
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
});
