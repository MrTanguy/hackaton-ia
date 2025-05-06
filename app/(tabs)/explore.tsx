import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const cards = [
  { id: 1, value: '🌳', matched: false },
  { id: 2, value: '🌳', matched: false },
  { id: 3, value: '🌍', matched: false },
  { id: 4, value: '🌍', matched: false },
  { id: 5, value: '♻️', matched: false },
  { id: 6, value: '♻️', matched: false },
  { id: 7, value: '💧', matched: false },
  { id: 8, value: '💧', matched: false },
];

const facts = [
  "Les arbres absorbent le dioxyde de carbone et produisent de l'oxygène.",
  "La Terre est composée à 70% d'eau.",
  "Recycler permet de réduire les déchets et de préserver les ressources naturelles.",
  "L'eau douce est une ressource précieuse et limitée.",
];

export default function MemoryGame() {
  const [shuffledCards, setShuffledCards] = useState(shuffleArray([...cards]));
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [fact, setFact] = useState<string | null>(null);

  function shuffleArray(array: typeof cards) {
    return array.sort(() => Math.random() - 0.5);
  }

  const handleCardPress = (index: number) => {
    if (selectedCards.length === 2 || shuffledCards[index].matched) return;

    const newSelectedCards = [...selectedCards, index];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      const [firstIndex, secondIndex] = newSelectedCards;
      if (shuffledCards[firstIndex].value === shuffledCards[secondIndex].value) {
        const updatedCards = [...shuffledCards];
        updatedCards[firstIndex].matched = true;
        updatedCards[secondIndex].matched = true;
        setShuffledCards(updatedCards);
        setMatchedPairs(matchedPairs + 1);
        setFact(facts[matchedPairs % facts.length]);
      }
      setTimeout(() => setSelectedCards([]), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jeu de mémoire écologique</Text>
      {fact && <Text style={styles.fact}>{fact}</Text>}
      <FlatList
        data={shuffledCards}
        numColumns={4}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.matched || selectedCards.includes(index) ? styles.cardRevealed : styles.cardHidden,
            ]}
            onPress={() => handleCardPress(index)}
          >
            <Text style={styles.cardText}>
              {item.matched || selectedCards.includes(index) ? item.value : '?'}
            </Text>
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
    textAlign: 'center',
    color: '#fff', // Texte blanc
  },
  fact: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff', // Texte blanc
  },
  card: {
    width: 60,
    height: 60,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cardHidden: {
    backgroundColor: '#333', // Couleur sombre pour les cartes cachées
  },
  cardRevealed: {
    backgroundColor: '#a0d995', // Couleur claire pour les cartes révélées
  },
  cardText: {
    fontSize: 24,
    color: '#fff', // Texte blanc
  },
});
