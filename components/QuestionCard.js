import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const QuestionCard = ({ quiz, handleSelect }) => (
  <View>
    <Image source={{ uri: quiz.image }} style={styles.image} />
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
      {quiz.explanation && quiz.selected ? <Text style={styles.explanation}>{quiz.explanation}</Text> : null}
    {quiz.tip && quiz.selected ? <Text style={styles.tip}>{quiz.tip}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#f0fdf4',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 10
    },
    question: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#14532d'
    },
    optionsContainer: {
        marginTop: 10,
        marginBottom: 10
    },
    option: {
        padding: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        marginBottom: 8
    },
    selected: {
        backgroundColor: '#bbf7d0',
        borderColor: '#22c55e'
    },
    optionText: {
        fontSize: 16,
        color: '#065f46'
    },
    feedback: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
        color: '#047857'
    },
    tip: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
        color: '#4b5563'
    },
    explanation: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        color: '#42783b'
    }
});

export default QuestionCard;