import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import quizData from '../assets/data/quiz.json';

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export default function QuizScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(shuffleArray(quizData as Question[]));
  }, []);

  function shuffleArray(array: Question[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  const handleAnswer = (selectedOption: string) => {
    const current = questions[currentQuestion];
    if (selectedOption === current.answer) {
      setScore(score + 1);
      setFeedback(`Correct ! ${current.explanation}`);
    } else {
      setFeedback(`Faux ! ${current.explanation}`);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Résultat</Text>
        <Text style={styles.text}>
          Vous avez obtenu {score} sur {questions.length}.
        </Text>
      </View>
    );
  }

  if (!questions.length) {
    return null; // Attente du chargement des questions
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{questions[currentQuestion].question}</Text>
      {feedback && <Text style={styles.feedback}>{feedback}</Text>}
      <FlatList
        data={questions[currentQuestion].options}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.option} onPress={() => handleAnswer(item)}>
            <Text style={styles.text}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000', // Fond noir
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Texte blanc
  },
  text: {
    fontSize: 18,
    color: '#fff', // Texte blanc
  },
  feedback: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
    color: '#fff', // Texte blanc
  },
  option: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#333', // Couleur sombre pour les options
    borderRadius: 8,
  },
});
