import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import HomeScreen from '../screens/Home/HomeScreen'
import CoursesScreen from '../screens/Courses/CoursesScreen'
import ForumScreen from '../screens/Forum/ForumScreen'
import MarketplaceScreen from '../screens/Marketplace/MarketplaceScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'

const Tab = createBottomTabNavigator()

const tabIcon = (name: string, focused: boolean, color: string) => {
  const icons: Record<string, string> = {
    Home: '🏠', Courses: '📚', Forum: '💬', Marketplace: '🛒', Profile: '👤',
  }
  return null // Use a proper icon library (e.g., @expo/vector-icons) in production
}

export default function TabNavigator() {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 4 },
        headerStyle: { backgroundColor: '#16a34a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ title: 'AgriLearn', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Courses" component={CoursesScreen}
        options={{ title: 'Courses', tabBarLabel: 'Courses' }} />
      <Tab.Screen name="Forum" component={ForumScreen}
        options={{ title: 'Community', tabBarLabel: 'Forum' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen}
        options={{ title: 'Marketplace', tabBarLabel: 'Market' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  )
}
