import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchQuestion } from './lib/ai';
import QuestionCard from './components/QuestionCard';

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
      setQuiz(prev => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        health: isCorrect ? prev.health : prev.health - 20
      }));
      loadQuestion();
    }, 1500);
  };

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
});
