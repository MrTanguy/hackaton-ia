import { StyleSheet, Text, View } from 'react-native';

export default function LeaderboardScreen() {
  const leaderboard = [
    { name: 'Alice', score: 10 },
    { name: 'Bob', score: 8 },
    { name: 'Charlie', score: 7 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement</Text>
      {leaderboard.map((entry, index) => (
        <Text key={index} style={styles.entry}>
          {index + 1}. {entry.name} - {entry.score} points
        </Text>
      ))}
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
  entry: {
    fontSize: 18,
    color: '#fff', // Texte blanc
    marginBottom: 10,
  },
});
