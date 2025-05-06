import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const QuestionCard = ({ quiz, handleSelect }) => (
  <View style={styles.cardContainer}>
    <Text style={styles.question}>{quiz.question}</Text>
    {quiz.options.map((opt, idx) => {
      const optionStyles = [
        styles.option,
        styles[`option${idx}`],
        quiz.selected === opt && styles.selected
      ];
      return (
        <TouchableOpacity
          key={idx}
          onPress={() => handleSelect(opt)}
          style={optionStyles}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      );
    })}
    {quiz.feedback ? <Text style={styles.feedback}>{quiz.feedback}</Text> : null}
    {quiz.tip && quiz.selected ? <Text style={styles.tip}>{quiz.tip}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    maxWidth: 600,
    width: '90%',
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  option0: { backgroundColor: '#ecfdf5' },
  option1: { backgroundColor: '#d1fae5' },
  option2: { backgroundColor: '#a7f3d0' },
  option3: { backgroundColor: '#6ee7b7' },
  selected: {
    borderColor: '#059669',
    borderWidth: 2,
  },
  feedback: { fontSize: 18, marginTop: 10, textAlign: 'center' },
  tip: { fontSize: 14, fontStyle: 'italic', marginTop: 8, textAlign: 'center', color: '#4b5563' },
});

export default QuestionCard;