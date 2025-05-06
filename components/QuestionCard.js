import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const QuestionCard = ({ quiz, handleSelect }) => (
  <View>
<<<<<<< HEAD
    <Image source={{ uri: quiz.image }} style={styles.image} />
=======
    <Image source={{ uri: quiz.imageUrl }} style={styles.image} />
>>>>>>> c66b3b2 (feat : WebApplication Disponible)
    <Text style={styles.question}>{quiz.question}</Text>
    {quiz.options.map((opt, idx) => (
      <TouchableOpacity
        key={idx}
        onPress={() => handleSelect(opt)}
        style={[styles.option, quiz.selected === opt && styles.selected]}
      >
        <Text>{opt}</Text>
      </TouchableOpacity>
    ))}
    {quiz.feedback ? <Text style={styles.feedback}>{quiz.feedback}</Text> : null}
<<<<<<< HEAD
    {quiz.tip && quiz.selected ? <Text style={styles.tip}>{quiz.tip}</Text> : null}
=======
>>>>>>> c66b3b2 (feat : WebApplication Disponible)
  </View>
);

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  question: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  option: { padding: 10, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 6 },
  selected: { backgroundColor: '#bbf7d0' },
  feedback: { fontSize: 18, marginTop: 10, textAlign: 'center' },
<<<<<<< HEAD
  tip: { fontSize: 14, fontStyle: 'italic', marginTop: 8, textAlign: 'center', color: '#4b5563' },
=======
>>>>>>> c66b3b2 (feat : WebApplication Disponible)
});

export default QuestionCard;