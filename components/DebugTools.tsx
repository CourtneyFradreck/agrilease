import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { testDatabaseConnection } from '../FirebaseConfig';

export function DebugTools() {
  const [testResult, setTestResult] = useState<string>('');

  const handleTestDatabase = async () => {
    try {
      const result = await testDatabaseConnection();
      setTestResult(result ? 'Database connection successful!' : 'Database connection failed.');
    } catch (error: any) {
      setTestResult('Error testing database: ' + (error?.message || 'Unknown error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Tools</Text>
      <Button title="Test Database Connection" onPress={handleTestDatabase} />
      {testResult ? <Text style={styles.result}>{testResult}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  result: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});