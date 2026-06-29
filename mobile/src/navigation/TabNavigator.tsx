import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from '../context/ThemeContext'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
        },
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Tab.Screen
        name="Home"
        getComponent={() => require('../screens/Home/HomeScreen').default}
        options={{ title: 'Tassy Point', tabBarLabel: '🏠 Home' }}
      />
      <Tab.Screen
        name="Exams"
        getComponent={() => require('../screens/Exams/ExamsScreen').default}
        options={{ title: 'Exams', tabBarLabel: '📋 Exams' }}
      />
      <Tab.Screen
        name="Dashboard"
        getComponent={() => require('../screens/Dashboard/DashboardScreen').default}
        options={{ title: 'Dashboard', tabBarLabel: '📊 Dashboard' }}
      />
      <Tab.Screen
        name="Forum"
        getComponent={() => require('../screens/Forum/ForumScreen').default}
        options={{ title: 'Community', tabBarLabel: '💬 Forum' }}
      />
      <Tab.Screen
        name="Profile"
        getComponent={() => require('../screens/Profile/ProfileScreen').default}
        options={{ title: 'Profile', tabBarLabel: '👤 Profile' }}
      />
    </Tab.Navigator>
  )
}
