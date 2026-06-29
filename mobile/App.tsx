import React from 'react'
import { View, Text } from 'react-native'

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: '#16a34a', fontWeight: 'bold' }}>
        Tassy Point
      </Text>
      <Text style={{ color: '#6b7280', marginTop: 8 }}>Loading...</Text>
    </View>
  )
}
