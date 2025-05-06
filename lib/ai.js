export async function fetchQuestion() {
  // Replace this with real API call to OpenAI later
  return {
    question: 'Which action helps reduce plastic pollution the most?',
    options: [
      'Using single-use plastic bags',
      'Switching to reusable bags',
      'Throwing trash in the ocean',
      'Burning plastic waste'
    ],
    answer: 'Switching to reusable bags',
    image: 'https://source.unsplash.com/600x400/?recycling,environment'
  };
}